'use client';

import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'analytics_engine_token';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    setToken(stored);
    setLoading(false);
  }, []);

  const login = useCallback((accessToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return { token, loading, login, logout, isAuthenticated: token !== null };
}
