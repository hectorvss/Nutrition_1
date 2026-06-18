import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadEmailModuleWithoutProvider() {
  vi.resetModules();
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  delete process.env.RESEND_FROM;
  return import('./email');
}

describe('email integration helper', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes a boolean configuration flag', async () => {
    const { emailIsConfigured } = await loadEmailModuleWithoutProvider();
    expect(typeof emailIsConfigured()).toBe('boolean');
  });

  it('skips client emails when the provider is not configured', async () => {
    const { sendClientTransactionalEmail } = await loadEmailModuleWithoutProvider();
    const result = await sendClientTransactionalEmail({
      to: 'client@example.com',
      subject: 'Test',
      title: 'Test',
      body: 'Body',
    });
    expect(result.skipped).toBe(true);
  });
});
