import { useState, useEffect } from 'react';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const loadUser = () => {
      try {
        const userJson = localStorage.getItem('sh_user');
        const token = localStorage.getItem('sh_token');

        if (userJson && token) {
          const user = JSON.parse(userJson) as User;
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    loadUser();

    // Listen for storage changes (e.g., login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sh_user' || e.key === 'sh_token') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return state;
}
