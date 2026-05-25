import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api';
import { 
  MessageSquare, 
  Edit, 
  User, 
  Calendar, 
  Dumbbell, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Zap, 
  Activity, 
  Moon, 
  Flame, 
  Smile, 
  Info, 
  FileText, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  Clock,
  Scale,
  Plus,
  Utensils,
  BarChart3,
  Camera
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import CheckInHistory from '../CheckInHistory';
import CheckInReview from '../CheckInReview';
import Select from '../../components/ui/Select';
import WorkoutLogItem from './progress/WorkoutLogItem';
import EditProfileModal from './EditProfileModal';
import { Skeleton, SkeletonBlock, SkeletonCircle, SkeletonText } from '../../components/ui/Skeleton';

type Tab = 'Nutrition' | 'Training' | 'Planning' | 'Mindset' | 'Check-ins';

// Identificador estable de la opción "volumen semanal" del gráfico de fuerza.
// NO usar el texto traducido como clave: al cambiar de idioma dejaría de
// coincidir y el gráfico se rompería.
const WEEKLY_VOLUME_KEY = '__weekly_volume__';

// Maps Tailwind text-color classes to valid hex values for SVG/recharts strokes
const STROKE_COLOR_MAP: Record<string, string> = {
  'text-amber-500': '#f59e0b',
  'text-purple-500': '#8b5cf6',
  'text-blue-500': '#3b82f6',
  'text-red-500': '#ef4444',
  'text-green-500': '#22c55e',
  'text-emerald-500': '#10b981',
};

export default function ClientProgress() {
  const { t, language } = useLanguage();
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  const { user } = useAuth();
  // Tooltip de recharts adaptado al tema (antes estaba fijo a blanco y se veía
  // ilegible en modo oscuro). `isDark` se reevalúa cuando se hace toggle del
  // tema gracias al MutationObserver de abajo, en vez de quedar fijado al
  // valor que tenía la primera vez que se montó el componente.
  const [isDark, setIsDark] = useState<boolean>(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const obs = new MutationObserver(() => setIsDark(root.classList.contains('dark')));
    obs.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  const chartTooltipStyle = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#0f172a',
  };
  const [activeTab, setActiveTab] = useState<Tab>('Nutrition');
  const [innerView, setInnerView] = useState<'info' | 'review'>('info');
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);
  const [selectedAnalysisSubject, setSelectedAnalysisSubject] = useState(WEEKLY_VOLUME_KEY);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [strengthWeekOffset, setStrengthWeekOffset] = useState(0);
  const [visiblePRs, setVisiblePRs] = useState(4);
  const [visibleWorkouts, setVisibleWorkouts] = useState(4);
  const [strengthRange, setStrengthRange] = useState('1W');
  const [weightRange, setWeightRange] = useState<'3M' | '6M' | '1Y'>('3M');

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Perfil editable del cliente + estado del modal de edición.
  const [profile, setProfile] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', gender: '', age: '', goal: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      const p = await fetchWithAuth('/client/profile');
      setProfile(p);
      return p;
    } catch { return null; }
  };

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        const data = await fetchWithAuth('/client/profile-stats');
        if (mounted) setStats(data);
      } catch (error) {
        console.error('Error fetching client stats:', error);
        if (mounted) setLoadError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchStats();
    loadProfile();
    return () => { mounted = false; };
  }, []);

  const openEditModal = () => {
    setEditForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      gender: profile?.gender || '',
      age: profile?.age != null ? String(profile.age) : '',
      goal: profile?.goal || stats?.goal || '',
    });
    setEditError(null);
    setShowEdit(true);
  };

  const saveEditProfile = async () => {
    setEditSaving(true);
    setEditError(null);
    try {
      await fetchWithAuth('/client/profile', {
        method: 'PATCH',
        body: JSON.stringify(editForm),
      });
      await loadProfile();
      setShowEdit(false);
    } catch (e: any) {
      setEditError(e?.message || t('error', { defaultValue: 'Error' }));
    } finally {
      setEditSaving(false);
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || t('my_progress');

  useEffect(() => {
    if (stats?.training?.allExercises?.length > 0 && !hasAutoSelected) {
      setSelectedAnalysisSubject(stats.training.allExercises[0].name);
      setHasAutoSelected(true);
    }
  }, [stats, hasAutoSelected]);

  const handleUpdateWorkoutLog = async (logId: string, updatedData: any) => {
    try {
      await fetchWithAuth(`/client/workout-logs/${logId}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedData)
      });
      const data = await fetchWithAuth('/client/profile-stats');
      setStats(data);
    } catch (error) {
      console.error('Error updating workout log:', error);
    }
  };

  const getWeekRange = (offset: number) => {
    const now = new Date();
    const todayIdx = now.getDay();
    const isoToday = todayIdx === 0 ? 7 : todayIdx;
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
      const { monday } = getWeekRange(strengthWeekOffset);
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

  const getFilteredWeightData = () => {
    const history = stats?.weightHistory || [];
    if (history.length === 0) return [];
    const now = new Date();
    const cutoff = new Date();
    if (weightRange === '3M') cutoff.setMonth(now.getMonth() - 3);
    else if (weightRange === '6M') cutoff.setMonth(now.getMonth() - 6);
    else if (weightRange === '1Y') cutoff.setFullYear(now.getFullYear() - 1);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return history.filter((h: any) => {
      if (!h.date) return true;
      const d = String(h.date).split('T')[0];
      return d >= cutoffStr;
    });
  };

  const renderNutrition = () => (
    <div className="space-y-6">
      {isLoading ? (
        // Skeleton equivalent to the real layout: 4 compact stat cards on top,
        // a tall weight-progress chart and a side column with macro adherence.
        <div className="space-y-6" aria-hidden="true">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <SkeletonCircle size={40} />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <Skeleton className="h-5 w-48" />
              <SkeletonBlock height={260} />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
              <Skeleton className="h-5 w-40" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('weight'), value: stats?.latestWeight || '--', unit: 'kg', change: '', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('goal', { defaultValue: 'Objetivo' }), value: stats?.goal || t('tbd'), unit: '', change: t('target'), icon: TrendingDown, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('body_fat'), value: stats?.bodyFat || '--', unit: '%', change: '', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('active'), value: stats?.activeDays || '0', unit: t('days'), change: `${stats?.adherenceRate || 0}% ${t('rate')}`, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('weight_progress')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{t('goal')}: {stats?.goal || t('tbd')}</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {(['3M', '6M', '1Y'] as const).map(p => (
                <button key={p} onClick={() => setWeightRange(p)} className={`px-3 py-1 text-[10px] font-bold rounded-md ${p === weightRange ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getFilteredWeightData()}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={chartTooltipStyle}
                  labelStyle={{ fontWeight: 700, marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('macro_adherence')}</h3>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">{t('avg_7_days')}</span>
            </div>
            <div className="space-y-6">
              {[
                { label: t('protein'), percent: stats?.macros?.protein || 0, color: 'bg-emerald-500' },
                { label: t('carbs'), percent: stats?.macros?.carbs || 0, color: 'bg-blue-400' },
                { label: t('fats'), percent: stats?.macros?.fats || 0, color: 'bg-amber-400' },
              ].map((macro, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{macro.label}</span>
                    <span className="text-xs font-bold text-emerald-500">{macro.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className={`${macro.color} h-2 rounded-full`} style={{ width: `${macro.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('daily_caloric_avg')}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{stats?.macros?.calories || 0} kcal</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('allergies')}</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {stats?.allergies?.map((allergy: string, idx: number) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[10px] font-bold border border-red-100 dark:border-red-800/50 uppercase">
                  {allergy}
                </span>
              ))}
              {(!stats?.allergies || stats.allergies.length === 0) && <p className="text-xs text-slate-400 italic">{t('no_allergies_listed')}</p>}
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );

  const renderTraining = () => (
    <div className="space-y-6">
      {isLoading ? (
        // Skeleton layout mirroring the real training view: 4 stat cards,
        // strength-analysis chart, then two tables (PRs / recent workouts)
        // with 4-5 placeholder rows each.
        <div className="space-y-6" aria-hidden="true">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <SkeletonCircle size={40} />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
            <Skeleton className="h-5 w-56" />
            <div className="flex gap-4 overflow-x-auto">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-48 rounded-2xl shrink-0" />
              ))}
            </div>
            <SkeletonBlock height={260} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, col) => (
              <div key={col} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                <Skeleton className="h-5 w-44" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 flex-1">
                      <SkeletonCircle size={32} className="rounded-lg" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('weekly_volume'), value: stats?.training?.weeklyVolume?.toLocaleString() || '0', unit: 'kg', change: '', icon: Dumbbell, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('avg_session_rpe'), value: stats?.training?.avgRPE || '--', unit: '/ 10', change: t('session_avg'), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('workouts'), value: stats?.training?.workoutCount || '0', unit: t('sessions'), change: t('this_week'), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
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
                  <span className="text-[10px] uppercase font-bold text-slate-400">{t('week')}</span>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {(() => {
                      const { monday, sunday } = getWeekRange(strengthWeekOffset);
                      return `${monday.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}`;
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
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Select
                value={strengthRange}
                onChange={(val) => setStrengthRange(val)}
                className="text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-slate-600 dark:text-slate-300 outline-none shadow-sm transition-all"
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

        <div className="flex flex-nowrap overflow-x-auto gap-4 mb-8 pb-4 no-scrollbar">
          {[
            { id: WEEKLY_VOLUME_KEY, name: t('weekly_volume'), value: stats?.training?.weeklyVolume?.toLocaleString() || '0', unit: 'kg' },
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
                className={`flex-shrink-0 w-48 p-5 rounded-2xl border transition-all cursor-pointer select-none group ${isSelected ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-900/10 shadow-md shadow-emerald-50' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isSelected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
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

        {/* Cache the filtered slice ONCE per render — was being recomputed
            twice (here and inside the IIFE below) on every state change. */}
        {(() => {
          const strengthData = getFilteredStrengthData();
          return (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={strengthData}>
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
                  try { return new Date(date).toLocaleDateString(locale, { month: 'short', day: 'numeric' }); } catch { return date; }
                }}
              />
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip 
                contentStyle={chartTooltipStyle}
                labelStyle={{ fontWeight: 700, marginBottom: '4px' }}
                labelFormatter={(label) => {
                  try { return new Date(label).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return label; }
                }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />
              
              {(() => {
                if (selectedAnalysisSubject === WEEKLY_VOLUME_KEY) {
                  return (
                    <Area name={t('weekly_volume')} type="natural" dataKey="volume" stroke="#10b981" strokeWidth={3} fill="url(#colorStrength1)" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} connectNulls />
                  );
                }
                const findExData = (logs: any) => {
                  if (!logs) return null;
                  const key = Object.keys(logs).find(k => k.toLowerCase() === selectedAnalysisSubject.toLowerCase());
                  return key ? logs[key] : null;
                };
                const repCounts = new Set<string>();
                strengthData.forEach((row: any) => {
                  const exData = findExData(row.logs);
                  if (exData && exData.repMaxes) Object.keys(exData.repMaxes).forEach(r => repCounts.add(r));
                });
                const sortedReps = Array.from(repCounts).sort((a, b) => Number(a) - Number(b));
                const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
                return sortedReps.map((reps, i) => (
                  <Area key={reps} name={t('reps_count', { count: reps })} type="natural" dataKey={(row: any) => {
                    const exData = findExData(row.logs);
                    return (exData && exData.repMaxes && exData.repMaxes[reps]) || null;
                  }} stroke={colors[i % colors.length]} strokeWidth={2.5} fill={`url(#colorStrength${(i % 5) + 1})`} dot={{ r: 3, fill: colors[i % colors.length], strokeWidth: 1.5, stroke: '#fff' }} connectNulls />
                ));
              })()}
            </AreaChart>
          </ResponsiveContainer>
        </div>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('personal_records')}</h3>
          </div>
          <div className="h-[400px] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
              {(stats?.training?.allExercises || []).slice(0, visiblePRs).map((ex: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                      <Target className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{ex.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{ex.pr}kg</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{ex.latestDate ? new Date(ex.latestDate).toLocaleDateString(locale, { month: 'short', day: 'numeric' }) : '--'}</p>
                  </div>
                </div>
              ))}
              {(stats?.training?.allExercises || []).length > visiblePRs && (
                <button onClick={() => setVisiblePRs(prev => prev + 4)} className="w-full py-2.5 text-[10px] font-bold text-emerald-600 border border-emerald-100 dark:border-emerald-800/50 rounded-xl hover:bg-emerald-50 transition-colors uppercase tracking-widest mt-2">{t('load_more_records')}</button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('recent_workout_activity')}</h3>
          </div>
          <div className="h-[400px] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
              {(stats?.recentWorkouts || []).slice(0, visibleWorkouts).map((workout: any) => (
                <WorkoutLogItem key={workout.id} workout={workout} isExpanded={expandedWorkoutId === workout.id} onToggle={setExpandedWorkoutId} onUpdate={handleUpdateWorkoutLog} />
              ))}
              {(stats?.recentWorkouts || []).length > visibleWorkouts && (
                <button onClick={() => setVisibleWorkouts(prev => prev + 4)} className="w-full py-2.5 text-[10px] font-bold text-emerald-600 border border-emerald-100 dark:border-emerald-800/50 rounded-xl hover:bg-emerald-50 transition-colors uppercase tracking-widest mt-2">{t('load_more_activity')}</button>
              )}
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );

  const renderPlanning = () => {
    // Align with the actual `/client/profile-stats` shape — the previous
    // version read `stats.weight.goal`, `stats.adherence.training`, etc.
    // None of those exist in the response, so the Planning tab was always
    // empty. See server/routes/client.ts for the real fields.
    const goal = stats?.goalWeight ?? null;
    const current = stats?.latestWeight ?? null;
    const start = stats?.startWeight ?? null;
    const targetDelta = (goal != null && current != null) ? (Number(goal) - Number(current)) : null;
    // The server returns a single overall `adherenceRate` plus `macros` (calorie/
    // macro adherence %s) and `training.workoutCount`. Use those as the closest
    // approximations until a richer split is exposed.
    const nutritionAdh = stats?.macros?.calories ?? stats?.adherenceRate ?? null;
    const trainingAdh = stats?.training?.workoutCount != null
      ? Math.min(100, Math.round((Number(stats.training.workoutCount) / 4) * 100))
      : stats?.adherenceRate ?? null;
    // Step tracking isn't wired yet — keep the slot but never claim a value.
    const avgSteps = null;
    const hasPlanningData = goal != null || current != null || start != null || nutritionAdh != null || trainingAdh != null;

    if (!hasPlanningData) {
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Target className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('planning_no_data_title', { defaultValue: 'No planning data yet' })}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">{t('planning_no_data_desc', { defaultValue: 'Your coach will set goals and a roadmap. Complete your check-ins so progress can be tracked here.' })}</p>
        </div>
      );
    }

    const adherenceCards = [
      { label: t('nutrition'), value: nutritionAdh != null ? `${Math.round(Number(nutritionAdh))}%` : '--', icon: Utensils },
      { label: t('training'), value: trainingAdh != null ? `${Math.round(Number(trainingAdh))}%` : '--', icon: Dumbbell },
      { label: t('planning_avg_steps'), value: avgSteps != null ? `${(Number(avgSteps) / 1000).toFixed(1)}k` : '--', icon: Activity },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: t('planning_target_delta'), value: targetDelta != null ? `${targetDelta > 0 ? '+' : ''}${targetDelta.toFixed(1)} kg` : '--', icon: Target, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
            { label: t('current_weight', { defaultValue: 'Current weight' }), value: current != null ? `${Number(current).toFixed(1)} kg` : '--', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
            { label: t('goal', { defaultValue: 'Goal' }), value: goal != null ? `${Number(goal).toFixed(1)} kg` : '--', icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
          ].map((stat: any, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('adherence_snapshot_7d')}</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {adherenceCards.map((stat, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <stat.icon className="w-5 h-5 text-slate-400 mb-4" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMindset = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { label: t('mood_upper'), value: stats?.mindset?.mood || '--', status: stats?.mindset?.mood > 7 ? t('good') : t('avg'), icon: Smile, color: 'text-blue-500', bg: 'bg-blue-50', dataKey: 'mood' },
          { label: t('stress_upper'), value: stats?.mindset?.stress || '--', status: stats?.mindset?.stress > 7 ? t('high') : t('normal'), icon: Flame, color: 'text-red-500', bg: 'bg-red-50', dataKey: 'stress' },
          { label: t('motivation_upper'), value: stats?.mindset?.motivation || '--', status: stats?.mindset?.motivation > 7 ? t('high') : t('low'), icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50', dataKey: 'motivation' },
          { label: t('energy_upper'), value: stats?.mindset?.energy || '--', status: stats?.mindset?.energy > 7 ? t('high') : t('low'), icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50', dataKey: 'energy' },
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
                  <Line type="monotone" dataKey={stat.dataKey} stroke={STROKE_COLOR_MAP[stat.color] || '#10b981'} strokeWidth={2} dot={false} connectNulls />
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
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('recent_activity')}</h3>
        </div>
        <div className="p-6 flex-1 overflow-auto">
          <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-8">
            {stats?.activity?.map((act: any, idx: number) => {
              // Server now sends canonical `type` + raw values. Translate
              // the labels here so they follow the active app language.
              const title = act.type === 'CHECK_IN'
                ? t('activity_checkin_title', { defaultValue: 'Check-in' })
                : t('activity_message_title', { defaultValue: 'Mensaje recibido' });
              const sub = act.type === 'CHECK_IN'
                ? (act.weight != null
                    ? t('activity_checkin_weight', { weight: act.weight, defaultValue: `Peso registrado (${act.weight} kg)` })
                    : t('activity_checkin_submitted', { defaultValue: 'Check-in enviado' }))
                : (act.preview || act.sub || '');
              return (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] bg-white dark:bg-slate-900 p-1">
                    <div className={`h-3 w-3 rounded-full ${act.type === 'CHECK_IN' ? 'bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-900/30' : 'bg-blue-400 ring-4 ring-blue-50 dark:ring-blue-900/30'}`}></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{title}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(act.time).toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{sub}</p>
                  </div>
                </div>
              );
            })}
            {(!stats?.activity || stats.activity.length === 0) && (
              <p className="text-center text-slate-400 text-sm py-4">{t('no_recent_activity')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 md:p-8 lg:p-10">
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl ring-4 ring-emerald-50 dark:ring-emerald-900/20 shadow-sm bg-emerald-500/10 flex items-center justify-center text-3xl font-bold text-emerald-600 dark:text-emerald-400 uppercase">{(displayName || user?.email || 'C').charAt(0)}</div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{displayName}</h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200">{t('active')}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 font-medium capitalize">
                  {stats?.goal || t('in_progress')} {t('plan')}
                </p>
                <div className="flex gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('active_training')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={openEditModal}
                  className="flex-1 lg:flex-none justify-center flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-sm font-bold"
                >
                  <Edit className="w-4 h-4" />
                  {t('edit_profile')}
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{user?.email}</span>
              </div>
            </div>
          </header>

          <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto no-scrollbar">
            {(['Nutrition', 'Training', 'Planning', 'Mindset', 'Check-ins'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 text-sm font-bold transition-all relative ${
                  activeTab === tab 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                }`}
              >
                {tab === 'Nutrition' ? t('nutrition') : tab === 'Training' ? t('training') : tab === 'Planning' ? t('planning') : tab === 'Mindset' ? t('mindset') : t('checkins')}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'Nutrition' && renderNutrition()}
          {activeTab === 'Training' && renderTraining()}
          {activeTab === 'Planning' && renderPlanning()}
          {activeTab === 'Mindset' && renderMindset()}
          {activeTab === 'Check-ins' && (
            // CheckInHistory drops its own padding when hideHeader=true (so a
            // parent can fully control the chrome). Apply it here so the
            // cards aren't flush against the white card's edges.
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px] p-6 md:p-8">
              {innerView === 'review' && selectedCheckInId ? (
                <CheckInReview 
                  clientId={user?.id || ''} 
                  checkInId={selectedCheckInId} 
                  isClient={true}
                  readonly={true}
                  onBack={() => setInnerView('info')} 
                />
              ) : (
                <CheckInHistory 
                  clientId={user?.id || ''} 
                  isClient={true}
                  hideHeader={true}
                  onViewReview={(checkInId) => {
                    setSelectedCheckInId(checkInId);
                    setInnerView('review');
                  }}
                  onBack={() => {}}
                />
              )}
            </div>
          )}

          {renderInsights()}
        </div>
      </div>

      {/* Aviso de error de carga: antes el fallo de /profile-stats era
          silencioso y el cliente veía '--' por todas partes como si no
          tuviera datos. */}
      {loadError && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg">
          {t('error_loading_data', { defaultValue: 'No se pudieron cargar tus datos. Comprueba tu conexión.' })}
        </div>
      )}

      <EditProfileModal
        show={showEdit}
        form={editForm}
        setForm={setEditForm}
        isSaving={editSaving}
        error={editError}
        onClose={() => setShowEdit(false)}
        onSave={saveEditProfile}
        t={t}
      />
    </div>
  );
}
