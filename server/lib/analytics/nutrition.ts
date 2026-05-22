import type { AnalyticsContext } from './types.js';
import { supabaseAdmin } from '../../db/index.js';

/**
 * KPIs ampliados de la pestaña NUTRITION.
 *
 * Devuelve un objeto que se fusiona (spread) sobre el objeto `nutrition` base
 * del endpoint. Las claves estarán disponibles en el frontend como
 * `data.nutrition.<clave>`.
 */

// --- Helpers ---------------------------------------------------------------

/** Suma macros + calorías de una lista de comidas (cada meal -> items[]). */
function sumMeals(meals: any[]): { cal: number; p: number; c: number; f: number; fib: number } {
  let cal = 0, p = 0, c = 0, f = 0, fib = 0;
  (meals || []).forEach((m: any) => (m?.items || []).forEach((i: any) => {
    const q = Number(i.quantity || i.multiplier || 1) || 1;
    cal += (Number(i.calories) || 0) * q;
    p += (Number(i.protein) || 0) * q;
    c += (Number(i.carbs) || 0) * q;
    f += (Number(i.fats) || 0) * q;
    fib += (Number(i.fiber ?? i.fibre) || 0) * q;
  }));
  return { cal, p, c, f, fib };
}

/** Reduce el data_json de un plan de nutrición a totales diarios. */
function planDailyTotals(dj: any): { cal: number; p: number; c: number; f: number; fib: number } | null {
  let data = dj;
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return null; } }
  if (!data) return null;

  if ((data.type === 'weekly' || data.days) && data.days) {
    const dayTotals = Object.values(data.days)
      .map((d: any) => sumMeals(d?.meals))
      .filter((t: any) => t.cal > 0 || t.p > 0 || t.c > 0 || t.f > 0);
    if (!dayTotals.length) return null;
    const n = dayTotals.length;
    const acc = dayTotals.reduce((a: any, b: any) => ({
      cal: a.cal + b.cal, p: a.p + b.p, c: a.c + b.c, f: a.f + b.f, fib: a.fib + b.fib,
    }), { cal: 0, p: 0, c: 0, f: 0, fib: 0 });
    return { cal: acc.cal / n, p: acc.p / n, c: acc.c / n, f: acc.f / n, fib: acc.fib / n };
  }

  if (Array.isArray(data.meals)) {
    const t = sumMeals(data.meals);
    if (t.cal > 0 || t.p > 0 || t.c > 0 || t.f > 0) return t;
  }
  return null;
}

export async function computeNutritionExtras(ctx: AnalyticsContext): Promise<Record<string, any>> {
  const { last30DaysCheckIns, previous30DaysCheckIns, nutritionPlans, clientIds, BUCKETS, trendLabels, bucketIndexOf } = ctx;

  // -------------------------------------------------------------------------
  // 1. Objetivo calórico/macro por cliente (a partir de su plan más reciente).
  // -------------------------------------------------------------------------
  const planByClient: Record<string, { cal: number; p: number; c: number; f: number; fib: number }> = {};
  (nutritionPlans || []).forEach((plan: any) => {
    const totals = planDailyTotals(plan.data_json);
    if (totals && (totals.cal > 0)) {
      // último plan por cliente (nutritionPlans no garantiza orden -> nos quedamos
      // con el de mayor calorías-definidas si hay duplicados; en la práctica 1 por cliente)
      if (!planByClient[plan.client_id]) planByClient[plan.client_id] = totals;
    }
  });

  const plannedClients = Object.values(planByClient);
  const avgPlanTarget = plannedClients.length
    ? plannedClients.reduce((a, b) => a + b.cal, 0) / plannedClients.length
    : 0;
  const avgPlanProtein = plannedClients.length
    ? plannedClients.reduce((a, b) => a + b.p, 0) / plannedClients.length : 0;
  const avgPlanCarbs = plannedClients.length
    ? plannedClients.reduce((a, b) => a + b.c, 0) / plannedClients.length : 0;
  const avgPlanFats = plannedClients.length
    ? plannedClients.reduce((a, b) => a + b.f, 0) / plannedClients.length : 0;
  const fibPlans = plannedClients.filter(p => p.fib > 0);
  const avgPlanFiber = fibPlans.length
    ? fibPlans.reduce((a, b) => a + b.fib, 0) / fibPlans.length : 0;

  // Distribución media de macros del plan (% calorías).
  let macroDistribution = { protein: 0, carbs: 0, fats: 0 };
  {
    const macroCal = avgPlanProtein * 4 + avgPlanCarbs * 4 + avgPlanFats * 9;
    if (macroCal > 0) {
      macroDistribution = {
        protein: Math.round((avgPlanProtein * 4 / macroCal) * 100),
        carbs: Math.round((avgPlanCarbs * 4 / macroCal) * 100),
        fats: Math.round((avgPlanFats * 9 / macroCal) * 100),
      };
    }
  }

  // -------------------------------------------------------------------------
  // 2. Recorrido de los check-ins de la ventana actual.
  // -------------------------------------------------------------------------
  const adhTrend = Array.from({ length: BUCKETS }, () => ({ sum: 0, count: 0 }));
  const hydTrend = Array.from({ length: BUCKETS }, () => ({ sum: 0, count: 0 }));
  const weightTrend = Array.from({ length: BUCKETS }, () => ({ sum: 0, count: 0 }));

  // Por cliente: adherencia media + nº de check-ins + ingesta calórica.
  const perClient: Record<string, { name: string; adhSum: number; adhCount: number; calSum: number; calCount: number }> = {};
  let nutritionCheckInCount = 0;
  let calIntakeSum = 0, calIntakeCount = 0;
  let calDeviationSum = 0, calDeviationCount = 0;
  let goalHitCount = 0, goalEvalCount = 0;

  (last30DaysCheckIns || []).forEach((ci: any) => {
    const d = (ci.data_json || {}) as any;
    const idx = bucketIndexOf(ci.date);
    const cid = ci.client_id;
    if (!perClient[cid]) perClient[cid] = { name: ctx.clientNames?.[cid] || 'Cliente', adhSum: 0, adhCount: 0, calSum: 0, calCount: 0 };

    // Adherencia nutricional (1-10 -> 0-100).
    const adhScore = d.nutrition_adherence_score;
    if (adhScore !== undefined && adhScore !== null && Number.isFinite(Number(adhScore))) {
      const adh = Math.min(Math.max(Number(adhScore) * 10, 0), 100);
      nutritionCheckInCount++;
      perClient[cid].adhSum += adh;
      perClient[cid].adhCount++;
      if (idx !== -1) { adhTrend[idx].sum += adh; adhTrend[idx].count++; }
    }

    // Hidratación (1-10 -> 0-100).
    const hydScore = d.water_intake_score;
    if (hydScore !== undefined && hydScore !== null && Number.isFinite(Number(hydScore))) {
      const hyd = Math.min(Math.max(Number(hydScore) * 10, 0), 100);
      if (idx !== -1) { hydTrend[idx].sum += hyd; hydTrend[idx].count++; }
    }

    // Calorías reportadas del día.
    const cal = Number(d.calories);
    if (Number.isFinite(cal) && cal > 0) {
      calIntakeSum += cal;
      calIntakeCount++;
      perClient[cid].calSum += cal;
      perClient[cid].calCount++;
      const target = planByClient[cid]?.cal;
      if (target && target > 0) {
        calDeviationSum += cal - target;
        calDeviationCount++;
        goalEvalCount++;
        if (Math.abs(cal - target) <= target * 0.1) goalHitCount++;
      }
    }

    // Peso reportado.
    const w = Number(d.weight);
    if (Number.isFinite(w) && w > 0 && idx !== -1) {
      weightTrend[idx].sum += w;
      weightTrend[idx].count++;
    }
  });

  // -------------------------------------------------------------------------
  // 3. Cambio de peso de la cartera (check-ins actual vs anterior).
  // -------------------------------------------------------------------------
  // Peso más reciente de cada cliente dentro de un conjunto de check-ins.
  const latestWeightByClient = (rows: any[]): Record<string, { date: string; weight: number }> => {
    const m: Record<string, { date: string; weight: number }> = {};
    (rows || []).forEach((ci: any) => {
      const w = Number((ci.data_json || {}).weight);
      if (!Number.isFinite(w) || w <= 0) return;
      const prev = m[ci.client_id];
      if (!prev || String(ci.date) > prev.date) {
        m[ci.client_id] = { date: String(ci.date), weight: w };
      }
    });
    return m;
  };
  // Cambio de peso = media del delta POR CLIENTE (peso reciente vs. peso de la
  // ventana anterior, del MISMO cliente). Antes se comparaba la media de
  // clientes distintos entre ventanas, lo que no medía un cambio real.
  const curWeights = latestWeightByClient(last30DaysCheckIns);
  const prevWeights = latestWeightByClient(previous30DaysCheckIns);
  let weightDeltaSum = 0, weightDeltaN = 0;
  Object.keys(curWeights).forEach((cid) => {
    if (prevWeights[cid]) {
      weightDeltaSum += curWeights[cid].weight - prevWeights[cid].weight;
      weightDeltaN++;
    }
  });
  const portfolioWeightChange = weightDeltaN > 0
    ? Number((weightDeltaSum / weightDeltaN).toFixed(1))
    : 0;

  // -------------------------------------------------------------------------
  // 4. Reparto déficit / mantenimiento / superávit.
  //    Por cliente: media de calorías reportadas vs su objetivo de plan.
  // -------------------------------------------------------------------------
  let deficitCount = 0, maintenanceCount = 0, surplusCount = 0;
  Object.entries(perClient).forEach(([cid, v]) => {
    const target = planByClient[cid]?.cal;
    if (!target || target <= 0 || v.calCount === 0) return;
    const avgCal = v.calSum / v.calCount;
    const ratio = avgCal / target;
    if (ratio < 0.95) deficitCount++;
    else if (ratio > 1.05) surplusCount++;
    else maintenanceCount++;
  });

  // -------------------------------------------------------------------------
  // 5. Adherencia por cliente + mejor / peor.
  // -------------------------------------------------------------------------
  const clientAdherence = Object.values(perClient)
    .filter(v => v.adhCount > 0)
    .map(v => ({ name: v.name, adherence: Math.round(v.adhSum / v.adhCount) }))
    .sort((a, b) => b.adherence - a.adherence);

  const bestClient = clientAdherence.length ? clientAdherence[0] : null;
  const worstClient = clientAdherence.length ? clientAdherence[clientAdherence.length - 1] : null;

  // -------------------------------------------------------------------------
  // 6. Distribución de objetivos de los clientes (clients_profiles.goal).
  // -------------------------------------------------------------------------
  let goalDistribution = { cutting: 0, bulking: 0, maintenance: 0, other: 0 };
  try {
    if (clientIds && clientIds.length) {
      const { data: profiles } = await supabaseAdmin
        .from('clients_profiles')
        .select('user_id, goal')
        .in('user_id', clientIds);
      (profiles || []).forEach((p: any) => {
        const g = String(p.goal || '').toLowerCase();
        if (/cut|fat|loss|defin|lose|lean/.test(g)) goalDistribution.cutting++;
        else if (/bulk|gain|mass|build|volum|muscle/.test(g)) goalDistribution.bulking++;
        else if (/maint|recomp|perform|keep/.test(g)) goalDistribution.maintenance++;
        else if (g) goalDistribution.other++;
      });
    }
  } catch (e) {
    console.error('nutrition KPIs: goal distribution', e);
  }

  // -------------------------------------------------------------------------
  // 7. Series temporales (7 segmentos).
  // -------------------------------------------------------------------------
  const adherenceTrend = adhTrend.map(b => b.count > 0 ? Math.round(b.sum / b.count) : 0);
  const hydrationTrend = hydTrend.map(b => b.count > 0 ? Math.round(b.sum / b.count) : 0);
  const weightTrendSeries = weightTrend.map(b => b.count > 0 ? Number((b.sum / b.count).toFixed(1)) : 0);

  // Calorías medias diarias de los clientes con plan, vs objetivo medio.
  const calorieGoalCompliance = goalEvalCount > 0
    ? Math.round((goalHitCount / goalEvalCount) * 100)
    : 0;

  return {
    // Tarjetas
    calorieGoalCompliance,
    avgCalorieIntake: calIntakeCount > 0 ? Math.round(calIntakeSum / calIntakeCount) : 0,
    macroVsTarget: {
      protein: Math.round(avgPlanProtein),
      carbs: Math.round(avgPlanCarbs),
      fats: Math.round(avgPlanFats),
    },
    avgCalorieDeviation: calDeviationCount > 0 ? Math.round(calDeviationSum / calDeviationCount) : 0,
    nutritionCheckInCount,
    intakeSplit: { deficit: deficitCount, maintenance: maintenanceCount, surplus: surplusCount },
    portfolioWeightChange,
    avgFiber: avgPlanFiber > 0 ? Math.round(avgPlanFiber) : 0,
    bestClient,
    worstClient,
    avgPlanTarget: Math.round(avgPlanTarget),

    // Gráficas
    macroDistribution,
    adherenceTrend,
    hydrationTrend,
    weightTrendSeries,
    clientAdherence,
    goalDistribution,

    // Etiquetas de los segmentos (por si el front las necesita aquí).
    trendLabels,
  };
}
