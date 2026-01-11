import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginWithMicrosoft: (code: string) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync auth state from localStorage
  const syncAuthState = useCallback(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for stored token on mount
    syncAuthState();

    // Listen for storage changes (cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        syncAuthState();
      }
    };

    // Listen for custom auth events (same-tab synchronization)
    const handleAuthChange = () => {
      syncAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [syncAuthState]);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await api.auth.getMe();
      setUser(response.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMicrosoft = async (code: string) => {
    const response = await api.auth.microsoftCallback(code);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    // Dispatch custom event for same-tab synchronization
    window.dispatchEvent(new CustomEvent('auth-change'));
    return response; // Return response so caller can access user data
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    // Dispatch custom event for same-tab synchronization
    window.dispatchEvent(new CustomEvent('auth-change'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginWithMicrosoft,
        logout,
        isLoading,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

