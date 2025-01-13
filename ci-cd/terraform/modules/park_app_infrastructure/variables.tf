variable region {
  type    = string
  default = "europe-west1"
}

variable project_id {
  type    = string
  default = ""
}

variable project_number {
  type    = number
}

variable infra_namespace {
  description = "The kubernetes namespace for the infrastructure services"
  type        = string
}

variable authentication_service_sa {
  description = "The service account to use for the authentication service"
  type        = string
  default     = "auth-sa"
}

variable domain_zone_name {
  description = "The DNS zone name for the park app"
  type        = string
}

variable domain_name {
  description = "The domain name for the park app"
  type        = string
}