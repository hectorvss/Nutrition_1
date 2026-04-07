import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fetchWithAuth } from '../api';
import { useLanguage } from '../context/LanguageContext';

interface DayPlan {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  weekViewLabel: string;
  bars: any[];
  tag: string;
  tagColor: string;
}



interface NutritionWeeklyViewProps {
  client: any;
  onBack: () => void;
  onSelectDay: (dayId: string) => void;
  onReassign: () => void;
  initialPlanData?: any;
}

export default function NutritionWeeklyView({ client, onBack, onSelectDay, onReassign, initialPlanData }: NutritionWeeklyViewProps) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [planData, setPlanData] = useState<any>(initialPlanData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedDayId, setDraggedDayId] = useState<string | null>(null);
  const [dragOverDayId, setDragOverDayId] = useState<string | null>(null);
  const [showPlanPicker, setShowPlanPicker] = useState<string | null>(null);

  useEffect(() => {
    if (initialPlanData) {
      setPlanData(initialPlanData);
      return;
    }

    const fetchPlanData = async () => {
      if (!client?.id) return;
      try {
        setIsLoading(true);
        const data = await fetchWithAuth(`/manager/clients/${client.id}/nutrition-plan`);
        if (data && data.data_json) {
          setPlanData(data);
        }
      } catch (error) {
        console.error('Error fetching nutrition plan:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlanData();
  }, [client?.id, initialPlanData]);

  const handleSave = async (updatedDataJson: any) => {
    if (!client?.id) return;
    setIsSaving(true);
    try {
      await fetchWithAuth(`/manager/clients/${client.id}/nutrition-plan`, {
        method: 'POST',
        body: JSON.stringify({
          name: planData?.name || `Plan de Nutrición - ${client.name}`,
          data_json: updatedDataJson
        })
      });
      setHasChanges(false);
    } catch (e) {
      console.error('Error saving nutrition plan:', e);
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
    if (!draggedDayId || draggedDayId === targetDayId || !planData?.data_json?.days) return;

    const newDays = { ...planData.data_json.days };
    const sourceDayData = newDays[draggedDayId];
    const targetDayData = newDays[targetDayId];

    // Swap day data
    if (sourceDayData) newDays[targetDayId] = sourceDayData;
    else delete newDays[targetDayId];

    if (targetDayData) newDays[draggedDayId] = targetDayData;
    else delete newDays[draggedDayId];

    const updatedDataJson = { ...planData.data_json, days: newDays };
    setPlanData({ ...planData, data_json: updatedDataJson });
    handleSave(updatedDataJson);
    setDraggedDayId(null);
  };

  const handleDragEnd = () => {
    setDraggedDayId(null);
    setDragOverDayId(null);
  };

  const daysConfig = [
    { id: 'monday', name: t('monday') },
    { id: 'tuesday', name: t('tuesday') },
    { id: 'wednesday', name: t('wednesday') },
    { id: 'thursday', name: t('thursday') },
    { id: 'friday', name: t('friday') },
    { id: 'saturday', name: t('saturday') },
    { id: 'sunday', name: t('sunday') },
  ];

  const processedDays: DayPlan[] = daysConfig.map((day, dayIdx) => {
    // Priority 1: Day-specific meals
    // Priority 2: Root-level meals (common for templates)
    let dayData = planData?.data_json?.days?.[day.id];
    
    // Fallback to top-level meals if day-specific meals are missing
    if (!dayData && planData?.data_json?.meals) {
      dayData = { meals: planData.data_json.meals };
    }
    
    if (!dayData || !dayData.meals || dayData.meals.length === 0) {
      return {
        ...day,
        calories: 0, protein: 0, carbs: 0, fats: 0,
        weekViewLabel: t('rest_day_label'),
        tag: t('rest_day_label'),
        tagColor: 'bg-slate-50 text-slate-400 border-slate-100',
        bars: [20, 20, 20, 20, 20]
      };
    }

    const meals = dayData.meals || [];
    let totalCals = 0, totalP = 0, totalC = 0, totalF = 0;
    
    meals.forEach((m: any) => {
      m.items.forEach((i: any) => {
        const qty = i.multiplier || i.quantity || 1;
        totalCals += (i.calories || 0) * qty;
        totalP += (i.protein || 0) * qty;
        totalC += (i.carbs || 0) * qty;
        totalF += (i.fats || 0) * qty;
      });
      // Handle macro categories if present
      if (m.categories) {
        m.categories.forEach((cat: any) => {
          if (cat.id === 'p' || cat.label?.toLowerCase().includes('protein')) totalP += cat.amount || 0;
          else if (cat.id === 'c' || cat.label?.toLowerCase().includes('carb')) totalC += cat.amount || 0;
          else if (cat.id === 'f' || cat.label?.toLowerCase().includes('fat')) totalF += cat.amount || 0;
        });
      }
    });

    // If macro categories were used, we need to recalculate total calories based on them if calories is 0
    if (totalCals === 0 && (totalP > 0 || totalC > 0 || totalF > 0)) {
      totalCals = (totalP * 4) + (totalC * 4) + (totalF * 9);
    }

    const totalMacros = (totalP * 4) + (totalC * 4) + (totalF * 9) || 1;
    const pPct = Math.round((totalP * 4 / totalMacros) * 100);
    const cPct = Math.round((totalC * 4 / totalMacros) * 100);
    const fPct = Math.round((totalF * 9 / totalMacros) * 100);

    const bars = meals.map((m: any) => {
      const mCals = m.items.reduce((a: number, i: any) => a + ((i.calories || 0) * (i.quantity || 1)), 0);
      const h = Math.min(100, Math.max(20, (mCals / (totalCals / meals.length || 1)) * 60));
      return { h, p: true };
    });

    return {
      id: day.id,
      name: day.name,
      calories: Math.round(totalCals),
      protein: pPct,
      carbs: cPct,
      fats: fPct,
      weekViewLabel: t('meals_count', { count: meals.length }),
      tag: dayIdx % 3 === 0 ? t('training_day') : t('rest_day_label'),
      tagColor: dayIdx % 3 === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100',
      bars
    };
  });

  return (
    <div className="flex flex-col w-full h-full">
      <div className="px-6 md:px-8 lg:px-10 py-4 md:py-6 pb-2">
        <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <button onClick={onBack} className="inline-flex items-center text-slate-500 hover:text-emerald-500 transition-colors">
                {t('nutrition')}
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
                Goal: {client?.goal || 'Fat Loss'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:block"></span>
              <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                {planData ? t('active_plan') : t('draft_not_assigned')}
              </span>
            </div>
          </div>
          
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mt-2 sm:mt-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1 text-center">{t('plan_progress')}</div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t('week')} 1 / 12
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 lg:px-10 pt-2 pb-20 overflow-y-auto">
        <div className="flex flex-col gap-4">
          
          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-emerald-500">
                <span className="material-symbols-outlined text-2xl">calendar_view_week</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{t('plan_distribution')}</h3>
                <p className="text-sm text-slate-500">{t('drag_to_reorganize')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {(isLoading || isSaving) && (
                <div className="flex items-center gap-2 mr-4">
                  <div className="w-4 h-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <span className="text-xs font-medium text-slate-400">{isSaving ? t('saving_dots') : 'Loading...'}</span>
                </div>
              )}
              {onReassign && (
                <button 
            onClick={onReassign}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all font-semibold text-sm"
          >
            <span className="material-symbols-outlined text-lg">rebase_edit</span>
            {t('reassign_plan')}
          </button>
              )}
              
              <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-[240px]">
                <button 
                  onClick={() => setViewMode('weekly')}
                  className={`flex-1 px-4 py-2 text-xs font-black rounded-lg transition-all ${viewMode === 'weekly' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t('weekly_view_btn')}
                </button>
                <button 
                  onClick={() => setViewMode('monthly')}
                  className={`flex-1 px-4 py-2 text-xs font-black rounded-lg transition-all ${viewMode === 'monthly' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t('month_view_btn')}
                </button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium">{t('loading_distribution')}</p>
            </div>
          ) : processedDays.map((day, dayIdx) => (
            <div 
              key={day.id}
              className={`relative transition-all ${draggedDayId === day.id ? 'opacity-40 grayscale' : ''} ${dragOverDayId === day.id ? 'scale-[1.01] -translate-y-1' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, day.id)}
              onDragOver={(e) => handleDragOver(e, day.id)}
              onDragLeave={() => setDragOverDayId(null)}
              onDrop={(e) => handleDrop(e, day.id)}
              onDragEnd={handleDragEnd}
            >
              <button
                onClick={() => onSelectDay(day.id)}
                className={`group w-full text-left bg-white dark:bg-slate-900 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-4 p-5 ${
                  dragOverDayId === day.id ? 'border-emerald-500 shadow-xl ring-2 ring-emerald-500/20' : 
                  'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50'
                }`}
              >
                <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors">
                  <span className="material-symbols-outlined text-[24px]">drag_indicator</span>
                </div>

                <div className="w-full sm:w-1/4 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 pb-4 sm:pb-0 sm:pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">{day.name}</h3>
                  </div>
                  <div className={`flex items-center gap-1.5 font-black text-2xl ${day.calories === 0 ? 'text-slate-300' : 'text-orange-500'}`}>
                    <span className="material-symbols-outlined text-lg">{day.calories === 0 ? 'bedtime' : 'local_fire_department'}</span>
                    {day.calories.toLocaleString()} <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">kcal</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`${day.tagColor} text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border`}>
                      {day.tag}
                    </span>
                    <div className="flex gap-3 text-[10px] text-slate-500 font-black tracking-widest uppercase">
                      <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/20"></div>{day.protein}% P</span>
                      <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20"></div>{day.carbs}% C</span>
                      <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20"></div>{day.fats}% F</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex shadow-inner">
                    <div className="bg-blue-500 h-full transition-all duration-500 group-hover:scale-x-105 origin-left" style={{ width: `${day.protein}%` }}></div>
                    <div className="bg-emerald-500 h-full transition-all duration-500 group-hover:scale-x-105 origin-left" style={{ width: `${day.carbs}%` }}></div>
                    <div className="bg-amber-500 h-full transition-all duration-500 group-hover:scale-x-105 origin-left" style={{ width: `${day.fats}%` }}></div>
                  </div>
                </div>

                <div className="w-full sm:w-1/4 flex-shrink-0 pl-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('nutrition_label')}</div>
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 text-xs">
                        {day.weekViewLabel.split(' ')[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase">{day.weekViewLabel.split(' ')[1] || 'Ingestas'}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500">arrow_forward</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
