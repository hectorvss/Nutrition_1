// Unit tests para server/lib/pagination.ts. Run: npx tsx scripts/test_pagination.mts
import { decodeCursor, encodeCursor, parsePagination, buildPage } from '../server/lib/pagination.ts';

let pass = 0, fail = 0;
const t = (name: string, ok: boolean): void => {
  if (ok) { pass++; console.log('OK  ', name); }
  else { fail++; console.log('FAIL', name); }
};

// --- encode/decode roundtrip ---
const c1 = encodeCursor('2026-05-20T10:00:00Z', 'uuid-123');
const d1 = decodeCursor(c1);
t('roundtrip encode/decode', d1?.v === '2026-05-20T10:00:00Z' && d1?.i === 'uuid-123');

// Cursor invalido -> null (defensivo, nunca throws)
t('garbage string -> null', decodeCursor('garbage') === null);
t('empty string -> null', decodeCursor('') === null);
t('null -> null', decodeCursor(null as any) === null);
t('undefined -> null', decodeCursor(undefined) === null);
t('non-json b64 -> null', decodeCursor(Buffer.from('not json', 'utf8').toString('base64')) === null);
t('missing v field -> null', decodeCursor(Buffer.from('{"i":"x"}', 'utf8').toString('base64')) === null);
t('missing i field -> null', decodeCursor(Buffer.from('{"v":"x"}', 'utf8').toString('base64')) === null);

// --- parsePagination ---
const req = (q: any) => ({ query: q } as any);
const p1 = parsePagination(req({}));
t('default limit 50 + null cursor', p1.limit === 50 && p1.cursor === null);

const p2 = parsePagination(req({ limit: '20' }));
t('limit 20 parsed', p2.limit === 20);

const p3 = parsePagination(req({ limit: '999999' }));
t('limit > max -> capped to 100', p3.limit === 100);

const p4 = parsePagination(req({ limit: '-5' }));
t('negative limit -> default', p4.limit === 50);

const p5 = parsePagination(req({ limit: 'abc' }));
t('non-numeric limit -> default', p5.limit === 50);

const p6 = parsePagination(req({ cursor: c1 }));
t('cursor parsed correctamente', p6.cursor?.v === '2026-05-20T10:00:00Z' && p6.cursor?.i === 'uuid-123');

const p7 = parsePagination(req({ cursor: 'garbage' }));
t('garbage cursor en query -> null (no throw)', p7.cursor === null);

// --- buildPage ---
const rows = [
  { id: 'a', date: '2026-05-20' },
  { id: 'b', date: '2026-05-19' },
  { id: 'c', date: '2026-05-18' },
];
const r1 = buildPage(rows, 2, 'date');
t('hasMore=true cuando rows>limit', r1.hasMore === true);
t('data recortado a limit', r1.data.length === 2);
t('nextCursor emitido cuando hay siguiente', r1.nextCursor !== null);
const dec = r1.nextCursor ? decodeCursor(r1.nextCursor) : null;
t('cursor apunta a la ultima fila visible', dec?.i === 'b' && dec?.v === '2026-05-19');

const r2 = buildPage([rows[0]], 2, 'date');
t('hasMore=false cuando rows<=limit', r2.hasMore === false && r2.nextCursor === null);

const r3 = buildPage([], 2, 'date');
t('lista vacia -> no hasMore, no cursor', r3.data.length === 0 && !r3.hasMore && r3.nextCursor === null);

// --- Cursor con discriminador `t` (cross-table) ---
const cursorT = encodeCursor('2026-05-20', 'uuid-abc', 'dynamic');
const decT = decodeCursor(cursorT);
t('encode/decode preserva discriminador t', decT?.t === 'dynamic');

const cursorNoT = encodeCursor('2026-05-20', 'uuid-abc');
const decNoT = decodeCursor(cursorNoT);
t('cursor sin t -> decode sin t', decNoT?.t === undefined);

// buildPage con typeKey
const rowsT = [
  { id: 'a', date: '2026-05-20', type: 'legacy'  },
  { id: 'b', date: '2026-05-19', type: 'dynamic' },
  { id: 'c', date: '2026-05-18', type: 'legacy'  },
];
const rT = buildPage(rowsT, 2, 'date', 'id', 'type');
const decRT = rT.nextCursor ? decodeCursor(rT.nextCursor) : null;
t('buildPage con typeKey emite cursor con t', decRT?.t === 'dynamic');
t('cursor incluye id y date correctos', decRT?.i === 'b' && decRT?.v === '2026-05-19');

// buildPage sin typeKey no debe incluir t
const rNoT = buildPage(rowsT, 2, 'date', 'id');
const decRNoT = rNoT.nextCursor ? decodeCursor(rNoT.nextCursor) : null;
t('buildPage sin typeKey -> cursor sin t', decRNoT?.t === undefined);

// Discriminador con valor falsy (null/undefined) en la fila: no se serializa
const rowsNullType = [
  { id: 'a', date: '2026-05-20', type: null as any },
  { id: 'b', date: '2026-05-19', type: null as any },
  { id: 'c', date: '2026-05-18', type: null as any },
];
const rNull = buildPage(rowsNullType, 2, 'date', 'id', 'type');
const decNull = rNull.nextCursor ? decodeCursor(rNull.nextCursor) : null;
t('typeKey con valor null en la fila -> cursor sin t', decNull?.t === undefined);

const total = pass + fail;
console.log('\n' + pass + '/' + total + ' pagination unit tests passed');
process.exit(fail === 0 ? 0 : 1);
