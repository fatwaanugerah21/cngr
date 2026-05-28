import { createContext, useContext } from 'react';
import type { AccountProfileData } from './cngr-api';
import type { LoginCredentials } from './auth';

export type AuthContextValue = {
  user: AccountProfileData | undefined;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (credentials: LoginCredentials) => Promise<AccountProfileData>;
  logout: () => void;
  refreshCurrentUser: () => Promise<AccountProfileData | undefined>;
  setCurrentUser: (user: AccountProfileData | undefined) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}

export { AuthContext };
