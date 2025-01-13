
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
  name     = "${var.project_id}-prop-ma-${var.tenant_id}"
  location = var.region
  force_destroy = true
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
  name     = "${var.project_id}-prop-ma-${var.tenant_id}"
  location_id = var.region
  type     = "FIRESTORE_NATIVE"
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
  deletion_policy = "DELETE"
}

resource "google_firestore_database" "parking_management_db" {
  project  = var.project_id
  name     = "${var.project_id}-park-ma-${var.tenant_id}"
  location_id = var.region
  type     = "FIRESTORE_NATIVE"
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
  deletion_policy = "DELETE"
}

resource "google_service_account" "property_management_sa" {
  account_id   = "${var.tenant_id}-${var.property_management_sa}"
  project      = var.project_id
  display_name = "Property Management Service Account"
}

variable "property_management_sa_roles" {
  type = list(string)
  default = [
    "roles/datastore.user",
    "roles/iam.serviceAccountTokenCreator",
    "roles/storage.objectCreator"
  ]
}

resource "google_project_iam_member" "property_management_sa_iam_member" {	
  for_each = { for value in var.property_management_sa_roles : value => value }
  project = var.project_id
  role    = each.value
  member = "serviceAccount:${google_service_account.property_management_sa.email}"
}


resource "google_service_account" "parking_management_sa" {
  account_id   = "${var.tenant_id}-${var.parking_management_sa}"
  project      = var.project_id
  display_name = "Parking Management Service Account"
}

variable "parking_management_sa_roles" {
  type = list(string)
  default = [
    "roles/datastore.user",
    "roles/iam.serviceAccountTokenCreator"
  ]
}

resource "google_project_iam_member" "parking_management_sa_iam_member" {
  for_each = { for value in var.parking_management_sa_roles : value => value }
  project = var.project_id
  role    = each.value
  member = "serviceAccount:${google_service_account.parking_management_sa.email}"
}


resource "google_service_account" "frontend_sa" {
  account_id   = "${var.tenant_id}-${var.frontend_sa}"
  project      = var.project_id
  display_name = "Frontend Service Account"
}

variable "frontend_sa_roles" {
  type = list(string)
  default = [
    "roles/iam.serviceAccountTokenCreator"
  ]
}

resource "google_project_iam_member" "frontend_sa_iam_member" {
  for_each = { for value in var.frontend_sa_roles : value => value }
  project = var.project_id
  role    = each.value
  member = "serviceAccount:${google_service_account.frontend_sa.email}"
}

### DNS record for the tenant

resource "google_dns_record_set" "tenant_dns_record" {
  managed_zone = var.dns_zone_name
  name    = "${var.tenant_subdomain}.${var.dns_zone_domain_name}"
  type    = "A"
  rrdatas = [var.gateway_ip]
  ttl     = 300
}
