import React from 'react';
import {
  Smile,
  Flame,
  Zap,
  Activity,
  Moon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

interface MindsetTabProps {
  stats: any;
  t: Function;
}

const MindsetTab: React.FC<MindsetTabProps> = ({ stats, t }) => {
  // Coerce a mindset metric to a finite number, or null when missing/'--'.
  const m = stats?.mindset || {};
  const num1to10 = (k: string): number | null => {
    const v = Number((m as any)[k]);
    return Number.isFinite(v) && v > 0 ? v : null;
  };
  const mood = num1to10('mood');
  const stress = num1to10('stress');
  const motivation = num1to10('motivation');
  const energy = num1to10('energy');
  // Burnout heuristic uses a 1-10 quality score, not raw hours of sleep.
  // `mindset.sleep` carries `sleep_hours` (4-10 range); the score lives
  // in `sleepQuality` and matches the 1-10 scale of the other inputs.
  const sleep = num1to10('sleepQuality');

  // Composite burnout risk: combines sustained stress, low sleep and low
  // motivation. Returns null when none of the inputs has data, so the card
  // shows '—' instead of inventing a value for brand-new clients.
  const burnoutRisk = (() => {
    if (stress == null && sleep == null && motivation == null) return null;
    let score = 0;
    let count = 0;
    if (stress != null)     { score += stress >= 8 ? 2 : stress >= 6 ? 1 : 0; count++; }
    if (sleep != null)      { score += sleep <= 5  ? 2 : sleep <= 6  ? 1 : 0; count++; }
    if (motivation != null) { score += motivation <= 3 ? 2 : motivation <= 5 ? 1 : 0; count++; }
    const avg = score / Math.max(count, 1);
    if (avg >= 1.5) return 'High';
    if (avg >= 0.6) return 'Medium';
    return 'Low';
  })();

  const valueOrDash = (n: number | null) => (n != null ? n : '--');
  const statusOrDash = (n: number | null, hi: string, lo: string) => (n != null ? (n > 7 ? hi : lo) : '--');

  return (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[
        { label: 'MOOD', value: valueOrDash(mood), status: statusOrDash(mood, 'Good', 'Avg'), icon: Smile, color: 'text-blue-500', bg: 'bg-blue-50', dataKey: 'mood' },
        { label: 'STRESS', value: valueOrDash(stress), status: statusOrDash(stress, 'High', 'Normal'), icon: Flame, color: 'text-red-500', bg: 'bg-red-50', dataKey: 'stress' },
        { label: 'MOTIVATION', value: valueOrDash(motivation), status: statusOrDash(motivation, 'High', 'Low'), icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50', dataKey: 'motivation' },
        { label: 'ENERGY', value: valueOrDash(energy), status: statusOrDash(energy, 'High', 'Low'), icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50', dataKey: 'energy' },
        { label: 'SLEEP', value: valueOrDash(sleep), status: statusOrDash(sleep, 'Good', 'Low'), icon: Moon, color: 'text-emerald-500', bg: 'bg-emerald-50', dataKey: 'sleep' },
        { label: 'BURNOUT RISK', value: burnoutRisk ?? '--', status: '', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', dataKey: 'stress' },
      ].map((stat, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>{stat.status}</span>
              </div>
            </div>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div className="h-16 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.mindset?.history || []}>
                <Line type="monotone" dataKey={stat.dataKey} stroke={({ 'text-blue-500': '#3b82f6', 'text-red-500': '#ef4444', 'text-purple-500': '#a855f7', 'text-amber-500': '#f59e0b', 'text-emerald-500': '#10b981' } as Record<string, string>)[stat.color] || '#10b981'} strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>

    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('todays_state')}</h3>
        <div className="space-y-6">
          {[
            { label: t('mood'), value: stats?.mindset?.mood, color: 'bg-blue-500' },
            { label: t('stress'), value: stats?.mindset?.stress, color: 'bg-red-400' },
            { label: t('energy'), value: stats?.mindset?.energy, color: 'bg-amber-400' },
            { label: t('motivation'), value: stats?.mindset?.motivation, color: 'bg-purple-500' },
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{item.value || '--'}/10</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className={`${item.color} h-2 rounded-full`} style={{ width: `${(Number(item.value) || 0) * 10}%` }}></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('client_note')}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
            {stats?.activity?.find((a: any) => a.type === 'CHECK_IN' && a.sub)?.sub || t('no_client_notes_period')}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('adherence_snapshot')}</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('nutrition')}</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{stats?.macros?.adherenceScore ? `${stats.macros.adherenceScore}%` : '--'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('training')}</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{stats?.training?.workoutCount ? `${stats.training.workoutCount} ${t('sessions')}` : '--'}</span>
          </div>
        </div>
      </div>

      {/* Injury & Pain Tracking — consume las preguntas pain_* del check-in
          (painLevel, affectedArea, painType, trainingImpact, painDuration,
          painProgression) que antes estaban huérfanas. */}
      {(() => {
        const painData = stats?.pain;
        const hasAnyPain = painData && (painData.current || (painData.history && painData.history.length > 0));
        return (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('injury_pain_tracking', { defaultValue: 'Injury & Pain' })}</h3>
            </div>
            {!hasAnyPain ? (
              <p className="text-xs text-slate-400">{t('no_pain_reported', { defaultValue: 'No pain reported in recent check-ins.' })}</p>
            ) : (
              <div className="space-y-4">
                {painData.current?.level != null && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('pain_level', { defaultValue: 'Pain level' })}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{painData.current.level}/10</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full ${painData.current.level >= 7 ? 'bg-rose-500' : painData.current.level >= 4 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${painData.current.level * 10}%` }} />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {painData.current?.area && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t('pain_area', { defaultValue: 'Area' })}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{Array.isArray(painData.current.area) ? painData.current.area.join(', ') : painData.current.area}</span>
                    </div>
                  )}
                  {painData.current?.type && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t('pain_type', { defaultValue: 'Type' })}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{painData.current.type}</span>
                    </div>
                  )}
                  {painData.current?.impact && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t('pain_impact', { defaultValue: 'Training impact' })}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{painData.current.impact}</span>
                    </div>
                  )}
                  {painData.current?.duration && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t('pain_duration', { defaultValue: 'Duration' })}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{painData.current.duration}</span>
                    </div>
                  )}
                  {painData.current?.progression && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t('pain_progression', { defaultValue: 'Progression' })}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{painData.current.progression}</span>
                    </div>
                  )}
                  {typeof painData.recentWeeksReported === 'number' && painData.recentWeeksReported > 0 && (
                    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">{t('pain_weeks_30d', { defaultValue: 'Weeks with pain (30d)' })}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{painData.recentWeeksReported}</span>
                    </div>
                  )}
                </div>
                {painData.current?.notes && (
                  <div className="mt-4 p-3 bg-rose-50/50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-900/30">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">{t('notes', { defaultValue: 'Notes' })}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">{painData.current.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  </div>
  );
};

export default MindsetTab;
