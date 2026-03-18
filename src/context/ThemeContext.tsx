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

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ThemeSettings>({
    theme_color: '#10b981', // Default emerald-500
    dark_mode: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await fetchWithAuth('/manager/settings');
        if (data) {
          setSettings({
            theme_color: data.theme_color || '#10b981',
            dark_mode: data.dark_mode || false
          });
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
    
    if (user) {
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
