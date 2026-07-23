// ============================================================================
// Separación landing ↔ app por host.
//
// En producción la landing de marketing vive en `nuly.app` (y `www.nuly.app`)
// y la aplicación interior en `app.nuly.app`. Ambos hosts los sirve el MISMO
// proyecto de Vercel (mismo bundle + misma `/api`), así que la API sigue siendo
// mismo-origen en los dos y la sesión (localStorage de Supabase) vive en el
// host donde se hace login: `app.nuly.app`.
//
// En local (`localhost`) y en previews de Vercel (`*.vercel.app`) NO hay
// subdominios, así que tratamos el host como "other" y conservamos el
// comportamiento de un solo origen (landing + app juntas, sin redirecciones).
// Así el desarrollo y las preview no se ven afectados por el split.
// ============================================================================

export const MARKETING_HOSTS = ['nuly.app', 'www.nuly.app'];
export const APP_HOST = 'app.nuly.app';

// Interruptor del split. Mientras esté apagado (por defecto), TODO se comporta
// como un solo origen: sin redirecciones landing↔app. Así el código puede
// desplegarse sin riesgo antes de que app.nuly.app exista en Vercel/DNS. Se
// activa poniendo VITE_APP_SPLIT=true en el entorno de la app y redeploy, una
// vez el subdominio ya resuelve.
export const SPLIT_ENABLED = import.meta.env.VITE_APP_SPLIT === 'true';

export type HostKind = 'marketing' | 'app' | 'other';

export function getHostKind(): HostKind {
  if (typeof window === 'undefined') return 'other';
  // Split desactivado → tratamos cualquier host como "other" (un solo origen,
  // comportamiento histórico: landing + app en la misma SPA, sin saltos).
  if (!SPLIT_ENABLED) return 'other';
  const h = window.location.hostname;
  if (MARKETING_HOSTS.includes(h)) return 'marketing';
  if (h === APP_HOST) return 'app';
  return 'other';
}

/** Estamos en el host de marketing de producción (nuly.app / www.nuly.app). */
export const isMarketingHost = (): boolean => getHostKind() === 'marketing';

/** Estamos en el host de la app de producción (app.nuly.app). */
export const isAppHost = (): boolean => getHostKind() === 'app';

/**
 * Redirige desde la landing hacia la app interior. `view` es una intención
 * opcional ('login' | 'signup') que la app lee del query param al arrancar.
 * Sólo tiene efecto real cuando estamos en el host de marketing; en cualquier
 * otro host (local/preview/app) la separación no aplica y no navegamos fuera.
 */
export function redirectToApp(view?: string): void {
  if (typeof window === 'undefined') return;
  const q = view ? `?view=${encodeURIComponent(view)}` : '';
  window.location.href = `https://${APP_HOST}/${q}`;
}

/**
 * Redirige desde la app interior hacia la landing de marketing. Se usa en el
 * "volver" del login cuando estamos en app.nuly.app (donde no existe landing).
 */
export function redirectToMarketing(): void {
  if (typeof window === 'undefined') return;
  window.location.href = `https://${MARKETING_HOSTS[0]}/`;
}
