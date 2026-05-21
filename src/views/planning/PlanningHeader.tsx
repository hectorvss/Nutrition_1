import React from 'react';
import { Icon } from './helpers';
import { RoadmapData } from '../../types/planning';

interface Props {
  roadmap: RoadmapData;
  client: any;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  currentWeek: number;
  /** True when the roadmap has unsaved edits — gates the "Save changes" button. */
  hasChanges: boolean;
  onNavigate: (view: string) => void;
  onSave: (status?: 'Draft' | 'Active') => void;
  /** Opens the template selector to assign a different plan to this client. */
  onReassign: () => void;
  t: (key: string, vars?: any) => string;
  /** Template-authoring mode: no client, editable name, "assign to client". */
  isTemplate?: boolean;
  templateName?: string;
  onRenameTemplate?: (name: string) => void;
  onAssign?: () => void;
}

export default function PlanningHeader({
  roadmap, client, saveStatus, currentWeek: _currentWeek, hasChanges,
  onNavigate, onSave, onReassign, t,
  isTemplate, templateName, onRenameTemplate, onAssign,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 dark:text-slate-400">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <button onClick={() => onNavigate(isTemplate ? 'planning-templates' : 'planning')} className="inline-flex items-center hover:text-emerald-500 transition-colors focus:outline-none">
              {isTemplate ? t('planning_templates_title', { defaultValue: 'Plantillas de Planificación' }) : t('planning')}
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <Icon name="chevron_right" className="text-[16px] mx-1" />
              <span className="text-slate-900 dark:text-white font-medium">{isTemplate ? (templateName || t('new_template_name', { defaultValue: 'Nueva plantilla' })) : client?.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="relative bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-amber-200 dark:border-amber-800/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 overflow-hidden">
        <div className={`absolute top-0 right-0 text-[10px] font-bold px-4 py-1 rounded-bl-lg shadow-sm z-10 uppercase tracking-wider ${
          isTemplate ? 'bg-emerald-500 text-white'
            : /active|live/i.test(roadmap.status || '') ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-900'
        }`}>
          {isTemplate
            ? t('template_label', { defaultValue: 'Plantilla' })
            : /active|live/i.test(roadmap.status || '')
              ? t('planning_published', { defaultValue: 'Published' })
              : t('planning_editing_draft')}
        </div>

        <div className="flex items-center gap-4 relative z-10">
          {isTemplate ? (
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 shadow-inner border-2 border-slate-50 flex items-center justify-center text-emerald-500">
              <Icon name="map" className="text-[32px]" />
            </div>
          ) : (client?.avatar_url || client?.avatar) ? (
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
            {isTemplate ? (
              <input
                value={templateName || ''}
                onChange={(e) => onRenameTemplate?.(e.target.value)}
                placeholder={t('template_name', { defaultValue: 'Nombre de la plantilla' })}
                className="text-2xl font-bold text-slate-900 dark:text-white leading-tight bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-emerald-500 outline-none transition-colors"
              />
            ) : (
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{client?.name}</h2>
            )}
            {!isTemplate && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-slate-500">{client?.gender}, {t('years_old_short', { age: client?.age })}</span>
              </div>
            )}
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

        {/* "Save changes" (only with unsaved edits) plus a context action:
            reassign the client's plan, or assign the template to a client. */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 relative z-10">
          <div className="flex gap-2 w-full sm:w-auto">
            {(hasChanges || saveStatus !== 'idle') && (
              <button
                onClick={() => onSave('Draft')}
                disabled={saveStatus === 'saving'}
                className={`flex-1 sm:flex-none py-2 px-6 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-60 ${
                  saveStatus === 'saved' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                  saveStatus === 'error' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                  'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                }`}
              >
                {saveStatus === 'saving' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saveStatus === 'saved' && <Icon name="check_circle" className="text-white" />}
                {saveStatus === 'error' && <Icon name="error" className="text-white" />}
                <span>
                  {saveStatus === 'saving' ? t('saving') :
                   saveStatus === 'saved' ? t('saved') :
                   saveStatus === 'error' ? t('error') :
                   t('planning_save_changes', { defaultValue: 'Guardar cambios' })}
                </span>
              </button>
            )}
            {isTemplate ? (
              <button
                onClick={onAssign}
                className="flex-1 sm:flex-none py-2 px-6 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <Icon name="person_add" className="text-[18px]" />
                <span>{t('assign_to_client', { defaultValue: 'Asignar a cliente' })}</span>
              </button>
            ) : (
              <button
                onClick={onReassign}
                className="flex-1 sm:flex-none py-2 px-6 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <Icon name="swap_horiz" className="text-[18px]" />
                <span>{t('planning_reassign_plan', { defaultValue: 'Reasignar plan' })}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
