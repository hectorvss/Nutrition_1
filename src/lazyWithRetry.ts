import { lazy, type ComponentType } from 'react';

/**
 * `React.lazy` con auto-recuperación ante despliegues nuevos.
 *
 * Cada vez que se publica una versión en Vercel, los chunks generados por
 * Vite cambian de hash (p. ej. `Analytics-DhAwEXmT.js` → otro nombre). Un
 * navegador que aún tiene cacheado el `index.html` antiguo intentará cargar
 * el chunk viejo, que ya no existe. El rewrite SPA devuelve entonces el
 * `index.html` (text/html) y el import dinámico falla con:
 *   "Failed to fetch dynamically imported module"
 *   "Expected a JavaScript module but got MIME type text/html".
 *
 * Cuando eso ocurre, recargamos la página UNA sola vez: así el navegador
 * pide un `index.html` fresco con los hashes correctos. Un flag en
 * sessionStorage evita un bucle de recargas si el fallo es real (chunk
 * roto de verdad, sin conexión, etc.) — en ese caso se propaga el error
 * al error boundary.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    const STORAGE_KEY = 'chunk-reload-attempted';
    try {
      const mod = await factory();
      // Carga correcta: limpiamos el flag para futuros despliegues.
      try { window.sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      return mod;
    } catch (err) {
      let alreadyTried = false;
      try { alreadyTried = window.sessionStorage.getItem(STORAGE_KEY) === '1'; } catch { /* ignore */ }

      if (!alreadyTried) {
        try { window.sessionStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
        window.location.reload();
        // La página se va a recargar: devolvemos una promesa que nunca
        // resuelve para que React no intente renderizar nada mientras tanto.
        return new Promise<{ default: T }>(() => {});
      }
      // Ya recargamos una vez y sigue fallando → error real.
      throw err;
    }
  });
}
