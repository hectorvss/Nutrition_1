import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartTooltip, ReferenceLine,
} from 'recharts';
import { Icon, computeTrajectory } from './helpers';
import { RoadmapData, TrajectoryGoals } from '../../types/planning';
import DatePicker from '../../components/ui/DatePicker';

interface Props {
  roadmap: RoadmapData;
  checkInsHistory: { date: string; weight: number }[];
  client: any;
  language: string;
  onUpdateTrajectoryGoals: (partial: Partial<TrajectoryGoals>) => void;
  t: (key: string, vars?: any) => string;
}

export default function TrajectoryChart({ roadmap, checkInsHistory, client, language, onUpdateTrajectoryGoals, t }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  const isEs = language === 'es';

  // Auto values from real check-ins (auto-filled, coach can override)
  const autoStart = checkInsHistory.length > 0 ? checkInsHistory[0].weight : undefined;
  const autoCurrent = checkInsHistory.length > 0 ? checkInsHistory[checkInsHistory.length - 1].weight : undefined;
  const saved: Partial<TrajectoryGoals> = roadmap.trajectoryGoals ?? {};

  // Seed from the client's real weight; no invented numbers. Targets
  // default to "maintain" (= current) until the coach sets them.
  const profileWeight = Number((client as any)?.weight) || 0;
  const baseWeight = autoCurrent ?? autoStart ?? profileWeight;
  const tGoals: TrajectoryGoals = {
    targetWeight: baseWeight,
    startWeight: autoStart ?? profileWeight ?? baseWeight,
    currentWeight: autoCurrent ?? autoStart ?? baseWeight,
    targetStrengthKg: 0,
    startStrengthKg: 0,
    exerciseName: '',
    programStartDate: today,
    totalWeeks: roadmap.totalWeeks || 12,
    ...saved,
  };
  const startIsAuto = saved.startWeight === undefined && autoStart !== undefined;
  const currentIsAuto = saved.currentWeight === undefined && autoCurrent !== undefined;

  const totalWeeks = tGoals.totalWeeks || 12;
  const hasActualData = checkInsHistory.length > 0;

  const { chartData, currentWeekIndex, anchorWeight, observedRate } = computeTrajectory(
    roadmap, checkInsHistory, tGoals, locale
  );

  // --- Headline KPIs ---
  const currentW = parseFloat((anchorWeight || tGoals.currentWeight || tGoals.startWeight || 0).toFixed(1));
  const targetW = tGoals.targetWeight || 0;
  const remaining = parseFloat((targetW - currentW).toFixed(1));
  const canEstimatePace = checkInsHistory.length >= 2;
  const finalProjected = parseFloat((currentW + observedRate * totalWeeks).toFixed(1));
  const projGap = parseFloat((finalProjected - targetW).toFixed(1));
  const onTrack = Math.abs(projGap) <= 1;
  const losing = remaining < 0;
  const weeksLeft = Math.max(0, totalWeeks - currentWeekIndex - 1);

  // Y-axis domain
  const allWeights = [
    ...chartData.map(d => d.projected).filter((v): v is number => typeof v === 'number'),
    ...checkInsHistory.map(c => c.weight),
    targetW,
  ].filter(v => v > 0);
  const minW = allWeights.length > 0 ? Math.floor(Math.min(...allWeights)) - 2 : 60;
  const maxW = allWeights.length > 0 ? Math.ceil(Math.max(...allWeights)) + 2 : 100;

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const proj = payload.find((p: any) => p.dataKey === 'projected');
    const actual = payload.find((p: any) => p.dataKey === 'actual');
    return (
      <div className="bg-slate-900 text-white rounded-xl px-3 py-2 shadow-xl text-[10px] font-bold min-w-[120px]">
        <div className="text-emerald-400 mb-1.5 uppercase tracking-widest">{label}</div>
        {actual?.value != null && (
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />{t('planning_actual', { defaultValue: 'Actual' })}</span>
            <span>{actual.value} kg</span>
          </div>
        )}
        {proj?.value != null && (
          <div className="flex items-center justify-between gap-3 mt-0.5">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />{t('planning_projected_short', { defaultValue: 'Projected' })}</span>
            <span>{proj.value} kg</span>
          </div>
        )}
      </div>
    );
  };

  const kpiTile = (tone: string, label: string, value: React.ReactNode, sub?: React.ReactNode) => (
    <div className={`rounded-2xl p-4 border ${tone}`}>
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">{value}</div>
      {sub && <div className="mt-1 text-[10px] font-semibold opacity-70">{sub}</div>}
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-md shadow-slate-200/60 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-700">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Icon name="monitoring" className="text-emerald-500 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {t('planning_goal_trajectory_predictions', { defaultValue: 'Goal Trajectory & Predictions' })}
            </h3>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              {isEs ? 'Peso real vs. proyección según el plan nutricional' : 'Actual weight vs. projection from the nutrition plan'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center gap-1.5">
            <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" /></svg>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('planning_actual', { defaultValue: 'Actual' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#10b981" strokeWidth="3" strokeDasharray="2 4" strokeLinecap="round" /></svg>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('planning_projected', { defaultValue: 'Projected' })}</span>
          </div>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {kpiTile(
          'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/40 text-blue-700 dark:text-blue-300',
          isEs ? 'Peso actual' : 'Current weight',
          <><span className="text-3xl font-extrabold">{currentW || '--'}</span><span className="text-sm font-bold opacity-70">kg</span></>,
          hasActualData
            ? (isEs ? 'Último check-in' : 'Latest check-in')
            : (isEs ? 'Sin check-ins aún' : 'No check-ins yet')
        )}
        {kpiTile(
          'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300',
          isEs ? 'Objetivo' : 'Target',
          <>
            <input
              type="number" step="0.5"
              className="text-3xl font-extrabold bg-transparent border-none p-0 w-[4.5rem] focus:ring-0 outline-none"
              value={tGoals.targetWeight || ''}
              onChange={e => { const v = parseFloat(e.target.value); onUpdateTrajectoryGoals({ targetWeight: isNaN(v) ? 0 : v }); }}
            />
            <span className="text-sm font-bold opacity-70">kg</span>
          </>,
          isEs ? 'Editable' : 'Editable'
        )}
        {kpiTile(
          'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200',
          isEs ? 'Por recorrer' : 'To go',
          <>
            <Icon name={losing ? 'trending_down' : remaining > 0 ? 'trending_up' : 'drag_handle'} className={`text-2xl ${losing ? 'text-emerald-500' : remaining > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className="text-3xl font-extrabold">{Math.abs(remaining) || 0}</span><span className="text-sm font-bold opacity-70">kg</span>
          </>,
          remaining === 0 ? (isEs ? 'En el objetivo' : 'At target') : losing ? (isEs ? 'para bajar' : 'to lose') : (isEs ? 'para subir' : 'to gain')
        )}
        {kpiTile(
          'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/40 text-amber-700 dark:text-amber-300',
          isEs ? 'Semana' : 'Week',
          <><span className="text-3xl font-extrabold">{Math.min(currentWeekIndex + 1, totalWeeks)}</span><span className="text-sm font-bold opacity-70">/ {totalWeeks}</span></>,
          weeksLeft > 0 ? (isEs ? `${weeksLeft} sem. restantes` : `${weeksLeft}w remaining`) : (isEs ? 'Programa finalizado' : 'Program finished')
        )}
      </div>

      {/* Projection summary banner */}
      <div className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-4 text-xs font-bold ${
        !canEstimatePace
          ? 'bg-slate-50 dark:bg-slate-800/60 text-slate-500'
          : onTrack
            ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300'
            : 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300'
      }`}>
        <Icon name={!canEstimatePace ? 'info' : onTrack ? 'check_circle' : 'warning'} className="text-lg" />
        <span>
          {!canEstimatePace
            ? (isEs ? 'Se necesitan al menos 2 check-ins de peso para estimar el ritmo real.' : 'At least 2 weight check-ins are needed to estimate the real pace.')
            : onTrack
              ? (isEs
                  ? `A su ritmo actual terminará en ~${finalProjected} kg, justo en el objetivo.`
                  : `At their current pace they finish around ~${finalProjected} kg — right on target.`)
              : (isEs
                  ? `A su ritmo actual terminará en ~${finalProjected} kg (${projGap > 0 ? '+' : ''}${projGap} kg del objetivo). Ajusta el plan o el ritmo.`
                  : `At their current pace they finish around ~${finalProjected} kg (${projGap > 0 ? '+' : ''}${projGap} kg off target). Adjust the plan or pace.`)}
        </span>
      </div>

      {/* Phase strips */}
      {roadmap.nutrition.length > 0 && (
        <div className="flex gap-1 px-1 mb-1.5">
          {roadmap.nutrition.map(b => (
            <div
              key={b.id}
              style={{ flex: Math.max(1, b.endWeek - b.startWeek + 1) }}
              className={`h-2 rounded-full ${b.colorToken?.split(' ')[0] || 'bg-blue-200'}`}
              title={`${b.title} (W${b.startWeek}–W${b.endWeek})`}
            />
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="w-full rounded-2xl bg-gradient-to-b from-slate-50/60 to-transparent dark:from-slate-800/30 p-2" style={{ height: 376 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 18, right: 72, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="traj-projected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.30} />
                <stop offset="55%" stopColor="#10b981" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="traj-actual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="traj-proj-stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 5" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
              interval={totalWeeks > 16 ? Math.floor(totalWeeks / 8) : 1}
            />
            <YAxis
              domain={[minW, maxW]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
              tickCount={6}
              tickFormatter={v => `${v}`}
              width={34}
            />

            <RechartTooltip content={<ChartTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4 4' }} />

            {/* Target weight reference line */}
            {targetW > 0 && (
              <ReferenceLine
                y={targetW}
                stroke="#10b981"
                strokeDasharray="2 4"
                strokeWidth={1.5}
                label={{ value: `🎯 ${targetW}kg`, position: 'right', fill: '#059669', fontSize: 10, fontWeight: 800 }}
              />
            )}

            {/* "Now" reference line */}
            {chartData[currentWeekIndex] && (
              <ReferenceLine
                x={chartData[currentWeekIndex].label}
                stroke="#94a3b8"
                strokeDasharray="3 4"
                strokeWidth={1.5}
                label={{ value: isEs ? 'HOY' : 'NOW', position: 'top', fill: '#64748b', fontSize: 9, fontWeight: 800 }}
              />
            )}

            {/* Actual — soft fill under the real check-in line */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="none"
              fill="url(#traj-actual)"
              connectNulls={false}
              isAnimationActive
              animationDuration={800}
            />

            {/* Projected — gradient curve from current weight onward */}
            <Area
              type="monotone"
              dataKey="projected"
              stroke="url(#traj-proj-stroke)"
              strokeWidth={3}
              strokeDasharray="2 5"
              strokeLinecap="round"
              fill="url(#traj-projected)"
              dot={false}
              activeDot={{ r: 6, fill: '#10b981', stroke: 'white', strokeWidth: 2.5 }}
              connectNulls
              isAnimationActive
              animationDuration={1100}
            />

            {/* Actual check-ins — crisp solid line on top */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={3.5}
              strokeLinecap="round"
              dot={{ fill: 'white', stroke: '#3b82f6', strokeWidth: 2.5, r: 4.5 }}
              activeDot={{ r: 7.5, fill: '#3b82f6', stroke: 'white', strokeWidth: 2.5 }}
              connectNulls={false}
              isAnimationActive
              animationDuration={800}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Compact settings row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-200 dark:border-slate-700">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('planning_program_start_date', { defaultValue: 'Start date' })}</p>
          <DatePicker
            value={tGoals.programStartDate || ''}
            onChange={(v) => onUpdateTrajectoryGoals({ programStartDate: v })}
            allowClear={false}
            className="w-full flex items-center justify-between gap-1 text-xs font-bold text-slate-800 dark:text-white bg-transparent text-left outline-none"
          />
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-200 dark:border-slate-700">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('total_duration', { defaultValue: 'Duration' })}</p>
          <div className="flex items-baseline gap-1">
            <input
              type="number" min="4" max="52"
              className="text-sm font-bold text-slate-800 dark:text-white bg-transparent border-none p-0 w-10 focus:ring-0 outline-none"
              value={tGoals.totalWeeks || ''}
              onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) onUpdateTrajectoryGoals({ totalWeeks: v }); }}
            />
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('weeks_label', { defaultValue: 'weeks' })}</span>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-200 dark:border-slate-700">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
            {t('start_weight', { defaultValue: 'Start weight' })}
            {startIsAuto && <span className="text-[7px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 px-1 py-px rounded font-black">AUTO</span>}
          </p>
          <div className="flex items-baseline gap-1">
            <input
              type="number" step="0.5"
              className="text-sm font-bold text-slate-800 dark:text-white bg-transparent border-none p-0 w-12 focus:ring-0 outline-none"
              value={tGoals.startWeight || ''}
              onChange={e => { const v = parseFloat(e.target.value); onUpdateTrajectoryGoals({ startWeight: isNaN(v) ? 0 : v }); }}
            />
            <span className="text-[10px] font-bold text-slate-400">kg</span>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-200 dark:border-slate-700">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
            {isEs ? 'Peso actual' : 'Current weight'}
            {currentIsAuto && <span className="text-[7px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 px-1 py-px rounded font-black">AUTO</span>}
          </p>
          <div className="flex items-baseline gap-1">
            <input
              type="number" step="0.5"
              className="text-sm font-bold text-slate-800 dark:text-white bg-transparent border-none p-0 w-12 focus:ring-0 outline-none"
              value={tGoals.currentWeight || ''}
              onChange={e => { const v = parseFloat(e.target.value); onUpdateTrajectoryGoals({ currentWeight: isNaN(v) ? 0 : v }); }}
            />
            <span className="text-[10px] font-bold text-slate-400">kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
