import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';
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
  MoreVertical,
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
  Trash2,
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
  Area,
  Bar,
  Legend
} from 'recharts';
import { useClient } from '../context/ClientContext';
import CheckInHistory from './CheckInHistory';
import CheckInReview from './CheckInReview';

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
}

type Tab = 'Nutrition' | 'Training' | 'Planning' | 'Mindset' | 'Check-ins';

const weightData = [
  { date: 'Aug 1', weight: 78 },
  { date: 'Aug 15', weight: 76.5 },
  { date: 'Sep 1', weight: 75.2 },
  { date: 'Sep 15', weight: 74.1 },
  { date: 'Oct 1', weight: 72.8 },
  { date: 'Oct 15', weight: 71.5 },
  { date: 'Today', weight: 68.5 },
];

const strengthData = [
  { date: 'Aug 1', volume: 10000 },
  { date: 'Aug 15', volume: 11200 },
  { date: 'Sep 1', volume: 12500 },
  { date: 'Sep 15', volume: 13100 },
  { date: 'Oct 1', volume: 13800 },
  { date: 'Oct 15', volume: 14100 },
  { date: 'Today', volume: 14250 },
];

const mindsetData = [
  { date: 'Mon', mood: 7, stress: 6, motivation: 8, energy: 6 },
  { date: 'Tue', mood: 7.2, stress: 5.8, motivation: 8.1, energy: 6.2 },
  { date: 'Wed', mood: 7.5, stress: 5.5, motivation: 8.3, energy: 6.5 },
  { date: 'Thu', mood: 7.3, stress: 6.2, motivation: 8.2, energy: 6.1 },
  { date: 'Fri', mood: 7.6, stress: 5.9, motivation: 8.4, energy: 6.3 },
  { date: 'Sat', mood: 7.8, stress: 5.7, motivation: 8.5, energy: 6.4 },
  { date: 'Sun', mood: 7.8, stress: 6.2, motivation: 8.5, energy: 6.4 },
];

interface WorkoutLogItemProps {
  workout: any;
  isExpanded: boolean;
  onToggle: (id: string | null) => void;
  onUpdate: (id: string, data: any) => Promise<void>;
}

const WorkoutLogItem: React.FC<WorkoutLogItemProps> = ({ workout, isExpanded, onToggle, onUpdate }) => {
  const [exercises, setExercises] = useState(workout.exercises || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setExercises(workout.exercises || []);
  }, [workout.exercises]);

  const updateSet = (exIdx: number, sIdx: number, field: string, value: string) => {
    const newExs = [...exercises];
    const newSets = [...newExs[exIdx].sets_logged];
    newSets[sIdx] = { ...newSets[sIdx], [field]: value };
    newExs[exIdx] = { ...newExs[exIdx], sets_logged: newSets };
    setExercises(newExs);
  };

  const updateNotes = (exIdx: number, value: string) => {
    const newExs = [...exercises];
    newExs[exIdx] = { ...newExs[exIdx], notes: value };
    setExercises(newExs);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(workout.id, { exercises });
    setIsSaving(false);
    onToggle(null);
  };

  return (
    <div className="flex flex-col border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all text-left">
      <div 
        onClick={() => onToggle(isExpanded ? null : workout.id)}
        className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3 font-bold">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-slate-900 dark:text-white">{workout.name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{new Date(workout.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
             <p className="text-xs font-bold text-slate-900 dark:text-white">{workout.volume.toLocaleString()} kg</p>
             <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mt-0.5">RPE {workout.rpe}</p>
          </div>
          <ChevronRight className={`w-5 h-5 text-slate-300 transition-transform ${isExpanded ? 'rotate-90 text-emerald-500' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 space-y-8 animate-in slide-in-from-top-2 duration-200">
          {exercises.map((ex: any, exIdx: number) => (
            <div key={exIdx} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-700">drag_handle</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ex.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{ex.muscle_group || 'Target muscles'}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-emerald-500">edit_note</span>
                  Client Log
                </span>
              </div>

              <div className="pl-11 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-1">
                    <div>Set</div><div>Weight</div><div>Reps</div><div>RIR</div>
                  </div>
                  {ex.sets_logged?.map((s: any, sIdx: number) => (
                    <div key={sIdx} className="grid grid-cols-4 gap-2">
                      <div className="h-10 flex items-center justify-center text-xs font-bold text-slate-300">#{sIdx+1}</div>
                      <input 
                        className="h-10 text-center text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500" 
                        value={s.weight} 
                        onChange={(e) => updateSet(exIdx, sIdx, 'weight', e.target.value)} 
                      />
                      <input 
                        className="h-10 text-center text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500" 
                        value={s.reps} 
                        onChange={(e) => updateSet(exIdx, sIdx, 'reps', e.target.value)} 
                      />
                      <input 
                        className="h-10 text-center text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500" 
                        value={s.rir} 
                        onChange={(e) => updateSet(exIdx, sIdx, 'rir', e.target.value)} 
                      />
                    </div>
                  ))}
                  {(!ex.sets_logged || ex.sets_logged.length === 0) && (
                    <p className="text-center text-xs text-slate-400 italic py-2">No sets logged</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Notes & Sensations</label>
                  <textarea 
                    className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 min-h-[100px] text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed shadow-sm italic outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Notes..."
                    value={ex.notes || ""}
                    onChange={(e) => updateNotes(exIdx, e.target.value)}
                  />
                </div>
              </div>
              {exIdx < exercises.length - 1 && <hr className="border-slate-100 dark:border-slate-800/50 my-6" />}
            </div>
          ))}
          
          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${isSaving ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200 active:scale-95'}`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-[18px]">save</span>
              )}
              {isSaving ? 'Saving...' : 'Save Session Log'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ClientDetail({ clientId, onBack }: ClientDetailProps) {
  const { clients, deleteClient } = useClient();
  const [activeTab, setActiveTab] = useState<Tab>('Nutrition');
  const [innerView, setInnerView] = useState<'info' | 'review'>('info');
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);
  const [selectedAnalysisSubject, setSelectedAnalysisSubject] = useState('Weekly Volume');
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [strengthWeekOffset, setStrengthWeekOffset] = useState(0);

  // ─── Delete modal state ──────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await fetchWithAuth(`/manager/clients/${clientId}/profile-stats`);
        setStats(data);
      } catch (error) {
        console.error('Error fetching client stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [clientId]);

  useEffect(() => {
    if (stats?.training?.allExercises?.length > 0 && !hasAutoSelected) {
      setSelectedAnalysisSubject(stats.training.allExercises[0].name);
      setHasAutoSelected(true);
    }
  }, [stats, hasAutoSelected]);

  const handleConfirmDelete = async () => {
    if (!client || deleteConfirmText !== client.name) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteClient(String(clientId));
      onBack();
    } catch {
      setDeleteError('Failed to delete client. Please try again.');
      setIsDeleting(false);
    }
  };
  const handleUpdateWorkoutLog = async (logId: string, updatedData: any) => {
    try {
      await fetchWithAuth(`/manager/clients/${clientId}/workout-logs/${logId}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedData)
      });
      // Refresh stats to show updated volume/PRs
      const data = await fetchWithAuth(`/manager/clients/${clientId}/profile-stats`);
      setStats(data);
    } catch (error) {
      console.error('Error updating workout log:', error);
    }
  };
  // Find the exact client object, or fallback if something went wrong
  const client = clients.find(c => c.id === clientId as any) || {
    name: 'Unknown Client',
    avatar: '',
    weight: '--',
    goal: '--',
    age: '--',
    location: '--',
    gender: '--',
    progress: 0
  };

  const renderNutrition = () => (
    <div className="space-y-6">
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Cargando estadísticas...</p>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Weight', value: stats?.latestWeight || '--', unit: 'kg', change: '', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Loss goal', value: stats?.goal || 'TBD', unit: '', change: 'Target', icon: TrendingDown, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Body Fat', value: stats?.bodyFat || '--', unit: '%', change: '', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Active', value: stats?.activeDays || '0', unit: 'days', change: `${stats?.adherenceRate || 0}% rate`, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Weight Progress</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Goal: {stats?.goal || 'TBD'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Overlay Body Fat %</span>
                <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {['3M', '6M', '1Y'].map(p => (
                  <button key={p} className={`px-3 py-1 text-[10px] font-bold rounded-md ${p === '3M' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{p}</button>
                ))}
              </div>
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

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Macro Adherence</h3>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">Avg. 7 Days</span>
            </div>
            <div className="space-y-6">
              {[
                { label: 'PROTEIN', percent: stats?.macros?.protein || 90, color: 'bg-emerald-500' },
                { label: 'CARBS', percent: stats?.macros?.carbs || 85, color: 'bg-blue-400' },
                { label: 'FATS', percent: stats?.macros?.fats || 92, color: 'bg-amber-400' },
              ].map((macro, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{macro.label}</span>
                    </div>
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

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Allergies</h3>
              <button className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">EDIT</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {stats?.allergies?.map((allergy: string, idx: number) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[10px] font-bold border border-red-100 dark:border-red-800/50 uppercase">
                  <X className="w-3 h-3" /> {allergy}
                </span>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">DIETARY STYLE</p>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-800/50">Low Carb</span>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-800/50">High Protein</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );

  const [strengthRange, setStrengthRange] = useState('1W');

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
      const start = monday.toISOString().split('T')[0];
      const end = sunday.toISOString().split('T')[0];
      return stats.training.strengthHistory.filter((h: any) => h.date >= start && h.date <= end);
    }
    
    if (strengthRange === '3M') cutoff.setMonth(now.getMonth() - 3);
    else if (strengthRange === '6M') cutoff.setMonth(now.getMonth() - 6);
    else if (strengthRange === 'YTD') cutoff.setFullYear(now.getFullYear(), 0, 1);
    else return stats.training.strengthHistory;

    const todayStr = now.toISOString().split('T')[0];
    return stats.training.strengthHistory.filter((h: any) => new Date(h.date) >= cutoff && h.date <= todayStr);
  };

  const renderTraining = () => (
    <div className="space-y-6">
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-10 h-10 border-4 border-[#17cf54]/20 border-t-[#17cf54] rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Cargando entrenamiento...</p>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Weekly Volume', value: stats?.training?.weeklyVolume?.toLocaleString() || '0', unit: 'kg', change: '', icon: Dumbbell, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Avg. Session RPE', value: stats?.training?.avgRPE || '--', unit: '/ 10', change: 'Session Avg', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Workouts', value: stats?.training?.workoutCount || '0', unit: 'sessions', change: 'This Week', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Fatigue Level', value: stats?.training?.fatigue || '--', unit: '/ 10', change: stats?.training?.fatigue > 7 ? 'High' : 'Normal', icon: AlertTriangle, color: stats?.training?.fatigue > 7 ? 'text-red-500' : 'text-amber-500', bg: stats?.training?.fatigue > 7 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20' },
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Strength Progress Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Deep dive analytics for primary compound lifts</p>
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
                  <span className="text-[10px] uppercase font-bold text-slate-400">Semana</span>
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
              <select 
                value={strengthRange}
                onChange={(e) => setStrengthRange(e.target.value)}
                className="appearance-none text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 py-2 pl-9 pr-8 text-slate-600 dark:text-slate-300 hover:border-emerald-500/50 shadow-sm transition-all outline-none"
              >
                <option value="1W">Last 7 Days</option>
                <option value="3M">Latest 90 Days</option>
                <option value="6M">Last 6 Months</option>
                <option value="YTD">Year to Date</option>
                <option value="ALL">All History</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
            </div>
          </div>
        </div>

        <div className="flex flex-nowrap overflow-x-auto gap-4 mb-8 pb-4 scrollbar-hide no-scrollbar">
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
                className={`flex-shrink-0 w-48 p-5 rounded-2xl border transition-all cursor-pointer select-none group ${isSelected ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-900/10 shadow-md shadow-emerald-50' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isSelected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                    <Dumbbell className="w-4.5 h-4.5" />
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[8px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-lg uppercase">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Selected
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
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
                labelStyle={{ fontWeight: 700, marginBottom: '4px' }}
                labelFormatter={(label) => {
                  try {
                    return new Date(label).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
                  } catch { return label; }
                }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />
              
              {(() => {
                if (selectedAnalysisSubject === 'Weekly Volume') {
                  return (
                    <Area 
                      name="Weekly Volume" 
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
                  if (exData && typeof exData === 'object') {
                    Object.keys(exData).forEach(r => repCounts.add(r));
                  }
                });

                const sortedReps = Array.from(repCounts).sort((a, b) => Number(a) - Number(b));
                const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

                return sortedReps.map((reps, i) => (
                  <Area 
                    key={reps}
                    name={`${reps} Reps`}
                    type="natural" 
                    dataKey={(row: any) => {
                      const exData = findExData(row.logs);
                      return (exData && exData[reps]) || null;
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Records</h3>
            <button className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline uppercase tracking-wider">History</button>
          </div>
          <div className="space-y-4">
            {(stats?.training?.allExercises || []).slice(0, 3).map((ex: any, idx: number) => (
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
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Workout Activity</h3>
            <button className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline uppercase tracking-wider">View Log</button>
          </div>
          <div className="space-y-4">
            {stats?.training?.recentWorkouts?.map((workout: any) => (
              <WorkoutLogItem 
                key={workout.id}
                workout={workout}
                isExpanded={expandedWorkoutId === workout.id}
                onToggle={setExpandedWorkoutId}
                onUpdate={handleUpdateWorkoutLog}
              />
            ))}
            {(!stats?.training?.recentWorkouts || stats.training.recentWorkouts.length === 0) && (
              <p className="text-center text-slate-400 text-sm py-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 transition-all hover:border-slate-300">
                No recent workouts logged yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500">edit_note</span>
            Latest Exercise Sensations
          </h3>
        </div>
        <div className="space-y-4">
          {(() => {
            const allSensations = stats?.training?.sensations || [];
            
            // Filter by selected lift if it's not "Weekly Volume"
            const filtered = selectedAnalysisSubject === 'Weekly Volume' 
              ? allSensations 
              : allSensations.filter((s: any) => s.exercise.toLowerCase().includes(selectedAnalysisSubject.toLowerCase()));
            
            if (filtered.length === 0) {
              return <p className="text-center text-slate-400 text-sm py-4 italic">No specific sensations logged for this lift yet.</p>;
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
      </>
      )}
    </div>
  );

  const renderPlanning = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Projected Goal Date', value: 'Dec 15', sub: 'On Track', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Target Delta', value: '-4.5 kg', sub: '', icon: Target, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Current Mesocycle', value: '2/4', sub: '', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Success Probability', value: '88%', sub: 'High Confidence', icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-900">{stat.value}</span>
                  {stat.sub && <span className="text-[10px] font-bold text-emerald-500 ml-1">{stat.sub}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Adherence Snapshot (7-Day)</h3>
            <button className="text-xs font-bold text-emerald-600 hover:underline">Details</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Nutrition', value: '78%', change: '+2%', icon: Utensils, color: 'text-emerald-500' },
              { label: 'Training', value: '85%', change: '+5%', icon: Dumbbell, color: 'text-emerald-500' },
              { label: 'Avg Steps', value: '8.2k', sub: '/9k', change: '-4%', icon: Activity, color: 'text-red-500' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <stat.icon className="w-5 h-5 text-slate-400" />
                  <span className={`text-[10px] font-bold ${stat.color}`}>{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}<span className="text-sm text-slate-400 font-medium">{stat.sub}</span></p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900">Master Roadmap</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase">Plan: Live</span>
            </div>
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-slate-300 cursor-help" />
              <button className="text-xs font-bold text-emerald-600 hover:underline">Edit Plan</button>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Nutrition Focus</p>
              <div className="flex h-12 rounded-xl overflow-hidden border border-slate-100">
                <div className="w-1/3 bg-red-50 border-r border-slate-100 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-red-700">Deficit</span>
                  <span className="text-[8px] font-bold text-red-400 uppercase">Wk 1-4</span>
                </div>
                <div className="w-1/3 bg-blue-50 border-r border-slate-100 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-blue-700">Maintenance</span>
                  <span className="text-[8px] font-bold text-blue-400 uppercase">Wk 5-8</span>
                </div>
                <div className="w-1/3 bg-emerald-50 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-emerald-700">Surplus</span>
                  <span className="text-[8px] font-bold text-emerald-400 uppercase">Wk 9-12</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Training Block</p>
              <div className="flex h-12 rounded-xl overflow-hidden border border-slate-100">
                <div className="w-1/4 bg-purple-50 border-r border-slate-100 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-purple-700">Metabolic</span>
                  <span className="text-[8px] font-bold text-purple-400 uppercase">Wk 1-3</span>
                </div>
                <div className="w-[41.6%] bg-indigo-50 border-r border-slate-100 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-indigo-700">Strength Base</span>
                  <span className="text-[8px] font-bold text-indigo-400 uppercase">Wk 4-8</span>
                </div>
                <div className="w-[33.3%] bg-amber-50 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-amber-700">Hypertrophy</span>
                  <span className="text-[8px] font-bold text-amber-400 uppercase">Wk 9-12</span>
                </div>
              </div>
            </div>
            <div className="relative pt-4">
              <div className="h-0.5 bg-slate-100 w-full rounded-full"></div>
              <div className="absolute top-2 left-[25%] flex flex-col items-center -ml-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                <span className="text-[8px] font-bold text-emerald-600 mt-1 uppercase">Current</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wider">
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-md font-bold text-slate-900">Next 7 Days</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Action center</p>
            </div>
            <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Weekly Check-in', time: 'Tomorrow, 9:00 AM', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Progress Photos', time: 'Friday, EOD', icon: Camera, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-[10px] font-bold text-slate-400">{item.time}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors"><CheckCircle2 className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors"><MessageSquare className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-md font-bold text-slate-900">Risks & Deviations</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Auto-detected alerts</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600 rotate-90" />
                  <span className="text-xs font-bold text-slate-900">Weight Plateau</span>
                </div>
                <span className="text-[8px] font-bold text-white bg-amber-500 px-1.5 py-0.5 rounded uppercase">High</span>
              </div>
              <p className="text-[10px] font-medium text-slate-600 mb-4">No change in 7-day moving average.</p>
              <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-between px-3">
                Adjust Calories
                <Utensils className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-900">Sleep Down</span>
                </div>
                <span className="text-[8px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded uppercase">Med</span>
              </div>
              <p className="text-[10px] font-medium text-slate-600 mb-4">Avg 5.5h last 3 nights.</p>
              <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-between px-3">
                Send Check-in Message
                <MessageSquare className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMindset = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { label: 'MOOD', value: stats?.mindset?.mood || '--', status: stats?.mindset?.mood > 7 ? 'Good' : 'Avg', icon: Smile, color: 'text-blue-500', bg: 'bg-blue-50', dataKey: 'mood' },
          { label: 'STRESS', value: stats?.mindset?.stress || '--', status: stats?.mindset?.stress > 7 ? 'High' : 'Normal', icon: Flame, color: 'text-red-500', bg: 'bg-red-50', dataKey: 'stress' },
          { label: 'MOTIVATION', value: stats?.mindset?.motivation || '--', status: stats?.mindset?.motivation > 7 ? 'High' : 'Low', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50', dataKey: 'motivation' },
          { label: 'ENERGY', value: stats?.mindset?.energy || '--', status: stats?.mindset?.energy > 7 ? 'High' : 'Low', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50', dataKey: 'energy' },
          { label: 'SLEEP', value: stats?.mindset?.sleep || '7.2h', status: 'Avg', icon: Moon, color: 'text-emerald-500', bg: 'bg-emerald-50', dataKey: 'mood' },
          { label: 'BURNOUT RISK', value: stats?.mindset?.stress > 8 ? 'High' : 'Low', status: '', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', dataKey: 'stress' },
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
                  <Line type="monotone" dataKey={stat.dataKey} stroke={stat.color.replace('text-', '').replace('-500', '')} strokeWidth={2} dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Today's State</h3>
          <div className="space-y-6">
            {[
              { label: 'Mood', value: stats?.mindset?.mood, color: 'bg-blue-500' },
              { label: 'Stress', value: stats?.mindset?.stress, color: 'bg-red-400' },
              { label: 'Energy', value: stats?.mindset?.energy, color: 'bg-amber-400' },
              { label: 'Motivation', value: stats?.mindset?.motivation, color: 'bg-purple-500' },
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
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">CLIENT NOTE</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
              {stats?.activity?.find((a: any) => a.type === 'CHECK_IN' && a.sub)?.sub || "No client notes available for this period."}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Adherence Snapshot</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Nutrition</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{stats?.macros?.protein ? 'High' : (stats?.adherenceRate || 0) + '%'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Training</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{stats?.training?.workoutCount ? Math.round((stats.training.workoutCount / 5) * 100) + '%' : '0%'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Latest Measurements */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Latest Measurements</h3>
          <button className="text-emerald-600 text-xs font-bold hover:underline uppercase tracking-wider">View All</button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Metric</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4 text-right">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {[
                { metric: 'Waist', value: stats?.measurements?.waist ? `${stats.measurements.waist} cm` : '--', change: '0 cm', icon: '' },
                { metric: 'Hip', value: stats?.measurements?.hip ? `${stats.measurements.hip} cm` : '--', change: '0 cm', icon: '' },
                { metric: 'Thigh (R)', value: stats?.measurements?.thigh_r ? `${stats.measurements.thigh_r} cm` : '--', change: '0 cm', icon: '' },
                { metric: 'Arm (R)', value: stats?.measurements?.arm_r ? `${stats.measurements.arm_r} cm` : '--', change: '0 cm', icon: '' },
              ].map((row, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{row.metric}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{row.value}</td>
                  <td className="px-6 py-4 text-right text-emerald-600 font-bold">
                    <div className="flex justify-end items-center gap-1">
                      {row.change !== '0 cm' ? row.change : <span className="text-slate-400 font-medium">0 cm</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          <button className="text-emerald-600 text-xs font-bold hover:underline uppercase tracking-wider">History</button>
        </div>
        <div className="p-6 flex-1 overflow-auto">
          <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
            {stats?.activity?.map((act: any, idx: number) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] bg-white p-1">
                  <div className={`h-3 w-3 rounded-full ${act.type === 'CHECK_IN' ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-blue-400 ring-4 ring-blue-50'}`}></div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{act.title}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(act.time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-600">{act.sub}</p>
                </div>
              </div>
            ))}
            {(!stats?.activity || stats.activity.length === 0) && (
              <p className="text-center text-slate-400 text-sm py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Access & Security */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Account Access & Security</h3>
          <ShieldCheck className="w-5 h-5 text-slate-400" />
        </div>
        <div className="p-6 flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Grant App Access</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Allow client to log in</p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 bg-emerald-500">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Access expiration date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-600 focus:ring-emerald-500 focus:border-emerald-500 outline-none" type="date" defaultValue="2024-12-31" />
            </div>
          </div>
          <div className="mt-auto pt-6 border-t border-slate-100">
            <button
            onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(null); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-bold text-sm border border-transparent hover:border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Delete Client Permanently
          </button>
          </div>
        </div>
      </div>

      {/* Client Documents */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Client Documents</h3>
          <button className="text-emerald-600 text-xs font-bold hover:underline uppercase tracking-wider">Upload New</button>
        </div>
        <div className="p-6 flex-1 overflow-auto">
          <div className="flex flex-col gap-3">
            {stats?.documents?.map((doc: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-500/50 transition-colors group cursor-pointer">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-500`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{doc.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 truncate uppercase">{new Date(doc.date).toLocaleDateString()}</p>
                </div>
                <button className="text-slate-400 group-hover:text-emerald-500 transition-colors p-2 hover:bg-white rounded-lg">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-6 md:p-8 lg:p-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
            <button onClick={onBack} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
              Clients
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-white font-bold">{client.name}</span>
          </div>

          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-2xl bg-cover bg-center ring-4 ring-emerald-50 dark:ring-emerald-900/20 shadow-sm" style={{ backgroundImage: `url("${client.avatar}")` }}></div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{client.name}</h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                    Active
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 font-medium">
                  {client.gender || 'Unknown'}, {client.age || '--'} years • {client.location || 'Unknown'}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Hypertrophy Plan</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Joined Aug 2023</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full lg:w-auto gap-4">
              <div className="flex items-center gap-3">
                <button className="flex-1 lg:flex-none justify-center flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm text-sm font-bold">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
                <button className="flex-1 lg:flex-none justify-center flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-sm font-bold">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <div 
                  onClick={() => client.email && navigator.clipboard.writeText(client.email)}
                  className="flex-1 flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 group cursor-pointer hover:border-slate-200 dark:hover:border-slate-600 transition-all"
                  title="Copy Email"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{client.email || 'No email'}</span>
                  </div>
                  <Copy className="w-3 h-3 text-slate-300 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
                <div 
                  onClick={() => client.tempPassword && navigator.clipboard.writeText(client.tempPassword)}
                  className={`flex-1 flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 transition-all ${client.tempPassword ? 'group cursor-pointer hover:border-slate-200 dark:hover:border-slate-600' : 'opacity-70 cursor-not-allowed'}`}
                  title={client.tempPassword ? "Copy Password" : "Password not available. Reset from settings."}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Key className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">
                      {client.tempPassword || '••••••••'}
                    </span>
                  </div>
                  {client.tempPassword && (
                    <Copy className="w-3 h-3 text-slate-300 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto scrollbar-hide">
            {(['Nutrition', 'Training', 'Planning', 'Mindset', 'Check-ins'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 text-sm font-bold transition-all relative ${
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

          {activeTab === 'Nutrition' && renderNutrition()}
          {activeTab === 'Training' && renderTraining()}
          {activeTab === 'Planning' && renderPlanning()}
          {activeTab === 'Mindset' && renderMindset()}
          {activeTab === 'Check-ins' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px]">
              {innerView === 'review' && selectedCheckInId ? (
                <CheckInReview 
                  clientId={clientId} 
                  checkInId={selectedCheckInId} 
                  onBack={() => setInnerView('info')} 
                />
              ) : (
                <CheckInHistory 
                  clientId={clientId} 
                  onBack={() => onBack()} 
                  hideHeader={true}
                  onViewReview={(checkInId) => {
                    setSelectedCheckInId(checkInId);
                    setInnerView('review');
                  }}
                />
              )}
            </div>
          )}

          {/* Global Insights Section */}
          {renderInsights()}
        </div>
      </div>
    </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delete Client</h2>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
                <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">⚠ This action cannot be undone</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  All data for <span className="font-bold">{client.name}</span> — including plans, sessions, and check-ins — will be permanently erased.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">
                  Type <span className="text-red-600">{client.name}</span> to confirm
                </label>
                <input
                  autoFocus
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && deleteConfirmText === client.name) handleConfirmDelete(); }}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder={client.name}
                />
                {deleteError && (
                  <p className="text-xs text-red-500 font-medium mt-1.5">{deleteError}</p>
                )}
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmText !== client.name || isDeleting}
                  className="flex-1 py-2.5 font-bold bg-red-600 text-white rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> Delete permanently</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
