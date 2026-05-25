import React, { useState, useEffect, useCallback } from 'react';
import { useExerciseContext } from '../../context/ExerciseContext';
import { fetchWithAuth } from '../../api';
import { unwrapList } from '../../api/unwrap';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Skeleton, SkeletonBlock, SkeletonCircle, SkeletonText } from '../../components/ui/Skeleton';

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
  const { t, language } = useLanguage();
  const { exercises, isLoading: exercisesLoading, refreshExercises } = useExerciseContext();
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [weekOffset, setWeekOffset] = useState(0);
  const [trainingProgram, setTrainingProgram] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Marca de inicio por día/semana (clave = weekOffset-day). Persiste en
  // localStorage como el resto del borrador para que cerrar la pestaña
  // no haga perder el cronómetro a mitad de entrenamiento.
  const [sessionStarts, setSessionStarts] = useState<Record<string, string>>(() => {
    try {
      if (typeof window === 'undefined' || !user?.id) return {};
      const saved = localStorage.getItem(`workout_session_starts_${user.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  useEffect(() => {
    if (user?.id) localStorage.setItem(`workout_session_starts_${user.id}`, JSON.stringify(sessionStarts));
  }, [sessionStarts, user?.id]);

  // Tick una vez por segundo para que el contador del entrenamiento se vea en
  // vivo cuando hay una sesión iniciada. Si no hay sesión activa, no hace
  // nada.
  const [now, setNow] = useState(() => Date.now());
  const activeSessionKey = `${weekOffset}-${selectedDay}`;
  const sessionStartedAt = sessionStarts[activeSessionKey] || null;
  useEffect(() => {
    if (!sessionStartedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [sessionStartedAt]);

  const elapsedSeconds = sessionStartedAt
    ? Math.max(0, Math.floor((now - new Date(sessionStartedAt).getTime()) / 1000))
    : 0;
  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const mm = m.toString().padStart(2, '0');
    const sss = ss.toString().padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${sss}` : `${mm}:${sss}`;
  };

  const startSession = () => {
    setSessionStarts(prev => ({ ...prev, [activeSessionKey]: new Date().toISOString() }));
  };
  const clearSessionStart = () => {
    setSessionStarts(prev => {
      const next = { ...prev };
      delete next[activeSessionKey];
      return next;
    });
  };
  const { user } = useAuth();
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  // Drafts are scoped to the authenticated user. On first render `user?.id`
  // can be undefined (AuthContext still resolving) — never read or write the
  // `workout_draft_undefined` key, that would cross-pollute drafts between
  // accounts on the same browser profile.
  const [allLogs, setAllLogs] = useState<Record<string, { exerciseLogs: ExerciseLogs; rpe: string; notes: string }>>(() => {
    try {
      if (typeof window === 'undefined' || !user?.id) return {};
      const saved = localStorage.getItem(`workout_draft_${user.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const logKey = `${weekOffset}-${selectedDay}`;
  const dayData = allLogs[logKey] || { exerciseLogs: {} as ExerciseLogs, rpe: '', notes: '' };
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
    const key = `${weekOffset}-${day}`;
    setAllLogs(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { exerciseLogs: {}, rpe: '', notes: '' }),
        ...data
      }
    }));
  }, [weekOffset]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`workout_draft_${user.id}`, JSON.stringify(allLogs));
    }
  }, [allLogs, user?.id]);

  useEffect(() => {
    let mounted = true;
    // ExerciseContext already caches the full catalog at app start. Avoid
    // the ~600 KB re-fetch on every visit to /training; only refresh if the
    // context is genuinely empty (e.g. first navigation after login).
    if (exercises.length === 0) refreshExercises();
    const fetchMyPlans = async () => {
      try {
        const data = await fetchWithAuth('/client/plans');
        if (!mounted) return;
        if (data && data.training && data.training.length > 0) {
          // Ignore placeholder programs that were only created to mark the
          // client as "assigned" (data_json === { is_new: true }) — they have
          // no real workout content yet.
          const realPlan = data.training.find((p: any) => {
            const dj = p?.data_json || {};
            return dj.weeklySchedule || (Array.isArray(dj.blocks) && dj.blocks.length > 0);
          });
          setTrainingProgram(realPlan || data.training[0]);
        }
      } catch (err) {
        console.error('Error fetching client training plans:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const fetchWorkoutHistory = async () => {
      try {
        const history = unwrapList(await fetchWithAuth('/client/workout-logs?limit=200'));
        if (!mounted) return;
        if (Array.isArray(history)) {
          // Compute how many ISO weeks back the log lives, so historic logs
          // hydrate under the right `${weekOffset}-${day}` key instead of
          // overwriting the current-week draft (previous behaviour clamped
          // everything to weekOffset 0).
          const startOfWeek = (d: Date) => {
            const x = new Date(d); x.setHours(0, 0, 0, 0);
            const day = x.getDay(); // 0=Sun ... 6=Sat — week starts on Monday
            const diff = (day + 6) % 7;
            x.setDate(x.getDate() - diff);
            return x;
          };
          const nowWeek = startOfWeek(new Date()).getTime();
          setAllLogs(prev => {
            const newLogs = { ...prev };
            // history is newest-first; process oldest-first so the most recent
            // log for a given day wins.
            [...history].reverse().forEach(log => {
              if (!log.day_key) return;
              const logged = log.logged_at ? new Date(log.logged_at) : null;
              const weekIdx = logged
                ? Math.round((startOfWeek(logged).getTime() - nowWeek) / (7 * 24 * 60 * 60 * 1000))
                : 0;
              const stateKey = `${weekIdx}-${log.day_key}`;

              // Rebuild the per-exercise map. Saved logs preserve the
              // original block/exercise position via `ex.key` when available;
              // fall back to a flat `0-idx` key for older logs.
              const exerciseLogs: ExerciseLogs = {};
              (log.exercises || []).forEach((ex: any, idx: number) => {
                const key = typeof ex.key === 'string' ? ex.key : `0-${idx}`;
                exerciseLogs[key] = {
                  name: ex.name,
                  muscle_group: ex.muscle_group,
                  sets_logged: ex.sets_logged || [],
                  notes: ex.notes || ''
                };
              });

              // Only seed from history if there is no unsaved local draft.
              if (!newLogs[stateKey] || Object.keys(newLogs[stateKey].exerciseLogs).length === 0) {
                newLogs[stateKey] = {
                  exerciseLogs,
                  rpe: String(log.session_rpe || ''),
                  notes: log.notes || ''
                };
              }
            });
            return newLogs;
          });
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      }
    };

    fetchMyPlans();
    fetchWorkoutHistory();
    return () => { mounted = false; };
  }, [user?.id, refreshExercises]);

  const updateExerciseLog = useCallback((key: string, field: keyof ExerciseLog, value: any) => {
    setAllLogs(prev => {
      const activeLogKey = `${weekOffset}-${selectedDay}`;
      const dayData = prev[activeLogKey] || { exerciseLogs: {}, rpe: '', notes: '' };
      return {
        ...prev,
        [activeLogKey]: {
          ...dayData,
          exerciseLogs: {
            ...dayData.exerciseLogs,
            [key]: { ...dayData.exerciseLogs[key], [field]: value }
          }
        }
      };
    });
  }, [selectedDay, weekOffset]);

  const initExerciseLog = useCallback((
    key: string,
    name: string,
    muscle_group: string,
    defaultSets: any,
    prescribed?: { weight?: string; reps?: string; rir?: string },
    setDetails?: { weight?: string; reps?: string; rir?: string }[],
  ) => {
    setAllLogs(prev => {
      const activeLogKey = `${weekOffset}-${selectedDay}`;
      const dayData = prev[activeLogKey] || { exerciseLogs: {}, rpe: '', notes: '' };
      if (dayData.exerciseLogs[key]) return prev;

      const detailCount = Array.isArray(setDetails) ? setDetails.length : 0;
      const numSets = Math.max(1, detailCount || parseInt(String(defaultSets), 10) || 1);
      // Prefilled = lo que ha prescrito el coach. Si hay setDetails, cada
      // serie hereda su propio peso/reps/rir. Si no, todas heredan el valor
      // plano del ejercicio. Sirve a la vez como valor inicial del input y
      // como "fantasma" gris cuando el cliente no lo cambia.
      const sets_logged: SetLog[] = Array.from({ length: numSets }, (_, i) => {
        const d = setDetails?.[i] || {};
        return {
          weight: String(d.weight ?? prescribed?.weight ?? ''),
          reps:   String(d.reps   ?? prescribed?.reps   ?? ''),
          rir:    String(d.rir    ?? prescribed?.rir    ?? ''),
        };
      });

      return {
        ...prev,
        [activeLogKey]: {
          ...dayData,
          exerciseLogs: {
            ...dayData.exerciseLogs,
            [key]: { name, muscle_group, sets_logged, notes: '' }
          }
        }
      };
    });
  }, [selectedDay, weekOffset]);

  const updateSet = useCallback((exKey: string, setIdx: number, field: keyof SetLog, value: string) => {
    setAllLogs(prev => {
      const activeLogKey = `${weekOffset}-${selectedDay}`;
      const dayData = prev[activeLogKey] || { exerciseLogs: {}, rpe: '', notes: '' };
      let current = dayData.exerciseLogs[exKey];
      
      if (!current) {
        // Fallback initialization if missing
        current = { name: '', sets_logged: [], notes: '' };
      }
      
      const sets_logged = current.sets_logged.map((s, i) =>
        i === setIdx ? { ...s, [field]: value } : s
      );
      
      return {
        ...prev,
        [activeLogKey]: {
          ...dayData,
          exerciseLogs: {
            ...dayData.exerciseLogs,
            [exKey]: { ...current, sets_logged }
          }
        }
      };
    });
  }, [selectedDay, weekOffset]);

  const addSet = useCallback((exKey: string) => {
    setAllLogs(prev => {
      const activeLogKey = `${weekOffset}-${selectedDay}`;
      const dayData = prev[activeLogKey] || { exerciseLogs: {}, rpe: '', notes: '' };
      let current = dayData.exerciseLogs[exKey];
      
      if (!current) {
         current = { name: '', sets_logged: [], notes: '' };
      }
      
      return {
        ...prev,
        [activeLogKey]: {
          ...dayData,
          exerciseLogs: {
            ...dayData.exerciseLogs,
            [exKey]: { ...current, sets_logged: [...current.sets_logged, { reps: '', weight: '', rir: '' }] }
          }
        }
      };
    });
  }, [selectedDay, weekOffset]);

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

  const handleSaveSession = async () => {
    if (!trainingProgram) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Las series ya vienen autocompletadas con lo prescrito, así que basta
      // con persistir lo que hay (sea el valor del coach o el que el cliente
      // haya retocado). Aun así, si por cualquier motivo un campo está vacío,
      // se rellena al vuelo con el prescrito antes de enviar.
      const exercisesToSave = (Object.entries(exerciseLogs) as [string, ExerciseLog][])
        .filter(([, ex]) => ex.sets_logged.length > 0)
        .map(([key, ex]) => {
          const sets_logged = (ex.sets_logged || []).map((s) => ({
            // Backup defensivo por si en algun caso el set llega vacio.
            weight: s.weight ?? '',
            reps:   s.reps   ?? '',
            rir:    s.rir    ?? '',
          }));
          return { ...ex, sets_logged, key };
        });

      if (exercisesToSave.length === 0) {
        setSaveError(t('nothing_to_save', { defaultValue: 'No hay series registradas para guardar.' }));
        setTimeout(() => setSaveError(null), 6000);
        setIsSaving(false);
        return;
      }

      // Si hay sesión iniciada, calculamos la duración real para que el coach
      // sepa cuánto ha tardado el cliente. Sin start, duration queda en null.
      const startedAt = sessionStartedAt;
      const durationSeconds = startedAt
        ? Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
        : null;

      await fetchWithAuth('/client/workout-logs', {
        method: 'POST',
        body: JSON.stringify({
          plan_id: trainingProgram.id,
          workout_name: currentWorkoutName || `${t(selectedDay)} ${t('session')}`,
          day_key: selectedDay,
          exercises: exercisesToSave,
          notes: sessionNotes,
          session_rpe: sessionRPE ? Number(sessionRPE) : null,
          started_at: startedAt,
          duration_seconds: durationSeconds,
        })
      });
      setSaveSuccess(true);
      setSaveError(null);
      // Sesión completada: limpiamos la marca de inicio para que la próxima
      // vez vuelva a aparecer "Iniciar entrenamiento".
      clearSessionStart();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error saving workout log:', err);
      setSaveError(err.message || t('failed_sync_database'));
      setTimeout(() => setSaveError(null), 6000);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state: render the workout layout with placeholder blocks/exercise
  // rows (3 blocks × 4 exercises with the log structure: name + 3 series of
  // weight/reps/rir inputs) so the form does not appear empty while data loads.
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#f6f8f6] dark:bg-[#112116]" aria-hidden="true">
        <div className="p-6 pb-2">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 sm:gap-6">
            <SkeletonCircle size={64} className="rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-12 w-24 rounded-xl" />
          </div>
        </div>
        <div className="flex-1 p-6 pt-2">
          {/* Week selector + sync placeholder */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm mb-6">
            <Skeleton className="h-10 w-56 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
          {/* Day selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-20 rounded-xl shrink-0" />
            ))}
          </div>
          {/* Workout summary */}
          <SkeletonBlock height={220} className="rounded-2xl mb-8" />
          {/* Workout blocks: 3 blocks, 4 exercise rows each, each row with 3 set lines */}
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, bIdx) => (
              <div key={bIdx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                  <SkeletonCircle size={40} className="rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Array.from({ length: 4 }).map((_, eIdx) => (
                    <div key={eIdx} className="p-4 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="hidden md:grid grid-cols-5 gap-2 w-1/2">
                          {Array.from({ length: 5 }).map((_, k) => (
                            <Skeleton key={k} className="h-7 w-full" />
                          ))}
                        </div>
                      </div>
                      {/* 3 set rows (weight / reps / rir inputs) */}
                      <div className="pl-0 md:pl-12 space-y-2">
                        {Array.from({ length: 3 }).map((_, sIdx) => (
                          <div key={sIdx} className="grid grid-cols-4 gap-2 items-center">
                            <Skeleton className="h-4 w-8 mx-auto" />
                            <Skeleton className="h-9 w-full rounded-xl" />
                            <Skeleton className="h-9 w-full rounded-xl" />
                            <Skeleton className="h-9 w-full rounded-xl" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!trainingProgram) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
          <span className="material-symbols-outlined text-4xl">fitness_center</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('no_training_plan_assigned')}</h2>
        <p className="text-slate-500 max-w-sm">{t('coach_has_not_published_training_plan')}</p>
      </div>
    );
  }

  const dataJson = trainingProgram.data_json || {};
  const isWeekly = !!dataJson.weeklySchedule;
  // Monthly plans: weeks 2-4 may override the base week. Pick the schedule for
  // the week of the month matching today's date.
  const weekOfMonth = Math.min(4, Math.max(1, Math.ceil(new Date().getDate() / 7)));
  const activeSchedule = (dataJson.weekOverrides && dataJson.weekOverrides[weekOfMonth]) || dataJson.weeklySchedule || {};

  let blocks: any[] = [];
  let currentWorkoutName = '';

  if (isWeekly) {
    const workoutId = activeSchedule[selectedDay];
    const workouts = dataJson.workouts || [];
    const workout = workouts.find((w: any) => w.id === workoutId);
    blocks = workout?.blocks || [];
    currentWorkoutName = workout?.name || t('rest_day');
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
          const wId = activeSchedule[d];
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
              <span>{t(d)}</span>
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
              <span className="text-slate-500">{t('training')}</span>
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
                <span className="text-slate-800 dark:text-slate-200 font-medium">{user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
              </div>
            </li>
          </ol>
        </nav>
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl shadow-sm bg-[#17cf54]/10 flex items-center justify-center text-2xl font-bold text-[#17cf54] uppercase">{user?.email?.charAt(0) || 'C'}</div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || t('client')}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">person</span> {t('client')}
              </span>
            </div>
          </div>
          <div className="px-4 py-2 bg-[#17cf54]/10 dark:bg-[#17cf54]/20 rounded-xl border border-[#17cf54]/20 dark:border-[#17cf54]/30">
            <div className="text-xs text-[#17cf54] dark:text-[#17cf54] uppercase tracking-wide font-semibold mb-1 text-center">{t('status')}</div>
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-[#17cf54]"></span> {t('active_plan')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 pt-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between shadow-sm mb-6 gap-4 sm:gap-0">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 relative">
            <button 
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="px-3 py-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 transition-all"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <div className="px-4 py-2 flex flex-col items-center min-w-[140px]">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{t('week')}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                {(() => {
                  const { monday, sunday } = getWeekRange(weekOffset);
                  return `${monday.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}`;
                })()}
              </span>
            </div>
            <button
              onClick={() => setWeekOffset(prev => Math.min(0, prev + 1))}
              disabled={weekOffset >= 0}
              className="px-3 py-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
              aria-label={t('next_week', { defaultValue: 'Semana siguiente' })}
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
          <div className="flex items-center gap-3 pr-2 w-full sm:w-auto overflow-x-auto justify-center scrollbar-hide">
            {saveSuccess && (
              <span className="text-xs font-bold text-[#17cf54] flex items-center gap-1 animate-pulse whitespace-nowrap">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                {t('workout_completed', { defaultValue: '¡Entrenamiento completado!' })}
              </span>
            )}
            {saveError && (
              <span className="text-xs font-bold text-red-500 flex items-center gap-1 whitespace-nowrap">
                <span className="material-symbols-outlined text-[16px]">error</span> {saveError}
              </span>
            )}

            {/* Cronómetro en vivo (mm:ss / hh:mm:ss) cuando la sesión está
                en marcha. Sirve también al coach: el `duration_seconds` que
                se envía con la sesión es exactamente este tiempo. */}
            {sessionStartedAt && !saveSuccess && (
              <span className="text-xs font-bold text-[#17cf54] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#17cf54]/10 border border-[#17cf54]/20 tabular-nums whitespace-nowrap">
                <span className="material-symbols-outlined text-[16px]">timer</span>
                {formatElapsed(elapsedSeconds)}
              </span>
            )}

            {/* State machine del entrenamiento:
                — Sin iniciar: "Iniciar entrenamiento" (arranca cronómetro).
                — En marcha:    "Completar entrenamiento" (guarda y resetea).
                — Guardando:    spinner.
                Bloqueado si no hay plan / ejercicios. */}
            {!sessionStartedAt ? (
              <button
                onClick={startSession}
                disabled={blocks.length === 0}
                className="bg-[#17cf54] hover:bg-[#15b84a] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold text-sm shadow-sm whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                {t('start_workout', { defaultValue: 'Iniciar entrenamiento' })}
              </button>
            ) : (
              <button
                onClick={handleSaveSession}
                disabled={isSaving}
                className="bg-black hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold text-sm shadow-sm whitespace-nowrap"
              >
                {isSaving
                  ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> {t('saving', { defaultValue: 'Guardando…' })}</>
                  : <><span className="material-symbols-outlined text-[18px]">check_circle</span> {t('complete_workout', { defaultValue: 'Completar entrenamiento' })}</>
                }
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8 pb-20">
          {renderDaySelector()}
          
          {/* Session Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-6 md:p-8 flex-shrink-0 w-full">
             <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{t('workout_summary')}</h3>
                {isWeekly && <p className="text-sm text-[#17cf54] font-medium mt-1">{currentWorkoutName}</p>}
              </div>
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
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">{t('exercises')}</span>
                </div>
              </div>
              {/* Session RPE input */}
              <div className="flex flex-col gap-4 w-full max-w-xs">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">{t('session_rpe')}</label>
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
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">{t('session_notes')}</label>
                  <textarea
                    placeholder={t('session_notes_placeholder')}
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('rest_day')}</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">{t('rest_day_training_hint')}</p>
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
                      <p className="text-xs text-slate-500">{t('exercise_count_with_subtitle', { count: block.exercises?.length || 0, subtitle: block.subtitle })}</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider pl-[4.5rem] hidden md:grid">
                  <div className="col-span-4">{t('exercise')}</div>
                  <div className="col-span-8 grid grid-cols-5 gap-2 text-center pr-12">
                    <div>{t('target')}</div><div>{t('sets')}</div><div>{t('reps_label')}</div><div>{t('rir_label')}</div><div>{t('rest')}</div>
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
                        explanation={ex.explanation}
                        setDetails={ex.setDetails}
                        onViewExercise={onViewExercise}
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
  onInit: (
    key: string,
    name: string,
    muscle_group: string,
    defaultSets: number,
    prescribed?: { weight?: string; reps?: string; rir?: string },
    setDetails?: { weight?: string; reps?: string; rir?: string }[],
  ) => void;
  onUpdateSet: (key: string, setIdx: number, field: 'reps' | 'weight' | 'rir', value: string) => void;
  onAddSet: (key: string) => void;
  onUpdateNotes: (notes: string) => void;
  explanation?: string;
  setDetails?: { set: number; reps: string; weight?: string; rir: string; intensity: string; rest: string }[];
  /** Open the read-only `ClientActivityView` for this exercise. Was passed
   *  in from ClientApp but never wired to a UI control. */
  onViewExercise?: (name: string) => void;
}

const DetailedExerciseRow: React.FC<DetailedExerciseRowProps> = ({ exKey, name, muscle_group, type, weight, sets, reps, rir, rest, logData, onInit, onUpdateSet, onAddSet, onUpdateNotes, explanation, setDetails, onViewExercise }) => {
  const { t, language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const tt = (key: string, es: string, en: string) => t(key, { defaultValue: language === 'en' ? en : es });

  useEffect(() => {
    if (!logData) {
      // Pasamos los valores prescritos por el coach (planos + por serie) para
      // que cada input arranque autocompletado en lugar de vacío.
      onInit(
        exKey,
        name,
        muscle_group || '',
        Number(sets) || 1,
        { weight: String(weight ?? ''), reps: String(reps ?? ''), rir: String(rir ?? '') },
        Array.isArray(setDetails)
          ? setDetails.map((d) => ({
              weight: d?.weight != null ? String(d.weight) : undefined,
              reps:   d?.reps   != null ? String(d.reps)   : undefined,
              rir:    d?.rir    != null ? String(d.rir)    : undefined,
            }))
          : undefined,
      );
    }
  }, [exKey, logData, onInit, name, muscle_group, sets, weight, reps, rir, setDetails]);

  const setsLogged = logData?.sets_logged || [];

  // Valores que el coach prescribe para cada serie. Si setDetails los define
  // por serie, se usan; si no, todas las series heredan el valor plano del
  // ejercicio. Sirven a la vez como "fantasma" del input y como fallback al
  // guardar (si el cliente deja un input vacío, se guarda el prescrito).
  const prescribedFor = (i: number) => {
    const d = setDetails?.[i] || {};
    return {
      weight: d.weight != null ? String(d.weight) : String(weight ?? ''),
      reps:   d.reps   != null ? String(d.reps)   : String(reps   ?? ''),
      rir:    d.rir    != null ? String(d.rir)    : String(rir    ?? ''),
    };
  };

  return (
    <div className="flex flex-col border-b border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-colors">
      <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-4 flex items-center gap-4">
          <div className="min-w-0 flex flex-col gap-1 flex-1">
            {onViewExercise ? (
              <button
                type="button"
                onClick={() => onViewExercise(name)}
                className="text-left text-sm font-semibold text-slate-900 dark:text-white truncate hover:text-[#17cf54] dark:hover:text-[#17cf54] transition-colors inline-flex items-center gap-1.5 group/name"
                title={t('exercise_view_details', { defaultValue: 'Ver detalles del ejercicio' })}
              >
                <span className="truncate">{name}</span>
                <span className="material-symbols-outlined text-[14px] opacity-0 group-hover/name:opacity-100 transition-opacity">info</span>
              </button>
            ) : (
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{name}</h4>
            )}
            <p className="text-xs text-slate-400 truncate">{type}</p>
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
          {explanation && (
            <div className="mb-6 mx-2 p-4 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-2xl border border-emerald-500/10 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[18px] text-[#17cf54]">description</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{t('coach_notes')}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {explanation}
              </p>
            </div>
          )}
          {setDetails && setDetails.length > 0 && (
            <div className="mb-6 mx-2 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px] text-[#17cf54]">view_list</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  {tt('per_set_distribution', 'Distribución por serie', 'Per-set distribution')}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>{t('set_label')}</div>
                <div>{t('reps_label')}</div>
                <div>{tt('intensity_label', 'Intensidad', 'Intensity')}</div>
                <div>{t('rir_label')}</div>
                <div>{t('rest')}</div>
              </div>
              {setDetails.map((s, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 text-center text-sm text-slate-700 dark:text-slate-300 py-1.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                  <div className="font-bold text-slate-400">#{s.set}</div>
                  <div>{s.reps || '—'}</div>
                  <div>{s.intensity || '—'}</div>
                  <div>{s.rir || '—'}</div>
                  <div>{s.rest || '—'}</div>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 flex items-center justify-end md:justify-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#17cf54]">edit_note</span>
                {t('client_log')}
              </span>
            </div>
            <div className="md:col-span-8 flex flex-col gap-3">
              {/* Cabecera del bloque de inputs: ya no hay tabla, cada serie
                  pinta su propia tarjeta con dos bloques (Coach / Tú). */}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-1">
                {t('your_log', { defaultValue: 'Tu registro · autocompletado con lo prescrito' })}
              </div>
              {/* Filas por serie: dos bloques: Coach (gris, solo lectura) + Tú
                  (inputs editables). Cada input arranca con el valor prescrito;
                  si el cliente no lo cambia, se queda gris claro (modo
                  fantasma) y al guardar se persiste tal cual. Al cambiarlo, el
                  texto vira a negro y se nota que es un dato propio. */}
              {setsLogged.map((s, i) => {
                const p = prescribedFor(i);
                const isGhost = (cur: string, pres: string) => !cur || cur === pres;
                const inputCls = (cur: string, pres: string) =>
                  `w-full text-center text-sm p-2 rounded-xl border border-[#17cf54]/30 bg-white dark:bg-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-[#17cf54]/30 focus:border-[#17cf54] transition-colors placeholder:text-slate-300 ${
                    isGhost(cur, pres)
                      ? 'text-slate-400 dark:text-slate-500'
                      : 'text-slate-900 dark:text-white'
                  }`;
                return (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-3 items-center p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                  >
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-300 md:w-10 md:text-center">
                      #{i + 1}
                    </div>
                    {/* Bloque 1 — lo prescrito por el coach (solo lectura) */}
                    <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        {t('coach_prescribed', { defaultValue: 'Coach' })}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                        <div>{p.weight || '—'}<span className="text-[10px] text-slate-400 font-medium ml-0.5">kg</span></div>
                        <div>{p.reps   || '—'}<span className="text-[10px] text-slate-400 font-medium ml-0.5">rps</span></div>
                        <div>RIR {p.rir || '—'}</div>
                      </div>
                    </div>
                    {/* Bloque 2 — lo que de verdad ha hecho el cliente */}
                    <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-[#17cf54]/30">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-[#17cf54] mb-1">
                        {t('your_value', { defaultValue: 'Tú' })}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number" min="0" step="0.5"
                          placeholder={p.weight || '—'}
                          value={s.weight}
                          onChange={e => onUpdateSet(exKey, i, 'weight', e.target.value)}
                          aria-label={t('weight_kg')}
                          className={inputCls(s.weight, p.weight)}
                        />
                        <input
                          type="number" min="0"
                          placeholder={p.reps || '—'}
                          value={s.reps}
                          onChange={e => onUpdateSet(exKey, i, 'reps', e.target.value)}
                          aria-label={t('reps_label')}
                          className={inputCls(s.reps, p.reps)}
                        />
                        <input
                          type="number" min="0" max="5"
                          placeholder={p.rir || '—'}
                          value={s.rir}
                          onChange={e => onUpdateSet(exKey, i, 'rir', e.target.value)}
                          aria-label={t('rir_label')}
                          className={inputCls(s.rir, p.rir)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Add set button */}
              <button
                onClick={() => onAddSet(exKey)}
                className="self-start text-xs font-bold text-[#17cf54] hover:text-[#15b84a] flex items-center gap-1 px-2 py-1 bg-[#17cf54]/5 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">add</span> {t('add_set')}
              </button>
              {/* Notes */}
              <div className="relative">
                <textarea
                  placeholder={t('exercise_notes_placeholder', { defaultValue: 'Notas, sensaciones, dificultades...' })}
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
