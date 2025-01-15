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

data "google_project" "project" {}

module "ci_cd_infrastructure" {
  source = "../modules/ci_cd_infrastructure"
  region = var.region
  project_id = var.project_id
  github_org = "HTWG-Zeugs"
}

module "gke_cluster" {
  source = "../modules/gke_cluster"
  region = var.region
  project_id = var.project_id
  create_cluster = var.create_cluster
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
  source = "../modules/environments"
  region = var.region
  project_id = var.project_id
  project_number = data.google_project.project.number

  gateway_ip = module.park_app_infrastructure.gateway_ip
  dns_zone_name = module.park_app_infrastructure.dns_zone_name
  dns_zone_domain_name = module.park_app_infrastructure.dns_zone_domain_name

  environment_name = "free"
  subdomain = "free"
  app_namespace = "free-ns"
}

module "premium_tenants_env" {
  source = "../modules/environments"
  region = var.region
  project_id = var.project_id
  project_number = data.google_project.project.number

  gateway_ip = module.park_app_infrastructure.gateway_ip
  dns_zone_name = module.park_app_infrastructure.dns_zone_name
  dns_zone_domain_name = module.park_app_infrastructure.dns_zone_domain_name

  environment_name = "premium"
  subdomain = "premium"
  app_namespace = "premium-ns"
}

module "per_enterprise_tenant" {
  for_each = { for tenant in var.enterprise_tenants : tenant.id => tenant }

  source = "../modules/environments"
  region = var.region
  project_id = var.project_id
  project_number = data.google_project.project.number

  gateway_ip = module.park_app_infrastructure.gateway_ip
  dns_zone_name = module.park_app_infrastructure.dns_zone_name
  dns_zone_domain_name = module.park_app_infrastructure.dns_zone_domain_name

  environment_name = each.value.id
  subdomain = each.value.domain
  app_namespace = "enterprise-tenant-${each.value.id}-ns"
}

output "github_sa_email" {
  value = module.ci_cd_infrastructure.github_sa_email
}

output "workload_identity_pool_provider_name" {
  value = module.ci_cd_infrastructure.workload_identity_pool_provider_name
}

output "gateway_ip" {
  value = module.park_app_infrastructure.gateway_ip
}
