
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

resource "google_compute_address" "public_ip_address" {
  name = "park-gateway-ip"
}

resource "google_dns_managed_zone" "park_domain" {
  name     = "${var.domain_zone_name}"
  dns_name = "${var.domain_name}."
}

output "gateway_ip" {
  value = google_compute_address.public_ip_address.address
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
  rrdatas = [google_compute_address.public_ip_address.address]
  ttl     = 300
}


### Application resources for the park app

resource "google_firestore_database" "authentication-service-db" {
  project  = var.project_id
  name     = "${var.project_id}-auth-${var.infra_namespace}"
  location_id = var.region
  type     = "FIRESTORE_NATIVE"
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
  deletion_policy = "DELETE"
}

resource "google_project_iam_member" "authentication_service_management_firestore_access" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "principal://iam.googleapis.com/projects/${var.project_number}/locations/global/workloadIdentityPools/${var.project_id}.svc.id.goog/subject/ns/${var.infra_namespace}/sa/${var.authentication_service_sa}"
}

resource "google_project_iam_member" "authentication_service_management_token_creator" {
  project = var.project_id
  role    = "roles/iam.serviceAccountTokenCreator"
  member  = "principal://iam.googleapis.com/projects/${var.project_number}/locations/global/workloadIdentityPools/${var.project_id}.svc.id.goog/subject/ns/${var.infra_namespace}/sa/${var.authentication_service_sa}"
}