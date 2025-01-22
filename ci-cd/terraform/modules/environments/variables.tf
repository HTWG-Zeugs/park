variable region {
  type    = string
  default = "europe-west1"
}

variable project_id {
  type    = string
}

variable project_number {
  type    = number
}

variable gateway_ip {
  type    = string
}

variable dns_zone_name {
  type    = string
}

variable dns_zone_domain_name {
  type    = string
}

variable environment_name {
  type    = string
}

variable domain {
  type    = string
}

variable subdomain {
  type    = string
}

variable repository {
  type    = string
}

variable git_tag {
  type    = string
}

variable identity_api_key {
  type    = string
}

variable identity_auth_domain {
  type    = string
}

variable infra_url {
  type    = string
}

variable auth_url {
  type    = string
}

variable tenant_id {
  type    = string
  default = null
}

variable tenant_type {
  type    = string
}

variable app_namespace {
  description = "The kubernetes namespace for the app services"
  type        = string
}

variable property_management_sa {
  description = "The service account to use for the property management service"
  type        = string
  default     = "prop-sa"
}

variable parking_management_sa {
  description = "The service account to use for the parking management service"
  type        = string
  default     = "park-sa"
}

variable frontend_sa {
  description = "The service account to use for the frontend service"
  type        = string
  default     = "front-sa"
}

variable defect_report_sa {
  description = "The service account to use for the defect report cloud function"
  type        = string
  default     = "df-r-sa"
}