import React from 'react';
import { motion } from 'motion/react';
import { Icon } from './helpers';
import Select from '../../components/ui/Select';
import { Goal } from '../../types/planning';

interface Props {
  goals: Goal[];
  editingGoalId: string | null;
  setEditingGoalId: (id: string | null) => void;
  onAddGoal: () => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  t: (key: string, vars?: any) => string;
}

export default function GoalsCard({ goals, editingGoalId, setEditingGoalId, onAddGoal, onUpdateGoal, onDeleteGoal, t }: Props) {
  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon name="flag" className="text-emerald-500" />
          {t('goals_targets')}
        </h3>
        <button
          onClick={onAddGoal}
          className="text-[10px] font-semibold text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-widest flex items-center gap-1"
        >
          <Icon name="add" className="text-[16px]" /> {t('planning_add_goal', { defaultValue: 'Add Goal' })}
        </button>
      </div>
      {goals.length === 0 && (
        <div className="p-8 text-center text-slate-300 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl uppercase text-[10px] font-bold tracking-widest">
          {t('planning_no_goals', { defaultValue: 'No goals defined yet' })}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {goals.map((goal) => editingGoalId === goal.id ? (
          <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-emerald-500 ring-4 ring-emerald-500/5 flex flex-col gap-3">
            <input
              className="text-sm font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
              value={goal.label}
              placeholder={t('planning_goal_label', { defaultValue: 'Goal name' })}
              onChange={(e) => onUpdateGoal(goal.id, { label: e.target.value })}
            />
            <Select
              className="text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
              value={goal.type}
              onChange={(val) => onUpdateGoal(goal.id, { type: val as Goal['type'] })}
            >
              <option value="physical">{t('physical', { defaultValue: 'Physical' })}</option>
              <option value="nutrition">{t('nutrition', { defaultValue: 'Nutrition' })}</option>
              <option value="training">{t('training', { defaultValue: 'Training' })}</option>
              <option value="mindset">{t('mindset', { defaultValue: 'Mindset' })}</option>
            </Select>
            <input
              className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
              value={goal.desc}
              placeholder={t('planning_goal_desc', { defaultValue: 'Description' })}
              onChange={(e) => onUpdateGoal(goal.id, { desc: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                value={goal.currentLabel}
                placeholder={t('planning_goal_current', { defaultValue: 'Current' })}
                onChange={(e) => onUpdateGoal(goal.id, { currentLabel: e.target.value })}
              />
              <input
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                value={goal.targetLabel}
                placeholder={t('planning_goal_target', { defaultValue: 'Target' })}
                onChange={(e) => onUpdateGoal(goal.id, { targetLabel: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('planning_progress', { defaultValue: 'Progress' })}: {goal.value}%</label>
              <input
                type="range" min="0" max="100" value={goal.value}
                onChange={(e) => onUpdateGoal(goal.id, { value: parseInt(e.target.value) || 0 })}
                className="w-full accent-emerald-500"
              />
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => onDeleteGoal(goal.id)} className="flex-1 py-2 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100">{t('delete', { defaultValue: 'Delete' })}</button>
              <button onClick={() => setEditingGoalId(null)} className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600">{t('done', { defaultValue: 'Done' })}</button>
            </div>
          </div>
        ) : (
          <div key={goal.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 relative group cursor-pointer hover:border-emerald-500 transition-all hover:shadow-md">
            <button onClick={() => setEditingGoalId(goal.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-emerald-500 bg-white rounded-lg shadow-sm border border-slate-100"><Icon name="edit" className="text-[16px]" /></button>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name={goal.type === 'physical' ? 'accessibility' : goal.type === 'nutrition' ? 'restaurant_menu' : goal.type === 'training' ? 'fitness_center' : 'psychology'} className={`text-[20px] ${goal.type === 'physical' ? 'text-blue-500' : goal.type === 'nutrition' ? 'text-amber-500' : goal.type === 'training' ? 'text-purple-500' : 'text-rose-500'}`} />
                {goal.label}
              </h4>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg uppercase tracking-wider ${goal.type === 'physical' ? 'bg-blue-100 text-blue-600' : goal.type === 'nutrition' ? 'bg-amber-100 text-amber-600' : goal.type === 'training' ? 'bg-purple-100 text-purple-600' : 'bg-rose-100 text-rose-600'}`}>{goal.value}%</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mb-4 line-clamp-1">{goal.desc}</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 shadow-inner overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goal.value}%` }}
                className={`h-full rounded-full ${goal.type === 'physical' ? 'bg-blue-500' : goal.type === 'nutrition' ? 'bg-amber-500' : goal.type === 'training' ? 'bg-purple-500' : 'bg-rose-500'}`}
              />
            </div>
            <div className="flex justify-between text-[9px] font-semibold text-slate-400 mt-2 uppercase tracking-widest">
              <span>{goal.currentLabel}</span>
              <span>{goal.targetLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
