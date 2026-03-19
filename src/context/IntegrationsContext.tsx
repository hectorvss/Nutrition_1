import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWithAuth } from '../api';
import { useAuth } from './AuthContext';

interface Integrations {
  user_id: string;
  google_calendar_enabled: boolean;
  google_calendar_api_key: string | null;
  google_calendar_id: string | null;
  stripe_enabled: boolean;
  stripe_publishable_key: string | null;
  stripe_secret_key: string | null;
}

interface StripeBalance {
  balance: number;
  mrr: number;
  recent_revenue: number[];
  currency: string;
}

interface IntegrationsContextType {
  integrations: Integrations | null;
  stripeData: StripeBalance | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveIntegrations: (data: Partial<Integrations>) => Promise<void>;
  refreshStripeData: () => Promise<void>;
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

export const IntegrationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integrations | null>(null);
  const [stripeData, setStripeData] = useState<StripeBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth('/manager/integrations');
      setIntegrations(data);
      if (data?.stripe_enabled && data?.stripe_secret_key) {
        fetchStripeBalance();
      }
    } catch (err: any) {
      console.error('Error fetching integrations:', err);
      setError('Failed to load integration settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStripeBalance = async () => {
    try {
      const data = await fetchWithAuth('/manager/integrations/stripe/balance');
      setStripeData(data);
    } catch (err: any) {
      console.error('Error fetching stripe balance:', err);
    }
  };

  const saveIntegrations = async (data: Partial<Integrations>) => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = { ...integrations, ...data };
      const result = await fetchWithAuth('/manager/integrations', {
        method: 'POST',
        body: JSON.stringify(updated),
      });
      setIntegrations(result);
      if (result.stripe_enabled && result.stripe_secret_key) {
        fetchStripeBalance();
      } else {
        setStripeData(null);
      }
    } catch (err: any) {
      console.error('Error saving integrations:', err);
      setError('Failed to save integration settings.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIntegrations();
    }
  }, [user]);

  return (
    <IntegrationsContext.Provider value={{ 
      integrations, 
      stripeData, 
      isLoading, 
      isSaving, 
      error, 
      saveIntegrations,
      refreshStripeData: fetchStripeBalance
    }}>
      {children}
    </IntegrationsContext.Provider>
  );
};

export const useIntegrations = () => {
  const context = useContext(IntegrationsContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
};
