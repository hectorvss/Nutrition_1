// Paginacion cursor-based (keyset) para endpoints de listado.
//
// Por que keyset y no offset:
// - Offset (LIMIT N OFFSET M) crece linealmente con la pagina: para llegar
//   a la pagina 100 el motor lee y descarta 100*pageSize filas. Ademas
//   sufre "phantom rows" si hay inserts entre paginas.
// - Keyset usa WHERE (sort_col, id) < (lastVal, lastId) ORDER BY ... LIMIT N.
//   Con un indice sobre (sort_col, id) es O(log n) constante por pagina y
//   no salta filas si entran/salen filas entre cargas.
//
// El cursor es opaco para el cliente: base64({ v: sortValue, i: id }).
// Validamos su shape antes de inyectarlo en queries.
//
// Uso tipico en un handler:
//
//   const page = parsePagination(req, { defaultLimit: 50 });
//   let q = supabaseAdmin.from('messages').select('*')
//     .eq('...', '...')
//     .order('created_at', { ascending: false })
//     .order('id', { ascending: false })
//     .limit(page.limit + 1); // +1 para saber si hay siguiente
//   if (page.cursor) {
//     q = applyCursor(q, 'created_at', page.cursor);
//   }
//   const { data, error } = await q;
//   if (error) throw error;
//   return res.json(buildPage(data || [], page.limit, 'created_at'));

import type { Request } from 'express';

export const DEFAULT_PAGE_LIMIT = 50;
export const MAX_PAGE_LIMIT = 100;

export interface PaginationParams {
  /**
   * Cursor decodificado (null si es la primera pagina).
   * - v: sortValue de la ultima fila visible.
   * - i: id de la ultima fila visible.
   * - t: discriminador opcional (e.g. 'legacy'|'dynamic') para endpoints
   *      que mezclan filas de varias tablas. Permite aplicar `id.lt`
   *      SOLO a la tabla matching y evitar saltos cross-table.
   */
  cursor: { v: string; i: string; t?: string } | null;
  /** Tamano de pagina solicitado, ya recortado a [1, MAX_PAGE_LIMIT]. */
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Decodifica un cursor base64 a { v, i, t? } o null si esta malformado.
 * NUNCA throws — un cursor invalido se trata como "primera pagina".
 */
export function decodeCursor(s: string | undefined | null): { v: string; i: string; t?: string } | null {
  if (!s || typeof s !== 'string') return null;
  try {
    const decoded = Buffer.from(s, 'base64').toString('utf8');
    const obj = JSON.parse(decoded);
    if (typeof obj?.v === 'string' && typeof obj?.i === 'string') {
      const out: { v: string; i: string; t?: string } = { v: obj.v, i: obj.i };
      if (typeof obj.t === 'string') out.t = obj.t;
      return out;
    }
  } catch {
    // cursor invalido -> primera pagina
  }
  return null;
}

/** Codifica { v, i, t? } a cursor opaco base64. */
export function encodeCursor(v: string, i: string, t?: string): string {
  const obj: Record<string, string> = { v, i };
  if (t !== undefined) obj.t = t;
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64');
}

/**
 * Lee `?cursor=` y `?limit=` del request y devuelve los valores normalizados.
 * Limit fuera de rango se recorta; ausencias usan los defaults.
 */
export function parsePagination(
  req: Request,
  opts: { defaultLimit?: number; maxLimit?: number } = {},
): PaginationParams {
  const defaultLimit = opts.defaultLimit ?? DEFAULT_PAGE_LIMIT;
  const maxLimit = opts.maxLimit ?? MAX_PAGE_LIMIT;

  const raw = Number.parseInt(String(req.query.limit ?? ''), 10);
  const limit = Number.isFinite(raw) && raw > 0 ? Math.min(raw, maxLimit) : defaultLimit;

  const cursor = decodeCursor(typeof req.query.cursor === 'string' ? req.query.cursor : null);
  return { cursor, limit };
}

export type SortDirection = 'asc' | 'desc';

/**
 * Aplica el predicado de keyset cursor sobre un PostgrestFilterBuilder de
 * supabase-js. Encapsula la sintaxis `.or('col.lt.V,and(col.eq.V,id.lt.I)')`
 * para no repetirla en cada handler.
 *
 *   const q = supabase.from('tasks').select('*')...;
 *   const q2 = applyCursor(q, cursor, 'date', 'asc');
 *
 * Para direccion ASC usa `.gt` y `id.gt`; para DESC usa `.lt` y `id.lt`.
 * Si `cursor` es null, devuelve la query sin tocar.
 */
export function applyCursor<Q extends { or: (filter: string) => Q }>(
  query: Q,
  cursor: { v: string; i: string } | null,
  sortKey: string,
  direction: SortDirection = 'desc',
  idKey = 'id',
): Q {
  if (!cursor) return query;
  const cmp = direction === 'asc' ? 'gt' : 'lt';
  return query.or(`${sortKey}.${cmp}.${cursor.v},and(${sortKey}.eq.${cursor.v},${idKey}.${cmp}.${cursor.i})`);
}

/**
 * Tras hacer `.limit(limit + 1)`, llamamos a este helper:
 * - Si vinieron `limit + 1` filas, hay siguiente pagina; emite cursor.
 * - Si vinieron `<= limit`, no hay siguiente.
 *
 * `sortKey` es el nombre del campo por el que se ordeno (ej. 'created_at',
 * 'date'). El helper LO LEE de la ultima fila para construir el cursor.
 */
export function buildPage<T extends Record<string, any>>(
  rows: T[],
  limit: number,
  sortKey: string,
  idKey = 'id',
  /** Opcional: clave de la fila a serializar como discriminador `t` en el
   *  cursor. Usar en endpoints que mezclan dos tablas (e.g. legacy vs
   *  dynamic check-ins) para que el siguiente fetch sepa a que tabla
   *  pertenece el `id.lt` tiebreaker. */
  typeKey?: string,
): PaginatedResponse<T> {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;

  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const last = data[data.length - 1];
    const sortVal = last[sortKey];
    const idVal = last[idKey];
    if (sortVal != null && idVal != null) {
      const t = typeKey ? (last[typeKey] != null ? String(last[typeKey]) : undefined) : undefined;
      nextCursor = encodeCursor(String(sortVal), String(idVal), t);
    }
  }
  return { data, nextCursor, hasMore };
}
