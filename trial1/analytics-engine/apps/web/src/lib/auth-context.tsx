'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Tenant } from '@analytics-engine/shared';
import { apiClient } from './api-client';

interface AuthState {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshTenant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    tenant: null,
    loading: true,
    error: null,
  });

  const refreshTenant = useCallback(async () => {
    try {
      const res = await apiClient.get<Tenant>('/tenant/me');
      setState({ tenant: res.data, loading: false, error: null });
    } catch {
      setState({ tenant: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      refreshTenant();
    } else {
      setState({ tenant: null, loading: false, error: null });
    }
  }, [refreshTenant]);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await apiClient.post<{ accessToken: string; tenant: Tenant }>(
        '/auth/login',
        { email, password },
      );
      apiClient.setToken(res.data.accessToken);
      setState({ tenant: res.data.tenant, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setState({ tenant: null, loading: false, error: message });
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await apiClient.post<{ accessToken: string; tenant: Tenant }>(
        '/auth/register',
        { name, email, password },
      );
      apiClient.setToken(res.data.accessToken);
      setState({ tenant: res.data.tenant, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setState({ tenant: null, loading: false, error: message });
      throw err;
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    setState({ tenant: null, loading: false, error: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshTenant }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
