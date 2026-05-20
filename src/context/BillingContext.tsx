import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { fetchWithAuth } from '../api';
import { useAuth } from './AuthContext';

export type PlanTier = 'trial' | 'professional' | 'scale' | 'unlimited';

export interface PlanLimits {
  activeClients: number | null;
  monthlyMessages: number | null;
  storageGB: number | null;
  activeAutomations: number | null;
  activeAlerts: number | null;
}

export interface BillingUsage {
  activeClients: number;
  monthlyMessages: number;
  storageGB: number;
  activeAutomations: number;
  activeAlerts: number;
}

export interface BillingStatus {
  tier: PlanTier;
  status: string;
  isTrial: boolean;
  trialEndsAt: string | null;
  trialDaysLeft: number | null;
  currentPeriodEnd: string | null;
  hasStripeSubscription: boolean;
  accessBlocked: boolean;
  limits: PlanLimits;
  usage: BillingUsage;
}

interface BillingContextType {
  status: BillingStatus | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user || user.role !== 'MANAGER') {
      setStatus(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/manager/billing/status');
      if (data && typeof data === 'object' && !data.error) {
        setStatus(data as BillingStatus);
      } else {
        setError(data?.error || 'Failed to load billing status');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load billing status');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load + reload on user change. Also refresh when the tab becomes
  // visible again so the trial countdown stays current after long idle periods.
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  // Server returned 402 (limit or blocked subscription) → reload status so the
  // banner / paywall reflect reality without waiting for the next visibility tick.
  useEffect(() => {
    const onLimit = () => refresh();
    window.addEventListener('billing:limit', onLimit as EventListener);
    return () => window.removeEventListener('billing:limit', onLimit as EventListener);
  }, [refresh]);

  return (
    <BillingContext.Provider value={{ status, isLoading, error, refresh }}>
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = (): BillingContextType => {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBilling must be used within a BillingProvider');
  return ctx;
};
