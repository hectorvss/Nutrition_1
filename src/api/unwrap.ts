// Helper de compatibilidad: el backend pagino TODOS los endpoints de
// listado a shape `{ data: T[], nextCursor, hasMore }`. Muchas vistas y
// contextos existentes esperan un array directo y migrarlos uno a uno
// rompe demasiada superficie.
//
// `unwrapList` normaliza el payload:
//   - Si llega array  -> lo devuelve (legacy / single-page consumers).
//   - Si llega objeto -> extrae `.data` si es array.
//   - En cualquier otro caso -> [].
//
// Las vistas que SI quieran paginar de verdad ("Cargar mas") deben usar el
// hook `usePagination` (src/hooks/usePagination.ts), que consume el shape
// paginado directamente. `unwrapList` es para consumers de un solo tiro
// que solo necesitan la primera pagina.
//
// IMPORTANTE: si un consumer usa `unwrapList`, esta limitando lo que ve a
// la primera pagina del backend (default 50, max segun endpoint). Es
// adecuado para Tasks/Clients/Library donde la cardinalidad es baja.
// Para listados que crecen indefinidamente (mensajes, check-ins) hay que
// usar `usePagination`.

export function unwrapList<T = any>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}
