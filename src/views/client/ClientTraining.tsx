import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useExerciseContext } from '../../context/ExerciseContext';
import { fetchWithAuth } from '../../api';

// --- Types ---

interface ExerciseLog {
  name: string;
  muscle_group: string;
  sets_logged: { reps: string; weight: string; rir: string }[];
  notes: string;
}

type ExerciseLogs = Record<string, ExerciseLog>;

interface ClientTrainingProps {
  onViewExercise?: (exerciseId: string) => void;
}

// --- Components ---

const SummaryStat = ({ label, value, unit, icon }: { label: string; value: string; unit: string; icon: string }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-slate-400">
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-lg font-black text-slate-900 dark:text-white">{value}</span>
      <span className="text-[10px] font-bold text-slate-400">{unit}</span>
    </div>
  </div>
);

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
  onUpdateSet: (key: string, setIdx: number, field: 'reps' | 'weight' | 'rir', value: string) => void;
  onAddSet: (key: string) => void;
  onUpdateNotes: (key: string, notes: string) => void;
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
          <div className="md:col-span-4 flex items-center gap-4 text-left">
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
              <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center pb-1">
                <div>Set</div><div>Weight (kg)</div><div>Reps</div><div>RIR</div>
              </div>
              {setsLogged.map((s, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center">
                  <div className="text-center text-xs font-bold text-slate-400">#{i + 1}</div>
                  <input
                    type="number" step="0.5"
                    value={s.weight}
                    onChange={e => onUpdateSet(exKey, i, 'weight', e.target.value)}
                    className="w-full text-center text-sm p-2 rounded-xl border border-[#17cf54]/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#17cf54]/30 focus:border-[#17cf54] transition-all"
                  />
                  <input
                    type="number"
                    value={s.reps}
                    onChange={e => onUpdateSet(exKey, i, 'reps', e.target.value)}
                    className="w-full text-center text-sm p-2 rounded-xl border border-[#17cf54]/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#17cf54]/30 focus:border-[#17cf54] transition-all"
                  />
                  <input
                    type="number"
                    value={s.rir}
                    onChange={e => onUpdateSet(exKey, i, 'rir', e.target.value)}
                    className="w-full text-center text-sm p-2 rounded-xl border border-[#17cf54]/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#17cf54]/30 focus:border-[#17cf54] transition-all"
                  />
                </div>
              ))}
              <button
                onClick={() => onAddSet(exKey)}
                className="self-start text-xs font-bold text-[#17cf54] hover:text-[#15b84a] flex items-center gap-1 px-2 py-1 bg-[#17cf54]/5 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">add</span> Add Set
              </button>
              <div className="relative">
                <textarea
                  placeholder="Notes, sensations, difficulties..."
                  value={logData?.notes || ''}
                  onChange={e => onUpdateNotes(exKey, e.target.value)}
                  className="w-full text-sm p-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#17cf54]/20 focus:border-[#17cf54] transition-all h-20 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main component ---

export default function ClientTraining({ onViewExercise }: ClientTrainingProps) {
  const { exercises, refreshExercises } = useExerciseContext();
  const { user } = useAuth();

  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [trainingProgram, setTrainingProgram] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Persistence logic for drafts
  const [allLogs, setAllLogs] = useState<Record<string, { exerciseLogs: ExerciseLogs; rpe: string; notes: string }>>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`workout_draft_${user?.id}`) : null;
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    if (user?.id && allLogs) {
      localStorage.setItem(`workout_draft_${user.id}`, JSON.stringify(allLogs));
    }
  }, [allLogs, user?.id]);

  useEffect(() => {
    refreshExercises();
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [plansData, roadmapData] = await Promise.all([
          fetchWithAuth('/client/plans'),
          fetchWithAuth('/client/roadmap')
        ]);
        
        if (plansData?.training?.length > 0) {
          setTrainingProgram(plansData.training[0]);
        }
        if (roadmapData?.data_json) {
          setRoadmap(roadmapData);
          if (roadmapData.currentWeek) setSelectedWeek(roadmapData.currentWeek);
        }
      } catch (err) {
        console.error('Error fetching client data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshExercises]);

  const getDayData = (day: string) => allLogs[day] || { exerciseLogs: {} as ExerciseLogs, rpe: '', notes: '' };
  
  const setDayData = (day: string, updates: Partial<{ exerciseLogs: ExerciseLogs; rpe: string; notes: string }>) => {
    setAllLogs(prev => ({
      ...prev,
      [day]: { ...getDayData(day), ...updates }
    }));
  };

  const handleInitExercise = useCallback((key: string, name: string, muscle_group: string, defaultSets: number) => {
    setAllLogs(prev => {
      const current = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      if (current.exerciseLogs[key]) return prev;
      
      const newLogs = { ...current.exerciseLogs };
      newLogs[key] = {
        name,
        muscle_group,
        sets_logged: Array.from({ length: defaultSets }, () => ({ reps: '', weight: '', rir: '' })),
        notes: ''
      };
      return { ...prev, [selectedDay]: { ...current, exerciseLogs: newLogs } };
    });
  }, [selectedDay]);

  const handleUpdateSet = (key: string, setIdx: number, field: 'reps' | 'weight' | 'rir', value: string) => {
    const current = getDayData(selectedDay);
    const log = current.exerciseLogs[key];
    if (!log) return;
    const newSets = [...log.sets_logged];
    newSets[setIdx] = { ...newSets[setIdx], [field]: value };
    const newLogs = { ...current.exerciseLogs, [key]: { ...log, sets_logged: newSets } };
    setDayData(selectedDay, { exerciseLogs: newLogs });
  };

  const handleAddSet = (key: string) => {
    const current = getDayData(selectedDay);
    const log = current.exerciseLogs[key];
    if (!log) return;
    const newSets = [...log.sets_logged, { reps: '', weight: '', rir: '' }];
    const newLogs = { ...current.exerciseLogs, [key]: { ...log, sets_logged: newSets } };
    setDayData(selectedDay, { exerciseLogs: newLogs });
  };

  const handleUpdateNotes = (key: string, notes: string) => {
    const current = getDayData(selectedDay);
    const log = current.exerciseLogs[key];
    if (!log) return;
    const newLogs = { ...current.exerciseLogs, [key]: { ...log, notes } };
    setDayData(selectedDay, { exerciseLogs: newLogs });
  };

  const getLoggedAtDate = () => {
    const dayIndices: Record<string, number> = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
    const dayOffset = dayIndices[selectedDay] || 0;
    const weekOffset = (selectedWeek - 1) * 7;
    const totalDays = weekOffset + dayOffset;
    
    let baseDate = new Date();
    if (roadmap?.startDate) {
      baseDate = new Date(roadmap.startDate);
    } else {
      // Fallback: If no start date, we assume "today" is the current day of the selected week/day
      const today = new Date();
      const currentDayIdx = (today.getDay() + 6) % 7; // Mon=0, Sun=6
      const currentWeekIdx = roadmap?.currentWeek || 1;
      const daysSinceStart = (currentWeekIdx - 1) * 7 + currentDayIdx;
      baseDate.setDate(today.getDate() - daysSinceStart);
    }

    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + totalDays);
    return targetDate.toISOString();
  };

  const handleSaveSession = async () => {
    setIsSaving(true);
    try {
      const current = getDayData(selectedDay);
      const exercisesList = Object.values(current.exerciseLogs).filter(ex => ex.sets_logged.some(s => s.weight || s.reps));
      
      if (exercisesList.length === 0) {
        alert("Please log at least one exercise.");
        return;
      }

      await fetchWithAuth('/workout-logs', {
        method: 'POST',
        body: JSON.stringify({
          workout_name: trainingProgram?.name || `${selectedDay} Session`,
          rpe: current.rpe,
          notes: current.notes,
          exercises: exercisesList,
          logged_at: getLoggedAtDate()
        })
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Optional: Clear draft for this day
      setDayData(selectedDay, { exerciseLogs: {}, rpe: '', notes: '' });
    } catch (err) {
      console.error('Error saving session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const dataJson = trainingProgram?.data_json || {};
  const blocks = dataJson.blocks || [];
  const currentDayBlocks = blocks.filter((b: any) => b.day?.toLowerCase() === selectedDay.toLowerCase());

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 md:p-8 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 max-w-7xl mx-auto">
          <div>
             <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Entrenamiento</h1>
             <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{trainingProgram?.name || 'Program Overview'}</p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1">
            {[1,2,3,4,5,6,7,8].map(w => (
              <button
                key={w}
                onClick={() => setSelectedWeek(w)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                  selectedWeek === w
                    ? 'bg-white dark:bg-slate-700 text-[#17cf54] shadow-sm scale-105'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >W{w}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Day selector tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 sticky top-0 z-10 transition-all overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto flex">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
                selectedDay === day
                  ? 'border-[#17cf54] text-[#17cf54]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >{day}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <div className="w-10 h-10 border-4 border-[#17cf54]/20 border-t-[#17cf54] rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest">Sincronizando plan...</p>
          </div>
        ) : (
          <>
            {/* Session Summary Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden text-left">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Semana {selectedWeek} • {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}</h3>
                    <p className="text-xs font-bold text-[#17cf54] mt-1 uppercase tracking-widest">Focus: {trainingProgram?.name || 'Strength & Volume'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-2">
                    <SummaryStat label="Intensity" value={getDayData(selectedDay).rpe || '--'} unit="/10" icon="bolt" />
                    <SummaryStat label="Duration" value="75" unit="min" icon="schedule" />
                    <SummaryStat label="Volume" value="Targeted" unit="kg" icon="database" />
                    <SummaryStat label="Status" value="Planning" unit="mode" icon="settings_accessibility" />
                  </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                   <div className="flex-1 min-w-[200px]">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Internal RPE</label>
                      <div className="flex gap-1.5">
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <button
                            key={n}
                            onClick={() => setDayData(selectedDay, { rpe: String(n) })}
                            className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all border ${
                              getDayData(selectedDay).rpe === String(n)
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-emerald-500/50'
                            }`}
                          >{n}</button>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Exercises List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 sticky top-[52px] z-[5]">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                  <div className="md:col-span-4">Exercise & Target</div>
                  <div className="md:col-span-8 grid grid-cols-5 gap-2 text-center pr-12">
                   <div>Weight</div><div>Sets</div><div>Reps</div><div>RIR</div><div>Rest</div>
                  </div>
                </div>
              </div>

              {currentDayBlocks.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {currentDayBlocks.map((block: any, blockIdx: number) => (
                    <div key={blockIdx}>
                      {block.exercises?.map((ex: any, exIdx: number) => (
                        <DetailedExerciseRow 
                          key={`${blockIdx}-${exIdx}`}
                          exKey={`${blockIdx}-${exIdx}`}
                          name={ex.name}
                          type={ex.type}
                          weight={ex.weight}
                          sets={ex.sets}
                          reps={ex.reps}
                          rir={ex.rir}
                          rest={ex.rest}
                          logData={getDayData(selectedDay).exerciseLogs[`${blockIdx}-${exIdx}`]}
                          onInit={handleInitExercise}
                          onUpdateSet={handleUpdateSet}
                          onAddSet={handleAddSet}
                          onUpdateNotes={handleUpdateNotes}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4 py-20">
                  <span className="material-symbols-outlined text-[64px] opacity-10">bedtime</span>
                  <div className="text-center">
                    <p className="text-lg font-black uppercase tracking-tight">Active Recovery Day</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Listen to your body, focus on mobility</p>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 pb-12">
              <button 
                onClick={handleSaveSession}
                disabled={isSaving || currentDayBlocks.length === 0}
                className={`w-full sm:w-auto px-12 py-4 rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                  isSaving || currentDayBlocks.length === 0
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-[#17cf54] text-white hover:bg-[#15b84a] shadow-[#17cf54]/20'
                }`}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : saveSuccess ? (
                  <span className="material-symbols-outlined text-[20px]">task_alt</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                )}
                {isSaving ? 'Guardando...' : saveSuccess ? 'Entrenamiento Guardado' : 'Finalizar Entrenamiento'}
              </button>
              
              {saveSuccess && (
                <p className="text-xs font-bold text-[#17cf54] uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
                  Session successfully synchronized to personal records
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
