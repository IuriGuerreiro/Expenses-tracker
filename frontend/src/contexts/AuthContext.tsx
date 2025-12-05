import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authApi.getMe();
      if (response.success && response.data) {
        setIsAuthenticated(true);
        setUserId(response.data.userId);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    if (response.success && response.data) {
      // Check if 2FA is required
      if ('requiresTwoFactor' in response.data && response.data.requiresTwoFactor) {
        // Throw the response so Login.tsx can handle 2FA flow
        throw { response: { data: response } };
      }

      // Normal login without 2FA
      if ('userId' in response.data) {
        setIsAuthenticated(true);
        setUserId(response.data.userId);
      }
    }
  };

  const register = async (email: string, password: string) => {
    const response = await authApi.register({ email, password });
    if (response.success && response.data) {
      setIsAuthenticated(true);
      setUserId(response.data.userId);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setIsAuthenticated(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userId, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
