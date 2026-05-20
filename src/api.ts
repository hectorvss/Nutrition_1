export const API_URL = '/api';

export const getAuthToken = () => localStorage.getItem('auth_token');

export const setAuthToken = (token: string) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && token) {
    // 401 = invalid/expired token -> the session is genuinely dead, log out.
    setAuthToken('');
    localStorage.removeItem('auth_user');
    window.location.href = '/';
    // Throw so callers stop executing instead of receiving `undefined`
    // (which would crash on .map / .forEach before the redirect completes).
    throw new Error('Session expired');
  }

  if (!response.ok) {
    // 403 (forbidden) is NOT a dead session — e.g. a client hitting a
    // manager-only endpoint. Surface it as a normal error, never log out.
    const errorData = await response.json().catch(() => ({}));

    // 402 = the manager hit a plan limit or their trial/sub is blocked.
    // Notify the app (BillingContext listens for this) and throw an enriched
    // error so the UI can render an upgrade prompt instead of a generic toast.
    if (response.status === 402) {
      try {
        window.dispatchEvent(new CustomEvent('billing:limit', { detail: errorData }));
      } catch { /* SSR-safe */ }
      const err: any = new Error(errorData.message || errorData.error || 'Plan limit reached');
      err.code = errorData.error;
      err.billing = errorData;
      throw err;
    }

    throw new Error(errorData.error || 'API Request Failed');
  }

  // 204 No Content (and empty bodies) would make response.json() throw.
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
