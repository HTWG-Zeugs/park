terraform {
  required_version = ">= 1.0.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
    }
  }
}

provider "google" {
  credentials = var.is_github_actions ? null : file("terraform-key.json")
  project     = var.project_id
  region      = var.region
}

provider "kubernetes" {
  host                   = "https://${module.gke_cluster.cluster_endpoint}"
  cluster_ca_certificate = base64decode(module.gke_cluster.cluster_ca_certificate)
  token                  = data.google_client_config.provider.access_token
}

provider "helm" {
  kubernetes {
    host                   = "https://${module.gke_cluster.cluster_endpoint}"
    cluster_ca_certificate = base64decode(module.gke_cluster.cluster_ca_certificate)
    token                  = data.google_client_config.provider.access_token
  }
}

data "google_project" "project" {}
data "google_client_config" "provider" {}

data "google_storage_bucket_object_content" "deployment_info" {
  name   = "deployment.json"
  bucket = "park-staging-444913-terraform-state"
}

locals {
  git_tag = var.git_tag != "" ? var.git_tag : can(jsondecode(data.google_storage_bucket_object_content.deployment_info.content)) ? jsondecode(data.google_storage_bucket_object_content.deployment_info.content).git_tag : ""
}

locals {
  repository = "${var.region}-docker.pkg.dev/${var.project_id}/docker-repository"
  identity_auth_domain = "${ var.project_id}.firebaseapp.com"
}

module "gke_cluster" {
  source = "../modules/gke_cluster"
  region = var.region
  project_id = var.project_id
  create_cluster = var.create_cluster
}

module "ci_cd_infrastructure" {
  source = "../modules/ci_cd_infrastructure"
  region = var.region
  project_id = var.project_id
  github_org = "HTWG-Zeugs"
}

module "park_app_infrastructure" {
  depends_on = [ module.gke_cluster ]
  source = "../modules/park_app_infrastructure"
  region = var.region
  project_id = var.project_id
  project_number = data.google_project.project.number

  infra_namespace = "infra-ns"
  domain_name = var.domain_name
  domain_zone_name = "park-app-tech"
}

module "free_tenants_env" {
  depends_on = [ module.gke_cluster, module.park_app_infrastructure ]
  source = "../modules/environments"
  region = var.region
  project_id = var.project_id
  project_number = data.google_project.project.number

  gateway_ip = module.park_app_infrastructure.gateway_ip
  dns_zone_name = module.park_app_infrastructure.dns_zone_name
  dns_zone_domain_name = module.park_app_infrastructure.dns_zone_domain_name

  environment_name = "free"
  domain = var.domain_name
  subdomain = "free"
  app_namespace = "free-ns"
  repository = local.repository
  git_tag = local.git_tag
  identity_api_key = module.park_app_infrastructure.identity_platform_api_key
  identity_auth_domain = local.identity_auth_domain
  infra_url = "https://infrastructure-administration-${ data.google_project.project.number }.${ var.region }.run.app"
  auth_url = "https://authentication-service-${ data.google_project.project.number }.${ var.region }.run.app"
  tenant_type = "free"
  tenant_id = "NOT_SET"
}

module "premium_tenants_env" {
  depends_on = [ module.gke_cluster, module.park_app_infrastructure ]
  source = "../modules/environments"
  region = var.region
  project_id = var.project_id
  project_number = data.google_project.project.number

  gateway_ip = module.park_app_infrastructure.gateway_ip
  dns_zone_name = module.park_app_infrastructure.dns_zone_name
  dns_zone_domain_name = module.park_app_infrastructure.dns_zone_domain_name

  environment_name = "premium"
  domain = var.domain_name
  subdomain = "premium"
  app_namespace = "premium-ns"
  repository = local.repository
  git_tag = local.git_tag
  identity_api_key = module.park_app_infrastructure.identity_platform_api_key
  identity_auth_domain = local.identity_auth_domain
  infra_url = "https://infrastructure-administration-${ data.google_project.project.number }.${ var.region }.run.app"
  auth_url = "https://authentication-service-${ data.google_project.project.number }.${ var.region }.run.app"
  tenant_type = "premium"
  tenant_id = "NOT_SET"
}

data "google_storage_bucket_object_content" "enterprise_tenants" {
  name   = "enterprise-tenants.json"
  bucket = "park-staging-444913-terraform-state"
}
locals {
  enterprise_tenants = can(jsondecode(data.google_storage_bucket_object_content.enterprise_tenants.content)) ? jsondecode(data.google_storage_bucket_object_content.enterprise_tenants.content) : []
}

module "per_enterprise_tenant" {
  depends_on = [ module.gke_cluster, module.park_app_infrastructure ]
  for_each = { for tenant in local.enterprise_tenants : tenant.tenantId => tenant }
  source = "../modules/environments"
  region = var.region
  project_id = var.project_id
  project_number = data.google_project.project.number

  gateway_ip = module.park_app_infrastructure.gateway_ip
  dns_zone_name = module.park_app_infrastructure.dns_zone_name
  dns_zone_domain_name = module.park_app_infrastructure.dns_zone_domain_name

  environment_name = each.value.tenantId
  domain = var.domain_name
  subdomain = each.value.dns
  app_namespace = "${each.value.tenantId}-ns"
  repository = local.repository
  git_tag = local.git_tag
  identity_api_key = module.park_app_infrastructure.identity_platform_api_key
  identity_auth_domain = local.identity_auth_domain
  infra_url = "https://infrastructure-administration-${ data.google_project.project.number }.${ var.region }.run.app"
  auth_url = "https://authentication-service-${ data.google_project.project.number }.${ var.region }.run.app"
  tenant_type = "enterprise"
  tenant_id = each.value.tenantId
}

output "github_sa_email" {
  value = module.ci_cd_infrastructure.github_sa_email
}

output "workload_identity_pool_provider_name" {
  value = module.ci_cd_infrastructure.workload_identity_pool_provider_name
}