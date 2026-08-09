import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/config/environment';

// Supabase client for storage and realtime features
export const supabase = createClient(
  ENV.SUPABASE_URL || '',
  ENV.SUPABASE_ANON_KEY || ''
);

// Use environment variable for API URL with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Debug: Log the API URL being used
console.log('[API Client] Environment mode:', import.meta.env.MODE);
console.log('[API Client] Production mode:', import.meta.env.PROD);
console.log('[API Client] VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('[API Client] Final API URL being used:', API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for auth
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sh_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Debug: Log the error details
    console.error('[API Client] Request failed:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response',
      isNetworkError: !error.response
    });

    // Handle network errors
    if (!error.response) {
      // Network error or timeout
      return Promise.reject(new Error('Unable to connect to server. Please check your connection and try again.'));
    }
    
    // Handle 401s (Logged out/Expired)
    if (error.response?.status === 401) {
      const requestUrl = String(error.config?.url || '');
      const backendMessage =
        error?.response?.data?.message &&
        (Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message);
      const isSessionProbe =
        requestUrl.includes('/auth/profile') ||
        requestUrl.includes('/auth/verify-token');

      // Only clear token automatically for explicit session probes.
      // Other endpoints may fail with 401 for role/resource reasons.
      if (isSessionProbe) {
        localStorage.removeItem('sh_token');
      }

      const authError = new Error(
        String(backendMessage || 'Session expired or unauthorized. Please log in again.'),
      ) as Error & {
        status?: number;
        url?: string;
      };
      authError.status = 401;
      authError.url = requestUrl;
      return Promise.reject(authError);
    }
    
    const backendMessage =
      error?.response?.data?.message &&
      (Array.isArray(error.response.data.message)
        ? error.response.data.message.join(', ')
        : error.response.data.message);

    if (backendMessage) {
      return Promise.reject(new Error(String(backendMessage)));
    }

    return Promise.reject(error);
  }
);
