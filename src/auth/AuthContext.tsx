import { useState, type ReactNode } from 'react';
import { authApi, tokenStorage } from '../api/client';
import type { LoginRequest } from '../types/models';
import { AuthContext } from './authContextValue';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!tokenStorage.getAccess());
  const isLoading = false;

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