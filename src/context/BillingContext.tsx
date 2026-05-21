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
  refresh: () => Promise<BillingStatus | null>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<BillingStatus | null> => {
    if (!user || user.role !== 'MANAGER') {
      setStatus(null);
      return null;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/manager/billing/status');
      if (data && typeof data === 'object' && !data.error) {
        setStatus(data as BillingStatus);
        return data as BillingStatus;
      }
      setError(data?.error || 'Failed to load billing status');
      return null;
    } catch (e: any) {
      setError(e?.message || 'Failed to load billing status');
      return null;
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

  // Returning from Stripe Checkout (?session_id=...): we DON'T rely on the
  // webhook. We call /stripe/sync-session, which retrieves the session +
  // subscription straight from Stripe and applies the plan upgrade server-side.
  // Then we refresh the status. A short poll covers the edge case of an
  // async/pending payment that finalises a few seconds later.
  useEffect(() => {
    if (!user || user.role !== 'MANAGER') return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) return;

    let cancelled = false;
    let attempts = 0;
    const clearParam = () => {
      const p = new URLSearchParams(window.location.search);
      p.delete('session_id');
      const qs = p.toString();
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''));
    };
    const syncAndRefresh = async () => {
      attempts++;
      let synced = false;
      try {
        const result = await fetchWithAuth('/stripe/sync-session', {
          method: 'POST',
          body: JSON.stringify({ sessionId }),
        });
        synced = !!result?.synced;
      } catch (e) {
        // sync-session failed (e.g. payment still pending) — fall back to a
        // plain status refresh and retry.
      }
      const fresh = await refresh();
      if (cancelled) return;
      const upgraded = !!(fresh && fresh.tier !== 'trial' && fresh.hasStripeSubscription);
      if (synced || upgraded || attempts >= 8) {
        clearParam();
        return;
      }
      setTimeout(syncAndRefresh, 2500);
    };
    syncAndRefresh();
    return () => { cancelled = true; };
  }, [user, refresh]);

  // Returning from the Stripe Billing Portal (?billing_updated=1): the plan
  // change may already be applied or land via webhook shortly after. Refresh
  // a few times spaced ~2s so the UI reflects the new plan, then strip the
  // param so a reload doesn't re-trigger it.
  useEffect(() => {
    if (!user || user.role !== 'MANAGER') return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has('billing_updated')) return;

    let cancelled = false;
    let attempts = 0;
    const clearParam = () => {
      const p = new URLSearchParams(window.location.search);
      p.delete('billing_updated');
      const qs = p.toString();
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''));
    };
    const poll = async () => {
      attempts++;
      await refresh();
      if (cancelled) return;
      if (attempts >= 3) {
        clearParam();
        return;
      }
      setTimeout(poll, 2000);
    };
    poll();
    return () => { cancelled = true; };
  }, [user, refresh]);

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
