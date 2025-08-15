"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authApi, tokenStorage } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; requiresVerification?: boolean; email?: string }>;
  register: (name: string, email: string, password: string, image?: File) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (tokenStorage.isAuthenticated()) {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
        tokenStorage.removeToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authApi.login({ email, password });
      tokenStorage.setToken(response.token);
      setUser(response.user);
      router.push('/dashboard');
      return { success: true };
    } catch (error: any) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        return { 
          success: false, 
          requiresVerification: true, 
          email 
        };
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, image?: File) => {
    try {
      setLoading(true);
      const response = await authApi.register({ name, email, password, image });
      // Don't set token here as user needs to verify email first
      // Just show success message and redirect to verification page
      router.push('/auth/verify-email?email=' + encodeURIComponent(email));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenStorage.removeToken();
    setUser(null);
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    loading,
    setUser,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
