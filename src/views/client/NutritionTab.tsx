import React, { useState } from 'react';
import {
  Activity,
  TrendingDown,
  Calendar,
  X,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import NutritionPlanCard from './NutritionPlanCard';

interface NutritionTabProps {
  stats: any;
  isLoading: boolean;
  t: Function;
}

const NutritionTab: React.FC<NutritionTabProps> = ({ stats, isLoading, t }) => {
  const [showBodyFat, setShowBodyFat] = useState(false);
  const [weightRange, setWeightRange] = useState<'3M' | '6M' | '1Y'>('3M');

  const getFilteredWeightData = () => {
    const history = stats?.weightHistory || [];
    if (history.length === 0) return [];
    const cutoff = new Date();
    if (weightRange === '3M') cutoff.setMonth(cutoff.getMonth() - 3);
    else if (weightRange === '6M') cutoff.setMonth(cutoff.getMonth() - 6);
    else cutoff.setFullYear(cutoff.getFullYear() - 1);
    return history.filter((h: any) => {
      const d = new Date(h.date);
      return !isNaN(d.getTime()) && d >= cutoff;
    });
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm font-medium">{t('loading_stats')}</p>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('weight'), value: stats?.latestWeight || '--', unit: 'kg', change: '', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('loss_goal'), value: stats?.goal || 'TBD', unit: '', change: t('target'), icon: TrendingDown, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('body_fat'), value: stats?.bodyFat || '--', unit: '%', change: '', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('active'), value: stats?.activeDays || '0', unit: t('days'), change: `${stats?.adherenceRate || 0}% ${t('rate')}`, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                <span className="text-xs font-bold text-slate-400">{stat.unit}</span>
              </div>
              <p className={`text-[10px] font-bold ${stat.color}`}>{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('weight_progress')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{t('goal')}: {stats?.goal || 'TBD'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('overlay_body_fat')}</span>
                <button
                  type="button"
                  onClick={() => setShowBodyFat(prev => !prev)}
                  className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${showBodyFat ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${showBodyFat ? 'left-5' : 'left-1'}`}></div>
                </button>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {(['3M', '6M', '1Y'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setWeightRange(p)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${weightRange === p ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getFilteredWeightData()}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBodyFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                {showBodyFat && <YAxis yAxisId="bf" hide domain={['dataMin - 5', 'dataMax + 5']} />}
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-white)', color: 'var(--tw-colors-slate-900)' }}
                  labelStyle={{ fontWeight: 700, marginBottom: '4px' }}
                />
                {showBodyFat && <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '10px' }} />}
                <Area name={t('weight')} type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" connectNulls />
                {showBodyFat && (
                  <Area name={t('body_fat')} yAxisId="bf" type="monotone" dataKey="bodyFat" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorBodyFat)" connectNulls />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('macro_adherence')}</h3>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">{t('avg_7_days')}</span>
            </div>
            <div className="space-y-6">
              {(() => {
                const m = stats?.macros || {};
                const rows = [
                  { label: 'PROTEIN', grams: m.protein || 0, color: 'bg-emerald-500' },
                  { label: 'CARBS', grams: m.carbs || 0, color: 'bg-blue-400' },
                  { label: 'FATS', grams: m.fats || 0, color: 'bg-amber-400' },
                ];
                const total = rows.reduce((s, r) => s + r.grams, 0);
                return rows.map((macro, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{macro.label}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-500">{macro.grams} g</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className={`${macro.color} h-2 rounded-full`} style={{ width: `${total > 0 ? (macro.grams / total) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('daily_caloric_avg')}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stats?.macros?.calories || 0} kcal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('plan_adherence')}</span>
                <span className="text-sm font-bold text-emerald-500">{stats?.macros?.adherenceScore != null ? `${stats.macros.adherenceScore}%` : '--'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('allergies')}</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {stats?.allergies?.map((allergy: string, idx: number) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[10px] font-bold border border-red-100 dark:border-red-800/50 uppercase">
                  <X className="w-3 h-3" /> {allergy}
                </span>
              ))}
            </div>
            {stats?.dietaryStyle?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t('dietary_style')}</p>
                <div className="flex flex-wrap gap-2">
                  {stats.dietaryStyle.map((style: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-800/50">{style}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <NutritionPlanCard plan={stats?.nutritionPlan} />
      </div>
      </>
      )}
    </div>
  );
};

export default NutritionTab;
