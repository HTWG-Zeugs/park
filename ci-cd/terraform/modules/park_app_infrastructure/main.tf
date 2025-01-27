
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

output "identity_platform_api_key" {
  value = google_identity_platform_config.identity_platform.client[0].api_key
}

output "identity_platform_domain" {
  value = google_identity_platform_config.identity_platform.client[0].firebase_subdomain
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

resource "google_service_account" "cert_manager_sa" {
  account_id   = "cert-manager"
  project      = var.project_id
  display_name = "Cert Manager Service Account"
}

resource "google_service_account_iam_member" "cert_manager_sa_iam" {
  service_account_id = google_service_account.cert_manager_sa.id
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[infra-ns/cert-manager]"
}

variable "cert_manager_sa_roles" {
  type = list(string)
  default = [
    "roles/dns.admin",
    "roles/iam.serviceAccountTokenCreator"
  ]
}

resource "google_project_iam_member" "cert_manager_sa_iam_member" {	
  for_each = { for value in var.cert_manager_sa_roles : value => value }
  project = var.project_id
  role    = each.value
  member = "serviceAccount:${google_service_account.cert_manager_sa.email}"
}

resource "kubernetes_namespace" "infra" {
  metadata {
    name = "infra-ns"
    annotations = {
      "iam.gke.io/gcp-service-account" : "cert-manager@${ var.project_id }.iam.gserviceaccount.com"
    }
  }
  timeouts {
    delete = "20m"
  }
}

resource "helm_release" "cert_manager" {
  depends_on = [ kubernetes_namespace.infra ]
  name       = "cert-manager"
  repository = "https://charts.jetstack.io"
  chart      = "cert-manager"
  namespace = kubernetes_namespace.infra.metadata.0.name
  create_namespace = false
  
  set {
    name  = "config.apiVersion"
    value = "controller.config.cert-manager.io/v1alpha1"
  }
  set {
    name  = "config.kind"
    value = "ControllerConfiguration"
  }
  set {
    name  = "config.enableGatewayAPI"
    value = true
  }
  set {
    name  = "crds.enabled"
    value = true
  }
  set {
    name  = "global.leaderElection.namespace"
    value = "infra-ns"
  }
}

resource "kubernetes_annotations" "cert_manager_sa_annotations" {
  depends_on = [ helm_release.cert_manager ]
  api_version = "v1"
  kind        = "ServiceAccount"
  metadata {
    name = "cert-manager"
    namespace = "infra-ns"
  }
  annotations = {
    "iam.gke.io/gcp-service-account" : "cert-manager@${ var.project_id }.iam.gserviceaccount.com"
  }
}

resource "helm_release" "infrastructure" {
  depends_on = [ kubernetes_namespace.infra ]
  name  = "park-infra"
  chart = "../../helm/infrastructure"
  namespace = kubernetes_namespace.infra.metadata.0.name
  create_namespace = false
  set {
    name  = "projectId"
    value = var.project_id
  }
  set {
    name  = "domain"
    value = var.domain_name
  }
}