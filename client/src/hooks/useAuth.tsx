import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setAuthToken } from '../lib/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await authApi.me();
      setUser(data.user);
      // Persist the fresh token returned by /me (survives page refresh)
      if (data.token) {
        setAuthToken(data.token);
      }
    } catch (_) {
      setUser(null);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await authApi.login({ email, password });
      setAuthToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setError(err.data?.error || err.message || 'Login failed');
      throw err;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, role: string, phone?: string) => {
    setError(null);
    try {
      const data = await authApi.register({ email, password, name, role, phone });
      setAuthToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setError(err.data?.error || err.message || 'Registration failed');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // ignore errors on logout
    }
    setAuthToken(null);
    setUser(null);
  }, []);

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
