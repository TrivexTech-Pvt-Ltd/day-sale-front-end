export const APP_CONFIG = {
  TITLE: import.meta.env.VITE_APP_TITLE || 'Day Sale',
  VERSION: import.meta.env.VITE_APP_VERSION || '0.0.0',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7180/api',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};
