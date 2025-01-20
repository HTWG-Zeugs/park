resource "google_service_account" "node_sa" {
  account_id   = "gke-node"
  display_name = "GKE Node Service Account"
}

resource "google_project_iam_member" "gke_node_sa_node_service_account" {
  project = var.project_id
  role    = "roles/container.defaultNodeServiceAccount"
  member = "serviceAccount:${google_service_account.node_sa.email}"
}

resource "google_project_iam_member" "gke_node_sa_registry_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member = "serviceAccount:${google_service_account.node_sa.email}"
}

# Create a custom VPC
resource "google_compute_network" "vpc" {
  name                    = "${var.project_id}-vpc"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
}

# Create a custom subnet for the cluster
resource "google_compute_subnetwork" "subnet" {
  name                     = "${var.project_id}-subnet"
  ip_cidr_range            = "10.0.0.0/18"
  region                   = var.region
  network                  = google_compute_network.vpc.id
  private_ip_google_access = true

  secondary_ip_range {
    range_name    = "k8s-pod-range"
    ip_cidr_range = "10.48.0.0/14"
  }

  secondary_ip_range {
    range_name    = "k8s-service-range"
    ip_cidr_range = "10.52.0.0/20"
  }
}

# Create a GKE Standard cluster (non-Autopilot)
resource "google_container_cluster" "primary" {
  count = var.create_cluster ? 1 : 0
  name              = "${var.project_id}-gke"
  location          = var.region
  networking_mode   = "VPC_NATIVE"
  deletion_protection = false
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.self_link
  subnetwork = google_compute_subnetwork.subnet.self_link

  ip_allocation_policy {
    cluster_secondary_range_name  = "k8s-pod-range"
    services_secondary_range_name = "k8s-service-range"
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  node_config {
    service_account = google_service_account.node_sa.email
  }

  gateway_api_config {
    channel = "CHANNEL_STANDARD"
  }

  addons_config {
    http_load_balancing {
      disabled = false
    }
  }
}

# Create a single node pool for the cluster
resource "google_container_node_pool" "default_pool" {
  count = var.create_cluster ? 1 : 0
  cluster    = google_container_cluster.primary[0].name
  location   = var.region
  node_count = 3

  node_config {
    service_account = google_service_account.node_sa.email
    workload_metadata_config {
      mode = "GKE_METADATA"
    }
    machine_type = "e2-medium"
    labels = {
      env = "default"
    }
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  autoscaling {
    min_node_count = 1
    max_node_count = 1
  }
}