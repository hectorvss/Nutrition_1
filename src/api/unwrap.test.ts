import { describe, it, expect } from 'vitest';
import { unwrapList } from './unwrap';

describe('unwrapList', () => {
  it('returns array payload as-is', () => {
    const input = [{ id: 1 }, { id: 2 }];
    expect(unwrapList(input)).toBe(input);
  });

  it('extracts .data from paginated shape', () => {
    const input = { data: [{ id: 1 }], nextCursor: null, hasMore: false };
    expect(unwrapList(input)).toEqual([{ id: 1 }]);
  });

  it('returns [] for null', () => {
    expect(unwrapList(null)).toEqual([]);
  });

  it('returns [] for undefined', () => {
    expect(unwrapList(undefined)).toEqual([]);
  });

  it('returns [] when .data is not an array', () => {
    expect(unwrapList({ data: 'bad' })).toEqual([]);
  });

  it('returns [] for a plain object with no .data', () => {
    expect(unwrapList({ foo: 'bar' })).toEqual([]);
  });

  it('passes through empty array', () => {
    expect(unwrapList([])).toEqual([]);
  });
});
