// Single source of truth for the plan tiers shown in the UI: Stripe price IDs,
// monthly prices and per-tier limits. Both the public Pricing grid and the
// in-app PaywallLimitModal import from here so prices/IDs can NEVER diverge
// (they used to be duplicated, and Unlimited drifted to a wrong 199€).
//
// Limits mirror server/lib/plans.ts (the enforcement source of truth). If the
// backend caps change, update them here too so what the user sees matches what
// is enforced.

export type PaidTier = 'professional' | 'scale' | 'unlimited';
export type PlanTier = 'trial' | PaidTier;

export interface UiPlanLimits {
  activeClients: number | null;   // null = unlimited
  monthlyMessages: number | null;
  storageGB: number | null;
  activeAutomations: number | null;
  activeAlerts: number | null;
}

export const PLAN_LIMITS: Record<PaidTier, UiPlanLimits> = {
  professional: { activeClients: 20,  monthlyMessages: 2_000,  storageGB: 2,  activeAutomations: 10, activeAlerts: 25 },
  scale:        { activeClients: 60,  monthlyMessages: 10_000, storageGB: 10, activeAutomations: 30, activeAlerts: 100 },
  unlimited:    { activeClients: null, monthlyMessages: null,  storageGB: null, activeAutomations: null, activeAlerts: null },
};

// Real monthly prices in EUR — the single source for every price label in the UI.
export const TIER_MONTHLY_PRICE: Record<PaidTier, number> = {
  professional: 39,
  scale: 79,
  unlimited: 99,
};

// Annual billing applies a 20% discount, shown as an effective monthly price
// (parity with the public Pricing grid).
export const ANNUAL_DISCOUNT = 0.2;

export function effectiveMonthly(tier: PaidTier, isAnnual: boolean): number {
  const base = TIER_MONTHLY_PRICE[tier];
  return isAnnual ? Math.round(base * (1 - ANNUAL_DISCOUNT)) : base;
}

// Stripe price IDs — mirror server/lib/plans.ts PRICE_TO_TIER.
export const PRICE_MAP: Record<PaidTier, { monthly: string; annual: string }> = {
  professional: { monthly: 'price_1TCN9vCR4WvolxlpwC33dk8J', annual: 'price_1TCf4PCR4Wvolxlp3MoDzi0J' },
  scale:        { monthly: 'price_1TCNAHCR4WvolxlpwpLRfmwX', annual: 'price_1TCf52CR4WvolxlpcMMLOVpv' },
  unlimited:    { monthly: 'price_1TCNAcCR4WvolxlptLzNYdsz', annual: 'price_1TCf5cCR4WvolxlpWGhpOgnI' },
};

export function priceIdFor(tier: PaidTier, isAnnual: boolean): string {
  return isAnnual ? PRICE_MAP[tier].annual : PRICE_MAP[tier].monthly;
}

export const TIER_LABEL: Record<PaidTier, string> = {
  professional: 'Professional',
  scale: 'Scale',
  unlimited: 'Unlimited',
};

// Localized feature bullets derived from the real limits, so the cards always
// reflect what each plan actually grants.
export function planFeatures(tier: PaidTier, isEs: boolean): string[] {
  const L = PLAN_LIMITS[tier];
  const fmt = (n: number) => n.toLocaleString(isEs ? 'es-ES' : 'en-US');
  const clients = L.activeClients == null
    ? (isEs ? 'Clientes ilimitados' : 'Unlimited clients')
    : (isEs ? `${L.activeClients} clientes activos` : `${L.activeClients} active clients`);
  const messages = L.monthlyMessages == null
    ? (isEs ? 'Mensajes ilimitados' : 'Unlimited messages')
    : (isEs ? `${fmt(L.monthlyMessages)} mensajes / mes` : `${fmt(L.monthlyMessages)} messages / month`);
  const automations = L.activeAutomations == null
    ? (isEs ? 'Motor completo + API' : 'Full engine + API')
    : tier === 'scale'
      ? (isEs ? 'Automatizaciones avanzadas + alertas' : 'Advanced automations + alerts')
      : (isEs ? 'Automatizaciones esenciales' : 'Essential automations');
  return [clients, messages, automations];
}
