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

variable create_cluster {
  type    = bool
  default = true
}

variable tenants {
  type    = list(map(string))
  default = [
    {
      "id" = "free",
      "domain" = "free"
    },
    {
      "id" = "premium",
      "domain" = "premium"
    }
  ]
}