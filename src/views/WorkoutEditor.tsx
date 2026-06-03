import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useClient } from '../context/ClientContext';
import { useExerciseContext, Exercise } from '../context/ExerciseContext';
import { fetchWithAuth } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { matchExercise } from '../lib/search';
import { arrayMove } from '@dnd-kit/sortable';
import { SortableList } from '../components/dnd/SortableList';
import { SortableItem } from '../components/dnd/SortableItem';
import { useToast } from '../components/ui/Toast';

interface WorkoutEditorProps {
  onBack: () => void;
  onEditActivity: (activityId: string, activityName?: string) => void;
  clientId?: string | null;
  dayId?: string | null;
  mode?: 'default' | 'blank';
  initialPlanData?: any;
  /** When set, edits a training TEMPLATE instead of a client program. */
  templateId?: string | null;
}

interface SetDetail {
  set: number;
  reps: string;
  weight?: string;
  rir: string;
  intensity: string;
  rest: string;
}

interface PlannedExercise {
  id: string;
  exerciseId: string;
  name: string;
  type: string;
  weight: string;
  sets: string;
  reps: string;
  rir: string;
  rest: string;
  intensity?: string;
  tempo?: string;
  notes?: string;
  explanation?: string;
  setDetails?: SetDetail[];
}

interface WorkoutBlock {
  id: number;
  name: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  exercises: PlannedExercise[];
}

interface WorkoutLogExpansionProps {
  exercise: PlannedExercise;
  onUpdateExplanation: (text: string) => void;
  onUpdateSetDetails: (setDetails: SetDetail[] | undefined) => void;
}

const WorkoutLogExpansion: React.FC<WorkoutLogExpansionProps> = ({ exercise, onUpdateExplanation, onUpdateSetDetails }) => {
  const { t, language } = useLanguage();
  const setDetails = exercise.setDetails || [];

  const tt = (key: string, es: string, en: string) =>
    t(key, { defaultValue: language === 'en' ? en : es });

  const makeRow = (n: number): SetDetail => ({
    set: n,
    reps: exercise.reps || '',
    weight: exercise.weight && exercise.weight !== '-' ? exercise.weight : '',
    rir: exercise.rir || '',
    intensity: exercise.intensity || '',
    rest: exercise.rest || '',
  });

  const addSetRow = () => {
    onUpdateSetDetails([...setDetails, makeRow(setDetails.length + 1)]);
  };

  const removeSetRow = (idx: number) => {
    const next = setDetails
      .filter((_, i) => i !== idx)
      .map((r, i) => ({ ...r, set: i + 1 }));
    onUpdateSetDetails(next.length ? next : undefined);
  };

  const updateSetField = (idx: number, field: keyof SetDetail, value: string) => {
    onUpdateSetDetails(setDetails.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  // Sync the per-set rows to the flat `sets` count.
  const syncFromSetsCount = () => {
    const target = parseInt(exercise.sets, 10) || 0;
    if (target <= 0) {
      onUpdateSetDetails(undefined);
      return;
    }
    let next = [...setDetails];
    if (target > next.length) {
      for (let i = next.length; i < target; i++) next.push(makeRow(i + 1));
    } else if (target < next.length) {
      next = next.slice(0, target);
    }
    onUpdateSetDetails(next.map((r, i) => ({ ...r, set: i + 1 })));
  };

  const countMismatch =
    setDetails.length > 0 && setDetails.length !== (parseInt(exercise.sets, 10) || 0);

  return (
    <div className="px-6 py-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
      <div className="flex flex-col gap-6">
        {/* Per-set distribution editor */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-500">view_list</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                {tt('per_set_distribution', 'Distribución por serie', 'Per-set distribution')}
              </span>
            </div>
            {countMismatch && (
              <button
                onClick={syncFromSetsCount}
                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">sync</span>
                {tt('sync_set_rows', 'Sincronizar con series', 'Sync to sets count')}
              </button>
            )}
          </div>

          {setDetails.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-12 gap-2 px-1 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                <div className="col-span-1">{tt('set_label', 'Serie', 'Set')}</div>
                <div className="col-span-2">{t('reps_label')}</div>
                <div className="col-span-2">{t('weight')}</div>
                <div className="col-span-2">{t('rir_label')}</div>
                <div className="col-span-2">{tt('intensity_label', 'Intensidad', 'Intensity')}</div>
                <div className="col-span-2">{t('rest')}</div>
                <div className="col-span-1"></div>
              </div>
              {setDetails.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 text-center text-xs font-bold text-slate-400 dark:text-slate-500">#{row.set}</div>
                  <input className="col-span-2 w-full text-center text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={row.reps} onChange={(e) => updateSetField(idx, 'reps', e.target.value)} />
                  <input className="col-span-2 w-full text-center text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={row.weight || ''} onChange={(e) => updateSetField(idx, 'weight', e.target.value)} />
                  <input className="col-span-2 w-full text-center text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={row.rir} onChange={(e) => updateSetField(idx, 'rir', e.target.value)} />
                  <input className="col-span-2 w-full text-center text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={row.intensity} onChange={(e) => updateSetField(idx, 'intensity', e.target.value)} />
                  <input className="col-span-2 w-full text-center text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={row.rest} onChange={(e) => updateSetField(idx, 'rest', e.target.value)} />
                  <button onClick={() => removeSetRow(idx)} className="col-span-1 flex items-center justify-center p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addSetRow}
            className="self-start text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            {tt('add_set_row', 'Añadir serie', 'Add set row')}
          </button>
          {setDetails.length === 0 && (
            <p className="text-[9px] text-slate-400 px-1 italic">
              {tt('per_set_hint', 'Opcional: define cada serie de forma individual.', 'Optional: define each set individually.')}
            </p>
          )}
        </div>

        {/* Explanation */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-[18px] text-emerald-500">description</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('exercise_explanation')}</span>
          </div>
          <textarea
            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-h-[100px] text-sm text-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/50 resize-none font-medium placeholder:text-slate-300 dark:placeholder:text-slate-500 transition-all shadow-sm"
            placeholder={t('exercise_explanation_placeholder')}
            value={exercise.explanation || ""}
            onChange={(e) => onUpdateExplanation(e.target.value)}
          />
          <p className="text-[9px] text-slate-400 px-1 italic">{t('exercise_explanation_mobile_hint')}</p>
        </div>
      </div>
    </div>
  );
};

export default function WorkoutEditor({ onBack, onEditActivity, clientId, dayId, mode = 'default', initialPlanData, templateId }: WorkoutEditorProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { clients } = useClient();
  const { exercises } = useExerciseContext();
  const client = clients.find(c => c.id === clientId as any) || {
    name: t('unknown_client'),
    avatar: '',
    online: false,
    phase: t('no_phase')
  };
  const isBlank = mode === 'blank';

  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [fullPlanData, setFullPlanData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load existing program on mount
  React.useEffect(() => {
    const loadProgram = async () => {
      // If we have initialPlanData (from a template selection), use it
      if (initialPlanData) {
        const dataJson = initialPlanData.data_json || initialPlanData;
        setFullPlanData(dataJson);
        
        if (dayId && dataJson.weeklySchedule) {
          const workoutId = dataJson.weeklySchedule[dayId];
          const workouts = dataJson.workouts || [];
          const workout = workouts.find((w: any) => w.id === workoutId);
          if (workout && workout.blocks) {
            setBlocks(workout.blocks);
          } else {
            setBlocks([]);
          }
        } else if (dataJson.blocks) {
          setBlocks(dataJson.blocks);
        } else {
          setBlocks([]);
        }
        return;
      }

      // Template mode — load the workout for this day from a template.
      if (templateId) {
        setIsLoading(true);
        setLoadError(null);
        try {
          const data = await fetchWithAuth(`/manager/training-templates/${templateId}`);
          const dj = data?.data_json || {};
          setFullPlanData(dj);
          if (dayId && dj.weeklySchedule) {
            const w = (dj.workouts || []).find((x: any) => x.id === dj.weeklySchedule[dayId]);
            setBlocks(w?.blocks || []);
          } else {
            setBlocks(dj.blocks || []);
          }
        } catch (err: any) {
          console.error('Error loading training template:', err);
          setLoadError(err?.message || t('error_loading_data'));
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (!clientId) return;
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await fetchWithAuth(`/manager/clients/${clientId}/training-program`);
        if (data && data.data_json) {
          setFullPlanData(data.data_json);
          const dataJson = data.data_json;
          
          if (dayId && dataJson.weeklySchedule) {
            const workoutId = dataJson.weeklySchedule[dayId];
            const workouts = dataJson.workouts || [];
            const workout = workouts.find((w: any) => w.id === workoutId);
            if (workout && workout.blocks) {
              setBlocks(workout.blocks);
            } else {
              setBlocks([]);
            }
          } else if (dataJson.blocks) {
            setBlocks(dataJson.blocks);
          } else {
            setBlocks([]);
          }
        } else {
          // No plan found: start with an empty editor, never inject mock exercises.
          setBlocks([]);
        }
      } catch (err: any) {
        console.error('Error loading training program:', err);
        setLoadError(err?.message || t('error_loading_data'));
      } finally {
        setIsLoading(false);
      }
    };
    loadProgram();
  }, [clientId, isBlank, dayId, initialPlanData, templateId]);

  const buildDataJson = () => {
    let newDataJson = { ...fullPlanData };
    if (dayId && newDataJson.weeklySchedule) {
      let workoutId = newDataJson.weeklySchedule[dayId];
      let workouts = newDataJson.workouts || [];
      if (workoutId) {
        workouts = workouts.map((w: any) => w.id === workoutId ? { ...w, blocks } : w);
      } else {
        workoutId = `w_${Date.now()}`;
        workouts.push({ id: workoutId, name: `${t('training')} ${t(dayId)}`, blocks });
        newDataJson.weeklySchedule[dayId] = workoutId;
      }
      newDataJson.workouts = workouts;
      newDataJson.type = newDataJson.type === 'template' ? 'template' : 'weekly';
    } else {
      newDataJson.blocks = blocks;
    }
    return newDataJson;
  };

  const saveProgram = async () => {
    // Template mode — persist the workout back into the template.
    if (templateId) {
      setIsSaving(true);
      try {
        const dj = buildDataJson();
        await fetchWithAuth(`/manager/training-templates/${templateId}`, {
          method: 'PUT',
          body: JSON.stringify({ data_json: dj }),
        });
        setFullPlanData(dj);
        showToast(t('program_saved_success'), 'success');
      } catch (err) {
        console.error('Error saving training template:', err);
        showToast(t('save_program_error'), 'error');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (!clientId) return;
    setIsSaving(true);
    try {
      let newDataJson = { ...fullPlanData };

      if (dayId && newDataJson.weeklySchedule) {
        // Find existing workout ID
        let workoutId = newDataJson.weeklySchedule[dayId];
        let workouts = newDataJson.workouts || [];
        
        if (workoutId) {
          // Update existing
          workouts = workouts.map((w: any) => w.id === workoutId ? { ...w, blocks } : w);
        } else {
          // Create new workout for this day
          workoutId = `w_${Date.now()}`;
          const dayName = t(dayId);
          workouts.push({
            id: workoutId,
            name: `${t('training')} ${dayName}`,
            blocks
          });
          newDataJson.weeklySchedule[dayId] = workoutId;
        }
        newDataJson.workouts = workouts;
        newDataJson.type = 'weekly';
      } else {
        // Flat mode
        newDataJson.blocks = blocks;
      }

      await fetchWithAuth(`/manager/clients/${clientId}/training-program`, {
        method: 'POST',
        body: JSON.stringify({
          name: `Programa de Entrenamiento - ${client.name}`,
          data_json: newDataJson
        })
      });
      setFullPlanData(newDataJson);
      alert(t('program_saved_success'));
    } catch (err) {
      console.error('Error saving training program:', err);
      alert(t('save_program_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  
  // Drag and drop state
  const dragExerciseRef = useRef<Exercise | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<number | null>(null);

  // Edit blocks inline
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [editingBlockName, setEditingBlockName] = useState('');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const filteredExercises = exercises.filter(ex => matchExercise(ex, searchQuery));

  // Drag from Library
  const handleDragStart = (ex: Exercise) => {
    dragExerciseRef.current = ex;
  };

  const handleDragOver = useCallback((e: React.DragEvent, blockId: number) => {
    e.preventDefault();
    if (dragExerciseRef.current) setDragOverBlockId(blockId);
  }, []);

  const handleDragLeave = useCallback(() => setDragOverBlockId(null), []);

  const handleDrop = useCallback((e: React.DragEvent, blockId: number) => {
    e.preventDefault();
    setDragOverBlockId(null);
    if (!dragExerciseRef.current) return;
    
    const ex = dragExerciseRef.current;
    const newEx: PlannedExercise = {
      id: `${Date.now()}-${Math.random()}`,
      exerciseId: ex.id,
      name: ex.name,
      type: ex.type || 'Standard',
      weight: '-',
      sets: '3',
      reps: '10',
      rir: '2',
      rest: '90s',
      explanation: ''
    };

    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, exercises: [...b.exercises, newEx] } : b));
    dragExerciseRef.current = null;
  }, []);

  // Block reorder via @dnd-kit (keyboard + pointer, screen-reader announcements)
  const handleBlockReorder = (activeId: string, overId: string) => {
    setBlocks(prev => {
      const fromIdx = prev.findIndex(b => String(b.id) === activeId);
      const toIdx = prev.findIndex(b => String(b.id) === overId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      return arrayMove(prev, fromIdx, toIdx);
    });
  };

  const addBlock = () => {
    const icons = ['fitness_center', 'arrow_warm_up', 'self_improvement', 'run_circle'];
    const colors = ['bg-blue-50 text-blue-600', 'bg-orange-50 text-orange-600', 'bg-teal-50 text-teal-600', 'bg-purple-50 text-purple-600'];
    const idx = blocks.length;
    setBlocks(prev => [
      ...prev,
      {
        id: Date.now(),
        name: t('new_training_block'),
        subtitle: t('custom_block_sub'),
        icon: icons[idx % icons.length],
        iconBg: colors[idx % colors.length],
        exercises: []
      }
    ]);
  };

  const removeBlock = (id: number) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const removeExercise = (blockId: number, exId: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, exercises: b.exercises.filter(e => e.id !== exId) } : b));
  };
  
  const updateExerciseField = (blockId: number, exId: string, field: keyof PlannedExercise, value: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? {
      ...b,
      exercises: b.exercises.map(e => e.id === exId ? { ...e, [field]: value } : e)
    } : b));
  };

  const updateExerciseSetDetails = (blockId: number, exId: string, setDetails: SetDetail[] | undefined) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? {
      ...b,
      exercises: b.exercises.map(e => e.id === exId ? { ...e, setDetails } : e)
    } : b));
  };
  
  const startEditBlockName = (block: WorkoutBlock) => {
    setEditingBlockId(block.id);
    setEditingBlockName(block.name);
  };
  
  const commitEditBlockName = () => {
    if (editingBlockId) {
      setBlocks(prev => prev.map(b => b.id === editingBlockId ? { ...b, name: editingBlockName || b.name } : b));
    }
    setEditingBlockId(null);
  };

  const totalExercises = blocks.reduce((acc, b) => acc + b.exercises.length, 0);
  const totalSets = blocks.reduce(
    (acc, b) => acc + b.exercises.reduce((s, e) => s + (parseInt(e.sets, 10) || 0), 0),
    0
  );

  // Workout summary card — rendered below the exercise library so the library
  // stays within easy drag-and-drop reach of the workout blocks.
  const WORKOUT_SUMMARY = (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-8 shrink-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white">{t('workout_summary')}</h3>
              </div>
              <div className="flex flex-col items-center">
                <div className={`relative w-44 h-44 ${totalExercises === 0 ? 'opacity-40 grayscale' : ''}`}>
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-slate-100 dark:text-slate-800" cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" strokeWidth="3.5" />
                    {totalExercises > 0 && (
                      <circle className="text-emerald-500" cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" strokeWidth="3.5" strokeDasharray="100 100" strokeLinecap="round" />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className={`text-3xl font-black leading-none ${totalExercises === 0 ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{totalExercises}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('exercises')}</span>
                  </div>
                </div>
                <div className="mt-8 w-full text-center">
                  {totalExercises === 0 ? (
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('add_exercises_for_breakdown')}</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 w-full">
                      <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{blocks.length}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('blocks_label', { defaultValue: 'Bloques' })}</span>
                      </div>
                      <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalExercises}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('exercises')}</span>
                      </div>
                      <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalSets}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('sets_label', { defaultValue: 'Series' })}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="h-10 w-px bg-slate-100 dark:bg-slate-800 mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-cover bg-center border border-slate-100 dark:border-slate-800" style={{ backgroundImage: `url("${client.avatar}")` }}></div>
              {client.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{client.name}</h2>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>{t('training')}</span>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span>{isBlank ? t('new_workout_plan') : client.phase}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isBlank && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">
              {t('draft_not_saved')}
            </span>
          )}
          <button
            onClick={saveProgram}
            disabled={isSaving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-bold text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">{isSaving ? 'sync' : 'save'}</span>
            {isSaving ? t('saving') : t('save')}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Left Column: Workout Blocks */}
          <div className="flex-1 flex flex-col gap-6 pr-2 pb-20">
            {loadError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-3">
                <span className="material-symbols-outlined text-4xl text-red-400">error</span>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{loadError}</p>
              </div>
            )}
            <SortableList<WorkoutBlock>
              items={blocks}
              getId={(b) => String(b.id)}
              onReorder={handleBlockReorder}
              getLabel={(b) => b.name}
            >
            {blocks.map((block) => {
              const isDropTarget = dragOverBlockId === block.id;

              return (
                <React.Fragment key={block.id}>
                <SortableItem
                  id={String(block.id)}
                  ariaLabel={`${block.name}, position ${blocks.indexOf(block) + 1} of ${blocks.length}. Press Space to reorder.`}
                >
                  {({ dragHandleProps, isDragging }) => (
                  <div
                    className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all overflow-hidden ${isDragging ? 'opacity-50' : ''} ${isDropTarget ? 'border-emerald-400 shadow-emerald-100 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800 shadow-sm'}`}
                  >
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 mr-2 focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:rounded">
                         <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                      </div>
                      <div className={`w-10 h-10 rounded-xl ${block.iconBg} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-[24px]">{block.icon}</span>
                      </div>
                      <div>
                        {editingBlockId === block.id ? (
                           <input
                             autoFocus
                             className="text-sm font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-emerald-500 outline-none w-48"
                             value={editingBlockName}
                             onChange={(e) => setEditingBlockName(e.target.value)}
                             onBlur={commitEditBlockName}
                             onKeyDown={(e) => { if (e.key === 'Enter') commitEditBlockName(); }}
                           />
                        ) : (
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                            {block.name}
                            <button onClick={() => startEditBlockName(block)} className="text-slate-300 dark:text-slate-600 hover:text-emerald-500 transition-colors">
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                          </h3>
                        )}
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {t('exercise_count_with_subtitle', { count: block.exercises.length, subtitle: block.subtitle })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => removeBlock(block.id)} className="p-2 rounded-xl text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 grid grid-cols-12 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-[4.5rem] hidden md:grid">
                    <div className="col-span-4">{t('exercise')}</div>
                    <div className="col-span-8 grid grid-cols-5 gap-2 text-center pr-24">
                      <div>{t('weight')}</div><div>{t('sets')}</div><div>{t('reps_label')}</div><div>{t('rir_label')}</div><div>{t('rest')}</div>
                    </div>
                  </div>

                  <div 
                    className="min-h-[100px]"
                    onDragOver={(e) => { e.preventDefault(); if (dragExerciseRef.current) setDragOverBlockId(block.id); }}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, block.id)}
                  >
                    {block.exercises.length === 0 ? (
                      <div className={`py-12 flex flex-col items-center justify-center text-center transition-colors ${isDropTarget ? 'bg-emerald-50' : ''}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDropTarget ? 'bg-emerald-100 text-emerald-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>
                          <span className="material-symbols-outlined text-[24px]">assignment_add</span>
                        </div>
                        <p className={`text-sm font-bold uppercase tracking-widest ${isDropTarget ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {isDropTarget ? t('drop_exercise_here') : t('drag_exercise_here')}
                        </p>
                      </div>
                    ) : (
                      <div className={`divide-y divide-slate-100 dark:divide-slate-800 ${isDropTarget ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}>
                        {block.exercises.map((ex) => {
                          const isExpanded = expandedExerciseId === ex.id;
                          return (
                            <div key={ex.id} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                              <div
                                onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                                className={`p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer group ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}`}
                              >
                                <div className="grid grid-cols-12 gap-4 items-center">
                                  <div className="col-span-4 flex items-center gap-3">
                                    <div className="min-w-0 flex flex-col gap-1 flex-1">
                                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
                                        {ex.name}
                                      </h4>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{ex.type}</p>
                                    </div>
                                  </div>
                                  <div className="col-span-8 grid grid-cols-5 gap-2 relative pr-24" onClick={(e) => e.stopPropagation()}>
                                    <input className="w-full text-center text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={ex.weight} onChange={(e) => updateExerciseField(block.id, ex.id, 'weight', e.target.value)} />
                                    <input className="w-full text-center text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={ex.sets} onChange={(e) => updateExerciseField(block.id, ex.id, 'sets', e.target.value)} />
                                    <input className="w-full text-center text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={ex.reps} onChange={(e) => updateExerciseField(block.id, ex.id, 'reps', e.target.value)} />
                                    <input className="w-full text-center text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={ex.rir} onChange={(e) => updateExerciseField(block.id, ex.id, 'rir', e.target.value)} />
                                    <input className="w-full text-center text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={ex.rest} onChange={(e) => updateExerciseField(block.id, ex.id, 'rest', e.target.value)} />
                                    
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEditActivity(ex.exerciseId, ex.name)} className="p-1 text-slate-300 dark:text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-colors mr-1">
                                          <span className="material-symbols-outlined text-[16px]">info</span>
                                        </button>
                                        <button onClick={() => removeExercise(block.id, ex.id)} className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                                          <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {isExpanded && (
                                <WorkoutLogExpansion
                                  exercise={ex}
                                  onUpdateExplanation={(text) => updateExerciseField(block.id, ex.id, 'explanation', text)}
                                  onUpdateSetDetails={(sd) => updateExerciseSetDetails(block.id, ex.id, sd)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              </SortableItem>
              </React.Fragment>
              );
            })}
            </SortableList>

            <button onClick={addBlock} className="w-full py-6 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs shrink-0">
              <span className="material-symbols-outlined">add_circle</span> {t('add_training_block')}
            </button>
          </div>

          {/* Right Column: Summary & Library — sticky like the nutrition editor
              so the exercise library stays in view while the workout cards scroll. */}
          <div className="w-full lg:w-[400px] flex flex-col gap-8 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            {/* Exercise Library */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl flex flex-col relative">
              <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4 shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('exercise_library')}</h3>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
                  <input
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder={t('search_exercises')}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="p-4 bg-slate-50/20 dark:bg-slate-800/20 max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2 mt-2">{t('master_list')}</h4>
                  {filteredExercises.map((ex, idx) => (
                    <div 
                      key={idx} 
                      className="w-full text-left p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-emerald-500/20 rounded-2xl flex items-center justify-between group transition-all shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={() => handleDragStart(ex)}
                    >
                      <div className="flex items-center gap-3 min-w-0 w-full">
                        <div className="w-8 h-8 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors shrink-0">
                          <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                        </div>
                        <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0`}>
                          <span className="material-symbols-outlined text-[20px]">{ex.icon || 'fitness_center'}</span>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                           <span className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2">{ex.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-tight">{ex.muscleGroups?.[0] || 'VARIOUS'}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">• {ex.type || t('exercise')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredExercises.length === 0 && (
                     <div className="text-center p-8 text-slate-400 text-sm">{t('no_exercises_found')}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Workout Summary — below the library for easy drag-and-drop. */}
            {WORKOUT_SUMMARY}
          </div>
        </div>
      </div>
    </div>
  );
}
