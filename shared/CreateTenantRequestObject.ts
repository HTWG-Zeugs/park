export type CreateTenantRequestObject = {
  name: string;
  type: string;
  subdomain: string;
  adminMail: string;
  adminName: string;
  adminPassword: string;
}