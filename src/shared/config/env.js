/** Centralized runtime configuration. Keep environment access out of feature UI. */
export const appConfig = Object.freeze({
  sheetsEndpoint: import.meta.env.VITE_SHEETS_ENDPOINT || '',
  isProduction: import.meta.env.PROD,
});
