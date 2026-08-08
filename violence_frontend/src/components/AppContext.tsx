import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { User } from '@/types/user';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  language: string;
  setLanguage: (language: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('landing');
  const [language, setLanguage] = useState('ENG');

  const contextValue = useMemo(() => ({
    user,
    setUser,
    isLoading,
    setIsLoading,
    currentPage,
    setCurrentPage,
    language,
    setLanguage,
  }), [user, isLoading, currentPage, language]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined)
    throw new Error('useApp must be used within AppProvider');
  return context;
}
