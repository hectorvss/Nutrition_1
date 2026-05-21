import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { fetchWithAuth } from '../api';
import { useClient } from '../context/ClientContext';
import { useLanguage } from '../context/LanguageContext';
import { BlockStrategicDetails, RoadmapBlock, Milestone, Goal, TrajectoryGoals, RoadmapData } from '../types/planning';
import { getInitialData } from './planning/helpers';
import PlanningHeader from './planning/PlanningHeader';
import RoadmapTimeline from './planning/RoadmapTimeline';
import BlockStrategyEditor from './planning/BlockStrategyEditor';
import TrajectoryChart from './planning/TrajectoryChart';
import GoalsCard from './planning/GoalsCard';
import MilestonesSection from './planning/MilestonesSection';
import BlockEditModal from './planning/BlockEditModal';

export default function PlanningDetail({ onNavigate, clientId, initialRoadmap, templateId }: { onNavigate: (view: string) => void, clientId?: string, initialRoadmap?: RoadmapData, templateId?: string }) {
  const { t, language } = useLanguage();
  const { clients, reloadClients } = useClient();
  const client = clients.find(c => c.id === clientId);
  // Template-authoring mode: edit a planning template as a full roadmap with
  // no client attached. The roadmap lives in the template's data_json.
  const isTemplate = !!templateId;

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [draftBlockValues, setDraftBlockValues] = useState<Partial<RoadmapBlock> | null>(null);
  const [draftStratData, setDraftStratData] = useState<BlockStrategicDetails | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  // Template mode extras.
  const [templateName, setTemplateName] = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [assignBusy, setAssignBusy] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // --- Trajectory Data ---
  const [checkInsHistory, setCheckInsHistory] = useState<{ date: string; weight: number }[]>([]);

  const selectedBlock = useMemo(() => {
    if (!roadmap || !selectedBlockId) return undefined;
    return [...roadmap.nutrition, ...roadmap.training].find(b => b.id === selectedBlockId) || undefined;
  }, [roadmap, selectedBlockId]);

  useEffect(() => {
    if (selectedBlock) {
      setDraftStratData(JSON.parse(JSON.stringify(selectedBlock.stratData)));
    } else {
      setDraftStratData(null);
    }
  }, [selectedBlockId]);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    } else if (clientId) {
      loadRoadmap();
      loadTrajectoryData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, templateId]);

  // Load a planning template and treat its data_json as the roadmap.
  const loadTemplate = async () => {
    setLoadError(null);
    try {
      const tpl = await fetchWithAuth(`/manager/planning-templates/${templateId}`);
      const dj = tpl?.data_json && typeof tpl.data_json === 'object' ? tpl.data_json : {};
      const finalRoadmap: RoadmapData = {
        ...getInitialData(t),
        // Only pull real roadmap fields — ignore template-only metadata keys.
        ...(Array.isArray(dj.nutrition) ? { nutrition: dj.nutrition } : {}),
        ...(Array.isArray(dj.training) ? { training: dj.training } : {}),
        ...(Array.isArray(dj.goals) ? { goals: dj.goals } : {}),
        ...(Array.isArray(dj.milestones) ? { milestones: dj.milestones } : {}),
        ...(dj.assumptions ? { assumptions: dj.assumptions } : {}),
        ...(dj.config ? { config: dj.config } : {}),
        totalWeeks: tpl?.duration_weeks || dj.totalWeeks || 12,
        currentWeek: 1,
        status: 'Draft',
      };
      setTemplateName(tpl?.name || '');
      setRoadmap(finalRoadmap);
      const firstNut = finalRoadmap.nutrition[0];
      setSelectedBlockId(firstNut?.id || null);
    } catch (error: any) {
      console.error('Error loading planning template:', error);
      setLoadError(error?.message || t('error_loading_data'));
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  };

  const loadTrajectoryData = async () => {
    if (!clientId) return;
    try {
      const checkInsData = await fetchWithAuth(`/check-ins/manager/clients/${clientId}/check-ins`);
      const checkIns: any[] = checkInsData?.check_ins || [];

      const weightHistory: { date: string; weight: number }[] = [];
      checkIns.forEach((ci: any) => {
        const dj = ci.data_json || {};
        const wRaw =
          dj.weight ||
          dj.measurements?.weight ||
          dj.measurements?.weight_kg ||
          (Array.isArray(dj.measurements) ? dj.measurements.find((m: any) => m.type === 'weight' || m.id === 'weight')?.value : undefined);
        const w = parseFloat(String(wRaw));
        if (!isNaN(w) && w > 0) {
          weightHistory.push({
            date: ci.date || ci.created_at?.split('T')[0] || '',
            weight: parseFloat(w.toFixed(1)),
          });
        }
      });
      weightHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setCheckInsHistory(weightHistory);
    } catch (e) {
      console.warn('Trajectory data fetch failed (non-critical):', e);
    }
  };

  const loadRoadmap = async () => {
    setLoadError(null);
    try {
      const data = await fetchWithAuth(`/manager/clients/${clientId}/roadmap`);

      let remoteRoadmap = null;
      if (data && data.data_json) {
        remoteRoadmap = typeof data.data_json === 'string' ? JSON.parse(data.data_json) : data.data_json;
      }

      const roadmapData = initialRoadmap || remoteRoadmap || getInitialData(t);

      const finalRoadmap: RoadmapData = {
        ...getInitialData(t),
        ...roadmapData,
        status: data?.status || roadmapData.status || 'Draft'
      };

      setRoadmap(finalRoadmap);

      const currentWeek = finalRoadmap.currentWeek || 1;
      const currentNut = finalRoadmap.nutrition.find(b => currentWeek >= b.startWeek && currentWeek <= b.endWeek);
      setSelectedBlockId(currentNut?.id || finalRoadmap.nutrition[0]?.id || null);
    } catch (error: any) {
      console.error('Error loading roadmap:', error);
      setLoadError(error?.message || t('error_loading_data'));
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  };

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Unsaved-changes tracking — gates the "Save changes" button. The first
  // non-null roadmap (the freshly loaded one) becomes the baseline; any later
  // change marks the plan dirty. A save re-baselines on the next render.
  const [hasChanges, setHasChanges] = useState(false);
  const baselineRef = useRef<string | null>(null);
  useEffect(() => {
    if (!roadmap) return;
    const snap = JSON.stringify(roadmap);
    if (baselineRef.current === null) { baselineRef.current = snap; return; }
    if (snap !== baselineRef.current) setHasChanges(true);
  }, [roadmap]);

  const handleSave = async (nextStatus?: 'Draft' | 'Active') => {
    if (saveStatus === 'saving') return;

    setSaveStatus('saving');
    try {
      if (!roadmap) {
        throw new Error("No roadmap data to save");
      }

      const resolvedStatus = nextStatus || roadmap.status || 'Draft';

      const payload = {
        ...getInitialData(t),
        ...roadmap,
        status: resolvedStatus,
        currentWeek,
        updated_at: new Date().toISOString(),
        goals: roadmap.goals || [],
        milestones: roadmap.milestones || [],
        nutrition: roadmap.nutrition || [],
        training: roadmap.training || []
      };

      let response;
      if (isTemplate) {
        // Persist the roadmap into the planning template itself.
        response = await fetchWithAuth(`/manager/planning-templates/${templateId}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: (templateName || '').trim() || t('new_template_name', { defaultValue: 'Nueva plantilla' }),
            data_json: payload,
            duration_weeks: roadmap.totalWeeks || 12,
            phases: roadmap.nutrition.length || roadmap.training.length || 1,
          }),
        });
      } else {
        response = await fetchWithAuth(`/manager/clients/${clientId}/roadmap`, {
          method: 'POST',
          body: JSON.stringify({ data_json: payload, status: resolvedStatus })
        });
      }

      if (!response || response.error) {
        throw new Error(response?.error || "Server failed to save roadmap");
      }

      // Re-baseline: clearing the ref makes the next roadmap render the new
      // saved baseline, so the plan is no longer flagged as dirty.
      baselineRef.current = null;
      setHasChanges(false);
      setRoadmap(prev => prev ? { ...prev, status: resolvedStatus } : prev);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);

      await reloadClients();
    } catch (e: any) {
      console.error("CRITICAL: Save failed:", e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  // Assign the current template roadmap to a chosen client (template mode).
  const assignToClient = async (cid: string) => {
    if (!roadmap || assignBusy) return;
    setAssignBusy(true);
    setAssignError(null);
    try {
      const payload = {
        ...getInitialData(t),
        ...roadmap,
        status: 'Draft',
        currentWeek: 1,
        updated_at: new Date().toISOString(),
      };
      const response = await fetchWithAuth(`/manager/clients/${cid}/roadmap`, {
        method: 'POST',
        body: JSON.stringify({ data_json: payload, status: 'Draft' }),
      });
      if (!response || response.error) {
        throw new Error(response?.error || 'Server failed to assign roadmap');
      }
      await reloadClients();
      setShowAssign(false);
      onNavigate('planning');
    } catch (e: any) {
      console.error('Assign template failed:', e);
      setAssignError(e?.message || t('error_loading_data'));
    } finally {
      setAssignBusy(false);
    }
  };

  const planWeeks = (roadmap && roadmap.totalWeeks > 0) ? roadmap.totalWeeks : 12;

  const currentWeek = useMemo(() => {
    if (!roadmap) return 1;
    const startStr = roadmap.trajectoryGoals?.programStartDate;
    if (startStr) {
      const start = new Date(startStr);
      if (!isNaN(start.getTime())) {
        const weeks = Math.floor((Date.now() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
        return Math.min(Math.max(weeks, 1), planWeeks);
      }
    }
    return Math.min(Math.max(roadmap.currentWeek || 1, 1), planWeeks);
  }, [roadmap, planWeeks]);

  const findFirstGap = (blocks: RoadmapBlock[]): number | null => {
    const occupied = new Set<number>();
    blocks.forEach(b => {
      for (let i = b.startWeek; i <= b.endWeek; i++) occupied.add(i);
    });
    for (let w = 1; w <= planWeeks; w++) {
      if (!occupied.has(w)) return w;
    }
    return null;
  };

  const addBlock = (type: 'nutrition' | 'training') => {
    if (!roadmap) return;
    const blocks = type === 'nutrition' ? roadmap.nutrition : roadmap.training;

    const startWeek = findFirstGap(blocks);

    if (startWeek === null) {
      alert(t('planning_no_available_gap'));
      return;
    }

    const newBlock: RoadmapBlock = {
      id: `${type[0]}${Date.now()}`,
      title: type === 'nutrition' ? t('planning_new_nutrition_phase') : t('planning_new_training_block'),
      startWeek,
      endWeek: startWeek,
      duration: 1,
      type,
      order: blocks.length + 1,
      colorToken: type === 'nutrition'
        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
        : 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400',
      stratData: {
        summary: '',
        primaryObjective: '',
        secondaryObjectives: [],
        kpis: [],
        successCriteria: [],
        coachNotes: '',
        risksAndConstraints: [],
        kcal: '0', macros: '0/0/0', freq: '-', water: '0',
        trainingFocus: '-', sessions: '-', deload: '-', intensityTargets: []
      }
    };

    const newBlocks = [...blocks, newBlock].sort((a, b) => a.startWeek - b.startWeek);
    setRoadmap({
      ...roadmap,
      [type]: newBlocks
    });
    setSelectedBlockId(newBlock.id);
    setEditingBlockId(newBlock.id);
    setDraftBlockValues(newBlock);
  };

  const deleteBlock = (blockId: string) => {
    if (!roadmap) return;
    const isNutrition = roadmap.nutrition.some(b => b.id === blockId);
    const key = isNutrition ? 'nutrition' : 'training';
    const blocks = roadmap[key];
    const index = blocks.findIndex(b => b.id === blockId);
    const newBlocks = blocks.filter(b => b.id !== blockId);

    setRoadmap({
      ...roadmap,
      [key]: newBlocks
    });

    if (selectedBlockId === blockId) {
      if (newBlocks.length > 0) {
        const nextNeighbor = newBlocks[index] || newBlocks[newBlocks.length - 1];
        setSelectedBlockId(nextNeighbor.id);
      } else {
        setSelectedBlockId(null);
      }
    }
    setEditingBlockId(null);
    setDraftBlockValues(null);
  };

  const updateBlockWithValidation = (blockId: string, updates: Partial<RoadmapBlock>) => {
    if (!roadmap) return false;
    const isNutrition = roadmap.nutrition.some(b => b.id === blockId);
    const key = isNutrition ? 'nutrition' : 'training';
    const blocks = roadmap[key];
    const currentBlock = blocks.find(b => b.id === blockId)!;

    const proposed = { ...currentBlock, ...updates };

    if (proposed.startWeek < 1 || proposed.endWeek > planWeeks || proposed.startWeek > proposed.endWeek) {
      setEditError(t('planning_invalid_range', { start: proposed.startWeek, end: proposed.endWeek }));
      return false;
    }

    const hasOverlap = blocks.some(b => {
      if (b.id === blockId) return false;
      return (proposed.startWeek <= b.endWeek && proposed.endWeek >= b.startWeek);
    });

    if (hasOverlap) {
      setEditError(t('planning_conflict_overlap'));
      return false;
    }

    setEditError(null);
    setRoadmap({
      ...roadmap,
      [key]: blocks.map(b => b.id === blockId ? {
        ...proposed,
        duration: proposed.endWeek - proposed.startWeek + 1
      } : b).sort((a, b) => a.startWeek - b.startWeek)
    });
    return true;
  };

  // --- GOALS MANAGEMENT ---
  const addGoal = () => {
    if (!roadmap) return;
    const newGoal: Goal = {
      id: `g${Date.now()}`,
      type: 'physical',
      label: t('planning_new_goal', { defaultValue: 'New Goal' }),
      desc: '',
      value: 0,
      currentLabel: '',
      targetLabel: ''
    };
    setRoadmap({ ...roadmap, goals: [...(roadmap.goals || []), newGoal] });
    setEditingGoalId(newGoal.id);
  };
  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    if (!roadmap) return;
    setRoadmap({ ...roadmap, goals: roadmap.goals.map(g => g.id === goalId ? { ...g, ...updates } : g) });
  };
  const deleteGoal = (goalId: string) => {
    if (!roadmap) return;
    setRoadmap({ ...roadmap, goals: roadmap.goals.filter(g => g.id !== goalId) });
    if (editingGoalId === goalId) setEditingGoalId(null);
  };

  // --- MILESTONES MANAGEMENT ---
  const addMilestone = () => {
    if (!roadmap) return;
    const newMilestone: Milestone = {
      id: `m${Date.now()}`,
      label: t('planning_new_milestone', { defaultValue: 'New Milestone' }),
      week: t('planning_week_number', { week: currentWeek, defaultValue: `Week ${currentWeek}` }),
      status: 'future'
    };
    setRoadmap({ ...roadmap, milestones: [...(roadmap.milestones || []), newMilestone] });
  };
  const updateMilestone = (milestoneId: string, updates: Partial<Milestone>) => {
    if (!roadmap) return;
    setRoadmap({ ...roadmap, milestones: roadmap.milestones.map(m => m.id === milestoneId ? { ...m, ...updates } : m) });
  };
  const deleteMilestone = (milestoneId: string) => {
    if (!roadmap) return;
    setRoadmap({ ...roadmap, milestones: roadmap.milestones.filter(m => m.id !== milestoneId) });
  };

  const updateBlock = useCallback((blockId: string, updates: Partial<RoadmapBlock>) => {
    if (!roadmap) return;
    const isNutrition = roadmap.nutrition.some(b => b.id === blockId);
    const key = isNutrition ? 'nutrition' : 'training';

    let syncUpdates = { ...updates };
    if (updates.stratData?.summary !== undefined && isNutrition) {
      syncUpdates.rationale = updates.stratData.summary;
    }

    setRoadmap({
      ...roadmap,
      [key]: roadmap[key].map(b => b.id === blockId ? { ...b, ...syncUpdates } : b)
    });
  }, [roadmap]);

  if (loading) return null;

  if (loadError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-[#0f172a] gap-4 p-8">
        <span className="material-symbols-outlined text-5xl text-rose-400">error</span>
        <p className="text-sm font-medium text-rose-500">{loadError}</p>
        <button
          onClick={() => { setLoading(true); loadRoadmap(); }}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors"
        >
          {t('retry', { defaultValue: 'Retry' })}
        </button>
      </div>
    );
  }

  if (!roadmap) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0f172a] font-sans selection:bg-emerald-100 selection:text-emerald-900">

      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="w-full mx-auto flex flex-col gap-6">

          {/* --- 1. HEADER SECTION --- */}
          <PlanningHeader
            roadmap={roadmap}
            client={client}
            saveStatus={saveStatus}
            currentWeek={currentWeek}
            hasChanges={hasChanges}
            onNavigate={onNavigate}
            onSave={handleSave}
            onReassign={() => onNavigate('planning-template-selector')}
            t={t}
            isTemplate={isTemplate}
            templateName={templateName}
            onRenameTemplate={(name) => { setTemplateName(name); setHasChanges(true); }}
            onAssign={() => { setAssignError(null); setShowAssign(true); }}
          />

          {/* --- 2. MASTER ROADMAP --- */}
          <RoadmapTimeline
            roadmap={roadmap}
            planWeeks={planWeeks}
            currentWeek={currentWeek}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onEditBlock={(b) => {
              setEditingBlockId(b.id);
              setDraftBlockValues({ ...b });
              setEditError(null);
            }}
            onAddBlock={addBlock}
            t={t}
          />

          {/* --- 3. BLOCK STRATEGIC DETAILS --- */}
          <BlockStrategyEditor
            selectedBlock={selectedBlock}
            currentWeek={currentWeek}
            draftStratData={draftStratData}
            setDraftStratData={setDraftStratData}
            editingBlockId={editingBlockId}
            setEditingBlockId={setEditingBlockId}
            draftBlockValues={draftBlockValues}
            setDraftBlockValues={setDraftBlockValues}
            onSaveStratData={updateBlock}
            t={t}
          />

          {/* --- 4. GOAL TRAJECTORY & PREDICTIONS --- */}
          {/* Trajectory is client-specific (weight history) — hidden for templates. */}
          {roadmap && !isTemplate && (
            <TrajectoryChart
              roadmap={roadmap}
              checkInsHistory={checkInsHistory}
              client={client}
              language={language}
              onUpdateTrajectoryGoals={(partial: Partial<TrajectoryGoals>) =>
                setRoadmap({ ...roadmap, trajectoryGoals: { ...(roadmap.trajectoryGoals || {}), ...partial } as TrajectoryGoals })
              }
              t={t}
            />
          )}

          {/* --- 5. GOALS & TARGETS --- */}
          <GoalsCard
            goals={roadmap.goals}
            editingGoalId={editingGoalId}
            setEditingGoalId={setEditingGoalId}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={deleteGoal}
            t={t}
          />

          {/* --- 6+7. MILESTONES & ASSUMPTIONS --- */}
          <MilestonesSection
            milestones={roadmap.milestones}
            assumptions={roadmap.assumptions}
            onUpdateMilestone={updateMilestone}
            onDeleteMilestone={deleteMilestone}
            onAddMilestone={addMilestone}
            onUpdateAssumptions={(updates) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, ...updates } })}
            t={t}
          />

        </div>
      </div>

      {/* --- EDIT BLOCK MODAL --- */}
      {editingBlockId && draftBlockValues && (
        <BlockEditModal
          editingBlockId={editingBlockId}
          draftBlockValues={draftBlockValues}
          setDraftBlockValues={setDraftBlockValues}
          editError={editError}
          planWeeks={planWeeks}
          onClose={() => { setEditingBlockId(null); setDraftBlockValues(null); }}
          onDelete={deleteBlock}
          onConfirm={updateBlockWithValidation}
          t={t}
        />
      )}

      {/* --- ASSIGN TEMPLATE TO CLIENT MODAL --- */}
      {showAssign && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4" onClick={() => !assignBusy && setShowAssign(false)}>
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('assign_to_client', { defaultValue: 'Asignar a cliente' })}</h3>
              <button onClick={() => !assignBusy && setShowAssign(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-3 max-h-[60vh] overflow-y-auto">
              {assignError && (
                <div className="m-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">{assignError}</div>
              )}
              {clients.length === 0 && (
                <p className="p-6 text-center text-sm text-slate-400">{t('no_clients_found', { defaultValue: 'No hay clientes.' })}</p>
              )}
              {clients.map((c: any) => (
                <button
                  key={c.id}
                  disabled={assignBusy}
                  onClick={() => assignToClient(c.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left disabled:opacity-50"
                >
                  {c.avatar ? (
                    <div className="w-10 h-10 rounded-xl bg-cover bg-center shadow-sm" style={{ backgroundImage: `url("${c.avatar}")` }} />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {(c.name || 'C').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
