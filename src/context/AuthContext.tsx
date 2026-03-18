import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken, setAuthToken, fetchWithAuth } from '../api';

interface User {
  id: string;
  email: string;
  role: 'MANAGER' | 'CLIENT';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
       const token = getAuthToken();
       if (token) {
           // We can verify token by fetching user profile or just trust the local state/storage 
           // For robust implementation, we fetch the active user role if it's stored, or let fetchWithAuth fail internally
           // To keep it simple, we'll parse it from localstorage if not implemented a /me endpoint
           const savedUser = localStorage.getItem('auth_user');
           if (savedUser) {
             setUser(JSON.parse(savedUser));
           }
       }
       setIsLoading(false);
    };
    checkAuthStatus();
  }, []);

  const login = (token: string, userData: User) => {
    setAuthToken(token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    setAuthToken('');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
