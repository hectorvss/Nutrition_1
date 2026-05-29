import { supabase } from './supabase';

export const API_URL = '/api';

export const getAuthToken = () => localStorage.getItem('auth_token');

export const setAuthToken = (token: string) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

/**
 * Devuelve SIEMPRE un access token válido.
 *
 * El bug que tenía la app: el login guardaba el access token de Supabase
 * en `auth_token` (localStorage) y `fetchWithAuth` lo reutilizaba tal cual
 * para siempre. Los access tokens de Supabase caducan (~1h); el cliente
 * de Supabase los auto-refresca en SU propio storage, pero `auth_token`
 * se quedaba obsoleto → a la hora, la siguiente petición daba 401 y la
 * app cerraba sesión sola y te mandaba al landing.
 *
 * Aquí pedimos el token a `supabase.auth.getSession()` (que entrega el
 * token vigente, refrescándolo si toca) y lo cacheamos en `auth_token`
 * para los pocos consumidores que aún lo leen directo. Si Supabase no
 * tiene sesión (p. ej. arranque antes de hidratar), caemos al token
 * cacheado.
 */
const getValidToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    const tok = data.session?.access_token;
    if (tok) {
      setAuthToken(tok);
      return tok;
    }
  } catch { /* fall through to cached token */ }
  return getAuthToken();
};

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}, _isRetry = false): Promise<any> => {
  const token = await getValidToken();
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
    // Antes de matar la sesión, intentamos UN refresh explícito: el token
    // pudo expirar justo entre getSession() y la petición. Si el refresh
    // devuelve un token nuevo, reintentamos la misma petición una sola vez.
    if (!_isRetry) {
      try {
        const { data } = await supabase.auth.refreshSession();
        if (data.session?.access_token) {
          setAuthToken(data.session.access_token);
          return fetchWithAuth(endpoint, options, true);
        }
      } catch { /* refresh failed -> genuine logout below */ }
    }
    // 401 tras el refresh -> la sesión está realmente muerta, cerramos.
    setAuthToken('');
    localStorage.removeItem('auth_user');
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
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
