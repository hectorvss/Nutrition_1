import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWithAuth } from '../api';
import { useAuth } from './AuthContext';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
  isLoading: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    // Nav
    dashboard: "Panel de Control",
    tasks: "Tareas",
    calendar: "Calendario",
    clients: "Clientes",
    checkins: "Check-ins",
    messages: "Mensajes",
    nutrition: "Nutrición",
    training: "Entrenamiento",
    foods: "Alimentos",
    exercises: "Ejercicios",
    onboarding: "Onboarding",
    analytics: "Analítica",
    settings: "Configuración",
    
    // Settings Profile
    profile_details: "Detalles del Perfil",
    full_name: "Nombre Completo",
    professional_title: "Título Profesional",
    bio: "Biografía",
    language: "Idioma",
    save_changes: "Guardar Cambios",
    discard_changes: "Descartar Cambios",
    
    // Appearance
    appearance: "Apariencia",
    theme_color: "Color del Tema",
    dark_mode: "Modo Oscuro",

    // General & Tabs
    general: "General",
    profile: "Perfil",
    security: "Seguridad",
    integrations: "Integraciones",
    language_region: "Idioma y Región",
    select_language: "Seleccionar Idioma",
    spanish: "Español",
    english: "Inglés",
    timezone: "Zona Horaria",
    date_format: "Formato de Fecha",
    currency: "Moneda"
  },
  en: {
    // Nav
    dashboard: "Dashboard",
    tasks: "Tasks",
    calendar: "Calendar",
    clients: "Clients",
    checkins: "Check-ins",
    messages: "Messages",
    nutrition: "Nutrition",
    training: "Training",
    foods: "Foods & Recipes",
    exercises: "Exercises",
    onboarding: "Onboarding",
    analytics: "Analytics",
    settings: "Settings",

    // Settings Profile
    profile_details: "Profile Details",
    full_name: "Full Name",
    professional_title: "Professional Title",
    bio: "Bio",
    language: "Language",
    save_changes: "Save Profile",
    discard_changes: "Discard Changes",

    // Appearance
    appearance: "Appearance",
    theme_color: "Theme Color",
    dark_mode: "Dark Mode",

    // General & Tabs
    general: "General",
    profile: "Profile",
    security: "Security",
    integrations: "Integrations",
    language_region: "Language & Region",
    select_language: "Select Language",
    spanish: "Spanish",
    english: "English",
    timezone: "Timezone",
    date_format: "Date Format",
    currency: "Currency"
  }
};

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
        // We'll store language in the profile table
        await fetchWithAuth('/manager/profile', {
          method: 'POST',
          body: JSON.stringify({ language: lang })
        });
      } catch (err) {
        console.error('Error saving language preference:', err);
      }
    }
  };

  const t = (key: string) => {
    return translations[language][key] || key;
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
