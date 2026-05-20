import React from 'react';
import { RoadmapData, TrajectoryGoals } from '../../types/planning';

// --- EMPTY SCAFFOLD FACTORY ---
// A brand-new roadmap starts empty: no invented phases, KPIs or calories.
// Arrays are always present (never undefined) so the editor never crashes.
export const getInitialData = (_t: (key: string, vars?: Record<string, any>) => string): RoadmapData => ({
  status: 'Draft',
  currentWeek: 1,
  totalWeeks: 12,
  nutrition: [],
  training: [],
  goals: [],
  milestones: [],
  assumptions: {
    steps: '',
    sleep: '',
    constraints: ''
  }
});

// --- HELPER: ICON COMPONENT ---
export const Icon = ({ name, className = "" }: { name: string, className?: string }) => (
  React.createElement('span', { className: `material-symbols-outlined ${className}`, style: { fontSize: 'inherit' } }, name)
);


// --- TRAJECTORY HELPERS ---

/** Ease-out curve (fast at first, slowing toward the goal) for a natural projection. */
export function easeOutCubic(p: number): number {
  const c = Math.min(1, Math.max(0, p));
  return 1 - Math.pow(1 - c, 3);
}

export function computeTrajectory(
  roadmap: RoadmapData,
  checkInsByDate: { date: string; weight: number }[],
  goals: TrajectoryGoals,
  locale: string
): { chartData: any[]; currentWeekIndex: number; anchorWeight: number; weeklyRate: number; observedRate: number } {
  const totalWeeks = goals.totalWeeks || roadmap.totalWeeks || 12;
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const target = goals.targetWeight || 0;
  const round = (n: number) => parseFloat(n.toFixed(1));

  // Real check-ins, chronologically
  const cis = [...checkInsByDate]
    .filter(c => typeof c.weight === 'number' && c.weight > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Timeline origin: the first real check-in, else the program start, else now.
  const programStart = goals.programStartDate ? new Date(goals.programStartDate) : new Date();
  const origin = cis.length > 0 ? new Date(cis[0].date) : programStart;

  // Place each check-in on the week timeline from the origin. Weeks are kept
  // strictly increasing so every check-in stays visible (start → current),
  // even when several fall within the same calendar week.
  const actualByWeek: Record<number, number> = {};
  let lastActualWeek = 0;
  let prevWk = -1;
  cis.forEach((c, i) => {
    let wk = Math.max(0, Math.round((new Date(c.date).getTime() - origin.getTime()) / msPerWeek));
    if (i > 0 && wk <= prevWk) wk = prevWk + 1;
    actualByWeek[wk] = c.weight;
    prevWk = wk;
    if (wk > lastActualWeek) lastActualWeek = wk;
  });

  // Anchor = the client's most recent real weight (fallbacks when no check-ins).
  const anchorWeight = cis.length > 0
    ? cis[cis.length - 1].weight
    : (goals.currentWeight || goals.startWeight || 0);

  // The projection runs from the latest check-in toward the TARGET weight,
  // easing over the full program duration so it visibly heads to the goal.
  const projEndWeek = lastActualWeek + Math.max(1, totalWeeks);

  // Observed weekly rate from real check-ins (used for the honest pace banner).
  let observedRate = 0;
  if (cis.length >= 2 && lastActualWeek > 0) {
    observedRate = (cis[cis.length - 1].weight - cis[0].weight) / lastActualWeek;
  }

  const chartData: any[] = [];
  for (let w = 0; w <= projEndWeek; w++) {
    const weekDate = new Date(origin.getTime() + w * msPerWeek);
    let projected: number | undefined;
    if (w < lastActualWeek) {
      projected = undefined;                       // past — actual line only
    } else if (w === lastActualWeek) {
      projected = round(anchorWeight);             // join point: actual ↔ projection
    } else {
      const p = easeOutCubic((w - lastActualWeek) / (projEndWeek - lastActualWeek));
      projected = round(anchorWeight + (target - anchorWeight) * p);
    }
    chartData.push({
      week: w + 1,
      label: weekDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
      projected,
      actual: actualByWeek[w],
      isCurrentWeek: w === lastActualWeek,
    });
  }

  return {
    chartData,
    currentWeekIndex: lastActualWeek,
    anchorWeight,
    weeklyRate: totalWeeks > 0 ? (target - anchorWeight) / totalWeeks : 0,
    observedRate,
  };
}
