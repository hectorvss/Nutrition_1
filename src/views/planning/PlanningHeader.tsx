import React from 'react';
import { Icon } from './helpers';
import { RoadmapData } from '../../types/planning';

interface Props {
  roadmap: RoadmapData;
  client: any;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  currentWeek: number;
  onNavigate: (view: string) => void;
  onSave: (status?: 'Draft' | 'Active') => void;
  t: (key: string, vars?: any) => string;
}

export default function PlanningHeader({ roadmap, client, saveStatus, currentWeek: _currentWeek, onNavigate, onSave, t }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 dark:text-slate-400">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <button onClick={() => onNavigate('planning')} className="inline-flex items-center hover:text-emerald-500 transition-colors focus:outline-none">
              {t('planning')}
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <Icon name="chevron_right" className="text-[16px] mx-1" />
              <span className="text-slate-900 dark:text-white font-medium">{client?.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="relative bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-amber-200 dark:border-amber-800/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 overflow-hidden">
        <div className={`absolute top-0 right-0 text-[10px] font-bold px-4 py-1 rounded-bl-lg shadow-sm z-10 uppercase tracking-wider ${
          /active|live/i.test(roadmap.status || '') ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-900'
        }`}>
          {/active|live/i.test(roadmap.status || '')
            ? t('planning_published', { defaultValue: 'Published' })
            : t('planning_editing_draft')}
        </div>

        <div className="flex items-center gap-4 relative z-10">
          {(client?.avatar_url || client?.avatar) ? (
            <div
              className="w-16 h-16 rounded-full bg-cover bg-center shadow-inner border-2 border-slate-50"
              style={{ backgroundImage: `url("${client.avatar_url || client.avatar}")` }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-50 shadow-inner border-2 border-slate-50 flex items-center justify-center text-emerald-500 font-bold text-xl">
              {(client?.name || 'C').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{client?.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-slate-500">{client?.gender}, {t('years_old_short', { age: client?.age })}</span>
            </div>
            {roadmap.config && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {roadmap.config.primaryGoal && (
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {t(roadmap.config.primaryGoal as any, { defaultValue: roadmap.config.primaryGoal.replace(/_/g, ' ') })}
                  </span>
                )}
                {roadmap.config.trainingFreq && (
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {roadmap.config.trainingFreq}d/sem
                  </span>
                )}
                {roadmap.config.nutritionApproach && (
                  <span className="text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {roadmap.config.nutritionApproach}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 relative z-10">
          <div className="bg-emerald-500 text-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center sm:justify-start">
            <Icon name="play_circle" className="fill-1" />
            <span className="font-bold text-sm">{t('planning_program_status', { status: roadmap.status })}</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                if (window.confirm(t('planning_discard_confirm', { defaultValue: 'Discard unsaved changes and leave?' }))) {
                  onNavigate('planning');
                }
              }}
              className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm transition-colors border border-slate-200 dark:border-slate-700"
            >
              {t('discard')}
            </button>
            <button
              onClick={() => onSave('Draft')}
              disabled={saveStatus === 'saving'}
              className={`flex-1 sm:flex-none py-2 px-6 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-60 ${
                saveStatus === 'saved' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                saveStatus === 'error' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                'border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              }`}
            >
              {saveStatus === 'saving' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saveStatus === 'saved' && <Icon name="check_circle" className="text-white" />}
              {saveStatus === 'error' && <Icon name="error" className="text-white" />}

              <span>
                {saveStatus === 'saving' ? t('saving') :
                 saveStatus === 'saved' ? t('saved') :
                 saveStatus === 'error' ? t('error') :
                 t('planning_save_draft')}
              </span>
            </button>
            <button
              onClick={() => onSave('Active')}
              disabled={saveStatus === 'saving'}
              className="flex-1 sm:flex-none py-2 px-6 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-60"
            >
              <Icon name="rocket_launch" className="text-[18px]" />
              <span>{t('planning_publish', { defaultValue: 'Publish' })}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
