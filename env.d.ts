/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMOB_APP_ID: string;
  readonly VITE_ADMOB_BANNER_ID: string;
  readonly VITE_ADMOB_INTERSTITIAL_ID: string;
  readonly VITE_ADMOB_REWARDED_ID: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_APPSFLYER_DEV_KEY: string;
  readonly VITE_APPMETRICA_API_KEY: string;
  readonly VITE_IRONSOURCE_APP_KEY: string;
  readonly VITE_IRONSOURCE_BANNER_ID: string;
  readonly VITE_IRONSOURCE_REWARDED_ID: string;

}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}