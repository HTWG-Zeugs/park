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

variable git_tag {
  type    = string
  default = ""
}

variable "enterprise_tenants_json" {
  type        = string
  default     = "[]"
  description = "Raw JSON string of enterprise tenants."
}