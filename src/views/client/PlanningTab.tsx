import React, { useState, useEffect } from 'react';
import { Target, Utensils, Dumbbell } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { fetchWithAuth } from '../../api';

interface PlanningTabProps {
  clientId: string;
  t: Function;
  onNavigate?: (view: string, data?: any) => void;
}

const PlanningTab: React.FC<PlanningTabProps> = ({ clientId, t, onNavigate }) => {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      setIsLoadingRoadmap(true);
      try {
        const data = await fetchWithAuth(`/manager/clients/${clientId}/roadmap`);
        const dj = data?.data_json
          ? (typeof data.data_json === 'string' ? JSON.parse(data.data_json) : data.data_json)
          : null;
        if (dj) {
          setRoadmap({ ...dj, status: data?.status || dj.status || 'Draft' });
        } else {
          setRoadmap(null);
        }
      } catch (error) {
        console.error('Error fetching roadmap:', error);
        setRoadmap(null);
      } finally {
        setIsLoadingRoadmap(false);
      }
    };
    fetchRoadmap();
  }, [clientId]);

  if (isLoadingRoadmap) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-sm font-medium">{t('loading_general_information')}</p>
      </div>
    );
  }

  const nutritionBlocks: any[] = Array.isArray(roadmap?.nutrition) ? roadmap.nutrition : [];
  const trainingBlocks: any[] = Array.isArray(roadmap?.training) ? roadmap.training : [];
  const goals: any[] = Array.isArray(roadmap?.goals) ? roadmap.goals : [];
  const milestones: any[] = Array.isArray(roadmap?.milestones) ? roadmap.milestones : [];
  const tg = roadmap?.trajectoryGoals || null;
  const hasAnything = nutritionBlocks.length > 0 || trainingBlocks.length > 0 || goals.length > 0 || milestones.length > 0 || !!tg;

  if (!hasAnything) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
        <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">{t('no_planning_data_title')}</p>
        <p className="text-sm mt-2 max-w-sm mx-auto">{t('no_planning_data_desc')}</p>
      </div>
    );
  }

  const totalWeeks = (tg?.totalWeeks || roadmap?.totalWeeks || 12);
  const status = roadmap?.status || 'Draft';

  const BlockTimeline = ({ blocks, title, icon: Icon }: any) => {
    if (!blocks.length) return null;
    return (
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" /> {title}
        </p>
        <div className="space-y-2">
          {blocks
            .slice()
            .sort((a: any, b: any) => (a.startWeek || 0) - (b.startWeek || 0))
            .map((b: any, i: number) => (
              <div key={b.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex-shrink-0 w-14 text-center">
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">{t('week', { defaultValue: 'Week' })}</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{b.startWeek || '?'}–{b.endWeek || '?'}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{b.title || t('untitled', { defaultValue: 'Untitled block' })}</p>
                  {(b.stratData?.summary || b.rationale) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{b.stratData?.summary || b.rationale}</p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header: status + horizon */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('master_roadmap', { defaultValue: 'Master roadmap' })}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{totalWeeks} {t('weeks', { defaultValue: 'weeks' })}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
          status === 'Active'
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
        }`}>
          {status}
        </span>
      </div>

      {/* Trajectory goals */}
      {tg && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t('trajectory', { defaultValue: 'Trajectory' })}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: t('start_weight', { defaultValue: 'Start weight' }), value: tg.startWeight ? `${tg.startWeight} kg` : '—' },
              { label: t('current_weight'), value: tg.currentWeight ? `${tg.currentWeight} kg` : '—' },
              { label: t('target_weight', { defaultValue: 'Target weight' }), value: tg.targetWeight ? `${tg.targetWeight} kg` : '—' },
              { label: t('duration', { defaultValue: 'Duration' }), value: `${totalWeeks} ${t('weeks', { defaultValue: 'weeks' })}` },
            ].map((s, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phases */}
      {(nutritionBlocks.length > 0 || trainingBlocks.length > 0) && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <BlockTimeline blocks={nutritionBlocks} title={t('nutrition_focus', { defaultValue: 'Nutrition phases' })} icon={Utensils} />
          <BlockTimeline blocks={trainingBlocks} title={t('training_block', { defaultValue: 'Training blocks' })} icon={Dumbbell} />
        </div>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t('goals', { defaultValue: 'Goals' })}</h3>
          <div className="space-y-2">
            {goals.map((g: any, i: number) => (
              <div key={g.id || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{g.label}</p>
                  {g.desc && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{g.desc}</p>}
                </div>
                {(g.currentLabel || g.targetLabel) && (
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap ml-3">
                    {g.currentLabel || '—'} → {g.targetLabel || '—'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t('milestones', { defaultValue: 'Milestones' })}</h3>
          <div className="space-y-2">
            {milestones.map((m: any, i: number) => (
              <div key={m.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  m.status === 'done' ? 'bg-emerald-500' : m.status === 'next' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}></div>
                <p className="flex-1 text-sm font-bold text-slate-900 dark:text-white truncate">{m.label}</p>
                {m.week && <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{m.week}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningTab;
