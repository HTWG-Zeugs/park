

resource "google_artifact_registry_repository" "docker_repository" {
  project       = var.project_id
  location      = var.region
  repository_id = "docker-repository"
  format        = "DOCKER"
}

resource "google_storage_bucket" "gcf_source_bucket" {
  project  = var.project_id
  name     = "${var.project_id}-gcf-source"
  location = var.region
  uniform_bucket_level_access = true
  force_destroy = true
  public_access_prevention = "enforced"
}

resource "google_service_account" "github_sa" {
  account_id   = "github-sa"
  display_name = "GitHub Service Account"
}

resource "google_iam_workload_identity_pool" "github_pool" {
  project                   = var.project_id
  workload_identity_pool_id = "${var.project_id}-github"
  display_name              = "GitHub identity pool"
  disabled                  = false
}


resource "google_iam_workload_identity_pool_provider" "github_identity_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-repo-provider"
  display_name                       = "GitHub provider"
  disabled                           = false
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.actor"            = "assertion.actor"
    "attribute.aud"              = "assertion.aud"
    "attribute.repository"       = "assertion.repository"
    "attribute.repository_owner" = "assertion.repository_owner"
  }
  attribute_condition = "assertion.repository_owner=='HTWG-Zeugs'"
}


resource "google_service_account_iam_member" "github-sa-iam-workload-identity-user" {
  service_account_id = google_service_account.github_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository_owner/${var.github_org}"
}

resource "google_service_account_iam_member" "github-sa-iam-service-account-token-creator" {
  service_account_id = google_service_account.github_sa.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository_owner/${var.github_org}"
}

variable "github_sa_roles" {
  type = list(string)
  default = [
    "roles/editor",
    "roles/container.clusterViewer",
    "roles/container.admin",
    "roles/datastore.owner",
    "roles/resourcemanager.projectIamAdmin",
    "roles/artifactregistry.admin",
    "roles/iam.workloadIdentityPoolAdmin",
    "roles/iam.serviceAccountAdmin",
    "roles/iam.serviceAccountUser",
    "roles/serviceusage.serviceUsageAdmin",
    "roles/run.admin",
    "roles/storage.objectAdmin",
    "roles/iam.securityAdmin"
  ]
}

resource "google_project_iam_member" "github-sa-iam-member" {
  for_each = { for value in var.github_sa_roles : value => value }
  project = var.project_id
  role    = each.value
  member = "serviceAccount:${google_service_account.github_sa.email}"
}

resource "google_service_account" "cloud_build_sa" {
  account_id   = "cloud-build-sa"
  display_name = "Cloud Build Service Account"
}

variable "cloud_build_sa_roles" {
  type = list(string)
  default = [
    "roles/cloudbuild.builds.builder",
    "roles/logging.logWriter",
    "roles/artifactregistry.writer",
    "roles/storage.objectViewer"
  ]
}

resource "google_project_iam_member" "cloud_build_sa_iam_member" {
  for_each = { for value in var.cloud_build_sa_roles : value => value }
  project = var.project_id
  role    = each.value
  member = "serviceAccount:${google_service_account.cloud_build_sa.email}"
}

output "github_sa_email" {
  value = google_service_account.github_sa.email
}

output "workload_identity_pool_provider_name" {
  value = google_iam_workload_identity_pool_provider.github_identity_provider.name
}