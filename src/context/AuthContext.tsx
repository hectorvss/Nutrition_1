import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken, setAuthToken, fetchWithAuth } from '../api';

interface User {
  id: string;
  email: string;
  role: 'MANAGER' | 'CLIENT';
  // For clients, the id of the manager who owns them. Used by Messages.tsx
  // to set the conversation recipient and by other client views that scope
  // requests to their own coach. The backend `/auth/login` and `/auth/me`
  // already return it; this declaration just exposes it to consumers.
  manager_id?: string | null;
  // For clients, the display name from clients_profiles.metadata. Hydrated
  // once after auth via /client/profile so views can greet the user by
  // first name without each one re-fetching the profile. Optional —
  // consumers should fall back to the email local part.
  full_name?: string | null;
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
    // Safely read the cached user — a corrupt localStorage value must never
    // throw here, or setIsLoading(false) would never run and the app would
    // hang forever on the loading screen.
    const getCachedUser = (): User | null => {
      try {
        const saved = localStorage.getItem('auth_user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        localStorage.removeItem('auth_user');
        return null;
      }
    };

    const checkAuthStatus = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token is still valid against the server
      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid — clear everything
          setAuthToken('');
          localStorage.removeItem('auth_user');
          setUser(null);
        } else if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
            // Hydrate the client's display name once so every view can read
            // user.full_name instead of refetching /client/profile or
            // falling back to email.split('@')[0]. Fire-and-forget — auth
            // is already valid, this only enriches the cached user.
            if (data.user.role === 'CLIENT') {
              fetch('/api/client/profile', { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.ok ? r.json() : null)
                .then(p => {
                  if (p?.full_name) {
                    setUser(prev => prev ? { ...prev, full_name: p.full_name } : prev);
                    try {
                      const cached = JSON.parse(localStorage.getItem('auth_user') || 'null');
                      if (cached) localStorage.setItem('auth_user', JSON.stringify({ ...cached, full_name: p.full_name }));
                    } catch { /* ignore */ }
                  }
                })
                .catch(() => { /* non-blocking */ });
            }
          }
        } else {
          // Server error — fall back to cached user to avoid logging out on flaky network
          setUser(getCachedUser());
        }
      } catch {
        // Network error — fall back to cached user
        setUser(getCachedUser());
      } finally {
        setIsLoading(false);
      }
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
