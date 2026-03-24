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
  logData?: ExerciseLog;
  onInit: (key: string, name: string, muscle_group: string, defaultSets: number) => void;
  onUpdateSet: (key: string, setIdx: number, field: keyof SetLog, value: string) => void;
  onAddSet: (key: string) => void;
  onUpdateNotes: (notes: string) => void;
}

const DetailedExerciseRow: React.FC<DetailedExerciseRowProps> = ({ exKey, name, muscle_group, type, weight, sets, reps, rir, rest, logData, onInit, onUpdateSet, onAddSet, onUpdateNotes }) => {
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
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-400 truncate uppercase font-bold tracking-widest">{type}</p>
                <button className="text-[9px] font-bold text-[#17cf54] hover:text-[#15b84a] flex items-center gap-1 px-1.5 py-0.5 bg-[#17cf54]/5 rounded transition-colors uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[12px]">videocam</span> Video
                </button>
              </div>
            </div>
          </div>
          <div className="md:col-span-8 grid grid-cols-5 gap-2 relative pr-12">
            <div className="text-center text-[11px] font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 overflow-hidden truncate">{weight}</div>
            <div className="text-center text-[11px] font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 overflow-hidden truncate">{sets}</div>
            <div className="text-center text-[11px] font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 overflow-hidden truncate">{reps}</div>
            <div className="text-center text-[11px] font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 overflow-hidden truncate">{rir}</div>
            <div className="text-center text-[11px] font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 overflow-hidden truncate">{rest}</div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className={`absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#17cf54] hover:bg-[#17cf54]/10 rounded-full transition-all flex items-center justify-center ${isExpanded ? 'bg-[#17cf54]/10 text-[#17cf54] rotate-180' : ''}`}
            >
              <span className="material-symbols-outlined text-[20px]">expand_more</span>
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-8 pt-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/50 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            <div className="md:col-span-4 flex items-center justify-end md:justify-start">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-[#17cf54]">edit_note</span>
                Client Log
              </span>
            </div>
            <div className="md:col-span-8 flex flex-col gap-4">
              <div className="grid grid-cols-4 gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                <div>Set</div><div>Weight (kg)</div><div>Reps</div><div>RIR</div>
              </div>
              {setsLogged.map((s, i) => (
                <div key={i} className="grid grid-cols-4 gap-3 items-center">
                  <div className="text-center text-xs font-bold text-slate-400">#{i + 1}</div>
                  <input
                    type="number"
                    placeholder="W"
                    value={s.weight}
                    onChange={e => onUpdateSet(exKey, i, 'weight', e.target.value)}
                    className="w-full text-center text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:ring-1 focus:ring-[#17cf54] outline-none transition-all shadow-sm"
                  />
                  <input
                    type="number"
                    placeholder="R"
                    value={s.reps}
                    onChange={e => onUpdateSet(exKey, i, 'reps', e.target.value)}
                    className="w-full text-center text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:ring-1 focus:ring-[#17cf54] outline-none transition-all shadow-sm"
                  />
                  <select
                    value={s.rir}
                    onChange={e => onUpdateSet(exKey, i, 'rir', e.target.value)}
                    className="w-full text-center text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:ring-1 focus:ring-[#17cf54] outline-none transition-all shadow-sm appearance-none"
                  >
                    <option value="">RIR</option>
                    {[0,0.5,1,1.5,2,2.5,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 mt-2">
                <button
                  onClick={() => onAddSet(exKey)}
                  className="text-[10px] font-black text-[#17cf54] hover:text-[#15b84a] flex items-center gap-1.5 px-3 py-1.5 bg-[#17cf54]/5 rounded-xl transition-all uppercase tracking-widest border border-[#17cf54]/10"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span> Add Set
                </button>
                <div className="flex-1">
                  <input
                    placeholder="Notes for this exercise..."
                    value={logData?.notes || ''}
                    onChange={e => onUpdateNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-medium focus:ring-1 focus:ring-[#17cf54] outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientTraining({ onViewExercise }: ClientTrainingProps) {
  const { exercises, isLoading: exercisesLoading, refreshExercises } = useExerciseContext();
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [trainingProgram, setTrainingProgram] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
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

  const setDayData = (day: string, data: Partial<{ exerciseLogs: ExerciseLogs; rpe: string; notes: string }>) => {
    setAllLogs(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || { exerciseLogs: {}, rpe: '', notes: '' }),
        ...data
      }
    }));
  };

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
      const dData = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      return {
        ...prev,
        [selectedDay]: {
          ...dData,
          exerciseLogs: {
            ...dData.exerciseLogs,
            [key]: { ...dData.exerciseLogs[key], [field]: value }
          }
        }
      };
    });
  }, [selectedDay]);

  const initExerciseLog = useCallback((key: string, name: string, muscle_group: string, defaultSets: number) => {
    setAllLogs(prev => {
      const dData = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      if (dData.exerciseLogs[key]) return prev;
      
      const numSets = Math.max(1, parseInt(String(defaultSets), 10) || 1);
      const sets_logged: SetLog[] = Array.from({ length: numSets }, () => ({ reps: '', weight: '', rir: '' }));
      
      return {
        ...prev,
        [selectedDay]: {
          ...dData,
          exerciseLogs: {
            ...dData.exerciseLogs,
            [key]: { name, muscle_group, sets_logged, notes: '' }
          }
        }
      };
    });
  }, [selectedDay]);

  const updateSet = useCallback((exKey: string, setIdx: number, field: keyof SetLog, value: string) => {
    setAllLogs(prev => {
      const dData = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      const current = dData.exerciseLogs[exKey];
      if (!current) return prev;
      
      const sets_logged = current.sets_logged.map((s, i) =>
        i === setIdx ? { ...s, [field]: value } : s
      );
      
      return {
        ...prev,
        [selectedDay]: {
          ...dData,
          exerciseLogs: {
            ...dData.exerciseLogs,
            [exKey]: { ...current, sets_logged }
          }
        }
      };
    });
  }, [selectedDay]);

  const addSet = useCallback((exKey: string) => {
    setAllLogs(prev => {
      const dData = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      const current = dData.exerciseLogs[exKey];
      if (!current) return prev;
      
      return {
        ...prev,
        [selectedDay]: {
          ...dData,
          exerciseLogs: {
            ...dData.exerciseLogs,
            [exKey]: { ...current, sets_logged: [...current.sets_logged, { reps: '', weight: '', rir: '' }] }
          }
        }
      };
    });
  }, [selectedDay]);

  const getLoggedAtDate = (dayKey: string, weekNum: number): string => {
    const daysArr = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const targetIdx = daysArr.indexOf(dayKey.toLowerCase());
    
    let baseDate: Date;
    if (roadmap?.startDate) {
      baseDate = new Date(roadmap.startDate);
    } else {
      baseDate = new Date();
      const currentDay = baseDate.getDay();
      const diff = baseDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1);
      baseDate.setDate(diff);
    }

    const totalDaysOffset = (weekNum - 1) * 7 + (targetIdx === -1 ? 0 : targetIdx);
    const finalDate = new Date(baseDate);
    finalDate.setDate(baseDate.getDate() + totalDaysOffset);
    
    return finalDate.toISOString();
  };

  const handleSaveSession = async () => {
    if (!trainingProgram) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const itemsToSave = (Object.values(exerciseLogs) as ExerciseLog[]).filter(ex =>
        ex.sets_logged.some(s => s.weight || s.reps)
      );

      if (itemsToSave.length === 0) {
        setIsSaving(false);
        return;
      }

      await fetchWithAuth('/client/workout-logs', {
        method: 'POST',
        body: JSON.stringify({
          workout_name: trainingProgram.name || 'Training Session',
          exercises: itemsToSave,
          rpe: sessionRPE,
          notes: sessionNotes,
          logged_at: getLoggedAtDate(selectedDay, selectedWeek)
        })
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving workout log:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="w-10 h-10 border-4 border-[#17cf54]/20 border-t-[#17cf54] rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Program...</p>
      </div>
    );
  }

  const dataJson = trainingProgram?.data_json || {};
  const weeklySchedule = dataJson.weeklySchedule || {};
  const workoutId = weeklySchedule[selectedDay];
  const workouts = dataJson.workouts || [];
  const currentWorkout = workouts.find((w: any) => w.id === workoutId);
  const blocks = currentWorkout?.blocks || [];
  const totalExercises = blocks.reduce((acc: number, b: any) => acc + (b.exercises?.length || 0), 0);
  const completedCount = (Object.values(exerciseLogs) as ExerciseLog[]).filter(ex => ex.sets_logged.some(s => s.weight && s.reps)).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 md:p-8 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54] shadow-lg shadow-[#17cf54]/5">
               <span className="material-symbols-outlined text-[32px]">fitness_center</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Client Portal</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#17cf54] animate-pulse"></span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {trainingProgram?.name} <span className="text-[#17cf54] ml-2 text-xs font-bold uppercase tracking-widest bg-[#17cf54]/10 px-2 py-0.5 rounded-full">Active</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="hidden sm:flex bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="px-4 py-1.5 text-center border-r border-slate-200 dark:border-slate-700">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Progress</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{completedCount} / {totalExercises}</p>
               </div>
               <div className="px-4 py-1.5 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                  <p className="text-xs font-black text-[#17cf54] leading-none flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#17cf54]"></span> Ready
                  </p>
               </div>
            </div>
            
            <button 
              onClick={handleSaveSession}
              disabled={isSaving || blocks.length === 0}
              className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                isSaving || blocks.length === 0 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400' 
                  : 'bg-[#17cf54] text-white hover:bg-[#15b84a] shadow-[#17cf54]/20'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{isSaving ? 'sync' : saveSuccess ? 'check_circle' : 'save_as'}</span>
              {isSaving ? 'Saving...' : saveSuccess ? 'Logged!' : 'Save Workout'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          
          {/* Timeline Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             {/* Week Selector */}
             <div className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-4">
                   <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm text-[#17cf54] border border-slate-100 dark:border-slate-800">
                      <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                   </div>
                   <div>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Timeline Selection</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-0.5">Focus on your scheduled progression</p>
                   </div>
                </div>
                
                <div className="flex items-center bg-white dark:bg-slate-950 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                   <span className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] hidden sm:block">Week</span>
                   {[1,2,3,4,5,6,7,8].map(w => (
                     <button
                       key={w}
                       onClick={() => setSelectedWeek(w)}
                       className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${selectedWeek === w ? 'bg-[#17cf54] text-white shadow-lg shadow-[#17cf54]/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                     >{w}</button>
                   ))}
                </div>
             </div>

             {/* Day Tabs */}
             <div className="p-4 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-3">
                   {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                     const dayKey = day.toLowerCase();
                     const isActive = selectedDay === dayKey;
                     const targetWorkoutId = weeklySchedule[dayKey];
                     const targetWorkout = workouts.find((w: any) => w.id === targetWorkoutId);
                     const isRest = !targetWorkout;
                     
                     return (
                       <button
                         key={day}
                         onClick={() => setSelectedDay(dayKey)}
                         className={`min-w-[140px] flex-1 p-6 rounded-[24px] border transition-all relative group overflow-hidden ${
                           isActive 
                             ? 'bg-[#17cf54] border-[#17cf54] text-white shadow-xl shadow-[#17cf54]/10' 
                             : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-[#17cf54]/30'
                         }`}
                       >
                         <div className="relative z-10 text-center">
                            <h4 className={`text-xs font-black uppercase tracking-[0.15em] mb-1 ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{day}</h4>
                            <div className={`w-1 h-1 rounded-full mx-auto ${isActive ? 'bg-white' : isRest ? 'bg-slate-200' : 'bg-[#17cf54]'}`}></div>
                         </div>
                         {isActive && <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>}
                       </button>
                     );
                   })}
                </div>
             </div>
          </div>

          {/* Activity Section */}
          <div className="space-y-10">
            {blocks.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
                  <span className="material-symbols-outlined text-[64px] text-slate-100 dark:text-slate-800">nightlight</span>
                  <div className="text-center">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Recovery Day</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Listen to your body, focus on mobility</p>
                  </div>
               </div>
            ) : (
              blocks.map((block: any, bIdx: number) => (
                <div key={bIdx} className="space-y-6">
                  {/* Block Header */}
                  <div className="flex items-center gap-6 px-6">
                     <div className={`w-14 h-14 rounded-3xl ${block.iconBg || 'bg-slate-900 text-white'} flex items-center justify-center shadow-xl shadow-black/5`}>
                        <span className="material-symbols-outlined text-[28px]">{block.icon || 'star'}</span>
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-[#17cf54] bg-[#17cf54]/10 px-3 py-1 rounded-full uppercase tracking-widest">
                            Semana {selectedWeek} • {selectedDay}
                          </span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{block.name}</h4>
                     </div>
                  </div>

                  {/* Exercises Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    {/* PC Headers */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-10 py-5 bg-slate-50 dark:bg-slate-800/30 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                      <div className="col-span-4">Exercise Selection</div>
                      <div className="col-span-8 grid grid-cols-5 gap-4 text-center pr-12">
                        <div>Target</div><div>Sets</div><div>Reps</div><div>RIR</div><div>Rest</div>
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
                  
                  {/* Block Summary / RPE Callout for this block (optional) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-[32px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Internal Intensity (RPE)</p>
                       <div className="flex gap-2 flex-wrap">
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <button
                              key={n}
                              onClick={() => setDayData(selectedDay, { rpe: String(n) })}
                              className={`w-9 h-9 rounded-xl text-xs font-black transition-all border ${
                                sessionRPE === String(n)
                                  ? 'bg-[#17cf54] border-[#17cf54] text-white shadow-lg shadow-[#17cf54]/20'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-[#17cf54]/30'
                              }`}
                            >{n}</button>
                          ))}
                       </div>
                    </div>
                    <div className="p-6 rounded-[32px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Session Notes & Feeling</p>
                       <textarea
                         placeholder="Note sensations or health flags..."
                         value={sessionNotes}
                         onChange={e => setDayData(selectedDay, { notes: e.target.value })}
                         className="w-full bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none resize-none scrollbar-hide h-12"
                       />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
