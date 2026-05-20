// Single source of truth for plan tiers and their limits.
// The frontend pricing UI must consume the same numbers (via /manager/billing/status
// or by mirroring this file in src/lib/plans.ts). DO NOT duplicate copy in the UI
// without updating the server, or enforcement will diverge from what users see.

export type PlanTier = 'trial' | 'professional' | 'scale' | 'unlimited';

export interface PlanLimits {
  // Unlimited resources are represented as null (not Infinity, so the value is JSON-safe).
  activeClients: number | null;
  monthlyMessages: number | null;
  storageGB: number | null;
  activeAutomations: number | null;
  activeAlerts: number | null;
  /** Advanced Workflow Builder — separate from the simple `activeAutomations`
   *  bucket because workflows are more powerful and we want to gate them harder. */
  activeWorkflows: number | null;
  /**
   * Limites sobre el motor de automatizaciones simples (workflow simple).
   * - `automationTriggerTier`: 'basic' = solo triggers core (lifecycle,
   *    weekly check-in reminder, inactivity, birthday). 'advanced' = TODO
   *    el catalogo (peso, adherencia, workouts, métricas avanzadas).
   * - `automationMaxStepsPerFlow`: longitud maxima de la cadena multi-step.
   *    1 = solo mensaje unico (compat). >=2 = encadenar wait + message +
   *    create_task + set_field + stop_if. null = sin limite.
   */
  automationTriggerTier: 'basic' | 'advanced';
  automationMaxStepsPerFlow: number | null;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  // 14-day free trial mirrors the Professional tier so users get the full first-paid
  // experience and the upgrade prompt feels lossless if they convert.
  trial: {
    activeClients: 20,
    monthlyMessages: 2_000,
    storageGB: 10,
    activeAutomations: 10,
    activeAlerts: 25,
    activeWorkflows: 3,
    automationTriggerTier: 'advanced',     // trial = experiencia completa
    automationMaxStepsPerFlow: 5,
  },
  professional: {
    activeClients: 20,
    monthlyMessages: 2_000,
    storageGB: 10,
    activeAutomations: 10,
    activeAlerts: 25,
    activeWorkflows: 3,
    automationTriggerTier: 'basic',        // solo triggers core
    automationMaxStepsPerFlow: 1,          // solo mensaje unico
  },
  scale: {
    activeClients: 60,
    monthlyMessages: 10_000,
    storageGB: 50,
    activeAutomations: 30,
    activeAlerts: 100,
    activeWorkflows: 10,
    automationTriggerTier: 'advanced',
    automationMaxStepsPerFlow: 5,
  },
  unlimited: {
    activeClients: null,
    monthlyMessages: null,
    storageGB: null,
    activeAutomations: null,
    activeAlerts: null,
    activeWorkflows: null,
    automationTriggerTier: 'advanced',
    automationMaxStepsPerFlow: null,
  },
};

export const TRIAL_DAYS = 14;

// Maps a Stripe price ID to its plan tier. Kept here so getPlanTier in stripe.ts
// and any future enforcement code share the same mapping.
export const PRICE_TO_TIER: Record<string, PlanTier> = {
  // Monthly
  'price_1TCN9vCR4WvolxlpwC33dk8J': 'professional',
  'price_1TCNAHCR4WvolxlpwpLRfmwX': 'scale',
  'price_1TCNAcCR4WvolxlptLzNYdsz': 'unlimited',
  // Annual (20% discount)
  'price_1TCf4PCR4Wvolxlp3MoDzi0J': 'professional',
  'price_1TCf52CR4WvolxlpcMMLOVpv': 'scale',
  'price_1TCf5cCR4WvolxlpWGhpOgnI': 'unlimited',
};

export function tierFromPriceId(priceId: string | null | undefined): PlanTier {
  if (!priceId) return 'professional';
  return PRICE_TO_TIER[priceId] || 'professional';
}

export function limitsForTier(tier: PlanTier | string | null | undefined): PlanLimits {
  const t = (tier && (PLAN_LIMITS as any)[tier]) ? (tier as PlanTier) : 'trial';
  return PLAN_LIMITS[t];
}

// True when the manager has *no* active access (trial expired and no paid sub,
// or paid sub in a terminal/blocking state). The frontend uses this to show the paywall.
export function isAccessBlocked(opts: {
  tier: string | null | undefined;
  status: string | null | undefined;
  trialEndsAt: string | null | undefined;
}): boolean {
  const { tier, status, trialEndsAt } = opts;
  if (tier === 'trial') {
    if (!trialEndsAt) return false;
    return new Date(trialEndsAt).getTime() < Date.now();
  }
  // For paid tiers, only block when Stripe explicitly says the customer cannot use the service.
  return ['canceled', 'unpaid', 'incomplete_expired'].includes(String(status || ''));
}

export function trialDaysLeft(trialEndsAt: string | null | undefined): number | null {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

// Express middleware that blocks resource creation when the manager has hit
// the limit for their tier. Returns HTTP 402 (Payment Required) with payload
// the frontend uses to render an upgrade modal.
//
// `countFn` returns the live count of the resource for this manager. We don't
// trust caches — billing decisions must reflect actual DB state.
//
// `resource` is one of the keys in PlanLimits, used to look up the cap.
export type LimitResource = keyof PlanLimits;

export function makeEnforceLimit(
  supabaseAdmin: any,
  resource: LimitResource,
  countFn: (userId: string) => Promise<number>,
) {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { data: sub } = await supabaseAdmin
        .from('manager_subscriptions')
        .select('plan_tier, status, trial_ends_at')
        .eq('user_id', userId)
        .maybeSingle();

      // Block access if trial expired or paid sub is in a terminal state.
      if (isAccessBlocked({
        tier: sub?.plan_tier,
        status: sub?.status,
        trialEndsAt: sub?.trial_ends_at,
      })) {
        return res.status(402).json({
          error: 'subscription_required',
          message: 'Your trial has ended. Subscribe to keep using this feature.',
          tier: sub?.plan_tier || 'trial',
          accessBlocked: true,
        });
      }

      const tier = (sub?.plan_tier as PlanTier) || 'trial';
      const limitRaw = limitsForTier(tier)[resource];
      // El enforce middleware solo aplica a resources NUMERICOS (cap por
      // cantidad). Para fields no numericos (e.g. automationTriggerTier que
      // es string) no enforces, simplemente pasamos. Es responsabilidad del
      // handler/route hacer el chequeo enum-based.
      if (limitRaw == null) return next(); // unlimited
      if (typeof limitRaw !== 'number') return next(); // resource no numerico

      const limit: number = limitRaw;
      const used = await countFn(userId);
      if (used >= limit) {
        return res.status(402).json({
          error: 'plan_limit_reached',
          message: `You've reached the ${resource} limit for your ${tier} plan.`,
          resource,
          tier,
          limit,
          used,
          accessBlocked: false,
        });
      }
      next();
    } catch (e: any) {
      // Never block a write because billing check failed — fail open and log.
      // Limits are a soft guard; Stripe is the hard one. Returning 500 here
      // would degrade the whole product if manager_subscriptions had a hiccup.
      console.error('enforceLimit failure:', e?.message);
      next();
    }
  };
}
