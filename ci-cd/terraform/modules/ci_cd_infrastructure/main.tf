

resource "google_artifact_registry_repository" "docker_repository" {
  project       = var.project_id
  location      = var.region
  repository_id = "docker-repository"
  format        = "DOCKER"
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
  project                            = var.project_id
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
    "roles/serviceusage.serviceUsageAdmin",
    "roles/run.admin"
  ]
}

resource "google_project_iam_member" "github-sa-iam-member" {
  for_each = { for value in var.github_sa_roles : value => value }
  project = var.project_id
  role    = each.value
  member = "serviceAccount:${google_service_account.github_sa.email}"
}


output "github_sa_email" {
  value = google_service_account.github_sa.email
}

output "workload_identity_pool_provider_name" {
  value = google_iam_workload_identity_pool_provider.github_identity_provider.name
}

resource "kubernetes_namespace" "infra" {
  metadata {
    name = "infra-ns"
    annotations = {
      "iam.gke.io/gcp-service-account" : "cert-manager@${ var.project_id }.iam.gserviceaccount.com"
    }
  }
}

resource "helm_release" "cert_manager" {
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

resource "helm_release" "infrastructure" {
  name  = "park-infra"
  chart = "../../../helm/infrastructure"
  namespace = kubernetes_namespace.infra.metadata.0.name
  create_namespace = false
  set {
    name  = "projectId"
    value = var.project_id
  }
  set {
    name  = "domain"
    value = var.domain
  }
}