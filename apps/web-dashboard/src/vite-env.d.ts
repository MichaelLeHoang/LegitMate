/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string;
  readonly VITE_SCORING_VERSION?: string;
  readonly VITE_LEGIT_VERSION?: string;
  readonly VITE_GITHUB_URL?: string;
  readonly VITE_CHROME_STORE_URL?: string;
  readonly VITE_EXTENSION_DOWNLOAD_URL?: string;
  readonly VITE_PRIVACY_URL?: string;
  readonly VITE_TERMS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
