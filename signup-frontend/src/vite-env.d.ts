/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INFRASTRUCTURE_MANAGEMENT_SERVICE_URL: string;
  readonly VITE_AUTHENTICATION_SERVICE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}