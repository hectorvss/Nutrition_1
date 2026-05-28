import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Target,
  ChevronLeft,
  ChevronRight,
  Percent,
  Flame,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Select from '../../components/ui/Select';
import WorkoutLogItem from './WorkoutLogItem';
import TrainingProgramCard from './TrainingProgramCard';
import { useChartTooltipStyle } from '../../lib/useChartTheme';

// Clave estable para la opción "Volumen semanal" del selector de análisis.
// Antes el estado default era 'Weekly Volume' (inglés) y se comparaba con
// t('weekly_volume'); en ES nunca casaba y el gráfico arrancaba vacío.
const WEEKLY_VOLUME_KEY = '__weekly_volume__';

interface TrainingTabProps {
  stats: any;
  isLoading: boolean;
  t: Function;
  clientId: string;
  onUpdateWorkoutLog: (id: string, data: any) => Promise<void>;
}

const TrainingTab: React.FC<TrainingTabProps> = ({ stats, isLoading, t, clientId, onUpdateWorkoutLog }) => {
  const [strengthRange, setStrengthRange] = useState('1W');
  const [strengthWeekOffset, setStrengthWeekOffset] = useState(0);
  const [selectedAnalysisSubject, setSelectedAnalysisSubject] = useState(WEEKLY_VOLUME_KEY);
  const chartTooltipStyle = useChartTooltipStyle();
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [visiblePRs, setVisiblePRs] = useState(4);
  const [visibleWorkouts, setVisibleWorkouts] = useState(4);

  useEffect(() => {
    if (stats?.training?.allExercises?.length > 0 && !hasAutoSelected) {
      setSelectedAnalysisSubject(stats.training.allExercises[0].name);
      setHasAutoSelected(true);
    }
  }, [stats, hasAutoSelected]);

  const getWeekRange = (offset: number) => {
    const now = new Date();
    const todayIdx = now.getDay();
    const isoToday = todayIdx === 0 ? 7 : todayIdx;

    // Get Monday of the week (ISO)
    const monday = new Date(now);
    monday.setDate(now.getDate() - (isoToday - 1) + (offset * 7));

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return { monday, sunday };
  };

  const getFilteredStrengthData = () => {
    if (!stats?.training?.strengthHistory) return [];

    const now = new Date();
    let cutoff = new Date();
    if (strengthRange === '1W') {
      const { monday, sunday } = getWeekRange(strengthWeekOffset);
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const k = d.toISOString().split('T')[0];
        const match = stats.training.strengthHistory.find((h: any) => h.date === k);
        days.push(match || { date: k, volume: 0, logs: {} });
      }
      return days;
    }

    if (strengthRange === '3M') cutoff.setMonth(now.getMonth() - 3);
    else if (strengthRange === '6M') cutoff.setMonth(now.getMonth() - 6);
    else if (strengthRange === '14D') cutoff.setDate(now.getDate() - 14);
    else if (strengthRange === '30D') cutoff.setDate(now.getDate() - 30);
    else if (strengthRange === 'YTD') cutoff.setFullYear(now.getFullYear(), 0, 1);
    else return stats.training.strengthHistory;

    const todayStr = now.toISOString().split('T')[0];
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return stats.training.strengthHistory.filter((h: any) => h.date >= cutoffStr && h.date <= todayStr);
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm font-medium">{t('loading_training')}</p>
        </div>
      ) : (
      <>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: t('weekly_volume'), value: stats?.training?.weeklyVolume?.toLocaleString() || '0', unit: 'kg', change: '', icon: Dumbbell, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('avg_session_rpe'), value: stats?.training?.avgRPE || '--', unit: '/ 10', change: t('session_avg'), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('workouts'), value: stats?.training?.workoutCount || '0', unit: t('sessions'), change: t('this_week'), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          // Training adherence (self-reported 0-100, from training_adherence_score
          // FIXED question × 10). Surfaced now that /profile-stats exposes it.
          { label: t('training_adherence', { defaultValue: 'Adherencia entreno' }), value: stats?.training?.adherenceRate != null ? `${stats.training.adherenceRate}` : '--', unit: '%', change: '', icon: Percent, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          // Training intensity score (1-10). Sits alongside RPE: RPE is the
          // session-level effort average, intensityScore is the wellbeing
          // self-report from the latest check-in.
          { label: t('training_intensity', { defaultValue: 'Intensidad' }), value: stats?.training?.intensityScore || '--', unit: '/ 10', change: '', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: t('fatigue_level'), value: stats?.training?.fatigue || '--', unit: '/ 10', change: stats?.training?.fatigue > 7 ? t('high') : t('normal'), icon: AlertTriangle, color: stats?.training?.fatigue > 7 ? 'text-red-500' : 'text-amber-500', bg: stats?.training?.fatigue > 7 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                <span className="text-xs font-bold text-slate-400">{stat.unit}</span>
              </div>
              <p className={`text-[10px] font-bold ${stat.color}`}>{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('strength_progress_analysis')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{t('strength_progress_subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            {strengthRange === '1W' && (
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 relative items-center mr-2">
                <button
                  onClick={() => setStrengthWeekOffset(prev => prev - 1)}
                  className="px-2 py-1.5 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="px-3 py-1 flex flex-col items-center min-w-[120px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{t('week', { defaultValue: 'Semana' })}</span>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {(() => {
                      const { monday, sunday } = getWeekRange(strengthWeekOffset);
                      return `${monday.toLocaleDateString([], { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString([], { day: 'numeric', month: 'short' })}`;
                    })()}
                  </span>
                </div>
                <button
                  onClick={() => setStrengthWeekOffset(prev => prev + 1)}
                  className="px-2 py-1.5 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors pointer-events-none" />
              <Select
                value={strengthRange}
                onChange={(val) => setStrengthRange(val)}
                className="text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-slate-600 dark:text-slate-300 hover:border-emerald-500/50 shadow-sm transition-all outline-none"
              >
                <option value="1W">{t('last_7_days')}</option>
                <option value="14D">{t('last_14_days')}</option>
                <option value="30D">{t('last_30_days')}</option>
                <option value="3M">{t('latest_90_days')}</option>
                <option value="6M">{t('last_6_months')}</option>
                <option value="YTD">{t('year_to_date')}</option>
                <option value="ALL">{t('all_history')}</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-nowrap overflow-x-auto gap-4 mb-8 pb-4 scrollbar-hide no-scrollbar">
          {[
            { id: WEEKLY_VOLUME_KEY, name: t('weekly_volume'), value: stats?.training?.weeklyVolume?.toLocaleString() || '0', unit: t('volume_kg_unit', { defaultValue: 'kg vol.' }) },
            ...(stats?.training?.allExercises || []).map((ex: any) => ({
              id: ex.name,
              name: ex.name,
              value: ex.pr || '--',
              unit: 'kg'
            }))
          ].map((ex, idx) => {
            const isSelected = ex.id === selectedAnalysisSubject;
            return (
              <div
                key={idx}
                onClick={() => setSelectedAnalysisSubject(ex.id)}
                className={`flex-shrink-0 w-48 p-5 rounded-2xl border transition-all cursor-pointer select-none group ${isSelected ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-900/10 shadow-md shadow-emerald-50' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isSelected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                    <Dumbbell className="w-4.5 h-4.5" />
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[8px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-lg uppercase">
                      <CheckCircle2 className="w-2.5 h-2.5" /> {t('selected')}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 truncate group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{ex.name}</h4>
                <div className="flex items-baseline gap-1.5">
                   <span className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tighter">{ex.value}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ex.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getFilteredStrengthData()}>
              <defs>
                {[
                  { id: 'colorStrength1', color: '#10b981' },
                  { id: 'colorStrength2', color: '#3b82f6' },
                  { id: 'colorStrength3', color: '#f59e0b' },
                  { id: 'colorStrength4', color: '#ef4444' },
                  { id: 'colorStrength5', color: '#8b5cf6' }
                ].map(grad => (
                  <linearGradient key={grad.id} id={grad.id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={grad.color} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={grad.color} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}}
                tickFormatter={(date) => {
                  try {
                    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  } catch { return date; }
                }}
              />
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                labelStyle={{ fontWeight: 700, marginBottom: '4px' }}
                labelFormatter={(label) => {
                  try {
                    return new Date(label).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
                  } catch { return label; }
                }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />

              {(() => {
                if (selectedAnalysisSubject === WEEKLY_VOLUME_KEY) {
                  return (
                    <Area
                      name={t('weekly_volume')}
                      type="natural"
                      dataKey="volume"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#colorStrength1)"
                      dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                      connectNulls
                    />
                  );
                }

                // Helper to match exercise name case-insensitively
                const findExData = (logs: any) => {
                  if (!logs) return null;
                  const key = Object.keys(logs).find(k => k.toLowerCase() === selectedAnalysisSubject.toLowerCase());
                  return key ? logs[key] : null;
                };

                // Find all unique rep counts
                const repCounts = new Set<string>();
                getFilteredStrengthData().forEach((row: any) => {
                  const exData = findExData(row.logs);
                  if (exData && exData.repMaxes && typeof exData.repMaxes === 'object') {
                    Object.keys(exData.repMaxes).forEach(r => repCounts.add(r));
                  }
                });

                const sortedReps = Array.from(repCounts).sort((a, b) => Number(a) - Number(b));
                const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

                return sortedReps.map((reps, i) => (
                  <Area
                    key={reps}
                    name={`${reps} ${t('reps_label')}`}
                    type="natural"
                    dataKey={(row: any) => {
                      const exData = findExData(row.logs);
                      return (exData && exData.repMaxes && exData.repMaxes[reps]) || null;
                    }}
                    stroke={colors[i % colors.length]}
                    strokeWidth={2.5}
                    fill={`url(#colorStrength${(i % 5) + 1})`}
                    dot={{ r: 3, fill: colors[i % colors.length], strokeWidth: 1.5, stroke: '#fff' }}
                    connectNulls
                  />
                ));
              })()}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="my-10 border-t border-slate-100 dark:border-slate-800/50"></div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500">edit_note</span>
            {t('latest_exercise_sensations')}
          </h3>
        </div>
        <div className="space-y-4">
          {(() => {
            const allSensations = stats?.training?.sensations || [];

            // Filter by selected lift if it's not "Weekly Volume"
            const filtered = selectedAnalysisSubject === WEEKLY_VOLUME_KEY
              ? allSensations
              : allSensations.filter((s: any) => s.exercise.toLowerCase().includes(selectedAnalysisSubject.toLowerCase()));

            if (filtered.length === 0) {
              return <p className="text-center text-slate-400 text-sm py-4 italic">{t('no_sensations_for_lift')}</p>;
            }

            return filtered.map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{item.exercise}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">{item.date}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{item.note}"</p>
              </div>
            ));
          })()}
        </div>
      </div>

      <div className="mt-8 mb-12">
        <div className="flex flex-col gap-6">
          <TrainingProgramCard program={stats?.trainingPlan} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('personal_records')}</h3>
          </div>
          <div className="h-[400px] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide no-scrollbar">
              {(stats?.training?.allExercises || []).slice(0, visiblePRs).map((ex: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Target className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{ex.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{ex.pr}kg</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{ex.latestDate ? new Date(ex.latestDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '--'}</p>
                  </div>
                </div>
              ))}
              {(stats?.training?.allExercises || []).length > visiblePRs && (
                <button
                  onClick={() => setVisiblePRs(prev => prev + 4)}
                  className="w-full py-2.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors uppercase tracking-widest mt-2"
                >
                  {t('load_more_records')}
                </button>
              )}
              {(!stats?.training?.allExercises || stats.training.allExercises.length === 0) && (
                <p className="text-center text-slate-400 text-sm py-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  {t('no_records_found')}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('recent_workout_activity')}</h3>
          </div>
          <div className="h-[400px] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide no-scrollbar">
              {(stats?.training?.recentWorkouts || []).slice(0, visibleWorkouts).map((workout: any) => (
                <WorkoutLogItem
                  key={workout.id}
                  workout={workout}
                  isExpanded={expandedWorkoutId === workout.id}
                  onToggle={setExpandedWorkoutId}
                  onUpdate={onUpdateWorkoutLog}
                />
              ))}
              {(stats?.training?.recentWorkouts || []).length > visibleWorkouts && (
                <button
                  onClick={() => setVisibleWorkouts(prev => prev + 4)}
                  className="w-full py-2.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors uppercase tracking-widest mt-2"
                >
                  {t('load_more_activity')}
                </button>
              )}
              {(!stats?.training?.recentWorkouts || stats.training.recentWorkouts.length === 0) && (
                <p className="text-center text-slate-400 text-sm py-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  {t('no_recent_workouts')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default TrainingTab;
