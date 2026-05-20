import React from 'react';
import { Icon } from './helpers';
import Select from '../../components/ui/Select';
import { Milestone } from '../../types/planning';

interface Props {
  milestones: Milestone[];
  assumptions: { steps: string; sleep: string; constraints: string };
  onUpdateMilestone: (id: string, updates: Partial<Milestone>) => void;
  onDeleteMilestone: (id: string) => void;
  onAddMilestone: () => void;
  onUpdateAssumptions: (updates: Partial<{ steps: string; sleep: string; constraints: string }>) => void;
  t: (key: string, vars?: any) => string;
}

export default function MilestonesSection({
  milestones,
  assumptions,
  onUpdateMilestone,
  onDeleteMilestone,
  onAddMilestone,
  onUpdateAssumptions,
  t,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">

      {/* --- 6. MILESTONES --- */}
      <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[11px] font-semibold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
            <Icon name="timeline" className="text-slate-400" />
            {t('key_milestones')}
          </h3>
          <button onClick={onAddMilestone} className="text-[10px] font-semibold text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-widest">+ {t('planning_add_milestone', { defaultValue: 'Add Milestone' })}</button>
        </div>
        {milestones.length === 0 && (
          <div className="p-6 text-center text-slate-300 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl uppercase text-[10px] font-bold tracking-widest">
            {t('planning_no_milestones', { defaultValue: 'No milestones yet' })}
          </div>
        )}
        <div className="space-y-3">
          {milestones.map((m) => (
            <div key={m.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${m.status === 'next' ? 'bg-white dark:bg-[#1e293b] border-emerald-500 ring-4 ring-emerald-500/5' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.status === 'done' ? 'bg-green-500' : m.status === 'next' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'bg-slate-300 dark:bg-slate-600'}`} />
                <div className="flex-1 min-w-0">
                  <input
                    className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1.5 bg-transparent border-none p-0 focus:ring-0 outline-none w-full"
                    value={m.label}
                    onChange={(e) => onUpdateMilestone(m.id, { label: e.target.value })}
                  />
                  <input
                    className={`text-[10px] font-semibold uppercase tracking-widest bg-transparent border-none p-0 focus:ring-0 outline-none w-full ${m.status === 'next' ? 'text-emerald-500' : 'text-slate-400'}`}
                    value={m.week}
                    onChange={(e) => onUpdateMilestone(m.id, { week: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Select
                  className="px-2 py-1.5 text-[9px] font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 outline-none uppercase tracking-widest"
                  value={m.status}
                  onChange={(val) => onUpdateMilestone(m.id, { status: val as Milestone['status'] })}
                >
                  <option value="future">{t('planning_status_future', { defaultValue: 'Future' })}</option>
                  <option value="next">{t('planning_status_next', { defaultValue: 'Next' })}</option>
                  <option value="done">{t('planning_status_done', { defaultValue: 'Done' })}</option>
                </Select>
                <button
                  onClick={() => onDeleteMilestone(m.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Icon name="delete" className="text-[16px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- 7. ASSUMPTIONS --- */}
      <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-[11px] font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
          <Icon name="rule" className="text-slate-400" />
          {t('strategic_assumptions')}
        </h3>
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{t('daily_steps_target', { defaultValue: 'Daily Steps Target' })}</label>
            <input
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
              type="text"
              value={assumptions.steps}
              onChange={(e) => onUpdateAssumptions({ steps: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{t('sleep_hygiene', { defaultValue: 'Sleep Hygiene' })}</label>
            <input
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
              type="text"
              value={assumptions.sleep}
              onChange={(e) => onUpdateAssumptions({ sleep: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{t('primary_constraints', { defaultValue: 'Primary Constraints' })}</label>
            <textarea
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none font-medium leading-relaxed h-20"
              value={assumptions.constraints}
              onChange={(e) => onUpdateAssumptions({ constraints: e.target.value })}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
