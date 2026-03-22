import React, { useState, useEffect } from 'react';
import { useExerciseContext } from '../../context/ExerciseContext';
import { fetchWithAuth } from '../../api';
import { useAuth } from '../../context/AuthContext';

interface ClientTrainingProps {
  onViewExercise?: (name: string) => void;
}

export default function ClientTraining({ onViewExercise }: ClientTrainingProps) {
  const { exercises, isLoading: exercisesLoading, refreshExercises } = useExerciseContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [trainingProgram, setTrainingProgram] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

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
  
  let blocks = [];
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


  const filteredLibraryExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || ex.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(exercises.map(e => e.category))).filter(Boolean);

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
            <span className="text-xs text-slate-400 hidden sm:inline-block mr-2">Last autosave: 2 min ago</span>
            <button className="text-slate-500 hover:text-[#17cf54] dark:text-slate-400 p-2 rounded-xl hover:bg-[#17cf54]/5 transition-colors"><span className="material-symbols-outlined">more_horiz</span></button>
            <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold text-sm">
              <span className="material-symbols-outlined text-[18px]">edit_note</span> Edit
            </button>
            <button className="bg-[#17cf54] hover:bg-[#15b84a] text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold text-sm">
              <span className="material-symbols-outlined text-[18px]">publish</span> Publish
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 pb-20">
          {renderDaySelector()}
          
          {/* Workout Summary - Full Width */}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 w-full max-w-lg">
                <SummaryStat label="Legs" value="50%" color="bg-blue-500" />
                <SummaryStat label="Chest" value="25%" color="bg-purple-500" />
                <SummaryStat label="Shoulders" value="25%" color="bg-orange-500" />
              </div>
            </div>
          </div>

          {/* Workout Blocks - Full Width */}
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
                  <div className="col-span-8 grid grid-cols-5 gap-2 text-center">
                    <div>Weight</div><div>Sets</div><div>Reps</div><div>RIR</div><div>Rest</div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(block.exercises || []).map((ex: any, eIdx: number) => (
                    <DetailedExerciseRow 
                      key={eIdx}
                      name={ex.name} 
                      type={ex.type} 
                      weight={ex.weight} 
                      sets={ex.sets} 
                      reps={ex.reps} 
                      rir={ex.rir} 
                      rest={ex.rest} 
                    />
                  ))}
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

function LibraryItem({ name, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center justify-between group transition-colors border border-transparent"
    >
      <span className="text-sm font-medium text-slate-900 dark:text-white">{name}</span>
      <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-[#17cf54]/10 group-hover:text-[#17cf54] transition-colors">
        <span className="material-symbols-outlined text-[16px]">visibility</span>
      </div>
    </button>
  );
}

function SimpleExerciseRow({ name, sub }: any) {
  return (
    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="cursor-grab text-slate-300 dark:text-slate-700 group-hover:text-slate-400">
          <span className="material-symbols-outlined text-[20px]">drag_handle</span>
        </div>
        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400">
          <span className="material-symbols-outlined text-[24px]">play_circle</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{name}</h4>
          <p className="text-xs text-slate-500 mt-1">{sub}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs font-medium text-[#17cf54] hover:text-[#15b84a] flex items-center gap-1 px-2 py-1 bg-[#17cf54]/5 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[16px]">videocam</span> Watch Video
          </button>
          <button className="p-2 text-slate-300 hover:text-[#17cf54] hover:bg-[#17cf54]/5 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailedExerciseRow({ name, type, weight, sets, reps, rir, rest }: any) {
  return (
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
        <div className="md:col-span-8 grid grid-cols-5 gap-2 relative">
          <div className="text-center text-sm p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">{weight}</div>
          <div className="text-center text-sm p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">{sets}</div>
          <div className="text-center text-sm p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">{reps}</div>
          <div className="text-center text-sm p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">{rir}</div>
          <div className="text-center text-sm p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">{rest}</div>
          <button className="absolute -right-3 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-[#17cf54] rounded-full transition-colors opacity-0 group-hover:opacity-100">
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
