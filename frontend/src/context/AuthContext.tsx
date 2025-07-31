'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginRequest, SignupRequest } from '@/types';
import { authAPI } from '@/services/api';
import { storage, getErrorMessage } from '@/utils';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  signup: (userData: SignupRequest) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    // Check for existing auth data on mount
    const savedToken = storage.get('token');
    const savedUser = storage.get('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.token) {
        setToken(response.token);
        storage.set('token', response.token);
        
        if (response.refresh_token) {
          storage.set('refresh_token', response.refresh_token);
        }
        
        // Create user object from response
        const userData: User = {
          _id: response.InsertedID || '',
          first_name: '',
          last_name: '',
          email: credentials.email,
          phone: '',
          user_id: response.InsertedID || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usercart: [],
          address: [],
          order_status: []
        };
        
        setUser(userData);
        storage.set('user', userData);
        
        toast.success('Login successful!');
        return true;
      }
      
      toast.error('Login failed');
      return false;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.signup(userData);
      
      if (response.InsertedID) {
        toast.success('Account created successfully! Please login.');
        return true;
      }
      
      toast.error('Signup failed');
      return false;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    storage.remove('token');
    storage.remove('refresh_token');
    storage.remove('user');
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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