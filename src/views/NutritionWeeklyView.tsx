import React, { useState } from 'react';
import { motion } from 'motion/react';

interface DayPlan {
  id: string;
  name: string;
  nameEn: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  weekViewLabel: string;
  bars: any[];
  tag: string;
  tagColor: string;
}

const WEEK_DAYS: DayPlan[] = [
  {
    id: 'monday',
    name: 'Lunes',
    nameEn: 'Monday',
    calories: 2200,
    protein: 30,
    carbs: 50,
    fats: 20,
    weekViewLabel: '3+2',
    tag: 'Entrenamiento',
    tagColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    bars: [80, 90, 70, 60, 50, {h: 40, p: true}, {h: 30, p: true}]
  },
  {
    id: 'tuesday',
    name: 'Martes',
    nameEn: 'Tuesday',
    calories: 2200,
    protein: 30,
    carbs: 50,
    fats: 20,
    weekViewLabel: '3+2',
    tag: 'Entrenamiento',
    tagColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    bars: [85, 85, 85, 70, 70, {h: 50, p: true}, {h: 40, p: true}]
  },
  {
    id: 'wednesday',
    name: 'Miércoles',
    nameEn: 'Wednesday',
    calories: 1800,
    protein: 35,
    carbs: 40,
    fats: 25,
    weekViewLabel: '4 meals',
    tag: 'Descanso Activo',
    tagColor: 'bg-blue-50 text-blue-600 border-blue-100',
    bars: [70, 70, 70, 80, 80, {h: 60, p: true}, {h: 60, p: true}]
  },
  {
    id: 'thursday',
    name: 'Jueves',
    nameEn: 'Thursday',
    calories: 2200,
    protein: 30,
    carbs: 50,
    fats: 20,
    weekViewLabel: '3+2',
    tag: 'Entrenamiento',
    tagColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    bars: [90, 90, 90, 90, 90, 90, {h: 70, p: true}]
  },
  {
    id: 'friday',
    name: 'Viernes',
    nameEn: 'Friday',
    calories: 2200,
    protein: 30,
    carbs: 50,
    fats: 20,
    weekViewLabel: '3+2',
    tag: 'Entrenamiento',
    tagColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    bars: [100, 100, 100, 100, 100, {h: 100, p: true}, {h: 60, p: true}]
  },
  {
    id: 'saturday',
    name: 'Sábado',
    nameEn: 'Saturday',
    calories: 2500,
    protein: 25,
    carbs: 55,
    fats: 20,
    weekViewLabel: 'Libre Estructurado',
    tag: 'Social / Refeed',
    tagColor: 'bg-purple-50 text-purple-600 border-purple-100',
    bars: [95, 95, 95, 95, 95, {h: 80, p: true}, {h: 80, p: true}]
  },
  {
    id: 'sunday',
    name: 'Domingo',
    nameEn: 'Sunday',
    calories: 1800,
    protein: 35,
    carbs: 40,
    fats: 25,
    weekViewLabel: 'Descanso',
    tag: 'Reset',
    tagColor: 'bg-slate-50 text-slate-600 border-slate-100',
    bars: [60, 60, 60, 60, 60, 60, {h: 60, p: true}]
  }
];

interface NutritionWeeklyViewProps {
  client: any;
  onBack: () => void;
  onSelectDay: (dayId: string) => void;
  onReassign?: () => void;
}

export default function NutritionWeeklyView({ client, onBack, onSelectDay, onReassign }: NutritionWeeklyViewProps) {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  
  return (
    <div className="flex flex-col w-full">
      <div className="p-4 md:p-6 pb-2">
        <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <button onClick={onBack} className="inline-flex items-center text-slate-500 hover:text-emerald-500 transition-colors">
                Nutrition
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

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div 
              className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm" 
              style={{ backgroundImage: `url("${client?.avatar || 'https://ui-avatars.com/api/?name=C&background=random'}")` }}
            ></div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"></div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{client?.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">flag</span>
                Goal: Fat Loss
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:block"></span>
              <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Plan Activo
              </span>
            </div>
          </div>
          
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mt-2 sm:mt-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1 text-center">Plan Progress</div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Week 4 / 12
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 pt-2 pb-20">
        <div className="flex flex-col gap-4">
          
          {/* View Mode Toggle Area (Replaces Create New Plan) */}
          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-emerald-500">
                <span className="material-symbols-outlined text-2xl">calendar_view_week</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Plan Distribution</h3>
                <p className="text-sm text-slate-500">Visualiza el balance semanal o mensual de tu cliente.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {onReassign && (
                <button 
                  onClick={onReassign}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-all font-bold text-xs"
                >
                  <span className="material-symbols-outlined text-[20px]">sync</span>
                  REASSIGN PLAN
                </button>
              )}
              
              <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-[240px]">
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
          {WEEK_DAYS.map((day) => (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className="group w-full text-left bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-6 p-5"
            >
              <div className="w-full sm:w-1/4 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700 pb-4 sm:pb-0 sm:pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{day.name}</h3>
                  <span className="text-xs text-slate-400 font-medium">/ {day.nameEn}</span>
                </div>
                <div className="flex items-center gap-1.5 text-orange-500 font-bold text-xl">
                  <span className="material-symbols-outlined text-lg">local_fire_department</span>
                  {day.calories.toLocaleString()} <span className="text-xs font-medium text-slate-400">kcal</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`${day.tagColor} text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide border`}>
                    {day.tag}
                  </span>
                  <div className="flex gap-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>{day.protein}% P</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>{day.carbs}% C</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>{day.fats}% F</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
                  <div className="bg-blue-500 h-full transition-all" style={{ width: `${day.protein}%` }}></div>
                  <div className="bg-green-500 h-full transition-all" style={{ width: `${day.carbs}%` }}></div>
                  <div className="bg-yellow-500 h-full transition-all" style={{ width: `${day.fats}%` }}></div>
                </div>
              </div>

              <div className="w-full sm:w-1/4 flex-shrink-0 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-700 pt-4 sm:pt-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Distribución</span>
                  <span className="text-[10px] text-slate-400 font-medium">{day.weekViewLabel}</span>
                </div>
                <div className="flex gap-1 h-8 items-end justify-between">
                  {day.bars.map((bar: any, bi) => {
                    const height = typeof bar === 'number' ? bar : bar.h;
                    const isPrimary = typeof bar === 'object' && bar.p;
                    return (
                      <div 
                        key={bi} 
                        className={`w-1.5 rounded-t-sm transition-all ${isPrimary ? 'bg-emerald-500/60' : 'bg-slate-300 dark:bg-slate-600'}`} 
                        style={{ height: `${height}%` }}
                      ></div>
                    );
                  })}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
