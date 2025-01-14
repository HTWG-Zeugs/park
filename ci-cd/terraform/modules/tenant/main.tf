resource "google_identity_platform_tenant" "tenant" {
  display_name          = var.tenant_id
  allow_password_signup = true
}

output "tenant_id" {
  value = google_identity_platform_tenant.tenant.id
}