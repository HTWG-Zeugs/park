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
  authentication_service_sa = "authentication-service-sa"
  domain_name = "park-app.tech"
  domain_zone_name = "park-app-tech"
}

module "per_tenant" {
  for_each = { for tenant in var.tenants : tenant.id => tenant }

  source = "../modules/tenants"
  region = var.region
  project_id = var.project_id
  project_number = data.google_project.project.number

  property_management_sa = "property-management-sa"
  parking_management_sa = "parking-management-sa"
  frontend_sa = "frontend-sa"
  gateway_ip = module.park_app_infrastructure.gateway_ip
  dns_zone_name = module.park_app_infrastructure.dns_zone_name
  dns_zone_domain_name = module.park_app_infrastructure.dns_zone_domain_name

  tenant_id = each.value.id
  tenant_subdomain = each.value.domain
  app_namespace = each.value.domain
}

output "github_sa_email" {
  value = module.ci_cd_infrastructure.github_sa_email
}

output "workload_identity_pool_provider_name" {
  value = module.ci_cd_infrastructure.workload_identity_pool_provider_name
}
