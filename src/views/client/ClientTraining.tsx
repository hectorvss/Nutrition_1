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

export default function ClientTraining({ onViewExercise }: ClientTrainingProps) {
  const { exercises, isLoading: exercisesLoading, refreshExercises } = useExerciseContext();
  const [selectedDay, setSelectedDay] = useState<string>('monday');
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
    const fetchMyPlans = async () => {
      try {
        const data = await fetchWithAuth('/client/plans');
        if (data && data.training && data.training.length > 0) {
          setTrainingProgram(data.training[0]);
        }
      } catch (err) {
        console.error('Error fetching client training plans:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyPlans();
  }, []);

  const updateExerciseLog = useCallback((key: string, field: keyof ExerciseLog, value: any) => {
    setAllLogs(prev => {
      const dayData = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      return {
        ...prev,
        [selectedDay]: {
          ...dayData,
          exerciseLogs: {
            ...dayData.exerciseLogs,
            [key]: { ...dayData.exerciseLogs[key], [field]: value }
          }
        }
      };
    });
  }, [selectedDay]);

  const initExerciseLog = useCallback((key: string, name: string, muscle_group: string, defaultSets: any) => {
    setAllLogs(prev => {
      const dayData = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      if (dayData.exerciseLogs[key]) return prev;
      
      const numSets = Math.max(1, parseInt(String(defaultSets), 10) || 1);
      const sets_logged: SetLog[] = Array.from({ length: numSets }, () => ({ reps: '', weight: '', rir: '' }));
      
      return {
        ...prev,
        [selectedDay]: {
          ...dayData,
          exerciseLogs: {
            ...dayData.exerciseLogs,
            [key]: { name, muscle_group, sets_logged, notes: '' }
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
      
      const sets_logged = current.sets_logged.map((s, i) =>
        i === setIdx ? { ...s, [field]: value } : s
      );
      
      return {
        ...prev,
        [selectedDay]: {
          ...dayData,
          exerciseLogs: {
            ...dayData.exerciseLogs,
            [exKey]: { ...current, sets_logged }
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

  const handleSaveSession = async () => {
    if (!trainingProgram) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const exercisesToSave = (Object.values(exerciseLogs) as ExerciseLog[]).filter(ex =>
        ex.sets_logged.some(s => s.weight || s.reps)
      );
      await fetchWithAuth('/client/workout-logs', {
        method: 'POST',
        body: JSON.stringify({
          plan_id: trainingProgram.id,
          workout_name: currentWorkoutName || `${selectedDay} session`,
          day_key: selectedDay,
          exercises: exercisesToSave,
          notes: sessionNotes,
          session_rpe: sessionRPE ? Number(sessionRPE) : null
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
    currentWorkoutName = workout?.name || 'Día de Descanso';
  } else {
    blocks = dataJson.blocks || [];
  }
    
  const totalExercises = blocks.reduce((acc: number, b: any) => acc + (b.exercises?.length || 0), 0);

  const renderDaySelector = () => {
    if (!isWeekly) return null;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return (
      <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-6 pb-2">
        {days.map(d => {
          const wId = dataJson.weeklySchedule[d];
          const hasWorkout = !!wId;
          const isSelected = selectedDay === d;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-4 py-2 flex flex-col items-center justify-center rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                isSelected 
                  ? 'bg-[#17cf54] text-white border-[#17cf54] shadow-md shadow-[#17cf54]/20' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{d.charAt(0).toUpperCase() + d.slice(1)}</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${hasWorkout ? (isSelected ? 'bg-white' : 'bg-[#17cf54]') : 'bg-transparent'}`}></div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f6f8f6] dark:bg-[#112116]">
      <div className="p-6 pb-2">
        <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <span className="text-slate-500">Training</span>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-slate-400 text-lg mx-1">chevron_right</span>
                <span className="text-slate-500">{trainingProgram.name}</span>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-slate-400 text-lg mx-1">chevron_right</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{user?.email.split('@')[0]}</span>
              </div>
            </li>
          </ol>
        </nav>
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm" style={{ backgroundImage: `url("https://ui-avatars.com/api/?name=${user?.email}&background=random")` }}></div>
            <div className="absolute -bottom-1 -right-1 bg-[#17cf54] w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user?.email.split('@')[0]}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">flag</span> Goal: Fat Loss
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">female</span> Client
              </span>
            </div>
          </div>
          <div className="px-4 py-2 bg-[#17cf54]/10 dark:bg-[#17cf54]/20 rounded-xl border border-[#17cf54]/20 dark:border-[#17cf54]/30">
            <div className="text-xs text-[#17cf54] dark:text-[#17cf54] uppercase tracking-wide font-semibold mb-1 text-center">Status</div>
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-[#17cf54]"></span> Active Plan
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 pt-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm mb-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 relative">
            <button className="relative px-6 py-2 rounded-lg text-sm font-semibold transition-all z-10 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm">
              Workout View
            </button>
          </div>
          <div className="flex items-center gap-3 pr-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-[#17cf54] flex items-center gap-1 animate-pulse">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Session saved!
              </span>
            )}
            <button
              onClick={handleSaveSession}
              disabled={isSaving || blocks.length === 0}
              className="bg-[#17cf54] hover:bg-[#15b84a] disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold text-sm shadow-sm"
            >
              {isSaving
                ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Saving...</>
                : <><span className="material-symbols-outlined text-[18px]">save</span> Save Session</>
              }
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 pb-20">
          {renderDaySelector()}
          
          {/* Session Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-6 md:p-8 flex-shrink-0 w-full">
             <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Workout Summary</h3>
                {isWeekly && <p className="text-sm text-[#17cf54] font-medium mt-1">{currentWorkoutName}</p>}
              </div>
              <button className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-[20px]">info</span></button>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-10">
              <div className="relative w-48 h-48 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8"></path>
                  <path className="text-blue-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="currentColor" strokeDasharray="50, 100" strokeWidth="3.8"></path>
                  <path className="text-purple-500" d="M18 33.9155 a 15.9155 15.9155 0 0 1 -15.9155 -15.9155" fill="none" stroke="currentColor" strokeDasharray="25, 100" strokeWidth="3.8"></path>
                  <path className="text-orange-500" d="M2.0845 18 a 15.9155 15.9155 0 0 1 15.9155 -15.9155" fill="none" stroke="currentColor" strokeDasharray="25, 100" strokeWidth="3.8"></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{totalExercises}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Exercises</span>
                </div>
              </div>
              {/* Session RPE input */}
              <div className="flex flex-col gap-4 w-full max-w-xs">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Session RPE (1-10)</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button
                        key={n}
                        onClick={() => setDayData(selectedDay, { rpe: String(n) })}
                        className={`w-9 h-9 rounded-full text-sm font-bold border transition-all ${
                          sessionRPE === String(n)
                            ? 'bg-[#17cf54] border-[#17cf54] text-white shadow'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-[#17cf54]/50'
                        }`}
                      >{n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Session Notes</label>
                  <textarea
                    placeholder="How did the session feel?"
                    value={sessionNotes}
                    onChange={e => setDayData(selectedDay, { notes: e.target.value })}
                    className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[70px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Workout Blocks */}
          <div className="w-full flex flex-col gap-6">
            {blocks.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                  <span className="material-symbols-outlined text-3xl">self_improvement</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Día de Descanso</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">Tómate un respiro, recupérate y prepárate para la próxima sesión.</p>
              </div>
            ) : (
              blocks.map((block: any, bIdx: number) => (
                <div key={bIdx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex-shrink-0">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${block.iconBg || 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-[24px]">{block.icon || 'fitness_center'}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{block.name}</h3>
                      <p className="text-xs text-slate-500">{block.exercises?.length || 0} Exercises • {block.subtitle}</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider pl-[4.5rem] hidden md:grid">
                  <div className="col-span-4">Exercise</div>
                  <div className="col-span-8 grid grid-cols-5 gap-2 text-center pr-12">
                    <div>Target</div><div>Sets</div><div>Reps</div><div>RIR</div><div>Rest</div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(block.exercises || []).map((ex: any, eIdx: number) => {
                    const key = `${bIdx}-${eIdx}`;
                    return (
                      <DetailedExerciseRow
                        key={`${selectedDay}-${key}`}
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
                        onUpdateNotes={(notes) => updateExerciseLog(key, 'notes', notes)}
                      />
                    );
                  })}
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
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

const DetailedExerciseRow: React.FC<DetailedExerciseRowProps> = ({ exKey, name, muscle_group, type, weight, sets, reps, rir, rest, logData, onInit, onUpdateSet, onAddSet, onUpdateNotes }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onInit(exKey, name, muscle_group || '', Number(sets) || 1);
  }, [exKey]);

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
              <p className="text-xs text-slate-400 truncate">{type}</p>
              <button className="text-[10px] font-medium text-[#17cf54] hover:text-[#15b84a] flex items-center gap-1 px-1.5 py-0.5 bg-[#17cf54]/5 rounded transition-colors">
                <span className="material-symbols-outlined text-[12px]">videocam</span> Video
              </button>
            </div>
          </div>
        </div>
        <div className="md:col-span-8 grid grid-cols-5 gap-2 relative pr-12">
          <div className="text-center text-sm p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">{weight}</div>
          <div className="text-center text-sm p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">{sets}</div>
          <div className="text-center text-sm p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">{reps}</div>
          <div className="text-center text-sm p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">{rir}</div>
          <div className="text-center text-sm p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">{rest}</div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#17cf54] hover:bg-[#17cf54]/10 rounded-full transition-all flex items-center justify-center ${isExpanded ? 'bg-[#17cf54]/10 text-[#17cf54] rotate-180' : ''}`}
          >
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </button>
        </div>
      </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-5 pt-2 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/50">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 flex items-center justify-end md:justify-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#17cf54]">edit_note</span>
                Client Log
              </span>
            </div>
            <div className="md:col-span-8 flex flex-col gap-3">
              {/* Set headers */}
              <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center pb-1">
                <div>Set</div><div>Weight (kg)</div><div>Reps</div><div>RIR</div>
              </div>
              {/* Set rows */}
              {setsLogged.map((s, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center">
                  <div className="text-center text-xs font-bold text-slate-400">#{i + 1}</div>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder={typeof weight === 'string' ? weight : '—'}
                    value={s.weight}
                    onChange={e => onUpdateSet(exKey, i, 'weight', e.target.value)}
                    className="w-full text-center text-sm p-2 rounded-xl border border-[#17cf54]/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#17cf54]/30 focus:border-[#17cf54] transition-all placeholder:text-slate-300"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder={typeof reps === 'string' ? reps : '—'}
                    value={s.reps}
                    onChange={e => onUpdateSet(exKey, i, 'reps', e.target.value)}
                    className="w-full text-center text-sm p-2 rounded-xl border border-[#17cf54]/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#17cf54]/30 focus:border-[#17cf54] transition-all placeholder:text-slate-300"
                  />
                  <input
                    type="number"
                    min="0"
                    max="5"
                    placeholder={typeof rir === 'string' ? rir : '—'}
                    value={s.rir}
                    onChange={e => onUpdateSet(exKey, i, 'rir', e.target.value)}
                    className="w-full text-center text-sm p-2 rounded-xl border border-[#17cf54]/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#17cf54]/30 focus:border-[#17cf54] transition-all placeholder:text-slate-300"
                  />
                </div>
              ))}
              {/* Add set button */}
              <button
                onClick={() => onAddSet(exKey)}
                className="self-start text-xs font-bold text-[#17cf54] hover:text-[#15b84a] flex items-center gap-1 px-2 py-1 bg-[#17cf54]/5 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">add</span> Add Set
              </button>
              {/* Notes */}
              <div className="relative">
                <textarea
                  placeholder="Notes, sensations, difficulties..."
                  value={logData?.notes || ''}
                  onChange={e => onUpdateNotes(e.target.value)}
                  className="w-full text-sm p-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#17cf54]/20 focus:border-[#17cf54] transition-all resize-none h-20 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
                <div className="absolute top-3 right-3 text-slate-300 dark:text-slate-600">
                  <span className="material-symbols-outlined text-[18px]">quick_reference_all</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
