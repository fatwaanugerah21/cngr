import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiHttpError } from './api';
import { AuthContext } from './auth-context';
import { clearSessionAuth, loginWithUsernamePassword, type LoginCredentials } from './auth';
import { clearStoredAccessToken, getStoredAccessToken, setStoredAccessToken } from './auth-session';
import { fetchCurrentAccountProfile, type AccountProfileData } from './cngr-api';
import { clearNavigationSession, clearStoredSelectedSite, setStoredUserRole } from './navigation-session';

function isExpiredSessionError(error: unknown): boolean {
  return error instanceof ApiHttpError && (error.status === 401 || error.status === 403);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountProfileData | undefined>();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasAccessToken, setHasAccessToken] = useState(() => getStoredAccessToken() !== undefined);

  const clearAuthState = useCallback(() => {
    clearStoredAccessToken();
    clearNavigationSession();
    setUser(undefined);
    setHasAccessToken(false);
  }, []);

  const syncCurrentUser = useCallback(async (): Promise<AccountProfileData | undefined> => {
    if (getStoredAccessToken() === undefined) {
      clearAuthState();
      return undefined;
    }

    try {
      const profile = await fetchCurrentAccountProfile();
      if (!profile?.id) {
        clearAuthState();
        return undefined;
      }

      setUser(profile);
      setHasAccessToken(true);
      setStoredUserRole(profile.role);
      return profile;
    } catch (error) {
      if (isExpiredSessionError(error)) {
        clearAuthState();
      }
      throw error;
    }
  }, [clearAuthState]);

  useEffect(() => {
    let cancelled = false;

    async function initializeAuth() {
      if (getStoredAccessToken() === undefined) {
        if (!cancelled) {
          setUser(undefined);
          setHasAccessToken(false);
          setIsInitializing(false);
        }
        return;
      }

      try {
        const profile = await fetchCurrentAccountProfile();
        if (cancelled) {
          return;
        }
        if (!profile?.id) {
          clearAuthState();
          return;
        }
        setUser(profile);
        setHasAccessToken(true);
        setStoredUserRole(profile.role);
      } catch (error) {
        if (!cancelled && isExpiredSessionError(error)) {
          clearAuthState();
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    }

    initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [clearAuthState]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AccountProfileData> => {
      const { token } = await loginWithUsernamePassword(credentials);
      setStoredAccessToken(token);
      setHasAccessToken(true);

      try {
        const profile = await syncCurrentUser();
        if (!profile?.role) {
          throw new Error('Gagal memuat data akun setelah login.');
        }

        clearStoredSelectedSite();
        return profile;
      } catch (error) {
        clearSessionAuth();
        clearNavigationSession();
        setUser(undefined);
        setHasAccessToken(false);
        throw error;
      }
    },
    [syncCurrentUser]
  );

  const logout = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  const setCurrentUser = useCallback((nextUser: AccountProfileData | undefined) => {
    setUser(nextUser);
    if (nextUser) {
      setStoredUserRole(nextUser.role);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: hasAccessToken && user !== undefined,
      isInitializing,
      login,
      logout,
      refreshCurrentUser: syncCurrentUser,
      setCurrentUser,
    }),
    [hasAccessToken, isInitializing, login, logout, setCurrentUser, syncCurrentUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
