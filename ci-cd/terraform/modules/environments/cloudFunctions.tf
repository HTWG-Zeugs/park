resource "google_storage_bucket" "defect_reports_bucket" {
  name     = "${var.project_id}-defect-reports-${var.environment_name}"
  location = var.region
  force_destroy = true
  public_access_prevention = "enforced"
}

resource "google_service_account" "defect_report_sa" {
  account_id   = "${var.environment_name}-${var.defect_report_sa}"
  project      = var.project_id
  display_name = "Defect Report Cloud Function Service Account"
}

resource "google_cloudfunctions2_function_iam_member" "invoker" {
  project        = google_cloudfunctions2_function.defect_report.project
  location       = google_cloudfunctions2_function.defect_report.location
  cloud_function = google_cloudfunctions2_function.defect_report.name
  role           = "roles/cloudfunctions.invoker"
  member         = "serviceAccount:${google_service_account.defect_report_sa.email}"
}

resource "google_cloud_run_service_iam_member" "cloud_run_invoker" {
  project  = google_cloudfunctions2_function.defect_report.project
  location = google_cloudfunctions2_function.defect_report.location
  service  = google_cloudfunctions2_function.defect_report.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.defect_report_sa.email}"
}

variable "defect_report_sa_roles" {
  type = list(string)
  default = [
    "roles/datastore.user",
    "roles/storage.objectCreator"
  ]
}

resource "google_project_iam_member" "defect_report_sa_iam_member" {	
  for_each = { for value in var.defect_report_sa_roles : value => value }
  project = var.project_id
  role    = each.value
  member = "serviceAccount:${google_service_account.defect_report_sa.email}"
}

resource "google_cloudfunctions2_function" "defect_report" {
  name = "${var.environment_name}-defect-reports"
  location = var.region
  description = "Create changed defects report"

  build_config {
    runtime = "nodejs20"
    entry_point = "createChangedDefectsReport"
    source {
      storage_source {
        bucket = "${var.project_id}-gcf-source"
        object = "createChangedDefectsReport.zip"
      }
    }
    service_account = "projects/${var.project_id}/serviceAccounts/cloud-build-sa@${var.project_id}.iam.gserviceaccount.com"
  }
  service_config {
    max_instance_count  = 1
    available_memory    = "256M"
    timeout_seconds     = 60
    environment_variables = {
        FIRESTORE_DB_ID   = google_firestore_database.property_management_db.name
        GCS_BUCKET_ID     = google_storage_bucket.defect_reports_bucket.name
    }
    ingress_settings = "ALLOW_INTERNAL_ONLY"
    all_traffic_on_latest_revision = true
    service_account_email = google_service_account.defect_report_sa.email
  }
}

resource "google_cloud_scheduler_job" "defect_report" {
  name      = "${var.environment_name}-defect-reports-job"
  schedule  = "0 * * * *"
  time_zone = "Europe/Berlin"
  project   = var.project_id
  region    = var.region

  retry_config {
    retry_count = 1
  }

  http_target {
    http_method = "POST"
    uri         = google_cloudfunctions2_function.defect_report.service_config.0.uri
    oidc_token {
      audience              = "${google_cloudfunctions2_function.defect_report.service_config[0].uri}/"
      service_account_email = google_service_account.defect_report_sa.email
    }
  }
}