export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || '',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
} as const;

// Debug: Log environment configuration
console.log('[Environment] Environment config loaded:', {
  API_URL: ENV.API_URL ? 'Set' : 'Not set',
  SUPABASE_URL: ENV.SUPABASE_URL ? 'Set' : 'Not set',
  SUPABASE_ANON_KEY: ENV.SUPABASE_ANON_KEY ? 'Set' : 'Not set',
  NODE_ENV: ENV.NODE_ENV,
  IS_PRODUCTION: ENV.IS_PRODUCTION,
  IS_DEVELOPMENT: ENV.IS_DEVELOPMENT,
  rawVITE_API_URL: import.meta.env.VITE_API_URL,
});
