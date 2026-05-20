import { describe, it, expect } from 'vitest';
import {
  decodeCursor,
  encodeCursor,
  buildPage,
  parsePagination,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from './pagination';

// ---- decodeCursor --------------------------------------------------------

describe('decodeCursor', () => {
  it('decodes a valid cursor', () => {
    const encoded = Buffer.from(JSON.stringify({ v: '2024-01-01', i: 'abc' }), 'utf8').toString('base64');
    expect(decodeCursor(encoded)).toEqual({ v: '2024-01-01', i: 'abc' });
  });

  it('decodes a cursor with optional t field', () => {
    const encoded = Buffer.from(JSON.stringify({ v: '100', i: 'z1', t: 'legacy' }), 'utf8').toString('base64');
    expect(decodeCursor(encoded)).toEqual({ v: '100', i: 'z1', t: 'legacy' });
  });

  it('returns null for null input', () => {
    expect(decodeCursor(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(decodeCursor(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(decodeCursor('')).toBeNull();
  });

  it('returns null for invalid base64', () => {
    expect(decodeCursor('not-valid-base64!!')).toBeNull();
  });

  it('returns null when v is missing', () => {
    const encoded = Buffer.from(JSON.stringify({ i: 'abc' }), 'utf8').toString('base64');
    expect(decodeCursor(encoded)).toBeNull();
  });

  it('returns null when i is missing', () => {
    const encoded = Buffer.from(JSON.stringify({ v: 'val' }), 'utf8').toString('base64');
    expect(decodeCursor(encoded)).toBeNull();
  });

  it('returns null when v is not a string', () => {
    const encoded = Buffer.from(JSON.stringify({ v: 123, i: 'abc' }), 'utf8').toString('base64');
    expect(decodeCursor(encoded)).toBeNull();
  });
});

// ---- encodeCursor --------------------------------------------------------

describe('encodeCursor', () => {
  it('encodes v and i into a base64 cursor', () => {
    const cursor = encodeCursor('2024-01-01', 'abc');
    const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
    expect(decoded).toEqual({ v: '2024-01-01', i: 'abc' });
  });

  it('includes t when provided', () => {
    const cursor = encodeCursor('50', 'xyz', 'dynamic');
    const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
    expect(decoded).toEqual({ v: '50', i: 'xyz', t: 'dynamic' });
  });

  it('round-trips with decodeCursor', () => {
    const cursor = encodeCursor('2025-05-20T10:00:00Z', 'id-42');
    expect(decodeCursor(cursor)).toEqual({ v: '2025-05-20T10:00:00Z', i: 'id-42' });
  });
});

// ---- buildPage -----------------------------------------------------------

describe('buildPage', () => {
  type Row = { id: string; created_at: string; name: string };
  const makeRows = (n: number): Row[] =>
    Array.from({ length: n }, (_, i) => ({
      id: `id-${i}`,
      created_at: `2024-01-${String(i + 1).padStart(2, '0')}`,
      name: `item-${i}`,
    }));

  it('returns all rows when count <= limit', () => {
    const rows = makeRows(3);
    const result = buildPage(rows, 10, 'created_at');
    expect(result.data).toHaveLength(3);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it('detects hasMore and trims the extra row', () => {
    const rows = makeRows(6); // 6 = limit+1 where limit=5
    const result = buildPage(rows, 5, 'created_at');
    expect(result.data).toHaveLength(5);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).not.toBeNull();
  });

  it('encodes the cursor from the last row', () => {
    const rows = makeRows(6);
    const { nextCursor } = buildPage(rows, 5, 'created_at');
    const decoded = decodeCursor(nextCursor!);
    expect(decoded?.v).toBe(rows[4].created_at);
    expect(decoded?.i).toBe(rows[4].id);
  });

  it('returns null cursor when there is no next page', () => {
    const rows = makeRows(5);
    const { nextCursor } = buildPage(rows, 5, 'created_at');
    expect(nextCursor).toBeNull();
  });

  it('returns empty data with no cursor for empty rows', () => {
    const result = buildPage([], 10, 'created_at');
    expect(result.data).toHaveLength(0);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it('includes typeKey discriminator in cursor when provided', () => {
    const rows: (Row & { kind: string })[] = makeRows(6).map(r => ({ ...r, kind: 'legacy' }));
    const { nextCursor } = buildPage(rows, 5, 'created_at', 'id', 'kind');
    const decoded = decodeCursor(nextCursor!);
    expect(decoded?.t).toBe('legacy');
  });
});

// ---- parsePagination -----------------------------------------------------

describe('parsePagination', () => {
  const makeReq = (query: Record<string, string> = {}) =>
    ({ query } as any);

  it('returns defaults when no query params', () => {
    const result = parsePagination(makeReq());
    expect(result.limit).toBe(DEFAULT_PAGE_LIMIT);
    expect(result.cursor).toBeNull();
  });

  it('respects custom default and max limits', () => {
    const result = parsePagination(makeReq(), { defaultLimit: 20, maxLimit: 200 });
    expect(result.limit).toBe(20);
  });

  it('clamps limit to maxLimit', () => {
    const result = parsePagination(makeReq({ limit: '999' }));
    expect(result.limit).toBe(MAX_PAGE_LIMIT);
  });

  it('ignores non-numeric limit', () => {
    const result = parsePagination(makeReq({ limit: 'bad' }));
    expect(result.limit).toBe(DEFAULT_PAGE_LIMIT);
  });

  it('decodes a valid cursor from query string', () => {
    const encoded = encodeCursor('2024-01-01', 'abc');
    const result = parsePagination(makeReq({ cursor: encoded }));
    expect(result.cursor).toEqual({ v: '2024-01-01', i: 'abc' });
  });

  it('returns null cursor for invalid cursor param', () => {
    const result = parsePagination(makeReq({ cursor: 'garbage' }));
    expect(result.cursor).toBeNull();
  });
});
