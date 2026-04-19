import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { authApi, setAuthToken, TOKEN_STORAGE_KEY } from '../services/api';

const AuthContext = createContext(null);

function persistToken(token) {
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  setAuthToken(token);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    persistToken(storedToken);

    authApi
      .me()
      .then(({ user: restoredUser }) => {
        setUser(restoredUser);
      })
      .catch(() => {
        persistToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function signIn(credentials) {
    const response = await authApi.login(credentials);
    persistToken(response.token);
    setUser(response.user);
    return response.user;
  }

  async function signUp(details) {
    const response = await authApi.register(details);
    persistToken(response.token);
    setUser(response.user);
    return response.user;
  }

  function signOut() {
    persistToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
