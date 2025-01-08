
### Tenant resource

resource "google_identity_platform_tenant" "tenant" {
  display_name          = var.tenant_id
  allow_password_signup = true
}

output "tenant_id" {
  value = google_identity_platform_tenant.tenant.id
}

### Application resources for the tenant

resource "google_storage_bucket" "property_management_bucket" {
  name     = "${var.project_id}-prop-ma-${var.app_namespace}"
  location = var.region
  public_access_prevention = "enforced"
  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}


resource "google_firestore_database" "property_management_db" {
  project  = var.project_id
  name     = "${var.project_id}-prop-ma-${var.app_namespace}"
  location_id = var.region
  type     = "FIRESTORE_NATIVE"
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
  deletion_policy = "DELETE"
}

resource "google_firestore_database" "parking_management_db" {
  project  = var.project_id
  name     = "${var.project_id}-park-ma-${var.app_namespace}"
  location_id = var.region
  type     = "FIRESTORE_NATIVE"
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
  deletion_policy = "DELETE"
}

resource "google_project_iam_member" "property_management_firestore_access" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "principal://iam.googleapis.com/projects/${var.project_number}/locations/global/workloadIdentityPools/${var.project_id}.svc.id.goog/subject/ns/${var.app_namespace}/sa/${var.property_management_sa}"
}

resource "google_project_iam_member" "property_management_storage_access" {
  project = var.project_id
  role    = "roles/storage.objectCreator"
  member  = "principal://iam.googleapis.com/projects/${var.project_number}/locations/global/workloadIdentityPools/${var.project_id}.svc.id.goog/subject/ns/${var.app_namespace}/sa/${var.property_management_sa}"
}

resource "google_project_iam_member" "parking_management_firestore_access" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "principal://iam.googleapis.com/projects/${var.project_number}/locations/global/workloadIdentityPools/${var.project_id}.svc.id.goog/subject/ns/${var.app_namespace}/sa/${var.parking_management_sa}"
}

resource "google_project_iam_member" "frontend_token_creator" {
  project = var.project_id
  role    = "roles/iam.serviceAccountTokenCreator"
  member  = "principal://iam.googleapis.com/projects/${var.project_number}/locations/global/workloadIdentityPools/${var.project_id}.svc.id.goog/subject/ns/${var.app_namespace}/sa/${var.frontend_sa}"
}


### DNS record for the tenant

resource "google_dns_record_set" "tenant_dns_record" {
  managed_zone = var.dns_zone_name
  name    = "${var.tenant_subdomain}.${var.dns_zone_domain_name}"
  type    = "A"
  rrdatas = [var.gateway_ip]
  ttl     = 300
}
