/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROPERTY_MANAGEMENT_SERVICE_URL: string;
  readonly VITE_AUTHENTICATION_SERVICE_URL: string;
  readonly VITE_IDENTITY_PLATFORM_API_KEY: string;
  readonly VITE_IDENTITY_PLATFORM_AUTH_DOMAIN: string;
  readonly VITE_IDENTITY_PLATFORM_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
