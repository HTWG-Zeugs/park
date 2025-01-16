variable is_github_actions {
  type    = bool
  default = false
}

variable region {
  type    = string
  default = "europe-west1"
}

variable project_id {
  type    = string
  default = "park-staging-444913"
}

variable domain_name {
  type    = string
}

variable create_cluster {
  type    = bool
  default = true
}

variable enterprise_tenants{
  type   = list(map(string))
}