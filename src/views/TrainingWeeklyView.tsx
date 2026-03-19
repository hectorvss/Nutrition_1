import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fetchWithAuth } from '../api';

interface DayTraining {
  id: string;
  name: string;
  nameEn: string;
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

const DAYS_CONFIG = [
  { id: 'monday', name: 'Lunes', nameEn: 'Monday' },
  { id: 'tuesday', name: 'Martes', nameEn: 'Tuesday' },
  { id: 'wednesday', name: 'Miércoles', nameEn: 'Wednesday' },
  { id: 'thursday', name: 'Jueves', nameEn: 'Thursday' },
  { id: 'friday', name: 'Viernes', nameEn: 'Friday' },
  { id: 'saturday', name: 'Sábado', nameEn: 'Saturday' },
  { id: 'sunday', name: 'Domingo', nameEn: 'Sunday' },
];

interface TrainingWeeklyViewProps {
  client: any;
  onBack: () => void;
  onSelectDay: (dayId: string) => void;
  onReassign?: () => void;
}

export default function TrainingWeeklyView({ client, onBack, onSelectDay, onReassign }: TrainingWeeklyViewProps) {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [planData, setPlanData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedDayId, setDraggedDayId] = useState<string | null>(null);
  const [dragOverDayId, setDragOverDayId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanData = async () => {
      if (!client?.id) return;
      try {
        setIsLoading(true);
        const data = await fetchWithAuth(`/manager/clients/${client.id}/training-program`);
        if (data && data.data_json) {
          setPlanData(data);
        }
      } catch (error) {
        console.error('Error fetching training program:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlanData();
  }, [client?.id]);

  const handleUpdateDay = (dayId: string, workoutId: string | null) => {
    if (!planData || !planData.data_json) return;
    
    const newWeeklySchedule = { ...planData.data_json.weeklySchedule };
    if (workoutId) {
      newWeeklySchedule[dayId] = workoutId;
    } else {
      delete newWeeklySchedule[dayId];
    }

    const updatedDataJson = { 
      ...planData.data_json, 
      weeklySchedule: newWeeklySchedule 
    };

    setPlanData({
      ...planData,
      data_json: updatedDataJson
    });
    setHasChanges(true);
  };

  const [showWorkoutPicker, setShowWorkoutPicker] = useState<string | null>(null);

  const handleMoveWorkout = (dayId: string, direction: 'up' | 'down') => {
    if (!planData || !planData.data_json) return;
    
    const dayIndex = DAYS_CONFIG.findIndex(d => d.id === dayId);
    const targetIndex = direction === 'up' ? dayIndex - 1 : dayIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= DAYS_CONFIG.length) return;
    
    const targetDayId = DAYS_CONFIG[targetIndex].id;
    const newWeeklySchedule = { ...planData.data_json.weeklySchedule };
    
    const sourceWorkoutId = newWeeklySchedule[dayId];
    const targetWorkoutId = newWeeklySchedule[targetDayId];
    
    if (sourceWorkoutId) {
      newWeeklySchedule[targetDayId] = sourceWorkoutId;
    } else {
      delete newWeeklySchedule[targetDayId];
    }
    
    if (targetWorkoutId) {
      newWeeklySchedule[dayId] = targetWorkoutId;
    } else {
      delete newWeeklySchedule[dayId];
    }

    const updatedDataJson = { 
      ...planData.data_json, 
      weeklySchedule: newWeeklySchedule 
    };

    setPlanData({
      ...planData,
      data_json: updatedDataJson
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!planData || !planData.data_json || !hasChanges) return;
    
    setIsSaving(true);
    try {
      await fetchWithAuth(`/manager/clients/${client.id}/training-program`, {
        method: 'POST',
        body: JSON.stringify({
          name: planData.name,
          data_json: planData.data_json
        })
      });
      setHasChanges(false);
      alert('Plan guardado correctamente');
    } catch (e) {
      console.error('Error saving training program:', e);
      alert('Error al guardar el plan');
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
  
  const processedDays: DayTraining[] = DAYS_CONFIG.map((day) => {
    if (planData && planData.data_json) {
      const dataJson = planData.data_json;
      const weeklySchedule = dataJson.weeklySchedule || {};
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
          intensity: isStrength ? 'Alta' : isMobility ? 'Baja' : 'Moderada',
          intensityColor: isStrength ? 'bg-orange-500' : isMobility ? 'bg-blue-400' : 'bg-emerald-500',
          duration: planData.duration ? `${planData.duration} min` : '60 min',
          volume: `${totalSetsNum} series`,
          tag: isMobility ? 'Movilidad' : 'Entrenamiento',
          tagColor: isMobility 
            ? 'bg-blue-50 text-blue-600 border-blue-100' 
            : 'bg-emerald-50 text-emerald-600 border-emerald-100',
          exercises: allExercises,
          isRestDay: false
        };
      }
    }

    return {
      ...day,
      workoutName: 'Día de Descanso',
      intensity: 'Baja',
      intensityColor: 'bg-slate-200',
      duration: '-',
      volume: '0 series',
      tag: 'Descanso',
      tagColor: 'bg-slate-50 text-slate-400 border-slate-100',
      exercises: [],
      isRestDay: true
    };
  });

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="p-4 md:p-6 pb-2">
        <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <button onClick={onBack} className="inline-flex items-center text-slate-500 hover:text-emerald-500 transition-colors">
                Training
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-slate-400 text-lg mx-1">chevron_right</span>
                <span className="text-slate-800 font-medium">{client?.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div 
              className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm" 
              style={{ backgroundImage: `url("${client?.avatar || 'https://ui-avatars.com/api/?name=C&background=random'}")` }}
            ></div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-slate-900">{client?.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">flag</span>
                Goal: {client?.goal || 'Muscle Gain'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Plan Activo
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
                {isSaving ? 'GUARDANDO...' : 'SAVE CHANGES'}
              </button>
            )}
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 mt-2 sm:mt-0">
              <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1 text-center">Plan Progress</div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Week 1 / 12
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-2 pb-20">
        <div className="flex flex-col gap-4">
          
          <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-500">
                <span className="material-symbols-outlined text-2xl">calendar_view_week</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Plan Distribution</h3>
                <p className="text-sm text-slate-500">Haz clic en cada día para editar o cambiar el entrenamiento.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isLoading && (
                <div className="flex items-center gap-2 mr-4">
                  <div className="w-4 h-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <span className="text-xs font-medium text-slate-400">Loading plan...</span>
                </div>
              )}
              {onReassign && (
                <button 
                  onClick={onReassign}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-emerald-500 hover:border-emerald-500/50 transition-all font-bold text-xs shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">sync</span>
                  REASSIGN PLAN
                </button>
              )}
              
              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 min-w-[240px]">
                <button 
                  onClick={() => setViewMode('weekly')}
                  className={`flex-1 px-4 py-2 text-xs font-black rounded-lg transition-all ${viewMode === 'weekly' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  WEEKLY VIEW
                </button>
                <button 
                  onClick={() => setViewMode('monthly')}
                  className={`flex-1 px-4 py-2 text-xs font-black rounded-lg transition-all ${viewMode === 'monthly' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  MONTH VIEW
                </button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Cargando distribución semanal...</p>
            </div>
          ) : processedDays.map((day) => (
            <div 
              key={day.id} 
              className={`relative group transition-all ${draggedDayId === day.id ? 'opacity-40 grayscale' : ''} ${dragOverDayId === day.id ? 'scale-[1.02] -translate-y-1' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, day.id)}
              onDragOver={(e) => handleDragOver(e, day.id)}
              onDragLeave={() => setDragOverDayId(null)}
              onDrop={(e) => handleDrop(e, day.id)}
              onDragEnd={handleDragEnd}
            >
              <button
                onClick={() => onSelectDay(day.id)}
                className={`w-full text-left bg-white rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-6 p-5 ${
                  dragOverDayId === day.id ? 'border-emerald-500 shadow-xl ring-2 ring-emerald-500/20' : 
                  day.isRestDay ? 'border-slate-100 opacity-80 hover:opacity-100' : 'border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-500/50'
                }`}
              >
                <div className="w-full sm:w-1/4 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-slate-50 pb-4 sm:pb-0 sm:pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{day.name}</h3>
                    <span className="text-xs text-slate-400 font-medium">/ {day.nameEn}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 font-bold text-xl ${day.isRestDay ? 'text-slate-300' : 'text-emerald-600'}`}>
                    <span className="material-symbols-outlined text-lg">{day.isRestDay ? 'bedtime' : 'fitness_center'}</span>
                    {day.duration}
                  </div>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`${day.tagColor} text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide border`}>
                      {day.tag}
                    </span>
                    <div className="flex gap-4 text-xs text-slate-500 font-medium">
                      {!day.isRestDay && (
                        <>
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">monitoring</span>
                            Intensidad: {day.intensity}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">layers</span>
                            {day.volume}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    {!day.isRestDay && <div className={`${day.intensityColor} h-full transition-all`} style={{ width: '100%' }}></div>}
                  </div>
                </div>

                <div className="w-full sm:w-1/4 flex-shrink-0 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-50 pt-4 sm:pt-0 flex justify-between items-center group/side">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <div className="flex items-center gap-2">
                          <div className="cursor-grab text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">ENTRENAMIENTO</span>
                       </div>
                    </div>
                    <div className={`text-sm font-bold truncate ${day.isRestDay ? 'text-slate-400' : 'text-slate-900'}`}>
                      {day.workoutName}
                    </div>
                    {!day.isRestDay && (
                      <div className="text-[10px] text-slate-400 font-medium mt-1">
                        Pulsa para ver ejercicios
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveWorkout(day.id, 'up');
                      }}
                      disabled={DAYS_CONFIG.findIndex(d => d.id === day.id) === 0}
                      className="p-1 rounded bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-[20px]">expand_less</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveWorkout(day.id, 'down');
                      }}
                      disabled={DAYS_CONFIG.findIndex(d => d.id === day.id) === DAYS_CONFIG.length - 1}
                      className="p-1 rounded bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-[20px]">expand_more</span>
                    </button>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowWorkoutPicker(showWorkoutPicker === day.id ? null : day.id);
                    }}
                    className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                      showWorkoutPicker === day.id ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'
                    }`}
                  >
                    <span className="material-symbols-outlined">edit_calendar</span>
                  </button>
                </div>
              </button>

              {/* Workout Picker Dropdown */}
              {showWorkoutPicker === day.id && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-3 animate-in fade-in zoom-in duration-200">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2 border-b border-slate-50 mb-2">
                    Cambiar Entrenamiento
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => {
                        handleUpdateDay(day.id, null);
                        setShowWorkoutPicker(null);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-red-500 transition-all flex items-center gap-3"
                    >
                      <span className="material-symbols-outlined text-[20px]">block</span>
                      Día de Descanso
                    </button>
                    {planData.data_json.workouts?.map((w: any) => (
                      <button 
                        key={w.id}
                        onClick={() => {
                          handleUpdateDay(day.id, w.id);
                          setShowWorkoutPicker(null);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between group/item ${
                          planData.data_json.weeklySchedule?.[day.id] === w.id 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                          {w.name}
                        </div>
                        {planData.data_json.weeklySchedule?.[day.id] === w.id && (
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
