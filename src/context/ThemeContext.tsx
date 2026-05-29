import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWithAuth } from '../api';
import { useAuth } from './AuthContext';

interface ThemeSettings {
  theme_color: string;
  dark_mode: boolean;
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateTheme: (newSettings: Partial<ThemeSettings>) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Cache local de las preferencias de tema para eliminar el FOUC: en la
// PRIMERA carga inicializamos desde aquí (no desde el default) para que no
// se vea el color/tema por defecto y luego un salto a la preferencia real
// del manager un par de segundos después.
const THEME_CACHE_KEY = 'theme_settings_cache';
const readThemeCache = (): ThemeSettings => {
  try {
    const raw = localStorage.getItem(THEME_CACHE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        theme_color: typeof p.theme_color === 'string' ? p.theme_color : '#10b981',
        dark_mode: !!p.dark_mode,
      };
    }
  } catch { /* ignore */ }
  return { theme_color: '#10b981', dark_mode: false };
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ThemeSettings>(readThemeCache);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      // /manager/settings is manager-only. Clients keep the default theme.
      if (user.role !== 'MANAGER') {
        setIsLoading(false);
        return;
      }
      try {
        const data = await fetchWithAuth('/manager/settings');
        if (data) {
          const fresh = {
            theme_color: data.theme_color || '#10b981',
            dark_mode: data.dark_mode || false,
          };
          setSettings(fresh);
          // Cacheamos para que la próxima carga arranque ya con la
          // preferencia correcta (sin parpadeo).
          try { localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(fresh)); } catch { /* ignore */ }
        }
      } catch (err) {
        console.error('Error loading theme settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [user]);

  useEffect(() => {
    // Apply theme color to CSS Variables
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', settings.theme_color);
    
    // Apply dark mode class
    if (settings.dark_mode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  const updateTheme = async (newSettings: Partial<ThemeSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try { localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }

    if (user && user.role === 'MANAGER') {
      try {
        await fetchWithAuth('/manager/settings', {
          method: 'POST',
          body: JSON.stringify(updated)
        });
      } catch (err) {
        console.error('Error saving theme settings:', err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ settings, updateTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
