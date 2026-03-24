import React, { useState, useEffect, useCallback } from 'react';
import { useExerciseContext } from '../../context/ExerciseContext';
import { fetchWithAuth } from '../../api';
import { useAuth } from '../../context/AuthContext';

interface ClientTrainingProps {
  onViewExercise?: (name: string) => void;
}

// Shape for a single set logged by the client
interface SetLog {
  reps: string;
  weight: string;
  rir: string;
}

// Shape for a single exercise log
interface ExerciseLog {
  name: string;
  muscle_group?: string;
  sets_logged: SetLog[];
  notes: string;
}

// Key: "blockIdx-exerciseIdx"
type ExerciseLogs = Record<string, ExerciseLog>;

// --- Components ---

function SummaryStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
        <span className="text-slate-600 dark:text-slate-400 font-medium">{label}</span>
      </div>
      <span className="font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

interface DetailedExerciseRowProps {
  exKey: string;
  name: string;
  muscle_group?: string;
  type?: string;
  weight?: string;
  sets?: string | number;
  reps?: string;
  rir?: string;
  rest?: string;
  logData?: { name: string; muscle_group?: string; sets_logged: { reps: string; weight: string; rir: string }[]; notes: string };
  onInit: (key: string, name: string, muscle_group: string, defaultSets: number) => void;
  onUpdateSet: (key: string, setIdx: number, field: 'reps' | 'weight' | 'rir', value: string) => void;
  onAddSet: (key: string) => void;
  onUpdateNotes: (notes: string) => void;
}

const DetailedExerciseRow: React.FC<DetailedExerciseRowProps> = ({ 
  exKey, name, muscle_group, type, weight, sets, reps, rir, rest, 
  logData, onInit, onUpdateSet, onAddSet, onUpdateNotes 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onInit(exKey, name, muscle_group || '', Number(sets) || 1);
  }, [exKey, name, muscle_group, sets, onInit]);

  const setsLogged = logData?.sets_logged || [];

  return (
    <div className="flex flex-col border-b border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-colors">
      <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="cursor-grab text-slate-300 dark:text-slate-700 group-hover:text-slate-400">
              <span className="material-symbols-outlined text-[20px]">drag_handle</span>
            </div>
            <div className="min-w-0 flex flex-col gap-1 flex-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{name}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${type === 'Compound' ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                {muscle_group} • {type}
              </p>
            </div>
          </div>
          
          <div className="md:col-span-8 grid grid-cols-5 gap-2 text-center items-center">
            <div className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 py-1.5 rounded-lg">{weight}</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{sets}</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{reps}</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{rir}</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{rest}</span>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`ml-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-[#17cf54] text-white shadow-md' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                <div>Set</div><div>Weight</div><div>Reps</div><div>RIR</div>
              </div>
              <div className="space-y-2">
                {setsLogged.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-3 items-center">
                    <div className="text-xs font-bold text-slate-400 text-center">#{idx + 1}</div>
                    <input 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl h-10 text-center text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-1 focus:ring-[#17cf54]" 
                      placeholder={weight || "0"} 
                      value={s.weight} 
                      onChange={e => onUpdateSet(exKey, idx, 'weight', e.target.value)}
                    />
                    <input 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl h-10 text-center text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-1 focus:ring-[#17cf54]" 
                      placeholder={reps || "0"} 
                      value={s.reps} 
                      onChange={e => onUpdateSet(exKey, idx, 'reps', e.target.value)}
                    />
                    <select 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl h-10 text-center text-[10px] font-bold text-slate-700 dark:text-white outline-none focus:ring-1 focus:ring-[#17cf54] appearance-none"
                      value={s.rir}
                      onChange={e => onUpdateSet(exKey, idx, 'rir', e.target.value)}
                    >
                      <option value="">RIR</option>
                      {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => onAddSet(exKey)}
                className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:text-[#17cf54] hover:border-[#17cf54]/30 transition-all flex items-center justify-center gap-2 bg-white dark:bg-slate-900"
              >
                <span className="material-symbols-outlined text-[16px]">add</span> Add Next Set
              </button>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Exercise Notes</label>
              <textarea 
                className="w-full h-32 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-600 dark:text-slate-300 outline-none focus:ring-1 focus:ring-[#17cf54] resize-none" 
                placeholder="Log technique cues, sensations, or injuries..."
                value={logData?.notes || ''}
                onChange={e => onUpdateNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main component ---

export default function ClientTraining({ onViewExercise }: ClientTrainingProps) {
  const { exercises, isLoading: exercisesLoading, refreshExercises } = useExerciseContext();
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [trainingProgram, setTrainingProgram] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { user } = useAuth();

  const [allLogs, setAllLogs] = useState<Record<string, { exerciseLogs: ExerciseLogs; rpe: string; notes: string }>>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`workout_draft_${user?.id}`) : null;
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const dayData = allLogs[selectedDay] || { exerciseLogs: {} as ExerciseLogs, rpe: '', notes: '' };
  const exerciseLogs = dayData.exerciseLogs || {};
  const sessionRPE = dayData.rpe || '';
  const sessionNotes = dayData.notes || '';

  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`workout_draft_${user.id}`);
        if (saved) {
          setAllLogs(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, [user?.id]);

  const setDayData = useCallback((day: string, data: Partial<{ exerciseLogs: ExerciseLogs; rpe: string; notes: string }>) => {
    setAllLogs(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || { exerciseLogs: {}, rpe: '', notes: '' }),
        ...data
      }
    }));
  }, []);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`workout_draft_${user.id}`, JSON.stringify(allLogs));
    }
  }, [allLogs, user?.id]);

  useEffect(() => {
    refreshExercises();
    const fetchData = async () => {
      try {
        const [plansData, roadmapData] = await Promise.all([
          fetchWithAuth('/client/plans'),
          fetchWithAuth('/client/roadmap')
        ]);
        
        if (plansData && plansData.training && plansData.training.length > 0) {
          setTrainingProgram(plansData.training[0]);
        }
        if (roadmapData && roadmapData.data_json) {
          setRoadmap(roadmapData);
          if (roadmapData.currentWeek) {
            setSelectedWeek(roadmapData.currentWeek);
          }
        }
      } catch (err) {
        console.error('Error fetching client training plans:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshExercises]);

  const updateExerciseLog = useCallback((key: string, field: keyof ExerciseLog, value: any) => {
    setAllLogs(prev => {
      const dayData = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      const current = dayData.exerciseLogs[key] || { name: '', sets_logged: [], notes: '' };
      return {
        ...prev,
        [selectedDay]: {
          ...dayData,
          exerciseLogs: {
            ...dayData.exerciseLogs,
            [key]: { ...current, [field]: value }
          }
        }
      };
    });
  }, [selectedDay]);

  const initExerciseLog = useCallback((key: string, name: string, muscle_group: string, defaultSets: number) => {
    setAllLogs(prev => {
      const dayData = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      if (dayData.exerciseLogs[key]) return prev;
      
      return {
        ...prev,
        [selectedDay]: {
          ...dayData,
          exerciseLogs: {
            ...dayData.exerciseLogs,
            [key]: {
              name,
              muscle_group,
              sets_logged: Array.from({ length: defaultSets }, () => ({ reps: '', weight: '', rir: '' })),
              notes: ''
            }
          }
        }
      };
    });
  }, [selectedDay]);

  const updateSet = useCallback((exKey: string, setIdx: number, field: keyof SetLog, value: string) => {
    setAllLogs(prev => {
      const dayData = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      const current = dayData.exerciseLogs[exKey];
      if (!current) return prev;
      
      const newSets = [...current.sets_logged];
      newSets[setIdx] = { ...newSets[setIdx], [field]: value };
      
      return {
        ...prev,
        [selectedDay]: {
          ...dayData,
          exerciseLogs: {
            ...dayData.exerciseLogs,
            [exKey]: { ...current, sets_logged: newSets }
          }
        }
      };
    });
  }, [selectedDay]);

  const addSet = useCallback((exKey: string) => {
    setAllLogs(prev => {
      const dayData = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      const current = dayData.exerciseLogs[exKey];
      if (!current) return prev;
      
      return {
        ...prev,
        [selectedDay]: {
          ...dayData,
          exerciseLogs: {
            ...dayData.exerciseLogs,
            [exKey]: { ...current, sets_logged: [...current.sets_logged, { reps: '', weight: '', rir: '' }] }
          }
        }
      };
    });
  }, [selectedDay]);

  const getLoggedAtDate = (dayKey: string): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetIdx = days.indexOf(dayKey.toLowerCase());
    if (targetIdx === -1) return new Date().toISOString();

    let referenceDate: Date;
    if (roadmap?.data_json?.startDate) {
      referenceDate = new Date(roadmap.data_json.startDate);
    } else {
      // Fallback: Current ISO Week start
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      referenceDate = new Date(d.setDate(diff));
    }

    const targetIsoDay = targetIdx === 0 ? 7 : targetIdx;
    const totalDaysOffset = (selectedWeek - 1) * 7 + (targetIsoDay - 1);
    
    const targetDate = new Date(referenceDate);
    targetDate.setDate(referenceDate.getDate() + totalDaysOffset);
    
    return targetDate.toISOString();
  };

  const handleSaveSession = async () => {
    if (!trainingProgram) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const exercisesToSave = (Object.values(exerciseLogs) as ExerciseLog[]).filter(ex =>
        ex.sets_logged.some(s => s.weight || s.reps)
      );
      
      const loggedAt = isWeekly ? getLoggedAtDate(selectedDay) : new Date().toISOString();

      await fetchWithAuth('/client/workout-logs', {
        method: 'POST',
        body: JSON.stringify({
          plan_id: trainingProgram.id,
          workout_name: currentWorkoutName || `${selectedDay} session`,
          day_key: selectedDay,
          exercises: exercisesToSave,
          notes: sessionNotes,
          session_rpe: sessionRPE ? Number(sessionRPE) : null,
          logged_at: loggedAt
        })
      });
      setSaveSuccess(true);
      // Clear draft for this day
      setDayData(selectedDay, { exerciseLogs: {}, rpe: '', notes: '' });
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving workout log:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17cf54]"></div>
      </div>
    );
  }

  if (!trainingProgram) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
          <span className="material-symbols-outlined text-4xl">fitness_center</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tienes un plan de entrenamiento asignado</h2>
        <p className="text-slate-500 max-w-sm">Tu coach aún no ha publicado tu rutina. Una vez asignada, la verás aquí.</p>
      </div>
    );
  }

  const dataJson = trainingProgram.data_json || {};
  const isWeekly = !!dataJson.weeklySchedule;
  
  let blocks: any[] = [];
  let currentWorkoutName = '';
  
  if (isWeekly) {
    const workoutId = dataJson.weeklySchedule[selectedDay];
    const workouts = dataJson.workouts || [];
    const workout = workouts.find((w: any) => w.id === workoutId);
    blocks = workout?.blocks || [];
    currentWorkoutName = workout?.name || 'Rest Day';
  } else {
    blocks = dataJson.blocks || [];
    currentWorkoutName = dataJson.name || 'Training Session';
  }

  const totalExercises = blocks.reduce((acc, b) => acc + (b.exercises?.length || 0), 0);
  const completedCount = (Object.values(exerciseLogs) as ExerciseLog[]).filter(ex => ex.sets_logged.some(s => s.weight && s.reps)).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 md:p-8 lg:p-10 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-[#17cf54] uppercase tracking-widest mb-1">
              <span className="w-4 h-px bg-[#17cf54]"></span> Live Client Portal
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              {trainingProgram.name || 'Strength Program'}
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] uppercase tracking-widest border border-emerald-500/20">Active</span>
            </h1>
          </div>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <div className="text-center px-4 border-r border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Progress</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">{completedCount} / {totalExercises}</div>
             </div>
             <div className="text-center px-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#17cf54] animate-pulse"></span> {isSaving ? 'Saving...' : 'Ready'}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {/* Controls Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm mb-8">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button className="px-5 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">edit_note</span> Active Session
            </button>
          </div>
          <div className="flex items-center gap-3 pr-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-[#17cf54] flex items-center gap-1 animate-pulse mr-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Session Saved!
              </span>
            )}
            <button
              onClick={handleSaveSession}
              disabled={isSaving || totalExercises === 0}
              className="bg-[#17cf54] hover:bg-[#15b84a] active:scale-95 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest shadow-md shadow-emerald-500/20"
            >
              <span className="material-symbols-outlined text-[18px]">{isSaving ? 'sync' : 'save'}</span>
              {isSaving ? 'Processing...' : 'Save Workout'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          
          {/* Week & Day Selectors */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <span className="material-symbols-outlined">event_repeat</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Timeline Selection</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Focus on your scheduled progression</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-3">Week</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                    <button
                      key={w}
                      onClick={() => setSelectedWeek(w)}
                      className={`w-9 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${selectedWeek === w ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-hide flex gap-2">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const wId = dataJson.weeklySchedule?.[day];
                const hasWorkout = !!wId;
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-1 min-w-[100px] h-20 flex flex-col items-center justify-center rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all border ${
                      isSelected 
                        ? 'bg-[#17cf54] text-white border-[#17cf54] shadow-xl shadow-[#17cf54]/20' 
                        : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {day}
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 ${hasWorkout ? (isSelected ? 'bg-white' : 'bg-[#17cf54]') : 'bg-transparent opacity-20 border border-slate-300'}`}></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Training Content */}
          <div className="space-y-8">
            {blocks.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-16 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6 group hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">self_improvement</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Recovery Day</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm font-medium">Rest is where the growth happens. Hydrate well and prepare for your next heavy session.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10">
                
                {/* Session Header Stats */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-12 items-center">
                  <div className="flex-1 space-y-8">
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{currentWorkoutName}</h4>
                      <div className="flex items-center gap-4 mt-2">
                         <span className="text-[10px] font-black text-[#17cf54] bg-[#17cf54]/10 px-3 py-1 rounded-full uppercase tracking-widest">Semana {selectedWeek} • {selectedDay}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{totalExercises} Targets Identified</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Internal Intensity (RPE)</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <button
                              key={n}
                              onClick={() => setDayData(selectedDay, { rpe: String(n) })}
                              className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all border ${
                                sessionRPE === String(n)
                                  ? 'bg-[#17cf54] border-[#17cf54] text-white shadow-md'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-emerald-500/50'
                              }`}
                            >{n}</button>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Session Notes & Feeling</label>
                        <textarea
                          placeholder="Note sensations or health flags..."
                          value={sessionNotes}
                          onChange={e => setDayData(selectedDay, { notes: e.target.value })}
                          className="w-full h-10 bg-transparent text-xs font-medium text-slate-600 dark:text-slate-300 outline-none resize-none scrollbar-hide"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-48 lg:h-48 relative shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" className="text-slate-100 dark:text-slate-800" stroke="currentColor" strokeWidth="3" />
                      <circle 
                        cx="18" cy="18" r="16" fill="none" className="text-[#17cf54]" stroke="currentColor" strokeWidth="3" 
                        strokeDasharray={`${(completedCount / (totalExercises || 1)) * 100}, 100`} strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{completedCount}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Logged</span>
                    </div>
                  </div>
                </div>

                {/* Blocks List */}
                <div className="space-y-10">
                  {blocks.map((block: any, bIdx: number) => (
                    <div key={bIdx} className="space-y-4">
                      <div className="flex items-center gap-4 px-4">
                         <div className={`w-10 h-10 rounded-2xl ${block.iconBg || 'bg-slate-900 text-white'} flex items-center justify-center shadow-lg shadow-black/5`}>
                           <span className="material-symbols-outlined text-[24px]">{block.icon || 'star'}</span>
                         </div>
                         <div>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{block.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{block.subtitle}</p>
                         </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="hidden md:grid grid-cols-12 gap-4 px-10 py-4 bg-slate-50 dark:bg-slate-800/30 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                          <div className="col-span-4">Exercise Selection</div>
                          <div className="col-span-8 grid grid-cols-5 gap-4 text-center pr-12">
                            <div>Target Weight</div><div>Sets</div><div>Reps</div><div>RIR</div><div>Rest</div>
                          </div>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {(block.exercises || []).map((ex: any, eIdx: number) => {
                            const key = `${bIdx}-${eIdx}`;
                            return (
                              <DetailedExerciseRow
                                key={`${selectedWeek}-${selectedDay}-${key}`}
                                exKey={key}
                                name={ex.name}
                                muscle_group={ex.muscle_group}
                                type={ex.type}
                                weight={ex.weight}
                                sets={ex.sets}
                                reps={ex.reps}
                                rir={ex.rir}
                                rest={ex.rest}
                                logData={exerciseLogs[key]}
                                onInit={initExerciseLog}
                                onUpdateSet={updateSet}
                                onAddSet={addSet}
                                onUpdateNotes={(n) => updateExerciseLog(key, 'notes', n)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
