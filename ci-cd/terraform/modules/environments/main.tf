### Application resources for the tenant
resource "google_storage_bucket" "property_management_bucket" {
  name     = "${var.project_id}-prop-ma-${var.environment_name}"
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
  name     = "${var.project_id}-prop-ma-${var.environment_name}"
  location_id = var.region
  type     = "FIRESTORE_NATIVE"
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
  deletion_policy = "DELETE"
}

resource "google_firestore_database" "parking_management_db" {
  project  = var.project_id
  name     = "${var.project_id}-park-ma-${var.environment_name}"
  location_id = var.region
  type     = "FIRESTORE_NATIVE"
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
  deletion_policy = "DELETE"
}

resource "google_service_account" "property_management_sa" {
  account_id   = "${var.environment_name}-${var.property_management_sa}"
  project      = var.project_id
  display_name = "Property Management Service Account"
}

resource "google_service_account_iam_member" "authentication_service_sa_iam" {
  service_account_id = google_service_account.property_management_sa.id
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[${var.app_namespace}/${var.property_management_sa}]"
}

variable "property_management_sa_roles" {
  type = list(string)
  default = [
    "roles/datastore.user",
    "roles/iam.serviceAccountTokenCreator",
    "roles/storage.objectCreator",
    "roles/run.invoker",
    "roles/iam.serviceAccountOpenIdTokenCreator"
  ]
}

resource "google_project_iam_member" "property_management_sa_iam_member" {	
  for_each = { for value in var.property_management_sa_roles : value => value }
  project = var.project_id
  role    = each.value
  member = "serviceAccount:${google_service_account.property_management_sa.email}"
}


resource "google_service_account" "parking_management_sa" {
  account_id   = "${var.environment_name}-${var.parking_management_sa}"
  project      = var.project_id
  display_name = "Parking Management Service Account"
}

resource "google_service_account_iam_member" "parking_management_sa_iam" {
  service_account_id = google_service_account.parking_management_sa.id
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[${var.app_namespace}/${var.parking_management_sa}]"
}

variable "parking_management_sa_roles" {
  type = list(string)
  default = [
    "roles/datastore.user",
    "roles/iam.serviceAccountTokenCreator",
    "roles/run.invoker",
    "roles/iam.serviceAccountOpenIdTokenCreator"
  ]
}

resource "google_project_iam_member" "parking_management_sa_iam_member" {
  for_each = { for value in var.parking_management_sa_roles : value => value }
  project = var.project_id
  role    = each.value
  member = "serviceAccount:${google_service_account.parking_management_sa.email}"
}


resource "google_service_account" "frontend_sa" {
  account_id   = "${var.environment_name}-${var.frontend_sa}"
  project      = var.project_id
  display_name = "Frontend Service Account"
}

resource "google_service_account_iam_member" "frontend_sa_iam" {
  service_account_id = google_service_account.frontend_sa.id
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[${var.app_namespace}/${var.frontend_sa}]"
}

variable "frontend_sa_roles" {
  type = list(string)
  default = [
    "roles/iam.serviceAccountTokenCreator",
    "roles/iam.serviceAccountOpenIdTokenCreator"
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
  name    = "${var.subdomain}.${var.dns_zone_domain_name}"
  type    = "A"
  rrdatas = [var.gateway_ip]
  ttl     = 300
}


### Helm chart for the tenant

resource "kubernetes_namespace" "tenant" {
  metadata {
    name = "${var.environment_name}-ns"
  }
}

resource "helm_release" "backend" {
  depends_on = [ kubernetes_namespace.tenant ]
  name      = "${var.environment_name}-park-backend"
  chart      = "../../../helm/backend"
  version    = var.git_tag
  namespace  = kubernetes_namespace.tenant.metadata.0.name
  create_namespace = false
  
  set {
    name  = "repository"
    value = var.repository
  }
  set {
    name  = "gitTag"
    value = var.git_tag
  }
  set {
    name  = "identityPlatForm.apiKey"
    value = var.identity_api_key
  }
  set {
    name  = "identityPlatForm.authDomain"
    value = var.identity_auth_domain
  }
  set {
    name  = "gc_project_id"
    value = var.project_id
  }
  set {
    name  = "domain"
    value = var.domain
  }
  set {
    name  = "subdomain"
    value = var.subdomain
  }
  set {
    name  = "environment_name"
    value = var.environment_name
  }
  set {
    name  = "authenticationService.url"
    value = var.auth_url
  }
  set {
    name  = "infrastructureManagement.url"
    value = var.infra_url
  }
  set {
    name  = "tenant_type"
    value = var.tenant_type
  }
}

resource "helm_release" "frontend" {
  name      = "${var.environment_name}-park-frontend"
  chart      = "../../../helm/backend"
  namespace  = kubernetes_namespace.tenant.metadata.0.name
  create_namespace = false
  
  set {
    name  = "repository"
    value = var.repository
  }
  set {
    name  = "gitTag"
    value = var.git_tag
  }
  set {
    name  = "identityPlatForm.apiKey"
    value = var.identity_api_key
  }
  set {
    name  = "identityPlatForm.authDomain"
    value = var.identity_auth_domain
  }
  set {
    name  = "gc_project_id"
    value = var.project_id
  }
  set {
    name  = "frontend.env.authUrl"
    value = var.auth_url
  }
  set {
    name  = "frontend.env.infrastructureUrl"
    value = var.infra_url
  }
  set {
    name  = "frontend.env.propertyUrl"
    value = "https://${var.subdomain}.${var.domain}/property"
  }
  set {
    name  = "frontend.env.parkingUrl"
    value = "https://${var.subdomain}.${var.domain}/parking"
  }
  set {
    name  = "domain"
    value = var.domain
  }
  set {
    name  = "subdomain"
    value = var.subdomain
  }
  set {
    name  = "environment_name"
    value = var.environment_name
  }
  set {
    name  = "tenant_id"
    value = var.tenant_id
  }
  set {
    name  = "tenant_type"
    value = var.tenant_type
  }
}