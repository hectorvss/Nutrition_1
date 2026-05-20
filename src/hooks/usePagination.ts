// Hook generico para endpoints paginados cursor-based.
//
// Asume que el endpoint devuelve { data: T[], nextCursor: string|null, hasMore: bool }.
// Si por accidente devuelve un T[] (legacy), tambien lo maneja.
//
// Uso:
//   const { items, loadMore, hasMore, isLoading, reload, error } =
//     usePagination<Message>(`/messages/${recipientId}`);
//
// Para reset (cambiar de chat, filtros) el hook se re-monta porque `endpoint`
// es parte de las deps. Si necesitas forzar refresh sin cambiar endpoint,
// llama a reload().

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWithAuth } from '../api';

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface UsePaginationResult<T> {
  /** Acumulado de paginas cargadas hasta ahora. */
  items: T[];
  /** Carga la siguiente pagina. No-op si !hasMore o isLoading. */
  loadMore: () => Promise<void>;
  /** Recarga desde cero (resetea cursor y items). */
  reload: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  /** Pagina actual: 0 (sin cargar), 1 (primera pagina), ... */
  pagesLoaded: number;
  error: string | null;
}

/**
 * Normaliza la respuesta del backend al shape paginado.
 * Si la API devuelve array directo (legacy), lo envuelve.
 */
function normalize<T>(payload: unknown): PaginatedResponse<T> {
  if (Array.isArray(payload)) {
    return { data: payload as T[], nextCursor: null, hasMore: false };
  }
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const p = payload as Partial<PaginatedResponse<T>>;
    return {
      data: Array.isArray(p.data) ? p.data : [],
      nextCursor: typeof p.nextCursor === 'string' ? p.nextCursor : null,
      hasMore: Boolean(p.hasMore),
    };
  }
  return { data: [], nextCursor: null, hasMore: false };
}

export function usePagination<T>(
  endpoint: string | null,
  opts: { limit?: number; enabled?: boolean } = {},
): UsePaginationResult<T> {
  const { limit = 50, enabled = true } = opts;
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagesLoaded, setPagesLoaded] = useState(0);

  // Token de invalidacion: incrementa al recargar para descartar respuestas
  // de fetches anteriores que llegaran tarde.
  const fetchTokenRef = useRef(0);

  const fetchPage = useCallback(
    async (resetFirst: boolean) => {
      if (!endpoint || !enabled) return;
      const token = ++fetchTokenRef.current;
      setIsLoading(true);
      setError(null);
      try {
        const url = new URL(endpoint, 'http://x'); // base placeholder
        url.searchParams.set('limit', String(limit));
        if (!resetFirst && cursor) url.searchParams.set('cursor', cursor);
        // Reconstruimos el path con query — fetchWithAuth concatena con el base API.
        const path = `${url.pathname}${url.search}`;
        const payload = await fetchWithAuth(path);
        // Si llego una respuesta "obsoleta" (el usuario llamo reload() o cambio
        // endpoint mientras esta peticion estaba en vuelo), la descartamos.
        if (token !== fetchTokenRef.current) return;
        const page = normalize<T>(payload);
        setItems((prev) => (resetFirst ? page.data : [...prev, ...page.data]));
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setPagesLoaded((p) => (resetFirst ? 1 : p + 1));
      } catch (e: unknown) {
        if (token !== fetchTokenRef.current) return;
        setError(e instanceof Error ? e.message : 'Error de carga');
      } finally {
        if (token === fetchTokenRef.current) setIsLoading(false);
      }
    },
    [endpoint, limit, enabled, cursor],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchPage(false);
  }, [hasMore, isLoading, fetchPage]);

  const reload = useCallback(async () => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setPagesLoaded(0);
    await fetchPage(true);
  }, [fetchPage]);

  // Carga inicial / reset al cambiar endpoint
  useEffect(() => {
    if (!endpoint || !enabled) return;
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setPagesLoaded(0);
    fetchPage(true);
    // Solo dependemos de endpoint/limit/enabled: NO de cursor (eso lo maneja fetchPage).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, limit, enabled]);

  return { items, loadMore, reload, hasMore, isLoading, pagesLoaded, error };
}
