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
  FileImage,
  FileVideo,
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
import CheckInReviewRenderer from '../components/checkin/CheckInReviewRenderer';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const primaryExercises = [
  'Bench Press', 'Squat', 'Deadlift', 'Military Press', 'Barbell Row',
  'Sentadilla', 'Peso Muerto', 'Press Banca', 'Press Militar', 'Remo con Barra',
  'Buenos Días', 'Romanian Deadlift', '90-90 Hip Switch', 'Adductor Rock-Back'
];

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
}

type Tab = 'Information' | 'Nutrition' | 'Training' | 'Planning' | 'Mindset';

interface WorkoutLogItemProps {
  workout: any;
  isExpanded: boolean;
  onToggle: (id: string | null) => void;
  onUpdate: (id: string, data: any) => Promise<void>;
}

const WorkoutLogItem: React.FC<WorkoutLogItemProps> = ({ workout, isExpanded, onToggle, onUpdate }) => {
  const { t } = useLanguage();
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{ex.muscle_group || t('target_muscles')}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-emerald-500">edit_note</span>
                  {t('client_log')}
                </span>
              </div>

              <div className="pl-11 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-1">
                    <div>{t('set_label')}</div><div>{t('weight')}</div><div>{t('reps_label')}</div><div>{t('rir_label')}</div>
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
                    <p className="text-center text-xs text-slate-400 italic py-2">{t('no_sets_logged')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">{t('notes_sensations')}</label>
                  <textarea 
                    className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 min-h-[100px] text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed shadow-sm italic outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder={t('notes_placeholder')}
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
              {isSaving ? t('saving') : t('save_session_log')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const NutritionPlanCard = ({ plan }: { plan: any }) => {
  const { t } = useLanguage();
  // Hooks must run unconditionally — declared before any early return.
  const [selectedDay, setSelectedDay] = useState('monday');

  if (!plan) return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
      <Utensils className="w-10 h-10 mx-auto mb-3 opacity-20" />
      <p className="text-sm font-bold uppercase tracking-widest text-slate-500">{t('no_nutrition_plan_assigned')}</p>
    </div>
  );

  const data = plan.data_json || {};
  const isWeekly = data.type === 'weekly';

  const currentDayData = isWeekly ? (data.days?.[selectedDay] || {}) : data;
  const meals = currentDayData.meals || [];

  let totalP = 0, totalC = 0, totalF = 0, totalKcal = 0;
  meals.forEach((m: any) => {
    (m.items || []).forEach((i: any) => {
      const qty = i.quantity || 1;
      totalKcal += (i.calories || 0) * qty;
      totalP += (i.protein || 0) * qty;
      totalC += (i.carbs || 0) * qty;
      totalF += (i.fats || 0) * qty;
    });
  });

  if (totalKcal === 0 && (totalP > 0 || totalC > 0 || totalF > 0)) {
    totalKcal = (totalP * 4) + (totalC * 4) + (totalF * 9);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{t('current_nutritional_plan')}</h3>
            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{plan.name || t('personalized_plan')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">{t('active')}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: t('calories'), value: Math.round(totalKcal), unit: 'kcal', color: 'text-orange-500' },
            { label: t('protein'), value: Math.round(totalP), unit: 'g', color: 'text-blue-500' },
            { label: t('carbs'), value: Math.round(totalC), unit: 'g', color: 'text-emerald-500' },
            { label: t('fats'), value: Math.round(totalF), unit: 'g', color: 'text-amber-500' },
          ].map((macro, i) => (
            <div key={i} className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{macro.label}</p>
              <div className="flex flex-col">
                <span className={`text-lg font-black tracking-tighter ${macro.color}`}>{macro.value}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">{macro.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {isWeekly && (
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all flex-1 min-w-[50px] ${
                  selectedDay === d 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-100 dark:border-slate-700'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {meals.map((meal: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 group hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <span className="material-symbols-outlined text-lg">{meal.iconName === 'Sunrise' ? 'wb_twilight' : meal.iconName === 'Sun' ? 'sunny' : meal.iconName === 'Moon' ? 'dark_mode' : 'restaurant'}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{meal.name}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{meal.time || '--:--'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-900 dark:text-white">{(meal.categories || []).map((c: any) => `${c.amount}g ${c.label.slice(0,1)}`).join(' / ')}</p>
              </div>
            </div>
          ))}
          {meals.length === 0 && (
            <p className="text-center text-[10px] text-slate-400 italic py-2 uppercase tracking-widest">{t('no_meals_defined_day')}</p>
          )}
        </div>
      </div>
      <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-center">
        <button className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline flex items-center gap-1.5">
          <ImageIcon className="w-3 h-3" /> {t('view_photo_plan')}
        </button>
      </div>
    </div>
  );
};

const TrainingProgramCard = ({ program }: { program: any }) => {
  const { t } = useLanguage();
  // Hooks must run unconditionally — declared before any early return.
  const [selectedDay, setSelectedDay] = useState('monday');

  if (!program) return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
      <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-20" />
      <p className="text-sm font-bold uppercase tracking-widest text-slate-500">{t('no_training_program_assigned')}</p>
    </div>
  );

  const data = program.data_json || {};
  const isWeekly = !!data.weeklySchedule;

  let blocks = [];
  let workoutName = '';

  if (isWeekly) {
    const workoutId = data.weeklySchedule?.[selectedDay];
    const workout = (data.workouts || []).find((w: any) => w.id === workoutId);
    blocks = workout?.blocks || [];
    workoutName = workout?.name || t('rest_day_label');
  } else {
    blocks = data.blocks || [];
    workoutName = program.name || t('training_session');
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{t('active_training_program')}</h3>
            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{program.name || t('custom_routine')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">{t('live_label')}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isWeekly && (
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all flex-1 min-w-[50px] ${
                  selectedDay === d 
                    ? 'bg-emerald-500 text-white shadow-sm border-emerald-500' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-100 dark:border-slate-700'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{workoutName}</p>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{blocks.length} Blocks</p>
        </div>

        <div className="space-y-4">
          {blocks.length === 0 ? (
            <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
              <span className="material-symbols-outlined text-slate-200 dark:text-slate-700 text-3xl mb-2">self_improvement</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('rest_recovery_day')}</p>
            </div>
          ) : (
            blocks.slice(0, 3).map((block: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 group hover:border-emerald-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-blue-500">{block.icon || 'fitness_center'}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{block.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{block.exercises?.length || 0} Exercises</span>
                </div>
                <div className="flex flex-wrap gap-1.5 ml-7">
                  {(block.exercises || []).slice(0, 4).map((ex: any, exIdx: number) => (
                    <span key={exIdx} className="text-[8px] font-bold text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800 uppercase tracking-tighter truncate max-w-[100px]">
                      {ex.name}
                    </span>
                  ))}
                  {(block.exercises || []).length > 4 && <span className="text-[8px] font-bold text-slate-400">{t('more_count_compact', { count: block.exercises.length - 4 })}</span>}
                </div>
              </div>
            ))
          )}
          {blocks.length > 3 && (
            <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">{t('more_blocks_count', { count: blocks.length - 3 })}</p>
          )}
        </div>
      </div>
      <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-center">
        <button className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline flex items-center gap-1.5">
          <Target className="w-3 h-3" /> {t('open_full_program')}
        </button>
      </div>
    </div>
  );
};



export default function ClientDetail({ clientId, onBack }: ClientDetailProps) {
  const { t } = useLanguage();
  const { clients, deleteClient } = useClient();
  const [activeTab, setActiveTab] = useState<Tab>('Information');
  const [innerView, setInnerView] = useState<'info' | 'review'>('info');
  const [onboardingSubmission, setOnboardingSubmission] = useState<any>(null);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);
  const [selectedAnalysisSubject, setSelectedAnalysisSubject] = useState('Weekly Volume');
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [strengthWeekOffset, setStrengthWeekOffset] = useState(0);
  const [visiblePRs, setVisiblePRs] = useState(4);
  const [visibleWorkouts, setVisibleWorkouts] = useState(4);
  const [weightRange, setWeightRange] = useState<'3M' | '6M' | '1Y'>('3M');
  const [showBodyFat, setShowBodyFat] = useState(false);

  // ─── Delete modal state ──────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [accessExpiration, setAccessExpiration] = useState('');
  const [savingExpiration, setSavingExpiration] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setStatsError(null);
      try {
        const data = await fetchWithAuth(`/manager/clients/${clientId}/profile-stats`);
        setStats(data);
        if (data?.accessExpiration) {
          setAccessExpiration(String(data.accessExpiration).split('T')[0]);
        }
      } catch (error) {
        console.error('Error fetching client stats:', error);
        setStatsError(t('error_loading_data'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [clientId]);

  useEffect(() => {
    const fetchOnboarding = async () => {
      setIsLoadingOnboarding(true);
      setOnboardingError(null);
      try {
        const submissions = await fetchWithAuth('/onboarding/manager/submissions');
        const clientSubmission = (submissions || [])
          .filter((s: any) => s.client_id === clientId)
          .sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0];

        if (clientSubmission) {
          setOnboardingSubmission(clientSubmission);
        }
      } catch (error) {
        console.error('Error fetching onboarding info:', error);
        setOnboardingError(t('error_loading_data'));
      } finally {
        setIsLoadingOnboarding(false);
      }
    };
    fetchOnboarding();
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
      setDeleteError(t('delete_client_error'));
      setIsDeleting(false);
    }
  };
  const handleSaveExpiration = async (value: string) => {
    setSavingExpiration(true);
    try {
      await fetchWithAuth(`/manager/clients/${clientId}`, {
        method: 'PATCH',
        body: JSON.stringify({ access_expiration: value || null })
      });
    } catch (error) {
      console.error('Error saving access expiration:', error);
    } finally {
      setSavingExpiration(false);
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
    name: t('unknown_client'),
    avatar: '',
    weight: '--',
    goal: '--',
    age: '--',
    location: '--',
    gender: '--',
    status: 'Active',
    progress: 0
  };

  const renderInformation = () => {
    if (isLoadingOnboarding) {
      return (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-sm font-medium">{t('loading_general_information')}</p>
        </div>
      );
    }

    if (onboardingError) {
      return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-red-200 dark:border-red-800/50 text-slate-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300">{onboardingError}</p>
        </div>
      );
    }

    if (!onboardingSubmission) {
      return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
          <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300">{t('no_onboarding_data_found')}</p>
          <p className="text-sm mt-2 max-w-xs mx-auto">{t('onboarding_data_processing_hint')}</p>
        </div>
      );
    }

    const { template, answers_json } = onboardingSubmission;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('general_information')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('latest_onboarding_data_prefix')}: <span className="font-bold text-emerald-600">{template?.name || t('onboarding')}</span></p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            {t('submitted')}: {new Date(onboardingSubmission.submitted_at).toLocaleDateString()}
          </div>
        </div>
        
        {template?.template_schema ? (
          <CheckInReviewRenderer 
            template={{
              id: template?.id || '',
              name: template?.name || t('onboarding'),
              templateSchema: template?.template_schema || [],
              key: template?.id || '',
              version: 1
            }} 
            answers={answers_json || {}} 
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
            {t('no_rendering_schema_found')}
          </div>
        )}
      </div>
    );
  };

  // Weight history filtered by the selected time range (3M / 6M / 1Y).
  const getFilteredWeightData = () => {
    const history = stats?.weightHistory || [];
    if (history.length === 0) return [];
    const cutoff = new Date();
    if (weightRange === '3M') cutoff.setMonth(cutoff.getMonth() - 3);
    else if (weightRange === '6M') cutoff.setMonth(cutoff.getMonth() - 6);
    else cutoff.setFullYear(cutoff.getFullYear() - 1);
    return history.filter((h: any) => {
      const d = new Date(h.date);
      return !isNaN(d.getTime()) && d >= cutoff;
    });
  };

  const renderNutrition = () => (
    <div className="space-y-6">
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm font-medium">{t('loading_stats')}</p>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('weight'), value: stats?.latestWeight || '--', unit: 'kg', change: '', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('loss_goal'), value: stats?.goal || 'TBD', unit: '', change: t('target'), icon: TrendingDown, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
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
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{t('goal')}: {stats?.goal || 'TBD'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('overlay_body_fat')}</span>
                <button
                  type="button"
                  onClick={() => setShowBodyFat(prev => !prev)}
                  className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${showBodyFat ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${showBodyFat ? 'left-5' : 'left-1'}`}></div>
                </button>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {(['3M', '6M', '1Y'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setWeightRange(p)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${weightRange === p ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >{p}</button>
                ))}
              </div>
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
                  <linearGradient id="colorBodyFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                {showBodyFat && <YAxis yAxisId="bf" hide domain={['dataMin - 5', 'dataMax + 5']} />}
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-white)', color: 'var(--tw-colors-slate-900)' }}
                  labelStyle={{ fontWeight: 700, marginBottom: '4px' }}
                />
                {showBodyFat && <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '10px' }} />}
                <Area name={t('weight')} type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" connectNulls />
                {showBodyFat && (
                  <Area name={t('body_fat')} yAxisId="bf" type="monotone" dataKey="bodyFat" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorBodyFat)" connectNulls />
                )}
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
              {(() => {
                const m = stats?.macros || {};
                const rows = [
                  { label: 'PROTEIN', grams: m.protein || 0, color: 'bg-emerald-500' },
                  { label: 'CARBS', grams: m.carbs || 0, color: 'bg-blue-400' },
                  { label: 'FATS', grams: m.fats || 0, color: 'bg-amber-400' },
                ];
                const total = rows.reduce((s, r) => s + r.grams, 0);
                return rows.map((macro, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{macro.label}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-500">{macro.grams} g</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className={`${macro.color} h-2 rounded-full`} style={{ width: `${total > 0 ? (macro.grams / total) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('daily_caloric_avg')}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stats?.macros?.calories || 0} kcal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('plan_adherence')}</span>
                <span className="text-sm font-bold text-emerald-500">{stats?.macros?.adherenceScore != null ? `${stats.macros.adherenceScore}%` : '--'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('allergies')}</h3>
              <button className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">{t('edit')}</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {stats?.allergies?.map((allergy: string, idx: number) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[10px] font-bold border border-red-100 dark:border-red-800/50 uppercase">
                  <X className="w-3 h-3" /> {allergy}
                </span>
              ))}
            </div>
            {stats?.dietaryStyle?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t('dietary_style')}</p>
                <div className="flex flex-wrap gap-2">
                  {stats.dietaryStyle.map((style: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-800/50">{style}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <NutritionPlanCard plan={stats?.nutritionPlan} />
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

  const renderTraining = () => (
    <div className="space-y-6">
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm font-medium">{t('loading_training')}</p>
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
                <option value="1W">{t('last_7_days')}</option>
                <option value="14D">{t('last_14_days')}</option>
                <option value="30D">{t('last_30_days')}</option>
                <option value="3M">{t('latest_90_days')}</option>
                <option value="6M">{t('last_6_months')}</option>
                <option value="YTD">{t('year_to_date')}</option>
                <option value="ALL">{t('all_history')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
            </div>
          </div>
        </div>

        <div className="flex flex-nowrap overflow-x-auto gap-4 mb-8 pb-4 scrollbar-hide no-scrollbar">
          {[
            { name: t('weekly_volume'), value: stats?.training?.weeklyVolume?.toLocaleString() || '0', unit: 'kg' },
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
                if (selectedAnalysisSubject === t('weekly_volume')) {
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
            const filtered = selectedAnalysisSubject === t('weekly_volume')
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
            <button className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline uppercase tracking-wider">{t('history')}</button>
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
            <button className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline uppercase tracking-wider">{t('view_log')}</button>
          </div>
          <div className="h-[400px] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide no-scrollbar">
              {(stats?.training?.recentWorkouts || []).slice(0, visibleWorkouts).map((workout: any) => (
                <WorkoutLogItem 
                  key={workout.id}
                  workout={workout}
                  isExpanded={expandedWorkoutId === workout.id}
                  onToggle={setExpandedWorkoutId}
                  onUpdate={handleUpdateWorkoutLog}
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

  const renderPlanning = () => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
      <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p className="text-lg font-medium text-slate-600 dark:text-slate-300">{t('no_planning_data_title')}</p>
      <p className="text-sm mt-2 max-w-sm mx-auto">{t('no_planning_data_desc')}</p>
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
          { label: 'SLEEP', value: stats?.mindset?.sleep || '--', status: 'Avg', icon: Moon, color: 'text-emerald-500', bg: 'bg-emerald-50', dataKey: 'sleep' },
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
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Latest Measurements */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{t('latest_measurements')}</h3>
          <button className="text-emerald-600 text-xs font-bold hover:underline uppercase tracking-wider">{t('view_all')}</button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">{t('metric')}</th>
                <th className="px-6 py-4">{t('value')}</th>
                <th className="px-6 py-4 text-right">{t('change')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {[
                { metric: t('waist'), value: stats?.measurements?.waist ? `${stats.measurements.waist} cm` : '--', change: stats?.measurements?.waistChange || '0', icon: '' },
                { metric: t('hip'), value: stats?.measurements?.hip ? `${stats.measurements.hip} cm` : '--', change: stats?.measurements?.hipChange || '0', icon: '' },
                { metric: t('thigh_r'), value: stats?.measurements?.thigh_r ? `${stats.measurements.thigh_r} cm` : '--', change: stats?.measurements?.thighChange || '0', icon: '' },
                { metric: t('arm_r'), value: stats?.measurements?.arm_r ? `${stats.measurements.arm_r} cm` : '--', change: stats?.measurements?.armChange || '0', icon: '' },
              ].map((row, idx) => {
                const numericChange = parseFloat(row.change);
                const colorClass = numericChange < 0 ? 'text-emerald-600' : numericChange > 0 ? 'text-red-500' : 'text-slate-400';
                const sign = numericChange > 0 ? '+' : '';
                return (
                  <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{row.metric}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{row.value}</td>
                    <td className={`px-6 py-4 text-right font-bold ${colorClass}`}>
                      <div className="flex justify-end items-center gap-1">
                        {numericChange !== 0 ? `${sign}${row.change} cm` : <span className="text-slate-400 font-medium">0 cm</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{t('recent_activity')}</h3>
          <button className="text-emerald-600 text-xs font-bold hover:underline uppercase tracking-wider">{t('history')}</button>
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
              <p className="text-center text-slate-400 text-sm py-4">{t('no_recent_activity')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Access & Security */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{t('account_access_security')}</h3>
          <ShieldCheck className="w-5 h-5 text-slate-400" />
        </div>
        <div className="p-6 flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">{t('grant_app_access')}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{t('allow_client_login')}</p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 bg-emerald-500">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('access_expiration_date')}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-600 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:opacity-50"
                type="date"
                value={accessExpiration}
                disabled={savingExpiration}
                onChange={(e) => setAccessExpiration(e.target.value)}
                onBlur={(e) => handleSaveExpiration(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-auto pt-6 border-t border-slate-100">
            <button
            onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(null); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-bold text-sm border border-transparent hover:border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            {t('delete_client_permanently')}
          </button>
          </div>
        </div>
      </div>

      {/* Client Documents */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{t('client_documents')}</h3>
          <button className="text-emerald-600 text-xs font-bold hover:underline uppercase tracking-wider">{t('upload_new')}</button>
        </div>
        <div className="p-6 flex-1 overflow-auto">
          <div className="flex flex-col gap-3">
              {stats?.documents?.map((doc: any, idx: number) => {
                const isImage = doc.type === 'image' || doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                const isVideo = doc.type === 'video' || doc.url.match(/\.(mp4|mov|avi|wmv)$/i);
                
                return (
                  <a 
                    key={idx} 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    download={doc.name}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 transition-colors group cursor-pointer"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500`}>
                      {isImage ? <FileImage className="w-5 h-5" /> : isVideo ? <FileVideo className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate uppercase">{new Date(doc.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-slate-400 group-hover:text-emerald-500 transition-colors p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg">
                      <Download className="w-4 h-4" />
                    </div>
                  </a>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );

    const onboardingAnswers = onboardingSubmission?.answers_json || {};
    const displayGender = onboardingAnswers.genero || onboardingAnswers.gender || client.gender || t('unknown');
    const displayAge = onboardingAnswers.edad || onboardingAnswers.age || client.age || '--';
    const displayLocation = onboardingAnswers.localizacion || onboardingAnswers.location || client.location || t('unknown');
    const displayPlan = client.planFamilyLabel || client.plan || t('no_plan');
    const joinDate = client.created_at ? new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';

    return (
    <>
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-6 md:p-8 lg:p-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
            <button onClick={onBack} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
              {t('clients')}
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    client.status === 'Archived'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      : client.status === 'Pending'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                  }`}>
                    {client.status === 'Archived' ? t('archived') : client.status === 'Pending' ? t('pending') : t('active')}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 font-medium uppercase tracking-tight text-[10px] font-black">
                  {displayGender}, {displayAge} years • {displayLocation}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{displayPlan}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('joined')} {joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full lg:w-auto gap-4">
              <div className="flex items-center gap-3">
                <button className="flex-1 lg:flex-none justify-center flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm text-sm font-bold">
                  <MessageSquare className="w-4 h-4" />
                  {t('message')}
                </button>
                <button className="flex-1 lg:flex-none justify-center flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-sm font-bold">
                  <Edit className="w-4 h-4" />
                  {t('edit_profile')}
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <div 
                  onClick={() => client.email && navigator.clipboard.writeText(client.email)}
                  className="flex-1 flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 group cursor-pointer hover:border-slate-200 dark:hover:border-slate-600 transition-all"
                  title={t('copy_email')}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{client.email || t('no_email')}</span>
                  </div>
                  <Copy className="w-3 h-3 text-slate-300 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
                <div 
                  onClick={() => client.tempPassword && navigator.clipboard.writeText(client.tempPassword)}
                  className={`flex-1 flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 transition-all ${client.tempPassword ? 'group cursor-pointer hover:border-slate-200 dark:hover:border-slate-600' : 'opacity-70 cursor-not-allowed'}`}
                  title={client.tempPassword ? t('copy_password') : t('password_not_available')}
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
            {(['Information', 'Nutrition', 'Training', 'Planning', 'Mindset'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 text-sm font-bold transition-all relative ${
                  activeTab === tab 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {tab === 'Information' && t('information')}
                {tab === 'Nutrition' && t('nutrition')}
                {tab === 'Training' && t('training')}
                {tab === 'Planning' && t('planning')}
                {tab === 'Mindset' && t('mindset')}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {statsError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{statsError}</span>
            </div>
          )}

          {activeTab === 'Information' && renderInformation()}
          {activeTab === 'Nutrition' && renderNutrition()}
          {activeTab === 'Training' && renderTraining()}
          {activeTab === 'Planning' && renderPlanning()}
          {activeTab === 'Mindset' && renderMindset()}

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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('delete_client')}</h2>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
                <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">⚠ {t('action_cannot_be_undone')}</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {t('all_client_data_deleted_prefix')} <span className="font-bold">{client.name}</span> {t('all_client_data_deleted_suffix')}
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">
                  {t('type')} <span className="text-red-600">{client.name}</span> {t('to_confirm_suffix')}
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
                  {t('cancel')}
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
                      {t('deleting')}
                    </>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> {t('delete_permanently')}</>
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

