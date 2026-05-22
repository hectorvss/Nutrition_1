import type { AnalyticsContext } from './types.js';
import { supabaseAdmin } from '../../db/index.js';

/**
 * KPIs ampliados de la pestaña TRAINING.
 *
 * Devuelve un objeto que se fusiona (spread) sobre el objeto `training` base
 * del endpoint. Las claves estarán disponibles en el frontend como
 * `data.training.<clave>`.
 */

/** Volumen (peso × reps) de una sesión completa. */
function sessionVolume(log: any): number {
  let v = 0;
  for (const ex of (log?.exercises || [])) {
    for (const s of (ex?.sets_logged || [])) {
      v += (Number(s?.weight) || 0) * (Number(s?.reps) || 0);
    }
  }
  return v;
}

/** Nº de series registradas en una sesión. */
function sessionSets(log: any): number {
  let n = 0;
  for (const ex of (log?.exercises || [])) {
    n += (ex?.sets_logged || []).length;
  }
  return n;
}

/** Normaliza un nombre de grupo muscular a una etiqueta canónica. */
function canonMuscle(raw: any): string {
  const mg = String(raw || '').toLowerCase();
  if (mg.includes('leg') || mg.includes('pierna') || mg.includes('glute') || mg.includes('quad') || mg.includes('ham')) return 'Legs';
  if (mg.includes('back') || mg.includes('espalda') || mg.includes('lat')) return 'Back';
  if (mg.includes('chest') || mg.includes('pecho') || mg.includes('pec')) return 'Chest';
  if (mg.includes('shoulder') || mg.includes('hombro') || mg.includes('delt')) return 'Shoulders';
  if (mg.includes('arm') || mg.includes('brazo') || mg.includes('bi') || mg.includes('tri')) return 'Arms';
  if (mg.includes('core') || mg.includes('abs') || mg.includes('abd')) return 'Core';
  return 'Other';
}

/** Parsea data_json (puede venir como string). */
function parseJson(dj: any): any {
  if (typeof dj === 'string') {
    try { return JSON.parse(dj); } catch { return null; }
  }
  return dj;
}

export async function computeTrainingExtras(ctx: AnalyticsContext): Promise<Record<string, any>> {
  const { workoutLogs, clientIds, BUCKETS, bucketIndexOf, windowDays, windowStart } = ctx;
  const logs = workoutLogs || [];
  const out: Record<string, any> = {};

  // ---------------------------------------------------------------------
  // 1. Nº de entrenos completados en la ventana.
  // ---------------------------------------------------------------------
  out.completedWorkouts = logs.length;

  // NOTA: la "duración media de sesión" se ha eliminado como KPI — workout_logs
  // no captura la duración del entreno, así que no tenía origen de datos real.

  // ---------------------------------------------------------------------
  // 3. Series medias por sesión.
  // ---------------------------------------------------------------------
  {
    const totalSets = logs.reduce((acc: number, l: any) => acc + sessionSets(l), 0);
    out.avgSetsPerSession = logs.length ? Number((totalSets / logs.length).toFixed(1)) : 0;
  }

  // ---------------------------------------------------------------------
  // 4. Sesiones por cliente y semana (media).
  // ---------------------------------------------------------------------
  {
    const activeClientCount = new Set(
      logs.map((l: any) => l?.client_id).filter(Boolean)
    ).size;
    const weeks = Math.max(windowDays / 7, 1);
    out.sessionsPerClientWeek = activeClientCount > 0
      ? Number((logs.length / activeClientCount / weeks).toFixed(1))
      : 0;
  }

  // ---------------------------------------------------------------------
  // 5. Volumen por grupo muscular (kg movidos por músculo).
  // ---------------------------------------------------------------------
  {
    const byMuscle: Record<string, number> = {};
    for (const log of logs) {
      for (const ex of (log?.exercises || [])) {
        const muscle = canonMuscle(ex?.muscle_group);
        let v = 0;
        for (const s of (ex?.sets_logged || [])) {
          v += (Number(s?.weight) || 0) * (Number(s?.reps) || 0);
        }
        byMuscle[muscle] = (byMuscle[muscle] || 0) + v;
      }
    }
    out.volumeByMuscle = Object.entries(byMuscle)
      .map(([label, value]) => ({ label, value: Math.round(value) }))
      .filter((m) => m.value > 0)
      .sort((a, b) => b.value - a.value);
  }

  // ---------------------------------------------------------------------
  // 6. Sesiones por semana (7 segmentos sobre la ventana).
  // ---------------------------------------------------------------------
  {
    const byBucket = Array.from({ length: BUCKETS }, () => 0);
    for (const log of logs) {
      const day = String(log?.logged_at || '').split('T')[0];
      const idx = bucketIndexOf(day);
      if (idx !== -1) byBucket[idx]++;
    }
    out.sessionsTrend = byBucket;
  }

  // ---------------------------------------------------------------------
  // 7. Tendencia de RPE (7 segmentos). Media del `session_rpe` (RPE de la
  //    sesión, 1-10) que el cliente registra al completar el entreno.
  //    Las series guardan RIR (reps en reserva), no RPE — el RPE real es
  //    el de sesión.
  // ---------------------------------------------------------------------
  {
    const sum = Array.from({ length: BUCKETS }, () => 0);
    const cnt = Array.from({ length: BUCKETS }, () => 0);
    for (const log of logs) {
      const day = String(log?.logged_at || '').split('T')[0];
      const idx = bucketIndexOf(day);
      if (idx === -1) continue;
      const rpe = Number(log?.session_rpe);
      if (Number.isFinite(rpe) && rpe > 0) {
        sum[idx] += rpe;
        cnt[idx]++;
      }
    }
    out.rpeTrend = sum.map((s, i) => (cnt[i] > 0 ? Number((s / cnt[i]).toFixed(1)) : 0));
  }

  // ---------------------------------------------------------------------
  // 8. Ejercicio más usado de la cartera (más frecuente en workout_logs).
  // ---------------------------------------------------------------------
  let topExerciseName = '';
  {
    const freq: Record<string, number> = {};
    for (const log of logs) {
      for (const ex of (log?.exercises || [])) {
        const name = String(ex?.name || '').trim();
        if (!name) continue;
        freq[name] = (freq[name] || 0) + 1;
      }
    }
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    if (sorted.length) {
      topExerciseName = sorted[0][0];
      out.topExercise = { name: sorted[0][0], count: sorted[0][1] };
    } else {
      out.topExercise = null;
    }
  }

  // ---------------------------------------------------------------------
  // 9. Progresión de un levantamiento clave: peso máximo por segmento del
  //    ejercicio más frecuente.
  // ---------------------------------------------------------------------
  {
    const maxByBucket = Array.from({ length: BUCKETS }, () => 0);
    if (topExerciseName) {
      for (const log of logs) {
        const day = String(log?.logged_at || '').split('T')[0];
        const idx = bucketIndexOf(day);
        if (idx === -1) continue;
        for (const ex of (log?.exercises || [])) {
          if (String(ex?.name || '').trim() !== topExerciseName) continue;
          for (const s of (ex?.sets_logged || [])) {
            const w = Number(s?.weight) || 0;
            if (w > maxByBucket[idx]) maxByBucket[idx] = w;
          }
        }
      }
    }
    out.keyLiftTrend = maxByBucket;
    out.keyLiftName = topExerciseName || null;
  }

  // ---------------------------------------------------------------------
  // 10. Clientes sin entrenar en los últimos 7 días.
  // ---------------------------------------------------------------------
  {
    const now = ctx.now.getTime();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const trainedRecently = new Set<string>();
    for (const log of logs) {
      const ts = new Date(log?.logged_at || 0).getTime();
      if (Number.isFinite(ts) && ts >= sevenDaysAgo) {
        if (log?.client_id) trainedRecently.add(log.client_id);
      }
    }
    out.clientsNoTraining7d = Math.max(
      0,
      (clientIds?.length || 0) - trainedRecently.size
    );
  }

  // ---------------------------------------------------------------------
  // 11. PRs / récords personales batidos en la ventana.
  //     Para cada (cliente, ejercicio) se compara el peso máximo dentro de
  //     la ventana con el máximo histórico ANTERIOR a la ventana.
  // ---------------------------------------------------------------------
  {
    let prs = 0;
    try {
      if (clientIds && clientIds.length > 0) {
        // Histórico anterior a la ventana: máximo peso por (cliente, ejercicio).
        const histRes = await supabaseAdmin
          .from('workout_logs')
          .select('client_id, exercises')
          .in('client_id', clientIds)
          .lt('logged_at', windowStart.toISOString());
        const histMax: Record<string, number> = {};
        for (const log of (histRes.data || [])) {
          for (const ex of (log?.exercises || [])) {
            const key = `${log.client_id}|${String(ex?.name || '').trim().toLowerCase()}`;
            for (const s of (ex?.sets_logged || [])) {
              const w = Number(s?.weight) || 0;
              if (w > (histMax[key] || 0)) histMax[key] = w;
            }
          }
        }
        // Máximo dentro de la ventana por (cliente, ejercicio).
        const winMax: Record<string, number> = {};
        for (const log of logs) {
          for (const ex of (log?.exercises || [])) {
            const name = String(ex?.name || '').trim();
            if (!name) continue;
            const key = `${log.client_id}|${name.toLowerCase()}`;
            for (const s of (ex?.sets_logged || [])) {
              const w = Number(s?.weight) || 0;
              if (w > (winMax[key] || 0)) winMax[key] = w;
            }
          }
        }
        for (const [key, w] of Object.entries(winMax)) {
          // Sólo cuenta como PR si existe histórico previo del ejercicio y
          // el peso de la ventana lo supera estrictamente.
          if (w > 0 && histMax[key] !== undefined && w > histMax[key]) prs++;
        }
      }
    } catch (e) {
      console.error('training PRs:', e);
    }
    out.personalRecords = prs;
  }

  // ---------------------------------------------------------------------
  // 12. Adherencia al programa: sesiones realizadas vs planificadas, global
  //     y por cliente (ranking). Las sesiones planificadas se estiman a
  //     partir del nº de workouts del programa proyectado sobre la ventana.
  // ---------------------------------------------------------------------
  {
    let globalAdherence: number | null = null;
    const perClient: { clientId: string; name: string; pct: number }[] = [];
    try {
      if (clientIds && clientIds.length > 0) {
        const progRes = await supabaseAdmin
          .from('training_programs')
          .select('client_id, data_json')
          .in('client_id', clientIds);

        // Sesiones/semana PLANIFICADAS por cliente: nº de días con un workout
        // asignado en el weeklySchedule (no el nº total de workouts del plan,
        // que no equivale a la frecuencia semanal). Fallback a workouts.length
        // para planes antiguos sin weeklySchedule.
        const plannedPerWeek: Record<string, number> = {};
        for (const prog of (progRes.data || [])) {
          const dj = parseJson(prog?.data_json);
          let perWeek = 0;
          const sched = dj?.weeklySchedule;
          if (sched && typeof sched === 'object') {
            perWeek = Object.values(sched).filter(Boolean).length;
          } else if (Array.isArray(dj?.workouts)) {
            perWeek = dj.workouts.length;
          }
          if (perWeek > (plannedPerWeek[prog.client_id] || 0)) plannedPerWeek[prog.client_id] = perWeek;
        }

        // sesiones realizadas por cliente dentro de la ventana.
        const doneByClient: Record<string, number> = {};
        for (const log of logs) {
          if (!log?.client_id) continue;
          doneByClient[log.client_id] = (doneByClient[log.client_id] || 0) + 1;
        }

        const weeks = Math.max(windowDays / 7, 1);
        let sumPlanned = 0;
        let sumDone = 0;
        for (const cid of Object.keys(plannedPerWeek)) {
          const planned = plannedPerWeek[cid] * weeks;
          if (planned <= 0) continue;
          const done = doneByClient[cid] || 0;
          sumPlanned += planned;
          sumDone += done;
          perClient.push({
            clientId: cid,
            name: ctx.clientNames?.[cid] || 'Cliente',
            pct: Math.min(100, Math.round((done / planned) * 100)),
          });
        }
        if (sumPlanned > 0) {
          globalAdherence = Math.min(100, Math.round((sumDone / sumPlanned) * 100));
        }
      }
    } catch (e) {
      console.error('training adherence:', e);
    }
    out.programAdherence = globalAdherence;
    out.adherenceByClient = perClient.sort((a, b) => b.pct - a.pct).slice(0, 8);
  }

  // ---------------------------------------------------------------------
  // 13. Progresión de carga media: compara el volumen medio por sesión de
  //     la primera mitad de la ventana con el de la segunda mitad.
  // ---------------------------------------------------------------------
  {
    const mid = windowStart.getTime() + (windowDays * 24 * 60 * 60 * 1000) / 2;
    let firstVol = 0, firstCnt = 0, secondVol = 0, secondCnt = 0;
    for (const log of logs) {
      const ts = new Date(log?.logged_at || 0).getTime();
      if (!Number.isFinite(ts)) continue;
      const v = sessionVolume(log);
      if (ts < mid) { firstVol += v; firstCnt++; }
      else { secondVol += v; secondCnt++; }
    }
    const firstAvg = firstCnt > 0 ? firstVol / firstCnt : 0;
    const secondAvg = secondCnt > 0 ? secondVol / secondCnt : 0;
    out.loadProgression = firstAvg > 0
      ? Number((((secondAvg - firstAvg) / firstAvg) * 100).toFixed(1))
      : null;
  }

  return out;
}
