variable is_github_actions {
  type    = bool
  default = false
}

variable region {
  type    = string
  default = "us-west1"
}

variable project_id {
  type    = string
  default = "park-production-448315"
}

variable domain_name {
  type    = string
}

variable create_cluster {
  type    = bool
  default = true
}

variable git_tag {
  type    = string
  default = ""
}