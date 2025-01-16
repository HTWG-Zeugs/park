
### Identity Platform for authentication service

resource "google_identity_platform_config" "identity_platform" {
  project = var.project_id
  sign_in {
    allow_duplicate_emails = false

    anonymous {
      enabled = false
    }
    email {
      enabled = true
      password_required = false
    }
    phone_number {
      enabled            = false
    }
  }

  multi_tenant {
    allow_tenants = true
  }
}

output "identity_platform" {
  value = google_identity_platform_config.identity_platform
}


### Public IP and DNS zone for the park app

resource "google_compute_global_address" "public_ip_address" {
  project  = var.project_id
  name = "park-gateway-ip"
}

resource "google_dns_managed_zone" "park_domain" {
  name     = "${var.domain_zone_name}"
  dns_name = "${var.domain_name}."
}

output "gateway_ip" {
  value = google_compute_global_address.public_ip_address.address
}

output "dns_zone_name" {
  value = google_dns_managed_zone.park_domain.name
}

output "dns_zone_domain_name" {
  value = google_dns_managed_zone.park_domain.dns_name
}

resource "google_dns_record_set" "root_dns_record" {
  managed_zone = google_dns_managed_zone.park_domain.name
  name    = google_dns_managed_zone.park_domain.dns_name
  type    = "A"
  rrdatas = [google_compute_global_address.public_ip_address.address]
  ttl     = 300
}


### Resources for the authentication service

resource "google_firestore_database" "authentication-service-db" {
  project  = var.project_id
  name     = "${var.project_id}-auth"
  location_id = var.region
  type     = "FIRESTORE_NATIVE"
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
  deletion_policy = "DELETE"
}

resource "google_service_account" "authentication_service_sa" {
  account_id   = "${var.authentication_service_sa}"
  project      = var.project_id
  display_name = "Authentication Service Account"
}

variable "authentication_service_sa_roles" {
  type = list(string)
  default = [
    "roles/datastore.user",
    "roles/iam.serviceAccountTokenCreator",
    "roles/identityplatform.admin",
    "roles/iam.serviceAccountOpenIdTokenCreator"
  ]
}

resource "google_project_iam_member" "authentication_service_sa_iam_member" {	
  for_each = { for value in var.authentication_service_sa_roles : value => value }
  project = var.project_id
  role    = each.value
  member = "serviceAccount:${google_service_account.authentication_service_sa.email}"
}

### Resources for the infrastructure management service

resource "google_firestore_database" "infrastructure-management-db" {
  project  = var.project_id
  name     = "${var.project_id}-infra-management"
  location_id = var.region
  type     = "FIRESTORE_NATIVE"
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
  deletion_policy = "DELETE"
}

resource "google_service_account" "infrastructure_management_sa" {
  account_id   = "${var.infrastructure_management_sa}"
  project      = var.project_id
  display_name = "Infrastructure Management Service Account"
}

variable "infrastructure_management_sa_roles" {
  type = list(string)
  default = [
    "roles/datastore.user",
    "roles/iam.serviceAccountTokenCreator"
  ]
}

resource "google_project_iam_member" "infrastructure_management_sa_iam_member" {	
  for_each = { for value in var.infrastructure_management_sa_roles : value => value }
  project = var.project_id
  role    = each.value
  member = "serviceAccount:${google_service_account.infrastructure_management_sa.email}"
}

resource "google_service_account" "sign_up_frontend_sa" {
  account_id   = "${var.sign_up_frontend_sa}"
  project      = var.project_id
  display_name = "Infrastructure Management Service Account"
}

variable "sign_up_frontend_sa_roles" {
  type = list(string)
  default = [
    "roles/iam.serviceAccountTokenCreator"
  ]
}

resource "google_project_iam_member" "sign_up_frontend_sa_iam_member" {	
  for_each = { for value in var.sign_up_frontend_sa_roles : value => value }
  project = var.project_id
  role    = each.value
  member = "serviceAccount:${google_service_account.sign_up_frontend_sa.email}"
}