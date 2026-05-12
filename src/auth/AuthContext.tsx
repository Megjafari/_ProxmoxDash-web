import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, tokenStorage } from '../api/client';
import type { LoginRequest } from '../types/models';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount, check if we have a stored access token
    const token = tokenStorage.getAccess();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = async (request: LoginRequest) => {
    const tokens = await authApi.login(request);
    tokenStorage.set(tokens);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const refreshToken = tokenStorage.getRefresh();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Ignore — we're logging out anyway
      }
    }
    tokenStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}