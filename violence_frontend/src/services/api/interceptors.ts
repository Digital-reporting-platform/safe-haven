import { supabase } from './client';

// Setup any global interceptors or listeners here
export const setupInterceptors = () => {
  // Example: Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    // Handle auth state changes, e.g., update global state or redirect
  });
};
