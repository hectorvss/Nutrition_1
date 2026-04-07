import React, { useState, useEffect } from 'react';
import { useExerciseContext } from '../context/ExerciseContext';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type ExerciseCategory = 'Strength' | 'Mobility' | 'Warm-up' | 'Cardio' | 'Rehab';

interface TrainingLibraryProps {
  onNavigate: (view: string, name?: string) => void;
}

export default function TrainingLibrary({ onNavigate }: TrainingLibraryProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ExerciseCategory>('Strength');
  const [search, setSearch] = useState('');
  const { exercises, deleteExercise, isLoading, refreshExercises } = useExerciseContext();

  useEffect(() => {
    refreshExercises();
  }, []);

  const filteredExercises = exercises.filter(ex =>
    ex.category === activeTab &&
    (!search || ex.name.toLowerCase().includes(search.toLowerCase()) || ex.muscleGroups.some(m => m.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="p-6 md:p-8 lg:p-10 w-full h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-emerald-500">fitness_center</span>
            {t('training_library_title')}
          </h2>
          <p className="text-slate-500 font-medium mt-1">{t('training_lib_desc')}</p>
        </div>
        <button 
          onClick={() => onNavigate('exercise-create')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 font-bold"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          {t('add_custom_exercise')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
        {(['Strength', 'Mobility', 'Warm-up', 'Cardio', 'Rehab'] as ExerciseCategory[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'Strength' ? t('strength_cat') :
             tab === 'Mobility' ? t('mobility_cat') :
             tab === 'Warm-up' ? t('warmup_cat') :
             tab === 'Cardio' ? t('cardio_cat') :
             t('rehab_cat')}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full sm:w-[500px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700"
            placeholder={t('search_exercises_placeholder')}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            {t('filter_by_muscle')}
          </button>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">fitness_center</span>
            {t('tools_label')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide pb-20">
        <div className="flex flex-col gap-6">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <div className="col-span-4">{t('exercise_name_label')}</div>
            <div className="col-span-8 grid grid-cols-6 gap-4 text-center">
              <div className="col-span-2 text-left pl-4">{t('muscle_group_label')}</div>
              <div className="col-span-2 text-left">{t('tools_label')}</div>
              <div className="col-span-1">{t('level_label')}</div>
              <div className="col-span-1">{t('actions_label')}</div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="p-20 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-4"></div>
                <p className="text-slate-500 font-bold">{t('loading_library')}</p>
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="p-20 text-center bg-white rounded-3xl border border-slate-200">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">search_off</span>
                <p className="text-slate-500 font-bold">{t('no_exercises_found')}</p>
              </div>
            ) : (
              filteredExercises.map((exercise) => (
              <div 
                key={exercise.id} 
                className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:border-emerald-500/30 transition-all p-4 md:p-6 cursor-pointer"
                onClick={() => onNavigate('exercise-detail', exercise.name)}
              >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center">
                  <div className="col-span-4 w-full flex items-center gap-6">
                    <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                      <span className="material-symbols-outlined text-3xl text-slate-400">{exercise.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xl text-slate-900 leading-tight truncate group-hover:text-emerald-600 transition-colors">{exercise.name}</h3>
                      <p className="text-sm text-slate-400 font-bold mt-1 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${exercise.type === 'Compound' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                        {exercise.type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="col-span-8 w-full grid grid-cols-2 md:grid-cols-6 gap-4 items-center border-t md:border-t-0 border-slate-50 pt-4 md:pt-0 mt-2 md:mt-0">
                    <div className="col-span-2 flex flex-col md:flex-row md:items-center text-left md:pl-4">
                      <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 mb-1">Target</span>
                      <div className="flex flex-wrap gap-1">
                        {exercise.muscleGroups.map(m => (
                          <span key={m} className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-tight">{m}</span>
                        ))}
                        {exercise.secondaryMuscles?.map(m => (
                          <span key={m} className="px-2 py-1 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-tight">{m}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex flex-col md:block text-left">
                      <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 mb-1">Tools</span>
                      <span className="text-sm font-bold text-slate-500">{exercise.tools.join(', ')}</span>
                    </div>
                    
                    <div className="flex flex-col md:block text-center">
                      <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 mb-1">{t('level_label')}</span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest ${
                        exercise.level === 'Beginner' ? 'bg-emerald-50 text-emerald-600' :
                        exercise.level === 'Intermediate' ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {exercise.level === 'Beginner' ? t('beginner_level') :
                         exercise.level === 'Intermediate' ? t('intermediate_level') :
                         t('advanced_level')}
                      </span>
                    </div>
                    
                    <div className="flex md:justify-center items-center gap-2">
                      <button className="text-emerald-500 hover:bg-emerald-50 p-2 rounded-xl transition-all" title="Add to Program">
                        <span className="material-symbols-outlined text-[24px]">add_circle</span>
                      </button>
                    </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            <div 
              onClick={() => onNavigate('exercise-create')}
              className="bg-white border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all p-8 cursor-pointer flex items-center justify-center opacity-80 hover:opacity-100"
            >
              <div className="flex items-center gap-3 py-2">
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-500 text-[20px] transition-colors">add</span>
                </div>
                <span className="font-bold text-sm text-slate-500 group-hover:text-emerald-600 transition-colors">{t('create_new_exercise')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
