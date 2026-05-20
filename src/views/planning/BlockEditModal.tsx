import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Select from '../../components/ui/Select';
import { Icon } from './helpers';
import { RoadmapBlock } from '../../types/planning';

interface Props {
  editingBlockId: string;
  draftBlockValues: Partial<RoadmapBlock>;
  setDraftBlockValues: (v: Partial<RoadmapBlock> | null) => void;
  editError: string | null;
  planWeeks: number;
  onClose: () => void;
  onDelete: (id: string) => void;
  onConfirm: (id: string, values: Partial<RoadmapBlock>) => boolean;
  t: (key: string, vars?: any) => string;
}

export default function BlockEditModal({
  editingBlockId,
  draftBlockValues,
  setDraftBlockValues,
  editError,
  planWeeks,
  onClose,
  onDelete,
  onConfirm,
  t,
}: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon name="edit" className="text-emerald-500" />
              {t('planning_edit_block', { type: draftBlockValues.type === 'nutrition' ? t('nutrition') : t('training') })}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
              <Icon name="close" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-100 dark:border-rose-800/50 flex items-center gap-2">
                <Icon name="error" className="text-sm" />
                {editError}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{t('planning_block_title')}</label>
              <input
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                value={draftBlockValues.title || ''}
                onChange={(e) => setDraftBlockValues({ ...draftBlockValues, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{t('planning_start_week')}</label>
                <Select
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={draftBlockValues.startWeek}
                  onChange={(raw) => {
                    const val = parseInt(raw);
                    const duration = (draftBlockValues.endWeek || 1) - (draftBlockValues.startWeek || 1);
                    setDraftBlockValues({
                      ...draftBlockValues,
                      startWeek: val,
                      endWeek: Math.min(val + duration, planWeeks)
                    });
                  }}
                >
                  {Array.from({ length: planWeeks }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{t('planning_week_label', { week: i + 1 })}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{t('total_duration')}</label>
                <Select
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={(draftBlockValues.endWeek || 1) - (draftBlockValues.startWeek || 1) + 1}
                  onChange={(raw) => {
                    const dur = parseInt(raw);
                    setDraftBlockValues({
                      ...draftBlockValues,
                      endWeek: Math.min((draftBlockValues.startWeek || 1) + dur - 1, planWeeks)
                    });
                  }}
                >
                  {Array.from({ length: planWeeks }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} {t('weeks_label')}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{t('planning_end_week')}</label>
                <Select
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={draftBlockValues.endWeek}
                  onChange={(raw) => setDraftBlockValues({ ...draftBlockValues, endWeek: parseInt(raw) })}
                >
                  {Array.from({ length: planWeeks }).map((_, i) => (
                    <option key={i + 1} disabled={i + 1 < (draftBlockValues.startWeek || 1)} value={i + 1}>{t('planning_week_label', { week: i + 1 })}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{t('planning_block_color')}</label>
              <div className="flex gap-2">
                {[
                  'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
                  'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
                  'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
                  'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400',
                  'bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400',
                  'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => setDraftBlockValues({ ...draftBlockValues, colorToken: c })}
                    className={`w-8 h-8 rounded-full border-2 ${c.split(' ')[0]} ${draftBlockValues.colorToken === c ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => onDelete(editingBlockId)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20 font-bold text-xs transition-colors border border-rose-100 dark:border-rose-800/50 flex items-center justify-center gap-2"
              >
                <Icon name="delete" className="text-[18px]" /> {t('planning_delete_block')}
              </button>
              <button
                onClick={() => {
                  if (onConfirm(editingBlockId, draftBlockValues)) {
                    onClose();
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md active:scale-95"
              >
                {t('planning_confirm_changes')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
