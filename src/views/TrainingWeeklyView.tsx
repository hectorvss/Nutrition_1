import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fetchWithAuth } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../components/ui/Toast';

interface DayTraining {
  id: string;
  name: string;
  workoutName: string;
  intensity: string;
  intensityColor: string;
  duration: string;
  volume: string;
  tag: string;
  tagColor: string;
  exercises: any[];
  isRestDay: boolean;
}

const DAY_IDS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

interface TrainingWeeklyViewProps {
  client: any;
  onBack: () => void;
  onSelectDay: (dayId: string) => void;
  onReassign?: () => void;
  initialPlanData?: any;
  /** When set, the view edits a training TEMPLATE instead of a client program. */
  templateId?: string | null;
}

export default function TrainingWeeklyView({ client, onBack, onSelectDay, onReassign, initialPlanData, templateId }: TrainingWeeklyViewProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [planData, setPlanData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draggedDayId, setDraggedDayId] = useState<string | null>(null);
  const [dragOverDayId, setDragOverDayId] = useState<string | null>(null);
  // Keyboard swap: selectedForSwap = the day the user has "picked up" with Space
  const [selectedForSwap, setSelectedForSwap] = useState<string | null>(null);
  // Monthly view: which week's "copy to…" menu is open.
  const [copyMenuWeek, setCopyMenuWeek] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlanData = async () => {
      // If we have initialPlanData (from a template selection), use it
      if (initialPlanData) {
        // Ensure it has the structure expected by the component (containing data_json)
        if (initialPlanData.data_json) {
          setPlanData(initialPlanData);
        } else {
          setPlanData({ data_json: initialPlanData, name: initialPlanData.name || 'Programa' });
        }
        return;
      }

      // Template mode — load the template's week.
      if (templateId) {
        try {
          setIsLoading(true);
          setLoadError(null);
          const data = await fetchWithAuth(`/manager/training-templates/${templateId}`);
          if (data && data.data_json) setPlanData(data);
        } catch (error: any) {
          console.error('Error fetching training template:', error);
          setLoadError(error?.message || t('error_loading_data'));
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (!client?.id) return;
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await fetchWithAuth(`/manager/clients/${client.id}/training-program`);
        if (data && data.data_json) {
          setPlanData(data);
        }
      } catch (error: any) {
        console.error('Error fetching training program:', error);
        setLoadError(error?.message || t('error_loading_data'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlanData();
  }, [client?.id, initialPlanData, templateId]);

  // --- Monthly (4-week) model: week 1 = base weeklySchedule; weeks 2-4 live in
  // data_json.weekOverrides and only exist once the coach customises them. ---
  const WEEKS = [1, 2, 3, 4];
  const getWeekSchedule = (week: number): Record<string, string> => {
    const dj = planData?.data_json || {};
    if (week === 1) return dj.weeklySchedule || {};
    return (dj.weekOverrides && dj.weekOverrides[week]) || dj.weeklySchedule || {};
  };
  const isWeekCustomised = (week: number): boolean =>
    week !== 1 && !!(planData?.data_json?.weekOverrides && planData.data_json.weekOverrides[week]);

  const handleUpdateDay = (dayId: string, workoutId: string | null, week: number = 1) => {
    if (!planData || !planData.data_json) return;
    const dj = planData.data_json;
    const sched = { ...getWeekSchedule(week) };
    if (workoutId) sched[dayId] = workoutId;
    else delete sched[dayId];

    const updatedDataJson = week === 1
      ? { ...dj, weeklySchedule: sched }
      : { ...dj, weekOverrides: { ...(dj.weekOverrides || {}), [week]: sched } };

    setPlanData({ ...planData, data_json: updatedDataJson });
    setHasChanges(true);
  };

  // Copy one week's schedule onto the other weeks of the month.
  const copyWeekTo = (from: number, targets: number[]) => {
    if (!planData?.data_json) return;
    const dj = planData.data_json;
    const src = { ...getWeekSchedule(from) };
    let weeklySchedule = dj.weeklySchedule;
    const overrides = { ...(dj.weekOverrides || {}) };
    for (const w of targets) {
      if (w === from) continue;
      if (w === 1) weeklySchedule = { ...src };
      else overrides[w] = { ...src };
    }
    setPlanData({ ...planData, data_json: { ...dj, weeklySchedule, weekOverrides: overrides } });
    setHasChanges(true);
  };

  // Drop a week's override so it falls back to the base week.
  const resetWeek = (week: number) => {
    if (!planData?.data_json || week === 1) return;
    const dj = planData.data_json;
    const overrides = { ...(dj.weekOverrides || {}) };
    delete overrides[week];
    setPlanData({ ...planData, data_json: { ...dj, weekOverrides: overrides } });
    setHasChanges(true);
  };

  const [showWorkoutPicker, setShowWorkoutPicker] = useState<string | null>(null);

  const handleSave = async () => {
    if (!planData || !planData.data_json || !hasChanges) return;

    setIsSaving(true);
    try {
      if (templateId) {
        await fetchWithAuth(`/manager/training-templates/${templateId}`, {
          method: 'PUT',
          body: JSON.stringify({ data_json: planData.data_json }),
        });
      } else {
        await fetchWithAuth(`/manager/clients/${client.id}/training-program`, {
          method: 'POST',
          body: JSON.stringify({
            // Fallback name so it never saves as undefined (backend upserts by client_id)
            name: planData.name || planData.data_json?.name || t('training_program', { defaultValue: 'Training Program' }),
            data_json: planData.data_json
          })
        });
      }
      setHasChanges(false);
      showToast(t('plan_saved_alert'), 'success');
    } catch (e) {
      console.error('Error saving training program:', e);
      showToast(t('plan_save_error_alert'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, dayId: string) => {
    setDraggedDayId(dayId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, dayId: string) => {
    e.preventDefault();
    if (draggedDayId === dayId) return;
    setDragOverDayId(dayId);
  };

  const handleDrop = (e: React.DragEvent, targetDayId: string) => {
    e.preventDefault();
    setDragOverDayId(null);
    if (!draggedDayId || draggedDayId === targetDayId) return;

    const newWeeklySchedule = { ...planData.data_json.weeklySchedule };
    const sourceWorkoutId = newWeeklySchedule[draggedDayId];
    const targetWorkoutId = newWeeklySchedule[targetDayId];

    if (sourceWorkoutId) {
      newWeeklySchedule[targetDayId] = sourceWorkoutId;
    } else {
      delete newWeeklySchedule[targetDayId];
    }

    if (targetWorkoutId) {
      newWeeklySchedule[draggedDayId] = targetWorkoutId;
    } else {
      delete newWeeklySchedule[draggedDayId];
    }

    setPlanData({
      ...planData,
      data_json: { ...planData.data_json, weeklySchedule: newWeeklySchedule }
    });
    setHasChanges(true);
    setDraggedDayId(null);
  };

  const handleDragEnd = () => {
    setDraggedDayId(null);
    setDragOverDayId(null);
  };

  const swapDays = (a: string, b: string) => {
    if (a === b) return;
    const newWeeklySchedule = { ...planData.data_json.weeklySchedule };
    const srcId = newWeeklySchedule[a];
    const tgtId = newWeeklySchedule[b];
    if (srcId) newWeeklySchedule[b] = srcId; else delete newWeeklySchedule[b];
    if (tgtId) newWeeklySchedule[a] = tgtId; else delete newWeeklySchedule[a];
    setPlanData({ ...planData, data_json: { ...planData.data_json, weeklySchedule: newWeeklySchedule } });
    setHasChanges(true);
  };

  const handleDayKeyDown = (e: React.KeyboardEvent, dayId: string) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (selectedForSwap === null) {
        setSelectedForSwap(dayId);
      } else if (selectedForSwap === dayId) {
        setSelectedForSwap(null);
      } else {
        swapDays(selectedForSwap, dayId);
        setSelectedForSwap(null);
      }
    } else if (e.key === 'Escape') {
      setSelectedForSwap(null);
    }
  };
  
  // Build the 7 day cards for an arbitrary week schedule (day -> workoutId).
  const computeDays = (weeklySchedule: Record<string, string>): DayTraining[] => DAY_IDS.map((dayId) => {
    const day = { id: dayId, name: t(dayId) };
    if (planData && planData.data_json) {
      const dataJson = planData.data_json;
      const workoutId = weeklySchedule[day.id];
      const workouts = dataJson.workouts || [];
      const workout = workouts.find((w: any) => w.id === workoutId);
      
      if (workout) {
        const blocks = workout.blocks || [];
        const allExercises = blocks.flatMap((b: any) => b.exercises || []);
        const totalSetsNum = allExercises.reduce((acc: number, ex: any) => acc + (Number(ex.sets) || 0), 0);
        
        const isStrength = workout.name.toLowerCase().includes('fuerza') || workout.name.toLowerCase().includes('strength');
        const isMobility = workout.name.toLowerCase().includes('mob') || workout.name.toLowerCase().includes('recu');
        
        return {
          ...day,
          workoutName: workout.name,
          intensity: isStrength ? t('intensity_high') : isMobility ? t('intensity_low') : t('intensity_mod'),
          intensityColor: isStrength ? 'bg-orange-500' : isMobility ? 'bg-blue-400' : 'bg-emerald-500',
          duration: (() => {
            const d = workout.duration ?? dataJson.duration;
            return d ? `${d} ${t('min_label')}` : `60 ${t('min_label')}`;
          })(),
          volume: `${totalSetsNum} ${t('sets_label')}`,
          tag: isMobility ? t('mobility_label') : t('training_day'),
          tagColor: isMobility
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40'
            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
          exercises: allExercises,
          isRestDay: false
        };
      }
    }

    return {
      ...day,
      workoutName: t('rest_day_title'),
      intensity: t('intensity_low'),
      intensityColor: 'bg-slate-200 dark:bg-slate-700',
      duration: '-',
      volume: `0 ${t('sets_label')}`,
      tag: t('rest_day_label'),
      tagColor: 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800',
      exercises: [],
      isRestDay: true
    };
  });

  const processedDays: DayTraining[] = computeDays(getWeekSchedule(1));

  // One day card — shared by the weekly list and the monthly (4-week) view.
  // `week` scopes the workout picker and edits to that month-week.
  const renderDayCard = (day: DayTraining, week: number, drag: boolean) => {
   const pickerKey = `${week}:${day.id}`;
   return (
    <div
      key={`w${week}-${day.id}`}
      className={`relative group transition-all ${draggedDayId === day.id ? 'opacity-40 grayscale' : ''} ${dragOverDayId === day.id ? 'scale-[1.02] -translate-y-1' : ''} ${selectedForSwap === day.id ? 'ring-2 ring-emerald-500 rounded-2xl' : ''}`}
      draggable={drag}
      onDragStart={drag ? (e) => handleDragStart(e, day.id) : undefined}
      onDragOver={drag ? (e) => handleDragOver(e, day.id) : undefined}
      onDragLeave={drag ? () => setDragOverDayId(null) : undefined}
      onDrop={drag ? (e) => handleDrop(e, day.id) : undefined}
      onDragEnd={drag ? handleDragEnd : undefined}
      onKeyDown={drag ? (e) => handleDayKeyDown(e, day.id) : undefined}
      tabIndex={drag ? 0 : undefined}
      role={drag ? 'button' : undefined}
      aria-label={drag ? `${day.name}: ${day.workoutName}. ${selectedForSwap ? (selectedForSwap === day.id ? 'Selected for swap. Press Space to deselect or Escape to cancel.' : 'Press Space to swap with selected day.') : 'Press Space to select for swap.'}` : undefined}
      aria-pressed={drag ? selectedForSwap === day.id : undefined}
    >
      <button
        onClick={() => onSelectDay(day.id)}
        className={`w-full text-left bg-white dark:bg-slate-900 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-4 p-5 ${
          dragOverDayId === day.id ? 'border-emerald-500 shadow-xl ring-2 ring-emerald-500/20' :
          day.isRestDay ? 'border-slate-100 dark:border-slate-800 opacity-80 hover:opacity-100' : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-emerald-500/50'
        }`}
      >
        {drag && (
          <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-[24px]">drag_indicator</span>
          </div>
        )}
        <div className="w-full sm:w-1/4 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-slate-50 dark:border-slate-800 pb-4 sm:pb-0 sm:pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{day.name}</h3>
          </div>
          <div className={`flex items-center gap-1.5 font-bold text-xl ${day.isRestDay ? 'text-slate-300 dark:text-slate-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
            <span className="material-symbols-outlined text-lg">{day.isRestDay ? 'bedtime' : 'fitness_center'}</span>
            {day.duration}
          </div>
        </div>

        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center justify-between">
            <span className={`${day.tagColor} text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide border`}>
              {day.tag}
            </span>
            <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
              {!day.isRestDay && (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">monitoring</span>
                    {t('intensity_label')}: {day.intensity}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">layers</span>
                    {day.volume}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
            {!day.isRestDay && <div className={`${day.intensityColor} h-full transition-all`} style={{ width: '100%' }}></div>}
          </div>
        </div>

        <div className="w-full sm:w-1/4 flex-shrink-0 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-50 dark:border-slate-800 pt-4 sm:pt-0 flex justify-between items-center group/side">
          <div>
            <div className="flex justify-between items-center mb-2">
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('training')}</span>
               </div>
            </div>
            <div className={`text-sm font-bold truncate ${day.isRestDay ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
              {day.workoutName}
            </div>
            {!day.isRestDay && (
              <div className="text-[10px] text-slate-400 font-medium mt-1">
                {t('click_to_view_exercises')}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowWorkoutPicker(showWorkoutPicker === pickerKey ? null : pickerKey);
            }}
            className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
              showWorkoutPicker === pickerKey ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500'
            }`}
          >
            <span className="material-symbols-outlined">edit_calendar</span>
          </button>
        </div>
      </button>

      {showWorkoutPicker === pickerKey && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-3 animate-in fade-in zoom-in duration-200">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2 border-b border-slate-50 dark:border-slate-800 mb-2">
            {t('change_workout_title')}
          </div>
          <div className="space-y-1">
            <button
              onClick={() => { handleUpdateDay(day.id, null, week); setShowWorkoutPicker(null); }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-red-500 transition-all flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-[20px]">block</span>
              {t('rest_day_title')}
            </button>
            {planData?.data_json?.workouts?.map((w: any) => {
              const isCurrent = getWeekSchedule(week)[day.id] === w.id;
              return (
              <button
                key={w.id}
                onClick={() => { handleUpdateDay(day.id, w.id, week); setShowWorkoutPicker(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between group/item ${
                  isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                  {w.name}
                </div>
                {isCurrent && (
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                )}
              </button>
            );})}
          </div>
        </div>
      )}
    </div>
   );
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="px-6 md:px-8 lg:px-10 py-4 md:py-6 pb-2">
        <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 dark:text-slate-400 mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <button onClick={onBack} className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                {t('training')}
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-slate-400 text-lg mx-1">chevron_right</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{client?.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div 
              className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm" 
              style={{ backgroundImage: `url("${client?.avatar || 'https://ui-avatars.com/api/?name=C&background=random'}")` }}
            ></div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{client?.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">flag</span>
                {t('goal')}: {client?.goal || '--'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:block"></span>
              <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                {t('active_plan_status_label')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">{isSaving ? 'sync' : 'save'}</span>
                {isSaving ? t('saving_btn') : t('save_changes')}
              </button>
            )}
            {(planData?.data_json?.currentWeek && planData?.data_json?.totalWeeks) && (
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mt-2 sm:mt-0">
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1 text-center">{t('plan_progress')}</div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t('week')} {planData.data_json.currentWeek} / {planData.data_json.totalWeeks}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-8 lg:px-10 pt-2 pb-20">
        <div className="flex flex-col gap-4">
          
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm text-emerald-500">
                <span className="material-symbols-outlined text-2xl">calendar_view_week</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{t('plan_distribution_label')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('plan_distribution_desc')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isLoading && (
                <div className="flex items-center gap-2 mr-4">
                  <div className="w-4 h-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <span className="text-xs font-medium text-slate-400">{t('loading_plan')}</span>
                </div>
              )}
              {onReassign && (
                <button 
                  onClick={onReassign}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500/50 transition-all font-bold text-xs shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">sync</span>
                  {t('reassign_plan_btn')}
                </button>
              )}

              <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 min-w-[240px]">
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`flex-1 px-4 py-2 text-xs font-black rounded-lg transition-all ${viewMode === 'weekly' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  {t('weekly_view_btn')}
                </button>
                <button
                  onClick={() => setViewMode('monthly')}
                  className={`flex-1 px-4 py-2 text-xs font-black rounded-lg transition-all ${viewMode === 'monthly' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  {t('month_view_btn')}
                </button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium">{t('loading_weekly_distribution')}</p>
            </div>
          ) : loadError ? (
            <div className="py-20 flex flex-col items-center justify-center text-rose-500 gap-3">
              <span className="material-symbols-outlined text-4xl">error</span>
              <p className="text-sm font-medium">{loadError}</p>
            </div>
          ) : viewMode === 'monthly' ? (
            <div className="flex flex-col gap-5">
              {WEEKS.map((week) => {
                const customised = isWeekCustomised(week);
                return (
                  <div key={`week-${week}`} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    {/* Week block header */}
                    <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
                          {week}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{t('week')} {week}</h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${week === 1 ? 'text-emerald-600 dark:text-emerald-400' : customised ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                            {week === 1
                              ? t('planning_base_week', { defaultValue: 'Semana base' })
                              : customised
                                ? t('planning_custom_week', { defaultValue: 'Personalizada' })
                                : t('planning_same_as_base', { defaultValue: 'Igual que la base' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 relative">
                        {customised && (
                          <button
                            onClick={() => resetWeek(week)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                          >
                            {t('planning_reset_to_base', { defaultValue: 'Restablecer' })}
                          </button>
                        )}
                        <button
                          onClick={() => setCopyMenuWeek(copyMenuWeek === week ? null : week)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          {t('planning_copy_week', { defaultValue: 'Copiar a…' })}
                        </button>
                        {copyMenuWeek === week && (
                          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-2">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">
                              {t('planning_copy_week_to', { defaultValue: 'Copiar esta semana a' })}
                            </div>
                            {WEEKS.filter(w => w !== week).map(w => (
                              <button
                                key={w}
                                onClick={() => { copyWeekTo(week, [w]); setCopyMenuWeek(null); }}
                                className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                              >
                                {t('week')} {w}
                              </button>
                            ))}
                            <button
                              onClick={() => { copyWeekTo(week, WEEKS.filter(w => w !== week)); setCopyMenuWeek(null); }}
                              className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all border-t border-slate-50 dark:border-slate-800 mt-1"
                            >
                              {t('planning_copy_all_weeks', { defaultValue: 'Todas las demás semanas' })}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Week block day cards */}
                    <div className="p-4 flex flex-col gap-3">
                      {computeDays(getWeekSchedule(week)).map((day) => renderDayCard(day, week, false))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            processedDays.map((day) => renderDayCard(day, 1, true))
          )}
        </div>
      </div>
    </div>
  );
}
