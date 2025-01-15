/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROPERTY_MANAGEMENT_SERVICE_URL: string;
  readonly VITE_PARKING_MANAGEMENT_SERVICE_URL: string;
  readonly VITE_INFRASTRUCTURE_MANAGEMENT_SERVICE_URL: string;
  readonly VITE_AUTHENTICATION_SERVICE_URL: string;
  readonly VITE_IDENTITY_PLATFORM_API_KEY: string;
  readonly VITE_IDENTITY_PLATFORM_AUTH_DOMAIN: string;
  readonly VITE_IDENTITY_PLATFORM_PROJECT_ID: string;
  readonly VITE_TENANT_ID: string;
  readonly VITE_TENANT_TYPE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
