import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './helpers';
import { BlockStrategicDetails, RoadmapBlock } from '../../types/planning';

interface Props {
  selectedBlock: RoadmapBlock | undefined;
  currentWeek: number;
  draftStratData: BlockStrategicDetails | null;
  setDraftStratData: React.Dispatch<React.SetStateAction<BlockStrategicDetails | null>>;
  editingBlockId: string | null;
  setEditingBlockId: (id: string | null) => void;
  draftBlockValues: Partial<RoadmapBlock> | null;
  setDraftBlockValues: (v: Partial<RoadmapBlock> | null) => void;
  onSaveStratData: (blockId: string, updates: Partial<RoadmapBlock>) => void;
  t: (key: string, vars?: any) => string;
}

export default function BlockStrategyEditor({
  selectedBlock,
  currentWeek,
  draftStratData,
  setDraftStratData,
  onSaveStratData,
  t,
}: Props) {
  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Icon name="psychology" className="font-variation-fill" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('planning_block_strategic_details', { defaultValue: 'Block Strategic Details' })}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('planning_strategy_roadmap_week_intelligence', { week: currentWeek })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 uppercase tracking-widest">{t('planning_active_phase')}</span>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {selectedBlock ? (
            <motion.div
              key={selectedBlock.id}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-10"
            >
              {/* Header with Title & Save */}
              <div className="flex items-center justify-between -mb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{t('planning_active_phase_selection')}</span>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedBlock.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDraftStratData(JSON.parse(JSON.stringify(selectedBlock.stratData)))}
                    className="px-4 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                  >
                    {t('reset')}
                  </button>
                  <button
                    onClick={() => {
                      if (!draftStratData) return;
                      const updates: Partial<RoadmapBlock> = {
                        stratData: draftStratData,
                        title: selectedBlock.title,
                      };

                      if (selectedBlock.type === 'nutrition') {
                        updates.rationale = draftStratData.summary;
                        updates.kcal = draftStratData.kcal;
                        updates.macros = draftStratData.macros;
                        updates.freq = draftStratData.freq;
                        updates.water = draftStratData.water;
                      } else {
                        updates.focus = draftStratData.trainingFocus;
                        updates.sessions = draftStratData.sessions;
                        updates.deload = draftStratData.deload;
                        updates.intensityTargets = draftStratData.intensityTargets;
                      }

                      onSaveStratData(selectedBlock.id, updates);
                    }}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                  >
                    <Icon name="save" className="text-[16px]" />
                    {t('planning_save_details')}
                  </button>
                </div>
              </div>

              {/* Nutrition Section */}
              {selectedBlock.type === 'nutrition' && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                      <Icon name="restaurant" className="text-[20px]" />
                      <h4 className="font-semibold text-xs uppercase tracking-widest">{t('planning_nutrition_strategy')}</h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">(W{selectedBlock.startWeek}-{selectedBlock.endWeek})</span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('planning_daily_calories')}</p>
                      <div className="flex items-center gap-1.5 font-bold">
                        <input
                          className="text-xl bg-transparent border-none p-0 focus:ring-0 w-full outline-none text-slate-900 dark:text-white"
                          value={draftStratData?.kcal || ''}
                          onChange={(e) => setDraftStratData(prev => prev ? { ...prev, kcal: e.target.value } : null)}
                        />
                        <span className="text-xs text-amber-600 font-medium shrink-0">kcal</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('planning_macro_split')}</p>
                      <div className="flex flex-col">
                        <input
                          className="text-xl font-bold bg-transparent border-none p-0 focus:ring-0 outline-none text-slate-900 dark:text-white"
                          value={draftStratData?.macros || ''}
                          onChange={(e) => setDraftStratData(prev => prev ? { ...prev, macros: e.target.value } : null)}
                        />
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">P / C / F</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('planning_meal_freq')}</p>
                      <input
                        className="text-xl font-bold bg-transparent border-none p-0 focus:ring-0 outline-none text-slate-900 dark:text-white"
                        value={draftStratData?.freq || ''}
                        onChange={(e) => setDraftStratData(prev => prev ? { ...prev, freq: e.target.value } : null)}
                      />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('hydration_goal')}</p>
                      <input
                        className="text-xl font-bold bg-transparent border-none p-0 focus:ring-0 outline-none text-slate-900 dark:text-white"
                        value={draftStratData?.water || ''}
                        onChange={(e) => setDraftStratData(prev => prev ? { ...prev, water: e.target.value } : null)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                        <Icon name="target" className="text-sm" /> Primary Objective
                      </h5>
                      <textarea
                        className="w-full text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 resize-none h-32 transition-all"
                        value={draftStratData?.primaryObjective || ''}
                        onChange={(e) => setDraftStratData(prev => prev ? { ...prev, primaryObjective: e.target.value } : null)}
                        placeholder="Add primary objective here..."
                      />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                        <Icon name="assignment" className="text-sm" /> Secondary Objectives
                      </h5>
                      <div className="space-y-2">
                        {(draftStratData?.secondaryObjectives || []).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                            <input
                              className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none font-medium"
                              value={item}
                              onChange={(e) => {
                                const newItems = [...(draftStratData?.secondaryObjectives || [])];
                                newItems[idx] = e.target.value;
                                setDraftStratData(prev => prev ? { ...prev, secondaryObjectives: newItems } : null);
                              }}
                            />
                          </div>
                        ))}
                        <button
                          onClick={() => setDraftStratData(prev => prev ? { ...prev, secondaryObjectives: [...(prev.secondaryObjectives || []), ''] } : null)}
                          className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1 hover:underline"
                        >
                          + Add Objective
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Training Section */}
              {selectedBlock.type === 'training' && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Icon name="fitness_center" className="text-[20px]" />
                      <h4 className="font-semibold text-xs uppercase tracking-widest">{t('planning_training_strategy')}</h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">(W{selectedBlock.startWeek}-{selectedBlock.endWeek})</span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('planning_block_focus')}</p>
                      <input
                        className="text-xl font-bold bg-transparent border-none p-0 focus:ring-0 outline-none text-slate-900 dark:text-white"
                        value={draftStratData?.trainingFocus || ''}
                        onChange={(e) => setDraftStratData(prev => prev ? { ...prev, trainingFocus: e.target.value } : null)}
                      />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('planning_volume_sets')}</p>
                      <input
                        className="text-xl font-bold bg-transparent border-none p-0 focus:ring-0 outline-none text-slate-900 dark:text-white w-full"
                        value={draftStratData?.trainingVolume || ''}
                        onChange={(e) => setDraftStratData(prev => prev ? { ...prev, trainingVolume: e.target.value } : null)}
                      />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('intensity_level')}</p>
                      <input
                        className="text-xl font-bold bg-transparent border-none p-0 focus:ring-0 outline-none text-slate-900 dark:text-white"
                        value={draftStratData?.trainingIntensity || ''}
                        onChange={(e) => setDraftStratData(prev => prev ? { ...prev, trainingIntensity: e.target.value } : null)}
                      />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('planning_cardio')}</p>
                      <input
                        className="text-xl font-bold bg-transparent border-none p-0 focus:ring-0 outline-none text-slate-900 dark:text-white"
                        value={draftStratData?.cardio || ''}
                        onChange={(e) => setDraftStratData(prev => prev ? { ...prev, cardio: e.target.value } : null)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                        <Icon name="trending_up" className="text-sm" /> Intensity Targets
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {(draftStratData?.intensityTargets || []).map((target, idx) => (
                          <input
                            key={idx}
                            className="px-3 py-2 bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold border border-purple-100 dark:border-purple-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                            value={target}
                            onChange={(e) => {
                              if (!draftStratData) return;
                              const newTargets = [...(draftStratData.intensityTargets || [])];
                              newTargets[idx] = e.target.value;
                              setDraftStratData({ ...draftStratData, intensityTargets: newTargets });
                            }}
                          />
                        ))}
                        <button
                          onClick={() => setDraftStratData(prev => prev ? { ...prev, intensityTargets: [...(prev.intensityTargets || []), ''] } : null)}
                          className="text-[9px] font-bold text-purple-500 uppercase tracking-widest mt-1 hover:underline"
                        >
                          + Add Target
                        </button>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                        <Icon name="assignment_late" className="text-sm" /> Risks &amp; Constraints
                      </h5>
                      <div className="space-y-2">
                        {(draftStratData?.risksAndConstraints || []).map((risk, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                            <input
                              className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none font-medium"
                              value={risk}
                              onChange={(e) => {
                                const newRisks = [...(draftStratData?.risksAndConstraints || [])];
                                newRisks[idx] = e.target.value;
                                setDraftStratData(prev => prev ? { ...prev, risksAndConstraints: newRisks } : null);
                              }}
                            />
                          </div>
                        ))}
                        <button
                          onClick={() => setDraftStratData(prev => prev ? { ...prev, risksAndConstraints: [...(prev.risksAndConstraints || []), ''] } : null)}
                          className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-1 hover:underline"
                        >
                          + Add Risk
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Training objectives */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                        <Icon name="target" className="text-sm" /> {t('planning_primary_objective', { defaultValue: 'Primary Objective' })}
                      </h5>
                      <textarea
                        className="w-full text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 resize-none h-32 transition-all"
                        value={draftStratData?.primaryObjective || ''}
                        onChange={(e) => setDraftStratData(prev => prev ? { ...prev, primaryObjective: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                        <Icon name="assignment" className="text-sm" /> {t('planning_secondary_objectives', { defaultValue: 'Secondary Objectives' })}
                      </h5>
                      <div className="space-y-2">
                        {(draftStratData?.secondaryObjectives || []).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                            <input
                              className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none font-medium"
                              value={item}
                              onChange={(e) => {
                                const newItems = [...(draftStratData?.secondaryObjectives || [])];
                                newItems[idx] = e.target.value;
                                setDraftStratData(prev => prev ? { ...prev, secondaryObjectives: newItems } : null);
                              }}
                            />
                          </div>
                        ))}
                        <button
                          onClick={() => setDraftStratData(prev => prev ? { ...prev, secondaryObjectives: [...(prev.secondaryObjectives || []), ''] } : null)}
                          className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1 hover:underline"
                        >
                          + Add Objective
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Shared Strategy Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                    <Icon name="psychology" className="text-sm text-blue-500" /> Strategic Summary
                  </h5>
                  <textarea
                    className="w-full text-sm text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 resize-none h-24 transition-all"
                    value={draftStratData?.summary || ''}
                    onChange={(e) => setDraftStratData(prev => prev ? { ...prev, summary: e.target.value } : null)}
                  />
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                    <Icon name="check_circle" className="text-sm text-amber-500" /> Success Criteria
                  </h5>
                  <div className="space-y-2">
                    {(draftStratData?.successCriteria || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100/50 dark:border-orange-900/20 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
                        <input
                          className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none font-medium"
                          value={item}
                          onChange={(e) => {
                            const newItems = [...(draftStratData?.successCriteria || [])];
                            newItems[idx] = e.target.value;
                            setDraftStratData(prev => prev ? { ...prev, successCriteria: newItems } : null);
                          }}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setDraftStratData(prev => prev ? { ...prev, successCriteria: [...(prev.successCriteria || []), ''] } : null)}
                      className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-1 hover:underline"
                    >
                      + Add Criteria
                    </button>
                  </div>
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                    <Icon name="format_list_bulleted" className="text-sm text-emerald-500" /> Key Performance Indicators (KPIs)
                  </h5>
                  <div className="space-y-2">
                    {(draftStratData?.kpis || []).map((kpi, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400">0{idx + 1}</span>
                        <input
                          className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none font-medium"
                          value={kpi}
                          onChange={(e) => {
                            const newKpis = [...(draftStratData?.kpis || [])];
                            newKpis[idx] = e.target.value;
                            setDraftStratData(prev => prev ? { ...prev, kpis: newKpis } : null);
                          }}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setDraftStratData(prev => prev ? { ...prev, kpis: [...(prev.kpis || []), ''] } : null)}
                      className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1 hover:underline"
                    >
                      + Add KPI
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-900/5 border border-amber-100 dark:border-amber-900/20">
                <h5 className="text-[10px] font-bold text-amber-600 dark:text-amber-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                  <Icon name="edit_note" className="text-sm" /> Coach Notes (Confidential)
                </h5>
                <textarea
                  className="w-full text-sm text-slate-700 dark:text-slate-300 bg-transparent border-none p-0 focus:ring-0 outline-none resize-none h-20"
                  value={draftStratData?.coachNotes || ''}
                  onChange={(e) => setDraftStratData(prev => prev ? { ...prev, coachNotes: e.target.value } : null)}
                  placeholder="Add private notes for yourself regarding this phase..."
                />
              </div>

            </motion.div>
          ) : (
            <div className="p-20 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <Icon name="touch_app" className="mb-2 text-3xl opacity-20" />
              <p className="font-bold uppercase tracking-widest text-[11px]">{t('planning_select_phase_hint')}</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
