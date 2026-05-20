import React from 'react';
import { Icon } from './helpers';
import { RoadmapData, RoadmapBlock } from '../../types/planning';

interface Props {
  roadmap: RoadmapData;
  planWeeks: number;
  currentWeek: number;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onEditBlock: (block: RoadmapBlock) => void;
  onAddBlock: (type: 'nutrition' | 'training') => void;
  t: (key: string, vars?: any) => string;
}

export default function RoadmapTimeline({ roadmap, planWeeks, currentWeek, selectedBlockId, onSelectBlock, onEditBlock, onAddBlock, t }: Props) {
  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon name="map" className="text-emerald-500" />
          {t('master_roadmap')}
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => onAddBlock('nutrition')}
            className="group flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 px-3 py-1.5 rounded-xl transition-all"
          >
            <Icon name="add" className="text-[18px]" /> {t('planning_nutrition_phase')}
          </button>
          <button
            onClick={() => onAddBlock('training')}
            className="group flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 px-3 py-1.5 rounded-xl transition-all"
          >
            <Icon name="add" className="text-[18px]" /> {t('training_block')}
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto pb-4 scrollbar-hide">
        <div className="min-w-[1000px]">
          {/* Week Labels */}
          <div className="flex justify-between px-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            {Array.from({ length: planWeeks }).map((_, i) => (
              <span key={i} style={{ width: `${100 / planWeeks}%` }} className="text-center">{t('planning_week_label_short', { week: i + 1 })}</span>
            ))}
          </div>

          {/* Nutrition Lane */}
          <div className="relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-4">
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">{t('nutrition')}</h4>
            <div className="flex gap-1 h-12 relative">
              {roadmap.nutrition.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-300 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  {t('planning_no_nutrition_phases', { defaultValue: 'No nutrition phases yet' })}
                </div>
              )}
              {roadmap.nutrition.map((block) => (
                <div
                  key={block.id}
                  onClick={() => onSelectBlock(block.id)}
                  style={{ width: `${((block.endWeek - block.startWeek + 1) / planWeeks) * 100}%` }}
                  className={`group relative flex items-center justify-center cursor-pointer transition-all border ${block.id === selectedBlockId ? 'ring-2 ring-emerald-500/50 scale-[0.99] z-10' : 'hover:scale-[0.99]'} ${block.colorToken} ${block.startWeek === 1 ? 'rounded-l-xl' : ''} ${block.endWeek === planWeeks ? 'rounded-r-xl' : ''}`}
                >
                  <span className="text-sm font-bold truncate px-2">{block.title}</span>
                  {block.startWeek <= currentWeek && block.endWeek >= currentWeek && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 rotate-45 z-10 shrink-0 shadow-sm" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditBlock(block);
                    }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/50 dark:bg-black/20 rounded-md"
                  >
                    <Icon name="edit" className="text-[16px]" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Training Lane */}
          <div className="relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">{t('training')}</h4>
            <div className="flex gap-1 h-12">
              {roadmap.training.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-300 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  {t('planning_no_training_blocks', { defaultValue: 'No training blocks yet' })}
                </div>
              )}
              {roadmap.training.map((block) => (
                <div
                  key={block.id}
                  onClick={() => onSelectBlock(block.id)}
                  style={{ width: `${((block.endWeek - block.startWeek + 1) / planWeeks) * 100}%` }}
                  className={`group relative flex items-center justify-center cursor-pointer transition-all border ${block.id === selectedBlockId ? 'ring-2 ring-emerald-500/50 scale-[0.99] z-10' : 'hover:scale-[0.99]'} ${block.colorToken} ${block.startWeek === 1 ? 'rounded-l-xl' : ''} ${block.endWeek === planWeeks ? 'rounded-r-xl' : ''}`}
                >
                  <span className="text-sm font-bold truncate px-2">{block.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditBlock(block);
                    }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/50 dark:bg-black/20 rounded-md"
                  >
                    <Icon name="edit" className="text-[16px]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
