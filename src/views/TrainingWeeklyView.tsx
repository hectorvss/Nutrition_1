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

  useEffect(() => {
    const fetchPlanData = async () => {
      if (!client?.id) return;
      try {
        setIsLoading(true);
        // Using training-program instead of training-plan
        const data = await fetchWithAuth(`/manager/clients/${client.id}/training-program`);
        console.log('Training program fetched:', data);
        
        if (data && data.data_json) {
          setPlanData(data);
          // If the plan has a schedule, we use it to determine which days are active
          // If not, we fall back to some sensible defaults or what's in the DB
        }
      } catch (error) {
        console.error('Error fetching training program:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlanData();
  }, [client?.id]);
  const processedDays: DayTraining[] = DAYS_CONFIG.map((day) => {
    // If we have real plan data
    if (planData && planData.data_json) {
      const schedule = planData.schedule || ['M', 'W', 'F']; 
      // Map day id to schedule format if needed (e.g., 'monday' -> 'M')
      const dayMap: Record<string, string> = {
        'monday': 'M', 'tuesday': 'T', 'wednesday': 'W', 'thursday': 'Th', 
        'friday': 'F', 'saturday': 'S', 'sunday': 'Su'
      };
      
      const isTrainingDay = schedule.includes(dayMap[day.id]);
      
      if (isTrainingDay) {
        const blocks = planData.data_json.blocks || [];
        const allExercises = blocks.flatMap((b: any) => b.exercises || []);
        const totalSetsNum = allExercises.reduce((acc: number, ex: any) => acc + (Number(ex.sets) || 0), 0);
        
        return {
          ...day,
          workoutName: planData.name || 'Strength Training',
          intensity: 'Moderada',
          intensityColor: 'bg-emerald-500',
          duration: '60 min',
          volume: `${totalSetsNum} series`,
          tag: 'Entrenamiento',
          tagColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
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
          
          <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 mt-2 sm:mt-0">
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1 text-center">Plan Progress</div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Week 1 / 12
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
                <p className="text-sm text-slate-500">Visualiza el balance semanal de entrenamientos del cliente.</p>
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
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className="group w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-6 p-5"
            >
              <div className="w-full sm:w-1/4 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-slate-50 pb-4 sm:pb-0 sm:pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">{day.name}</h3>
                  <span className="text-xs text-slate-400 font-medium">/ {day.nameEn}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xl">
                  <span className="material-symbols-outlined text-lg">fitness_center</span>
                  {day.duration}
                </div>
              </div>

              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`${day.tagColor} text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide border`}>
                    {day.tag}
                  </span>
                  <div className="flex gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">monitoring</span>
                      Intensidad: {day.intensity}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">layers</span>
                      {day.volume}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div className={`${day.intensityColor} h-full transition-all`} style={{ width: day.tag === 'Descanso' ? '10%' : '100%' }}></div>
                </div>
              </div>

              <div className="w-full sm:w-1/4 flex-shrink-0 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-50 pt-4 sm:pt-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">ENTRENAMIENTO</span>
                </div>
                <div className="text-sm font-bold text-slate-900 truncate">
                  {day.workoutName}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">
                  {day.tag === 'Descanso' ? 'Día de recuperación' : 'Pulsa para ver ejercicios'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
