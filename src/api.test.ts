import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithAuth, setAuthToken, getAuthToken } from './api';

const mockFetch = vi.fn();

const makeResponse = (status: number, body: unknown = {}) => {
  const json = JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(json),
  } as unknown as Response;
};

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  vi.stubGlobal('location', { href: '/' });
  mockFetch.mockReset();
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchWithAuth', () => {
  it('attaches Bearer token from localStorage', async () => {
    setAuthToken('tok123');
    mockFetch.mockResolvedValue(makeResponse(200, { ok: true }));
    await fetchWithAuth('/manager/me');
    const [, options] = mockFetch.mock.calls[0];
    expect((options as RequestInit).headers).toMatchObject({ Authorization: 'Bearer tok123' });
  });

  it('returns parsed JSON on 200', async () => {
    mockFetch.mockResolvedValue(makeResponse(200, { id: 1, name: 'test' }));
    const result = await fetchWithAuth('/test');
    expect(result).toEqual({ id: 1, name: 'test' });
  });

  it('returns null on 204 No Content', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.reject(), text: () => Promise.resolve('') } as unknown as Response);
    const result = await fetchWithAuth('/test');
    expect(result).toBeNull();
  });

  it('throws on 403 without clearing auth token', async () => {
    setAuthToken('tok');
    mockFetch.mockResolvedValue(makeResponse(403, { error: 'Forbidden' }));
    await expect(fetchWithAuth('/manager-only')).rejects.toThrow('Forbidden');
    expect(getAuthToken()).toBe('tok');
  });

  it('throws with billing error info on 402', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    mockFetch.mockResolvedValue(makeResponse(402, { error: 'plan_limit_clients', message: 'Client limit reached' }));
    const err: any = await fetchWithAuth('/manager/clients').catch(e => e);
    expect(err.code).toBe('plan_limit_clients');
    expect(err.billing.error).toBe('plan_limit_clients');
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'billing:limit' }));
  });

  it('clears auth token and throws on 401', async () => {
    setAuthToken('expired-tok');
    mockFetch.mockResolvedValue(makeResponse(401, {}));
    await expect(fetchWithAuth('/secure')).rejects.toThrow('Session expired');
    expect(getAuthToken()).toBeNull();
  });
});

describe('setAuthToken / getAuthToken', () => {
  it('stores and retrieves a token', () => {
    setAuthToken('mytoken');
    expect(getAuthToken()).toBe('mytoken');
  });

  it('removes token on empty string', () => {
    setAuthToken('mytoken');
    setAuthToken('');
    expect(getAuthToken()).toBeNull();
  });
});
