import { createContext } from 'react';
import type { LoginRequest } from '../types/models';

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);