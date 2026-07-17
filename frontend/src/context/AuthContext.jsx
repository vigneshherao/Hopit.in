import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '@/services/authService.js';
import { getAccessToken, onUnauthorized, setAccessToken } from '@/services/tokenStore.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setTokenState] = useState(getAccessToken());
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((session) => {
    setUser(session.user);
    setTokenState(session.accessToken);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setTokenState(null);
    setAccessToken(null);
  }, []);

  const refreshCurrentSession = useCallback(async () => {
    const session = await authService.refreshSession();
    applySession(session);
    return session;
  }, [applySession]);

  useEffect(() => {
    onUnauthorized(clearSession);

    async function restore() {
      try {
        const token = getAccessToken();
        if (token) {
          const { user: currentUser } = await authService.getMe();
          setUser(currentUser);
          setTokenState(token);
          return;
        }

        await refreshCurrentSession();
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    }

    void restore();
  }, [clearSession, refreshCurrentSession]);

  const login = useCallback(
    async (payload) => {
      const session = await authService.login(payload);
      applySession(session);
      return session;
    },
    [applySession],
  );

  const register = useCallback(
    async (payload) => {
      const session = await authService.register(payload);
      applySession(session);
      return session;
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      login,
      register,
      logout,
      refreshSession: refreshCurrentSession,
    }),
    [accessToken, isLoading, login, logout, refreshCurrentSession, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
