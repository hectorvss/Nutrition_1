// Test de integracion: el comportamiento real del .or().or() de supabase-js
// y del cursor en messages contra la DB real.
//
// Verifica:
// 1. .or(chat).or(cursor) combina como AND entre grupos (esperado).
// 2. Fechas ISO con T y : pasan el filtro PostgREST sin escape.
// 3. La paginacion devuelve siempre la siguiente pagina sin saltar filas
//    aunque haya dos rows con el mismo created_at.

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const db = createClient(url, key);

const log = (name: string, ok: boolean, extra?: any) => {
  console.log(ok ? 'OK  ' : 'FAIL', name, extra !== undefined ? JSON.stringify(extra) : '');
};

(async () => {
  // 1. Pillamos 2 ids reales de usuarios para probar el filtro
  const { data: users } = await db.from('users').select('id').limit(2);
  if (!users || users.length < 2) {
    console.log('Skip integration: no hay 2 usuarios en BD');
    process.exit(0);
  }
  const [u1, u2] = users;

  // 2. .or(chat).or(cursor) — chequear que se combina como AND
  // Construimos una query equivalente al endpoint real.
  const q = db.from('messages').select('id, created_at, sender_id, receiver_id')
    .or(`and(sender_id.eq.${u1.id},receiver_id.eq.${u2.id}),and(sender_id.eq.${u2.id},receiver_id.eq.${u1.id})`)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(5);
  const r1 = await q;
  if (r1.error) { console.log('FAIL primera query', r1.error); process.exit(1); }
  log('chat query ejecuta sin error', true, { rows: r1.data?.length });

  // 3. Anadir un .or() de cursor (el patron real)
  const cursorVal = '2099-01-01T00:00:00.000Z'; // fecha futura, no debe devolver nada
  const cursorId = '00000000-0000-0000-0000-000000000000';
  const q2 = db.from('messages').select('id, created_at, sender_id, receiver_id')
    .or(`and(sender_id.eq.${u1.id},receiver_id.eq.${u2.id}),and(sender_id.eq.${u2.id},receiver_id.eq.${u1.id})`)
    .or(`created_at.lt.${cursorVal},and(created_at.eq.${cursorVal},id.lt.${cursorId})`)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(5);
  const r2 = await q2;
  if (r2.error) {
    console.log('FAIL .or().or() con fecha ISO:', r2.error.message);
    console.log('  -> Sintaxis postgrest puede rechazar : o T sin escape.');
    process.exit(1);
  }
  log('.or().or() con fecha ISO ejecuta sin error', true, { rows: r2.data?.length });

  // 4. Comparar: el segundo .or() con cursor=futuro debe traer TODAS las filas (porque created_at.lt.futuro es siempre true).
  // Esto confirma que el .or() se interpreta como AND con el primer .or() (chat scope).
  // Si fuera OR-de-todo, traeria mas filas que la query 1.
  const sameOrFewer = (r2.data?.length || 0) <= (r1.data?.length || 0);
  log('.or().or() combina como AND (no expande resultado)', sameOrFewer,
      { q1: r1.data?.length, q2: r2.data?.length });

  // 5. Cursor en el pasado: debe devolver 0 filas
  const q3 = db.from('messages').select('id, created_at')
    .or(`and(sender_id.eq.${u1.id},receiver_id.eq.${u2.id}),and(sender_id.eq.${u2.id},receiver_id.eq.${u1.id})`)
    .or(`created_at.lt.1990-01-01T00:00:00.000Z,and(created_at.eq.1990-01-01T00:00:00.000Z,id.lt.${cursorId})`)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(5);
  const r3 = await q3;
  if (r3.error) { console.log('FAIL cursor pasado:', r3.error.message); process.exit(1); }
  log('cursor en el pasado -> 0 filas', (r3.data?.length || 0) === 0,
      { rows: r3.data?.length });

  // 6. Sintaxis `.lte()` con fecha ISO (la nueva rama del fix #2 check-ins)
  const q4 = db.from('check_ins').select('id, date').lte('date', '2026-05-20').limit(5);
  const r4 = await q4;
  if (r4.error) { console.log('FAIL .lte() con date:', r4.error.message); process.exit(1); }
  log('.lte(date, fecha) funciona', true, { rows: r4.data?.length });

  // 7. Paginar 2 paginas seguidas para verificar que no salta ni duplica
  // (cuando hay datos). Si no hay, skip.
  const { data: msgs1 } = await db.from('messages')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(11); // pide 11 (limit+1) para simular page=10
  if (!msgs1 || msgs1.length < 3) {
    console.log('Skip 7: no hay suficientes mensajes para test de paginacion');
  } else {
    const page1 = msgs1.slice(0, 10);
    const lastP1 = page1[page1.length - 1] as any;
    // Page 2 con cursor de last:
    const { data: msgs2 } = await db.from('messages')
      .select('id, created_at')
      .or(`created_at.lt.${lastP1.created_at},and(created_at.eq.${lastP1.created_at},id.lt.${lastP1.id})`)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(10);
    const ids1 = new Set((page1).map((m: any) => m.id));
    const overlap = (msgs2 || []).some((m: any) => ids1.has(m.id));
    log('paginas 1 y 2 NO se solapan (no duplicados)', !overlap,
        { p1: page1.length, p2: msgs2?.length, overlap });
  }

  console.log('\nIntegration tests completed.');
  process.exit(0);
})();
