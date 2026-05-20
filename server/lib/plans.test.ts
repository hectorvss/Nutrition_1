import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PLAN_LIMITS,
  TRIAL_DAYS,
  tierFromPriceId,
  limitsForTier,
  isAccessBlocked,
  trialDaysLeft,
  PRICE_TO_TIER,
} from './plans';

// ---- tierFromPriceId -----------------------------------------------------

describe('tierFromPriceId', () => {
  it('maps known monthly professional price to professional tier', () => {
    expect(tierFromPriceId('price_1TCN9vCR4WvolxlpwC33dk8J')).toBe('professional');
  });

  it('maps known monthly scale price to scale tier', () => {
    expect(tierFromPriceId('price_1TCNAHCR4WvolxlpwpLRfmwX')).toBe('scale');
  });

  it('maps known monthly unlimited price to unlimited tier', () => {
    expect(tierFromPriceId('price_1TCNAcCR4WvolxlptLzNYdsz')).toBe('unlimited');
  });

  it('defaults to professional for unknown price ID', () => {
    expect(tierFromPriceId('price_unknown')).toBe('professional');
  });

  it('defaults to professional for null', () => {
    expect(tierFromPriceId(null)).toBe('professional');
  });

  it('defaults to professional for undefined', () => {
    expect(tierFromPriceId(undefined)).toBe('professional');
  });

  it('all keys in PRICE_TO_TIER map to valid tiers', () => {
    const validTiers = Object.keys(PLAN_LIMITS);
    for (const [priceId, tier] of Object.entries(PRICE_TO_TIER)) {
      expect(validTiers, `price ${priceId} maps to invalid tier`).toContain(tier);
    }
  });
});

// ---- limitsForTier -------------------------------------------------------

describe('limitsForTier', () => {
  it('returns trial limits for trial tier', () => {
    expect(limitsForTier('trial')).toEqual(PLAN_LIMITS.trial);
  });

  it('returns professional limits for professional tier', () => {
    expect(limitsForTier('professional')).toEqual(PLAN_LIMITS.professional);
  });

  it('returns scale limits for scale tier', () => {
    expect(limitsForTier('scale')).toEqual(PLAN_LIMITS.scale);
  });

  it('returns unlimited limits for unlimited tier', () => {
    expect(limitsForTier('unlimited')).toEqual(PLAN_LIMITS.unlimited);
    expect(limitsForTier('unlimited').activeClients).toBeNull();
  });

  it('falls back to trial limits for unknown tier', () => {
    expect(limitsForTier('bogus')).toEqual(PLAN_LIMITS.trial);
  });

  it('falls back to trial limits for null', () => {
    expect(limitsForTier(null)).toEqual(PLAN_LIMITS.trial);
  });

  it('professional tier has lower workflow cap than scale', () => {
    const pro = limitsForTier('professional');
    const scale = limitsForTier('scale');
    expect(pro.activeWorkflows!).toBeLessThan(scale.activeWorkflows!);
  });

  it('unlimited tier has null limits for all numeric resources', () => {
    const ul = limitsForTier('unlimited');
    expect(ul.activeClients).toBeNull();
    expect(ul.monthlyMessages).toBeNull();
    expect(ul.storageGB).toBeNull();
    expect(ul.activeAutomations).toBeNull();
    expect(ul.activeWorkflows).toBeNull();
  });
});

// ---- isAccessBlocked -----------------------------------------------------

describe('isAccessBlocked', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false for trial with future expiry', () => {
    expect(isAccessBlocked({ tier: 'trial', status: null, trialEndsAt: '2025-12-31' })).toBe(false);
  });

  it('returns true for trial with past expiry', () => {
    expect(isAccessBlocked({ tier: 'trial', status: null, trialEndsAt: '2025-01-01' })).toBe(true);
  });

  it('returns false for trial with no expiry date', () => {
    expect(isAccessBlocked({ tier: 'trial', status: null, trialEndsAt: null })).toBe(false);
  });

  it('returns false for active paid subscription', () => {
    expect(isAccessBlocked({ tier: 'professional', status: 'active', trialEndsAt: null })).toBe(false);
  });

  it('returns true for canceled paid subscription', () => {
    expect(isAccessBlocked({ tier: 'professional', status: 'canceled', trialEndsAt: null })).toBe(true);
  });

  it('returns true for unpaid subscription', () => {
    expect(isAccessBlocked({ tier: 'scale', status: 'unpaid', trialEndsAt: null })).toBe(true);
  });

  it('returns true for incomplete_expired subscription', () => {
    expect(isAccessBlocked({ tier: 'professional', status: 'incomplete_expired', trialEndsAt: null })).toBe(true);
  });

  it('returns false for past_due subscription (not in blocking list)', () => {
    expect(isAccessBlocked({ tier: 'scale', status: 'past_due', trialEndsAt: null })).toBe(false);
  });
});

// ---- trialDaysLeft -------------------------------------------------------

describe('trialDaysLeft', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null for null input', () => {
    expect(trialDaysLeft(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(trialDaysLeft(undefined)).toBeNull();
  });

  it('returns correct days remaining for a future date', () => {
    // TRIAL_DAYS from purchase date is 14; here we set the expiry directly
    expect(trialDaysLeft('2025-06-15T00:00:00Z')).toBe(14);
  });

  it('returns 0 for an expired trial (not negative)', () => {
    expect(trialDaysLeft('2025-05-01T00:00:00Z')).toBe(0);
  });

  it('returns 1 for trial ending tomorrow', () => {
    expect(trialDaysLeft('2025-06-02T00:00:00Z')).toBe(1);
  });

  it('TRIAL_DAYS constant is 14', () => {
    expect(TRIAL_DAYS).toBe(14);
  });
});
