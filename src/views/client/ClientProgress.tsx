import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api';
import { 
  ArrowLeft, 
  MessageSquare, 
  Edit, 
  Copy, 
  Key, 
  User, 
  Calendar, 
  Dumbbell, 
  Utensils, 
  BarChart3, 
  Brain,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
  Zap,
  Activity,
  Moon,
  Flame,
  Smile,
  Info,
  Camera,
  FileText,
  History,
  X,
  Plus,
  ShieldCheck,
  FileSpreadsheet,
  Image as ImageIcon,
  ChevronDown,
  Scale,
  PieChart,
  Download
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
  Area
} from 'recharts';
import CheckInHistory from '../CheckInHistory';
import CheckInReview from '../CheckInReview';

type Tab = 'Nutrition' | 'Training' | 'Planning' | 'Mindset' | 'Check-ins';

export default function ClientProgress() {
  const [activeTab, setActiveTab] = useState<Tab>('Nutrition');
  const [innerView, setInnerView] = useState<'info' | 'review'>('info');
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);
  const [selectedAnalysisSubject, setSelectedAnalysisSubject] = useState('Weekly Volume');
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [strengthWeekOffset, setStrengthWeekOffset] = useState(0);
  const [strengthRange, setStrengthRange] = useState('1W');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, profileData] = await Promise.all([
          fetchWithAuth('/client/profile-stats'),
          fetchWithAuth('/client/profile')
        ]);
        setStats(statsData);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching client progress data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const renderNutrition = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Weight', value: stats?.latestWeight || '--', unit: 'kg', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Goal', value: stats?.goal || '--', unit: '', icon: TrendingDown, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Body Fat', value: stats?.bodyFat || '--', unit: '%', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Adherence', value: `${stats?.adherenceRate || 0}%`, unit: '', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
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
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Weight Progress</h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {['3M', '6M', '1Y'].map(p => (
                <button key={p} className={`px-3 py-1 text-[10px] font-bold rounded-md ${p === '3M' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.weightHistory || []}>
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
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-white)', color: 'var(--tw-colors-slate-900)' }}
                  labelStyle={{ fontWeight: 700, marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Macro Adherence</h3>
          <div className="space-y-6">
            {[
              { label: 'PROTEIN', percent: stats?.macros?.protein || 0, color: 'bg-emerald-500' },
              { label: 'CARBS', percent: stats?.macros?.carbs || 0, color: 'bg-blue-400' },
              { label: 'FATS', percent: stats?.macros?.fats || 0, color: 'bg-amber-400' },
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
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Daily Caloric Avg</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{stats?.macros?.calories || 0} kcal</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTraining = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Weekly Volume', value: stats?.training?.weeklyVolume?.toLocaleString() || '0', unit: 'kg', icon: Dumbbell, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Avg. Session RPE', value: stats?.training?.avgRPE || '--', unit: '/ 10', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Workouts', value: stats?.training?.workoutCount || '0', unit: 'sessions', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Fatigue Level', value: stats?.training?.fatigue || '--', unit: '/ 10', icon: AlertTriangle, color: stats?.training?.fatigue > 7 ? 'text-red-500' : 'text-amber-500', bg: stats?.training?.fatigue > 7 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20' },
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
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Strength Progress Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Deep dive analytics for primary compound lifts</p>
          </div>
          <div className="flex items-center gap-3">
            {strengthRange === '1W' && (
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 items-center mr-2">
                <button onClick={() => setStrengthWeekOffset(prev => prev - 1)} className="px-2 py-1.5 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-all">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="px-3 py-1 flex flex-col items-center min-w-[120px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Semana</span>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                    {(() => {
                      const { monday, sunday } = getWeekRange(strengthWeekOffset);
                      return `${monday.toLocaleDateString([], { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString([], { day: 'numeric', month: 'short' })}`;
                    })()}
                  </span>
                </div>
                <button onClick={() => setStrengthWeekOffset(prev => prev + 1)} className="px-2 py-1.5 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-all">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select 
                value={strengthRange}
                onChange={(e) => setStrengthRange(e.target.value)}
                className="appearance-none text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 py-2 pl-9 pr-8 text-slate-600 dark:text-slate-300 outline-none"
              >
                <option value="1W">Last 7 Days</option>
                <option value="14D">Last 14 Days</option>
                <option value="30D">Last 30 Days</option>
                <option value="3M">Latest 90 Days</option>
                <option value="6M">Last 6 Months</option>
                <option value="YTD">Year to Date</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-nowrap overflow-x-auto gap-4 mb-8 pb-4 scrollbar-hide">
          {[
            { name: 'Weekly Volume', value: stats?.training?.weeklyVolume?.toLocaleString() || '0', unit: 'kg' },
            ...(stats?.training?.allExercises || []).map((ex: any) => ({
              name: ex.name,
              value: ex.pr || '--',
              unit: 'kg'
            }))
          ].map((ex, idx) => {
            const isSelected = ex.name === selectedAnalysisSubject;
            return (
              <div 
                key={idx} 
                onClick={() => setSelectedAnalysisSubject(ex.name)}
                className={`flex-shrink-0 cursor-pointer p-4 rounded-2xl border transition-all ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 truncate max-w-[120px]">{ex.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-bold ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{ex.value}</span>
                  <span className="text-[10px] font-bold text-slate-400">{ex.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getFilteredStrengthData()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-white)', color: 'var(--tw-colors-slate-900)' }}
              />
              {selectedAnalysisSubject === 'Weekly Volume' ? (
                <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
              ) : (
                Object.keys(getFilteredStrengthData()[0]?.logs?.[selectedAnalysisSubject]?.repMaxes || {}).map((repStr, ridx) => (
                  <Line 
                    key={repStr}
                    type="monotone" 
                    dataKey={(d) => d.logs?.[selectedAnalysisSubject]?.repMaxes?.[repStr] || null} 
                    name={`${repStr} reps`}
                    stroke={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][ridx % 5]} 
                    strokeWidth={3} 
                    dot={{r: 4, strokeWidth: 2, fill: '#fff'}} 
                    connectNulls
                  />
                ))
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderPlanning = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Current Roadmap</h3>
        <p className="text-sm text-slate-500 mb-6">Visualiza tu evolución a largo plazo y los próximos hitos.</p>
        <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-4">
           <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
             <Target className="w-8 h-8 opacity-20" />
           </div>
           <p className="text-sm font-medium">No roadmap data available yet.</p>
        </div>
      </div>
    </div>
  );

  const renderMindset = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8">Daily State Trends</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.mindset?.history || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <YAxis domain={[0, 10]} hide />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#3b82f6" strokeWidth={3} dot={false} connectNulls />
              <Line type="monotone" dataKey="energy" stroke="#fbbf24" strokeWidth={3} dot={false} connectNulls />
              <Line type="monotone" dataKey="motivation" stroke="#a78bfa" strokeWidth={3} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Latest Snapshot</h3>
        <div className="space-y-6">
          {[
            { label: 'Mood', value: stats?.mindset?.mood, color: 'bg-blue-500' },
            { label: 'Energy', value: stats?.mindset?.energy, color: 'bg-amber-400' },
            { label: 'Motivation', value: stats?.mindset?.motivation, color: 'bg-purple-500' },
            { label: 'Stress', value: stats?.mindset?.stress, color: 'bg-red-400' },
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{item.label}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{item.value}/10</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className={`${item.color} h-full`} style={{ width: `${(Number(item.value) || 0) * 10}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold tracking-tight">Cargando tus progresos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 w-full max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row items-center gap-6 mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-20 h-20 rounded-2xl bg-cover bg-center ring-4 ring-emerald-50 dark:ring-emerald-900/20" style={{ backgroundImage: profile?.avatar ? `url("${profile.avatar}")` : 'none' }}>
          {!profile?.avatar && (
            <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600 font-bold text-2xl uppercase">
              {profile?.email?.charAt(0) || 'C'}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Tu Progreso</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Evolución, métricas y análisis de rendimiento</p>
        </div>
      </header>

      <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
        {(['Nutrition', 'Training', 'Planning', 'Mindset', 'Check-ins'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setInnerView('info'); }}
            className={`pb-4 px-1 text-sm font-bold transition-all relative whitespace-nowrap ${
              activeTab === tab 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8 overflow-hidden">
        {activeTab === 'Nutrition' && renderNutrition()}
        {activeTab === 'Training' && renderTraining()}
        {activeTab === 'Planning' && renderPlanning()}
        {activeTab === 'Mindset' && renderMindset()}
        {activeTab === 'Check-ins' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px]">
            {innerView === 'review' && selectedCheckInId ? (
              <CheckInReview 
                clientId={profile?.id} 
                checkInId={selectedCheckInId} 
                onBack={() => setInnerView('info')} 
                readonly={true}
              />
            ) : (
              <CheckInHistory 
                clientId={profile?.id || ''} 
                onBack={() => {}} 
                hideHeader={true}
                onViewReview={(checkInId) => {
                  setSelectedCheckInId(checkInId);
                  setInnerView('review');
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
