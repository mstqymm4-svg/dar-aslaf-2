import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '@/lib/api/authApi';
import { tokenStore, INDEPENDENT_API_ENABLED } from '@/lib/api/config';
import { base44 } from '@/api/base44Client';
import { getAccountEmail, setAccountEmail } from '@/lib/activeUser';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: 'dau', public_settings: {} });

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    // 1. Independent Auth via JWT token
    if (INDEPENDENT_API_ENABLED) {
      if (tokenStore.access) {
        try {
          const me = await authApi.me();
          if (me) {
            setUser({
              ...me,
              full_name: me.fullName || me.email.split('@')[0],
              role: me.role || 'USER',
            });
            setIsAuthenticated(true);
            setAccountEmail(me.email);
            setIsLoadingAuth(false);
            return;
          }
        } catch (err) {
          console.warn('Token verification failed, clearing stale token:', err);
          tokenStore.clear();
        }
      }

      // Check if an offline account email exists
      const savedEmail = getAccountEmail();
      if (savedEmail) {
        setUser({
          email: savedEmail,
          full_name: savedEmail.split('@')[0],
          role: 'USER',
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
      return;
    }

    // 2. Base44 platform fallback (only if INDEPENDENT_API_ENABLED was explicitly turned off)
    try {
      const currentUser = await base44.auth.me();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      const savedEmail = getAccountEmail();
      if (savedEmail) {
        setUser({ email: savedEmail, role: 'USER' });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    setIsLoadingAuth(true);
    try {
      if (INDEPENDENT_API_ENABLED) {
        const result = await authApi.login(email, password);
        const u = {
          ...result.user,
          full_name: result.user.fullName || result.user.email.split('@')[0],
        };
        setUser(u);
        setIsAuthenticated(true);
        setAccountEmail(u.email);
        return u;
      } else {
        // Fallback local session
        const localUser = { email, full_name: email.split('@')[0], role: 'USER' };
        setUser(localUser);
        setIsAuthenticated(true);
        setAccountEmail(email);
        return localUser;
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const register = async (email, password, fullName) => {
    setIsLoadingAuth(true);
    try {
      if (INDEPENDENT_API_ENABLED) {
        const result = await authApi.register(email, password, fullName);
        const u = {
          ...result.user,
          full_name: result.user.fullName || fullName || result.user.email.split('@')[0],
        };
        setUser(u);
        setIsAuthenticated(true);
        setAccountEmail(u.email);
        return u;
      } else {
        const localUser = { email, full_name: fullName || email.split('@')[0], role: 'USER' };
        setUser(localUser);
        setIsAuthenticated(true);
        setAccountEmail(email);
        return localUser;
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      if (INDEPENDENT_API_ENABLED) {
        await authApi.logout().catch(() => {});
      }
    } finally {
      tokenStore.clear();
      setUser(null);
      setIsAuthenticated(false);
      try {
        localStorage.removeItem('dau_access_token');
        localStorage.removeItem('dau_refresh_token');
        localStorage.removeItem('base44_access_token');
        localStorage.removeItem('token');
      } catch {}
      if (shouldRedirect) {
        window.location.href = '/';
      }
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  useEffect(() => {
    checkUserAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      login,
      register,
      logout,
      navigateToLogin,
      checkAppState: checkUserAuth,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};