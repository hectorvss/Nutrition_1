import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useExerciseContext } from '../../context/ExerciseContext';
import { fetchWithAuth } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface ClientTrainingProps {
  onBack?: () => void;
}

interface SetLog {
  reps: string;
  weight: string;
  rir: string;
}

interface ExerciseLog {
  name: string;
  muscle_group?: string;
  sets_logged: SetLog[];
  notes: string;
}

type ExerciseLogs = Record<string, ExerciseLog>;

// --- Helper Component: Exercise Row ---
interface DetailedExerciseRowProps {
  exKey: string;
  name: string;
  type?: string;
  weight?: string;
  sets?: string | number;
  reps?: string;
  rir?: string;
  rest?: string;
  logData?: ExerciseLog;
  onInit: (key: string, name: string, defaultSets: number) => void;
  onUpdateSet: (exKey: string, setIdx: number, field: keyof SetLog, value: string) => void;
  onAddSet: (exKey: string) => void;
  onUpdateNotes: (notes: string) => void;
}

const DetailedExerciseRow: React.FC<DetailedExerciseRowProps> = ({ exKey, name, type, weight, sets, reps, rir, rest, logData, onInit, onUpdateSet, onAddSet, onUpdateNotes }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onInit(exKey, name, Number(sets) || 1);
  }, [exKey, name, sets, onInit]);

  const setsLogged = logData?.sets_logged || [];

  return (
    <div className="border-b border-slate-50 last:border-0 overflow-hidden">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-4 hover:bg-slate-50/80 transition-all cursor-pointer group ${isExpanded ? 'bg-slate-50/50' : ''}`}
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-12 md:col-span-4 flex items-center gap-3">
            <div className="cursor-grab text-slate-200 group-hover:text-slate-400 shrink-0">
              <span className="material-symbols-outlined text-[20px]">drag_handle</span>
            </div>
            <div className="min-w-0 flex flex-col flex-1 gap-0.5">
              <h4 className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
                {name}
                <span className={`material-symbols-outlined text-[16px] transition-transform ${isExpanded ? 'rotate-90 text-blue-500' : 'text-slate-300'}`}>chevron_right</span>
              </h4>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{type || 'COMPUESTO'}</p>
                <button className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">videocam</span> Video
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-8 grid grid-cols-5 gap-2 relative pr-12 text-center" onClick={(e) => e.stopPropagation()}>
             <div className="text-[11px] font-bold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm">{weight}</div>
             <div className="text-[11px] font-bold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm">{sets}</div>
             <div className="text-[11px] font-bold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm">{reps}</div>
             <div className="text-[11px] font-bold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm">{rir}</div>
             <div className="text-[11px] font-bold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm">{rest}</div>
             
             <button 
               onClick={() => setIsExpanded(!isExpanded)}
               className={`absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-500 rounded-full transition-all flex items-center justify-center ${isExpanded ? 'bg-blue-50 text-blue-500' : ''}`}
             >
               <span className="material-symbols-outlined text-[20px]">{isExpanded ? 'expand_less' : 'expand_more'}</span>
             </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-8 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-6 px-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-blue-500">edit_note</span>
              Exercise Log
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-1">
                <div>Set</div><div>Weight</div><div>Reps</div><div>RIR</div>
              </div>
              {setsLogged.map((s, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2">
                  <div className="h-11 flex items-center justify-center text-xs font-bold text-slate-300">#{idx+1}</div>
                  <input 
                    className="h-11 text-center text-sm font-bold bg-white border border-slate-200 rounded-2xl text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all" 
                    placeholder="kg" 
                    value={s.weight} 
                    onChange={(e) => onUpdateSet(exKey, idx, 'weight', e.target.value)}
                  />
                  <input 
                    className="h-11 text-center text-sm font-bold bg-white border border-slate-200 rounded-2xl text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all" 
                    placeholder="reps" 
                    value={s.reps} 
                    onChange={(e) => onUpdateSet(exKey, idx, 'reps', e.target.value)}
                  />
                  <select 
                    className="h-11 text-center text-[10px] font-bold bg-white border border-slate-200 rounded-2xl text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all appearance-none" 
                    value={s.rir} 
                    onChange={(e) => onUpdateSet(exKey, idx, 'rir', e.target.value)}
                  >
                     <option value="">RIR</option>
                     {[0,0.5,1,1.5,2,2.5,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              ))}
              <button 
                onClick={() => onAddSet(exKey)}
                className="w-full py-2.5 rounded-2xl border border-dashed border-slate-200 text-[10px] font-bold text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all uppercase tracking-widest flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add</span> Add Set
              </button>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Notes & Sensations</label>
              <textarea 
                className="w-full p-4 rounded-3xl bg-white border border-slate-200 min-h-[140px] text-sm text-slate-600 outline-none focus:ring-1 focus:ring-blue-500 resize-none font-medium placeholder:text-slate-300 shadow-sm"
                placeholder="How did this exercise feel?"
                value={logData?.notes || ''}
                onChange={(e) => onUpdateNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Portal Component ---
export default function ClientTraining({ onBack }: ClientTrainingProps) {
  const { exercises, refreshExercises } = useExerciseContext();
  const { user } = useAuth();
  
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [trainingProgram, setTrainingProgram] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Persistence of drafts
  const [allLogs, setAllLogs] = useState<Record<string, { exerciseLogs: ExerciseLogs; rpe: string; notes: string }>>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`workout_draft_${user?.id}`) : null;
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  const dayData = allLogs[selectedDay] || { exerciseLogs: {} as ExerciseLogs, rpe: '', notes: '' };
  const exerciseLogs = dayData.exerciseLogs || {};
  const sessionRPE = dayData.rpe || '';
  const sessionNotes = dayData.notes || '';

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
        if (plansData?.training?.length > 0) setTrainingProgram(plansData.training[0]);
        if (roadmapData?.data_json) {
          setRoadmap(roadmapData);
          if (roadmapData.currentWeek) setSelectedWeek(roadmapData.currentWeek);
        }
      } catch (err) { console.error('Error:', err); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [refreshExercises]);

  const updateExerciseLog = useCallback((key: string, field: keyof ExerciseLog, value: any) => {
    setAllLogs(prev => {
      const d = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      return { ...prev, [selectedDay]: { ...d, exerciseLogs: { ...d.exerciseLogs, [key]: { ...d.exerciseLogs[key], [field]: value } } } };
    });
  }, [selectedDay]);

  const initExerciseLog = useCallback((key: string, name: string, defaultSets: number) => {
    setAllLogs(prev => {
      const d = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      if (d.exerciseLogs[key]) return prev;
      const numSets = Math.max(1, parseInt(String(defaultSets), 10) || 1);
      const sets_logged: SetLog[] = Array.from({ length: numSets }, () => ({ reps: '', weight: '', rir: '' }));
      return { ...prev, [selectedDay]: { ...d, exerciseLogs: { ...d.exerciseLogs, [key]: { name, sets_logged, notes: '' } } } };
    });
  }, [selectedDay]);

  const updateSet = useCallback((exKey: string, setIdx: number, field: keyof SetLog, value: string) => {
    setAllLogs(prev => {
      const d = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      const current = d.exerciseLogs[exKey];
      if (!current) return prev;
      const sets_logged = current.sets_logged.map((s, i) => i === setIdx ? { ...s, [field]: value } : s);
      return { ...prev, [selectedDay]: { ...d, exerciseLogs: { ...d.exerciseLogs, [exKey]: { ...current, sets_logged } } } };
    });
  }, [selectedDay]);

  const addSet = useCallback((exKey: string) => {
    setAllLogs(prev => {
      const d = prev[selectedDay] || { exerciseLogs: {}, rpe: '', notes: '' };
      const current = d.exerciseLogs[exKey];
      if (!current) return prev;
      return { ...prev, [selectedDay]: { ...d, exerciseLogs: { ...d.exerciseLogs, [exKey]: { ...current, sets_logged: [...current.sets_logged, { reps: '', weight: '', rir: '' }] } } } };
    });
  }, [selectedDay]);

  const getLoggedAtDate = (dayKey: string, weekNum: number): string => {
    const daysArr = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const targetIdx = daysArr.indexOf(dayKey.toLowerCase());
    let baseDate = roadmap?.startDate ? new Date(roadmap.startDate) : new Date();
    if (!roadmap?.startDate) {
      const currentDay = baseDate.getDay();
      baseDate.setDate(baseDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    }
    const offset = (weekNum - 1) * 7 + (targetIdx === -1 ? 0 : targetIdx);
    const finalDate = new Date(baseDate);
    finalDate.setDate(baseDate.getDate() + offset);
    return finalDate.toISOString();
  };

  const handleSaveSession = async () => {
    if (!trainingProgram) return;
    setIsSaving(true);
    try {
      const itemsToSave = Object.values(exerciseLogs).filter(ex => ex.sets_logged.some(s => s.weight || s.reps));
      if (itemsToSave.length === 0) return;
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
    } catch (err) { console.error('Save error:', err); }
    finally { setIsSaving(false); }
  };

  const currentWorkout = trainingProgram?.data_json?.workouts?.find((w: any) => w.id === trainingProgram?.data_json?.weeklySchedule?.[selectedDay]);
  const blocks = currentWorkout?.blocks || [];
  const totalExercises = blocks.reduce((acc: number, b: any) => acc + (b.exercises?.length || 0), 0);
  const completedCount = (Object.values(exerciseLogs) as ExerciseLog[]).filter(ex => ex.sets_logged.some(s => s.weight && s.reps)).length;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white gap-4 h-screen">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Workout...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* --- HEADER (Cloning Manager Style) --- */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="h-10 w-px bg-slate-100 mx-2"></div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-100 flex items-center justify-center text-white font-black text-sm uppercase">
               {user?.name?.slice(0,2) || 'CL'}
             </div>
             <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">{user?.name || 'Client'}</h2>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Training</span>
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                </div>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {saveSuccess && (
             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-in fade-in slide-in-from-right-2">Workout Synchronized!</span>
           )}
           <button 
             onClick={handleSaveSession}
             disabled={isSaving || blocks.length === 0}
             className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 font-bold text-sm disabled:opacity-40 active:scale-95"
           >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-[18px]">{saveSuccess ? 'task_alt' : 'save'}</span>
              )}
              {isSaving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save'}
           </button>
        </div>
      </header>

      {/* --- CONTENT AREA (2 Columns) --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* Main Column */}
          <div className="flex-1 space-y-8">
            {/* Week & Day Selector (Clean integrated style) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-10 flex flex-col md:flex-row items-center gap-10">
               {/* Week Selector */}
               <div className="flex-shrink-0">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Progression Timeline</p>
                  <div className="flex items-center bg-slate-50 p-1.5 rounded-[22px] border border-slate-100 shadow-sm">
                    {[1,2,3,4,5,6,7,8].map(w => (
                      <button
                        key={w}
                        onClick={() => setSelectedWeek(w)}
                        className={`w-10 h-10 rounded-full text-xs font-black transition-all ${selectedWeek === w ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                      >{w}</button>
                    ))}
                  </div>
               </div>
               {/* Day Navigator */}
               <div className="flex-1 w-full overflow-x-auto scrollbar-hide">
                  <div className="flex items-center gap-3">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const dayKey = day.toLowerCase();
                      const isActive = selectedDay === dayKey;
                      const hasWorkout = trainingProgram?.data_json?.weeklySchedule?.[dayKey];
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(dayKey)}
                          className={`flex-1 min-w-[110px] p-5 rounded-[28px] text-center transition-all border ${
                            isActive 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/10' 
                              : 'bg-white border-slate-100 text-slate-400 hover:border-blue-500/30'
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-900'}`}>{day.slice(0,3)}</span>
                          <div className={`w-1 h-1 rounded-full mx-auto mt-1 ${isActive ? 'bg-white' : hasWorkout ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                        </button>
                      );
                    })}
                  </div>
               </div>
            </div>

            {/* Blocks List */}
            <div className="space-y-10">
              {blocks.length === 0 ? (
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm py-32 flex flex-col items-center justify-center text-center gap-2">
                   <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2">
                      <span className="material-symbols-outlined text-3xl">bedtime</span>
                   </div>
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Recovery Day</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Focus on quality rest and recovery</p>
                </div>
              ) : (
                blocks.map((block: any, bIdx: number) => (
                  <div key={bIdx} className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl ${block.iconBg || 'bg-slate-900 text-white'} flex items-center justify-center shadow-md`}>
                          <span className="material-symbols-outlined text-[24px]">{block.icon || 'star'}</span>
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900 text-sm leading-none">{block.name}</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{block.subtitle}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden md:grid grid-cols-12 gap-4 px-10 py-5 bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pl-[4.5rem]">
                      <div className="col-span-4 text-left">Exercise Selection</div>
                      <div className="col-span-8 grid grid-cols-5 gap-2 text-center pr-12">
                        <div>Weight</div><div>Sets</div><div>Reps</div><div>RIR</div><div>Rest</div>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {block.exercises.map((ex: any, eIdx: number) => (
                        <DetailedExerciseRow
                          key={`${selectedWeek}-${selectedDay}-${bIdx}-${eIdx}`}
                          exKey={`${bIdx}-${eIdx}`}
                          name={ex.name}
                          type={ex.type}
                          weight={ex.weight}
                          sets={ex.sets}
                          reps={ex.reps}
                          rir={ex.rir}
                          rest={ex.rest}
                          logData={exerciseLogs[`${bIdx}-${eIdx}`]}
                          onInit={initExerciseLog}
                          onUpdateSet={updateSet}
                          onAddSet={addSet}
                          onUpdateNotes={(n) => updateExerciseLog(`${bIdx}-${eIdx}`, 'notes', n)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="w-full lg:w-[400px] flex flex-col gap-8 shrink-0">
            {/* Workout Summary Card */}
            <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm p-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Workout Summary</h3>
                <span className="material-symbols-outlined text-slate-300">info</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-slate-100" cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" strokeWidth="4" />
                    {totalExercises > 0 && (
                      <circle 
                        className="text-blue-600 transition-all duration-1000" 
                        cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" strokeWidth="4" 
                        strokeDasharray={`${(completedCount / (totalExercises || 1)) * 100} 100`} 
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <h4 className="text-4xl font-black text-slate-900 leading-none">{completedCount}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Logged</p>
                  </div>
                </div>
                
                <div className="mt-10 w-full space-y-4">
                   <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">Total Tasks</span>
                      <span className="text-slate-900">{totalExercises}</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all" style={{ width: `${(completedCount / (totalExercises || 1)) * 100}%` }}></div>
                   </div>
                </div>
              </div>
            </div>

            {/* Session Feedback Card */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-10 space-y-8">
               <div className="space-y-4">
                  <header>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">RPE Feedback</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">External perceive exertion for the entire session</p>
                  </header>
                  <div className="flex flex-wrap gap-2.5">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button
                        key={n}
                        onClick={() => setDayData(selectedDay, { rpe: String(n) })}
                        className={`w-9 h-9 rounded-2xl text-[11px] font-black transition-all border ${
                          sessionRPE === String(n)
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/10'
                            : 'bg-white border-slate-200 text-slate-400 hover:border-blue-500/30 shadow-sm'
                        }`}
                      >{n}</button>
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Post-Workout Notes</h3>
                  <textarea 
                    className="w-full p-6 pb-20 rounded-[32px] bg-slate-50/50 border border-slate-100 text-sm font-medium text-slate-600 outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none shadow-inner placeholder:text-slate-300"
                    placeholder="Physical sensations or flags..."
                    value={sessionNotes}
                    onChange={(e) => setDayData(selectedDay, { notes: e.target.value })}
                  />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
