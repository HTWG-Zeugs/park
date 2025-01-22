terraform {
  required_version = ">= 1.0.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
    }
  }
}

data "google_container_cluster" "primary" {
  name     = "${var.project_id}-gke"
  location = var.region
}

provider "google" {
  credentials = var.is_github_actions ? null : file("terraform-key.json")
  project     = var.project_id
  region      = var.region
}

provider "kubernetes" {
  host                   = "https://${data.google_container_cluster.primary.endpoint}"
  cluster_ca_certificate = base64decode(data.google_container_cluster.primary.master_auth[0].cluster_ca_certificate)
  token                  = data.google_client_config.provider.access_token
}

provider "helm" {
  kubernetes {
    host                   = "https://${data.google_container_cluster.primary.endpoint}"
    cluster_ca_certificate = base64decode(data.google_container_cluster.primary.master_auth[0].cluster_ca_certificate)
    token                  = data.google_client_config.provider.access_token
  }
}

data "google_project" "project" {}
data "google_client_config" "provider" {}

locals {
  repository = "${var.region}-docker.pkg.dev/${var.project_id}/docker-repository"
  identity_auth_domain = "${ var.project_id}.firebaseapp.com"
}

module "park_app_infrastructure" {
  source = "../modules/park_app_infrastructure"
  region = var.region
  project_id = var.project_id
  project_number = data.google_project.project.number

  infra_namespace = "infra-ns"
  domain_name = var.domain_name
  domain_zone_name = "park-app-tech"
}

module "free_tenants_env" {
  depends_on = [ module.park_app_infrastructure ]
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
  git_tag = var.git_tag
  identity_api_key = module.park_app_infrastructure.identity_platform_api_key
  identity_auth_domain = local.identity_auth_domain
  infra_url = "https://infrastructure-administration-${ data.google_project.project.number }.${ var.region }.run.app"
  auth_url = "https://authentication-service-${ data.google_project.project.number }.${ var.region }.run.app"
  tenant_type = "free"
  tenant_id = "NOT_SET"
}

module "premium_tenants_env" {
  depends_on = [ module.park_app_infrastructure ]
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
  git_tag = var.git_tag
  identity_api_key = module.park_app_infrastructure.identity_platform_api_key
  identity_auth_domain = local.identity_auth_domain
  infra_url = "https://infrastructure-administration-${ data.google_project.project.number }.${ var.region }.run.app"
  auth_url = "https://authentication-service-${ data.google_project.project.number }.${ var.region }.run.app"
  tenant_type = "premium"
  tenant_id = "NOT_SET"
}

locals {
  enterprise_tenants = jsondecode(var.enterprise_tenants_json)
}

module "per_enterprise_tenant" {
  depends_on = [ module.park_app_infrastructure ]
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
  git_tag = var.git_tag
  identity_api_key = module.park_app_infrastructure.identity_platform_api_key
  identity_auth_domain = local.identity_auth_domain
  infra_url = "https://infrastructure-administration-${ data.google_project.project.number }.${ var.region }.run.app"
  auth_url = "https://authentication-service-${ data.google_project.project.number }.${ var.region }.run.app"
  tenant_type = "enterprise"
  tenant_id = each.value.tenantId
}