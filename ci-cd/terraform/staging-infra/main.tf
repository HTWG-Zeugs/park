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

module "gke_cluster" {
  source = "../modules/gke_cluster"
  region = var.region
  project_id = var.project_id
}

module "ci_cd_infrastructure" {
  source = "../modules/ci_cd_infrastructure"
  region = var.region
  project_id = var.project_id
  github_org = "HTWG-Zeugs"
}

output "github_sa_email" {
  value = module.ci_cd_infrastructure.github_sa_email
}

output "workload_identity_pool_provider_name" {
  value = module.ci_cd_infrastructure.workload_identity_pool_provider_name
}