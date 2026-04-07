import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWithAuth } from '../api';
import { useAuth } from './AuthContext';
import { Language, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('es');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadLanguage = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await fetchWithAuth('/manager/profile');
        if (data && data.language) {
          setLanguageState(data.language as Language);
        }
      } catch (err) {
        console.error('Error loading language settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguage();
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    if (user) {
      try {
        await fetchWithAuth('/manager/profile', {
          method: 'POST',
          body: JSON.stringify({ language: lang })
        });
      } catch (err) {
        console.error('Error saving language preference:', err);
      }
    }
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    // Robust check for dictionary and key existence
    const langDict = translations[language] || translations['es'];
    if (!langDict) return key;

    let text = langDict[key] || key;
    
    if (params && typeof text === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        const value = (v !== null && v !== undefined) ? v.toString() : '';
        text = text.replace(`{${k}}`, value);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
export type { Language };
