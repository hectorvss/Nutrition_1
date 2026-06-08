import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = {
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  VAPID_SUBJECT: process.env.VAPID_SUBJECT,
};

afterEach(() => {
  process.env.VAPID_PUBLIC_KEY = ORIGINAL_ENV.VAPID_PUBLIC_KEY;
  process.env.VAPID_PRIVATE_KEY = ORIGINAL_ENV.VAPID_PRIVATE_KEY;
  process.env.VAPID_SUBJECT = ORIGINAL_ENV.VAPID_SUBJECT;
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('push configuration', () => {
  it('disables web push instead of crashing on malformed VAPID keys', async () => {
    process.env.VAPID_PUBLIC_KEY = 'bad-key=';
    process.env.VAPID_PRIVATE_KEY = 'also-bad=';
    process.env.VAPID_SUBJECT = 'mailto:test@example.com';

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mod = await import('./push');

    expect(mod.pushConfigured).toBe(false);
    expect(mod.vapidPublicKey).toBe('');
    expect(warn).toHaveBeenCalled();
  });
});
