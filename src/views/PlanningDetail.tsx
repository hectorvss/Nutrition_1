import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartTooltip, ReferenceLine, ReferenceArea 
} from 'recharts';
import { fetchWithAuth } from '../api';
import { useClient } from '../context/ClientContext';
import { useLanguage } from '../context/LanguageContext';
import Select from '../components/ui/Select';

// --- TYPES ---

interface BlockStrategicDetails {
  summary: string;
  primaryObjective: string;
  secondaryObjectives: string[];
  trainingVolume?: string;
  trainingIntensity?: string;
  cardio?: string;
  kpis: string[];
  successCriteria: string[];
  coachNotes: string;
  risksAndConstraints: string[];
  // Extended fields for specific strategies
  kcal?: string;
  macros?: string;
  freq?: string;
  water?: string;
  trainingFocus?: string;
  sessions?: string;
  deload?: string;
  intensityTargets?: string[];
}

interface RoadmapBlock {
  id: string;
  type: 'nutrition' | 'training';
  title: string;
  startWeek: number;
  endWeek: number;
  duration: number;
  colorToken?: string;
  isSelected?: boolean;
  order: number;
  stratData: BlockStrategicDetails;
  // Legacy/Direct access fields (keeping for compatibility with existing UI logic if possible, but transitioning to stratData)
  kcal?: string;
  macros?: string;
  deficit?: string;
  freq?: string;
  water?: string;
  rationale?: string;
  timing?: string[];
  focusItems?: string[];
  focus?: string;
  sessions?: string;
  deload?: string;
  intensityTargets?: string[];
}

interface Milestone {
  id: string;
  label: string;
  week: string;
  status: 'done' | 'next' | 'future';
}

interface Goal {
  id: string;
  type: 'physical' | 'nutrition' | 'training' | 'mindset';
  label: string;
  desc: string;
  value: number;
  currentLabel: string;
  targetLabel: string;
}

interface TrajectoryGoals {
  targetWeight: number;
  startWeight: number;
  currentWeight?: number;   // auto-filled from the latest check-in unless the coach overrides it
  targetStrengthKg: number;
  startStrengthKg: number;
  exerciseName: string;
  programStartDate: string; // ISO date string YYYY-MM-DD
  totalWeeks: number;       // managed here, overrides roadmap.totalWeeks for trajectory purposes
}

interface RoadmapData {
  status: string;
  currentWeek: number;
  totalWeeks: number;
  nutrition: RoadmapBlock[];
  training: RoadmapBlock[];
  goals: Goal[];
  milestones: Milestone[];
  assumptions: {
    steps: string;
    sleep: string;
    constraints: string;
  };
  trajectoryGoals?: TrajectoryGoals;
}

// --- EMPTY SCAFFOLD FACTORY ---
// A brand-new roadmap starts empty: no invented phases, KPIs or calories.
// Arrays are always present (never undefined) so the editor never crashes.
const getInitialData = (_t: (key: string, vars?: Record<string, any>) => string): RoadmapData => ({
  status: 'Draft',
  currentWeek: 1,
  totalWeeks: 12,
  nutrition: [],
  training: [],
  goals: [],
  milestones: [],
  assumptions: {
    steps: '',
    sleep: '',
    constraints: ''
  }
});

// --- HELPER: ICON COMPONENT ---
const Icon = ({ name, className = "" }: { name: string, className?: string }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: 'inherit' }}>{name}</span>
);


// --- TRAJECTORY HELPERS ---

/** Classify phase rate from title/type */
function getPhaseRates(block: RoadmapBlock): { weightRate: number; strengthRate: number } {
  const t = (block.title + ' ' + (block.stratData?.primaryObjective || '')).toLowerCase();
  if (block.type === 'nutrition') {
    if (t.includes('deficit') || t.includes('cut') || t.includes('fat loss') || t.includes('pérdida')) {
      return { weightRate: -0.45, strengthRate: 0.2 }; // Fat loss: lose weight, strength stable
    }
    if (t.includes('maintenance') || t.includes('mantenimiento') || t.includes('maintain')) {
      return { weightRate: 0, strengthRate: 0.5 }; // Flat
    }
    if (t.includes('bulk') || t.includes('gain') || t.includes('surplus') || t.includes('volumen')) {
      return { weightRate: 0.35, strengthRate: 1.5 }; // Bulk
    }
    if (t.includes('recomp') || t.includes('recompos')) {
      return { weightRate: -0.05, strengthRate: 0.8 }; // Subtle loss, muscle gain
    }
    if (t.includes('reverse')) {
      return { weightRate: 0.05, strengthRate: 0.5 }; // Reverse diet
    }
    return { weightRate: -0.1, strengthRate: 0.3 };
  } else {
    // Training block rates (strength %) per week
    if (t.includes('strength') || t.includes('fuerza') || t.includes('peak')) {
      return { weightRate: 0, strengthRate: 2.5 };
    }
    if (t.includes('hypertrophy') || t.includes('hipertrofia') || t.includes('volume') || t.includes('base')) {
      return { weightRate: 0, strengthRate: 1.5 };
    }
    if (t.includes('deload') || t.includes('recovery')) {
      return { weightRate: 0, strengthRate: 0 };
    }
    return { weightRate: 0, strengthRate: 1.0 };
  }
}

function computeTrajectory(
  roadmap: RoadmapData,
  checkInsByDate: { date: string; weight: number }[],
  goals: TrajectoryGoals,
  locale: string
): { chartData: any[]; currentWeekIndex: number; anchorWeight: number; weeklyRate: number } {
  const totalWeeks = goals.totalWeeks || roadmap.totalWeeks || 12;
  const allBlocks = [...roadmap.nutrition, ...roadmap.training];

  const programStart = goals.programStartDate
    ? new Date(goals.programStartDate)
    : new Date();

  // Current week index (0-based)
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const currentWeekIndex = Math.max(
    0,
    Math.min(totalWeeks - 1, Math.floor((now.getTime() - programStart.getTime()) / msPerWeek))
  );

  // 1. Bucket real check-ins by program week (last one of the week wins)
  const actualByWeek: (number | undefined)[] = [];
  for (let w = 0; w < totalWeeks; w++) {
    const weekStart = new Date(programStart.getTime() + w * msPerWeek);
    const weekEnd = new Date(weekStart.getTime() + msPerWeek);
    const ci = checkInsByDate.filter(c => {
      const d = new Date(c.date);
      return d >= weekStart && d < weekEnd;
    });
    actualByWeek[w] = ci.length > 0 ? ci[ci.length - 1].weight : undefined;
  }

  // 2. Anchor the projection to the client's real current weight: the latest
  //    check-in up to now. Falls back to the explicit currentWeight, then start.
  let anchorWeight = goals.currentWeight || goals.startWeight || 0;
  for (let w = currentWeekIndex; w >= 0; w--) {
    if (actualByWeek[w] != null) { anchorWeight = actualByWeek[w] as number; break; }
  }

  // 3. Build the chart. Past weeks show only actual; from "now" onward the
  //    projected line starts AT the anchor weight and applies phase rates,
  //    so the projection visually continues from reality (not a parallel guess).
  const chartData: any[] = [];
  let projW = anchorWeight;
  let firstFutureRate = 0;
  let firstFutureCaptured = false;

  for (let w = 0; w < totalWeeks; w++) {
    const weekNum = w + 1;
    const weekDate = new Date(programStart.getTime() + w * msPerWeek);
    const weekLabel = weekDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' });

    let projected: number | undefined;
    if (w < currentWeekIndex) {
      projected = undefined; // past — actual line only
    } else if (w === currentWeekIndex) {
      projected = parseFloat(anchorWeight.toFixed(1)); // anchor — joins actual & projection
    } else {
      const activeBlocks = allBlocks.filter(b => weekNum >= b.startWeek && weekNum <= b.endWeek);
      let rate = 0;
      let used = false;
      activeBlocks.forEach(b => {
        if (b.type === 'nutrition' && !used) { rate = getPhaseRates(b).weightRate; used = true; }
      });
      if (!firstFutureCaptured) { firstFutureRate = rate; firstFutureCaptured = true; }
      projW = parseFloat((projW + rate).toFixed(2));
      projected = projW;
    }

    chartData.push({
      week: weekNum,
      label: weekLabel,
      projected,
      actual: actualByWeek[w],
      isCurrentWeek: w === currentWeekIndex,
    });
  }

  return { chartData, currentWeekIndex, anchorWeight, weeklyRate: firstFutureRate };
}

export default function PlanningDetail({ onNavigate, clientId, initialRoadmap }: { onNavigate: (view: string) => void, clientId?: string, initialRoadmap?: RoadmapData }) {
  const { t, language } = useLanguage();
  const { clients, reloadClients } = useClient();
  const client = clients.find(c => c.id === clientId);

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [draftBlockValues, setDraftBlockValues] = useState<Partial<RoadmapBlock> | null>(null);
  const [draftStratData, setDraftStratData] = useState<BlockStrategicDetails | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // --- Trajectory Data ---
  // Store check-ins as flat array with date + weight (not bucketed by week)
  const [checkInsHistory, setCheckInsHistory] = useState<{ date: string; weight: number }[]>([]);

  const selectedBlock = useMemo(() => {
    if (!roadmap || !selectedBlockId) return null;
    return [...roadmap.nutrition, ...roadmap.training].find(b => b.id === selectedBlockId) || null;
  }, [roadmap, selectedBlockId]);

  useEffect(() => {
    if (selectedBlock) {
      setDraftStratData(JSON.parse(JSON.stringify(selectedBlock.stratData)));
    } else {
      setDraftStratData(null);
    }
  }, [selectedBlockId]);

  useEffect(() => {
    if (clientId) {
      loadRoadmap();
      loadTrajectoryData();
    }
  }, [clientId]);

  const loadTrajectoryData = async () => {
    if (!clientId) return;
    try {
      // Fetch check-ins for weight data
      const checkInsData = await fetchWithAuth(`/check-ins/manager/clients/${clientId}/check-ins`);
      const checkIns: any[] = checkInsData?.check_ins || [];

      // Parse each check-in into a flat { date, weight } entry (use actual calendar date)
      const weightHistory: { date: string; weight: number }[] = [];
      checkIns.forEach((ci: any) => {
        const dj = ci.data_json || {};
        // Support legacy weight field and nested measurements object
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
      // Sort by date ascending so chart renders left→right chronologically
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

      // The backend returns a record with a 'data_json' column
      let remoteRoadmap = null;
      if (data && data.data_json) {
        remoteRoadmap = typeof data.data_json === 'string' ? JSON.parse(data.data_json) : data.data_json;
      }

      // Use initialRoadmap (draft) if provided, otherwise remote data,
      // otherwise an EMPTY scaffold for a brand-new roadmap (no mock data).
      const roadmapData = initialRoadmap || remoteRoadmap || getInitialData(t);

      // Ensure we merge with structural defaults to prevent TypeErrors
      const finalRoadmap: RoadmapData = {
        ...getInitialData(t),
        ...roadmapData,
        // Preserve status from the record level if available
        status: data?.status || roadmapData.status || 'Draft'
      };

      setRoadmap(finalRoadmap);

      // Default selection to current phase (when phases exist)
      const currentWeek = finalRoadmap.currentWeek || 1;
      const currentNut = finalRoadmap.nutrition.find(b => currentWeek >= b.startWeek && currentWeek <= b.endWeek);
      setSelectedBlockId(currentNut?.id || finalRoadmap.nutrition[0]?.id || null);
    } catch (error: any) {
      // On failure, surface an error state instead of loading mock data.
      console.error('Error loading roadmap:', error);
      setLoadError(error?.message || t('error_loading_data'));
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  };

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // `nextStatus`: 'Draft' keeps it private; 'Active' publishes it to the client.
  const handleSave = async (nextStatus?: 'Draft' | 'Active') => {
    if (saveStatus === 'saving') return;

    setSaveStatus('saving');
    try {
      if (!roadmap) {
        throw new Error("No roadmap data to save");
      }

      const resolvedStatus = nextStatus || roadmap.status || 'Draft';

      // Ensure we have a complete structure
      const payload = {
        ...getInitialData(t),
        ...roadmap,
        status: resolvedStatus,
        // Persist the freshly derived current week so the client view stays in sync.
        currentWeek,
        updated_at: new Date().toISOString(),
        // Ensure arrays are never stripped
        goals: roadmap.goals || [],
        milestones: roadmap.milestones || [],
        nutrition: roadmap.nutrition || [],
        training: roadmap.training || []
      };

      const response = await fetchWithAuth(`/manager/clients/${clientId}/roadmap`, {
        method: 'POST',
        // The backend reads `body.data_json || body`; sending data_json
        // explicitly keeps the persisted blob clean and predictable.
        body: JSON.stringify({ data_json: payload, status: resolvedStatus })
      });

      if (!response || response.error) {
        throw new Error(response?.error || "Server failed to save roadmap");
      }

      // Reflect the new status locally so the header updates immediately.
      setRoadmap(prev => prev ? { ...prev, status: resolvedStatus } : prev);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);

      // reload context
      await reloadClients();
    } catch (e: any) {
      console.error("CRITICAL: Save failed:", e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  // The roadmap horizon: number of weeks. Defaults to 12 but follows the
  // configured totalWeeks so blocks can span the whole program.
  const planWeeks = (roadmap && roadmap.totalWeeks > 0) ? roadmap.totalWeeks : 12;

  // Live "current week": derived from the program start date when available
  // (roadmap.currentWeek alone is never recomputed and would stay stuck at 1).
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
      // Feedback: No space
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
        // Select next neighbor if exists, else previous
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
    
    // Merge updates for validation
    const proposed = { ...currentBlock, ...updates };
    
    // Basic Range Validation
    if (proposed.startWeek < 1 || proposed.endWeek > planWeeks || proposed.startWeek > proposed.endWeek) {
      setEditError(t('planning_invalid_range', { start: proposed.startWeek, end: proposed.endWeek }));
      return false;
    }

    // Overlap Validation
    const hasOverlap = blocks.some(b => {
      if (b.id === blockId) return false;
      return (proposed.startWeek <= b.endWeek && proposed.endWeek >= b.startWeek);
    });

    if (hasOverlap) {
      setEditError(t('planning_conflict_overlap'));
      return false;
    }

    // Success: Recalculate duration and update
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

  // Legacy updateBlock for simple fields (kcal, rationale, etc.) - no validation needed
  const updateBlock = (blockId: string, updates: Partial<RoadmapBlock>) => {
    if (!roadmap) return;
    const isNutrition = roadmap.nutrition.some(b => b.id === blockId);
    const key = isNutrition ? 'nutrition' : 'training';
    
    // Auto-sync rationale if summary is updated (and vice versa for compatibility)
    let syncUpdates = { ...updates };
    if (updates.stratData?.summary !== undefined && isNutrition) {
      syncUpdates.rationale = updates.stratData.summary;
    }

    setRoadmap({
      ...roadmap,
      [key]: roadmap[key].map(b => b.id === blockId ? { ...b, ...syncUpdates } : b)
    });
  };

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
                <div 
                  className="w-16 h-16 rounded-full bg-cover bg-center shadow-inner border-2 border-slate-50" 
                  style={{ backgroundImage: `url("${client?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'}")` }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{client?.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-slate-500">{client?.gender}, {t('years_old_short', { age: client?.age })}</span>
                  </div>
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
                    onClick={() => handleSave('Draft')}
                    disabled={saveStatus === 'saving'}
                    className={`flex-1 sm:flex-none py-2 px-6 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-60 ${
                      saveStatus === 'saved' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                      saveStatus === 'error' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                      'bg-slate-800 hover:bg-slate-900 text-white'
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
                    onClick={() => handleSave('Active')}
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

          {/* --- 2. MASTER ROADMAP --- */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="map" className="text-emerald-500" />
                {t('master_roadmap')}
              </h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => addBlock('nutrition')}
                  className="group flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Icon name="add" className="text-[18px]" /> {t('planning_nutrition_phase')}
                </button>
                <button 
                  onClick={() => addBlock('training')}
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
                        onClick={() => setSelectedBlockId(block.id)}
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
                            setEditingBlockId(block.id);
                            setDraftBlockValues({ ...block });
                            setEditError(null);
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
                        onClick={() => setSelectedBlockId(block.id)}
                        style={{ width: `${((block.endWeek - block.startWeek + 1) / planWeeks) * 100}%` }}
                        className={`group relative flex items-center justify-center cursor-pointer transition-all border ${block.id === selectedBlockId ? 'ring-2 ring-emerald-500/50 scale-[0.99] z-10' : 'hover:scale-[0.99]'} ${block.colorToken} ${block.startWeek === 1 ? 'rounded-l-xl' : ''} ${block.endWeek === planWeeks ? 'rounded-r-xl' : ''}`}
                      >
                        <span className="text-sm font-bold truncate px-2">{block.title}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBlockId(block.id);
                            setDraftBlockValues({ ...block });
                            setEditError(null);
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

          {/* --- 3. BLOCK STRATEGIC DETAILS (Swapped to Top) --- */}
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
                              title: selectedBlock.title // Keep sync if needed
                            };
                            
                            // Deep sync specific fields for legacy compatibility
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
                            
                            updateBlock(selectedBlock.id, updates);
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
                              onClick={() => setDraftStratData(prev => prev ? { ...prev, secondaryObjectives: [...(prev.secondaryObjectives || []), 'New Objective'] } : null)}
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
                              onClick={() => setDraftStratData(prev => prev ? { ...prev, intensityTargets: [...(prev.intensityTargets || []), 'New Target'] } : null)}
                              className="text-[9px] font-bold text-purple-500 uppercase tracking-widest mt-1 hover:underline"
                            >
                              + Add Target
                            </button>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                            <Icon name="assignment_late" className="text-sm" /> Risks & Constraints
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
                              onClick={() => setDraftStratData(prev => prev ? { ...prev, risksAndConstraints: [...(prev.risksAndConstraints || []), 'New Risk'] } : null)}
                              className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-1 hover:underline"
                            >
                              + Add Risk
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Training objectives — were previously uneditable, causing data loss on training blocks */}
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
                              onClick={() => setDraftStratData(prev => prev ? { ...prev, secondaryObjectives: [...(prev.secondaryObjectives || []), 'New Objective'] } : null)}
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
                            onClick={() => setDraftStratData(prev => prev ? { ...prev, successCriteria: [...(prev.successCriteria || []), 'New Criteria'] } : null)}
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
                              <span className="text-[10px] font-bold text-slate-400">0{idx+1}</span>
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
                            onClick={() => setDraftStratData(prev => prev ? { ...prev, kpis: [...(prev.kpis || []), 'New KPI'] } : null)}
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

          {/* --- 4. GOAL TRAJECTORY & PREDICTIONS --- */}
          {roadmap && (() => {
            const today = new Date().toISOString().split('T')[0];
            const locale = language === 'es' ? 'es-ES' : 'en-US';
            const isEs = language === 'es';

            // Auto values from real check-ins (auto-filled, coach can override)
            const autoStart = checkInsHistory.length > 0 ? checkInsHistory[0].weight : undefined;
            const autoCurrent = checkInsHistory.length > 0 ? checkInsHistory[checkInsHistory.length - 1].weight : undefined;
            const saved = roadmap.trajectoryGoals || {};

            const tGoals: TrajectoryGoals = {
              targetWeight: 70,
              startWeight: autoStart ?? 80,
              currentWeight: autoCurrent ?? autoStart ?? 80,
              targetStrengthKg: 100,
              startStrengthKg: 60,
              exerciseName: 'Key Lift',
              programStartDate: today,
              totalWeeks: roadmap.totalWeeks || 12,
              ...saved,
            };
            const startIsAuto = saved.startWeight === undefined && autoStart !== undefined;
            const currentIsAuto = saved.currentWeight === undefined && autoCurrent !== undefined;

            const totalWeeks = tGoals.totalWeeks || 12;
            const hasActualData = checkInsHistory.length > 0;

            const { chartData, currentWeekIndex, anchorWeight, weeklyRate } = computeTrajectory(
              roadmap, checkInsHistory, tGoals, locale
            );

            // --- Headline KPIs ---
            const currentW = parseFloat((anchorWeight || tGoals.currentWeight || tGoals.startWeight || 0).toFixed(1));
            const targetW = tGoals.targetWeight || 0;
            const remaining = parseFloat((targetW - currentW).toFixed(1));            // signed: + gain, - lose
            const finalProjected = parseFloat((chartData[chartData.length - 1]?.projected ?? currentW).toFixed(1));
            const projGap = parseFloat((finalProjected - targetW).toFixed(1));        // how far the projection lands from target
            const onTrack = Math.abs(projGap) <= 1;                                    // within 1 kg = on track
            const losing = remaining < 0;
            const weeksLeft = Math.max(0, totalWeeks - currentWeekIndex - 1);

            // Y-axis domain
            const allWeights = [
              ...chartData.map(d => d.projected).filter((v): v is number => typeof v === 'number'),
              ...checkInsHistory.map(c => c.weight),
              targetW,
            ].filter(v => v > 0);
            const minW = allWeights.length > 0 ? Math.floor(Math.min(...allWeights)) - 2 : 60;
            const maxW = allWeights.length > 0 ? Math.ceil(Math.max(...allWeights)) + 2 : 100;

            // Only persist fields the coach explicitly changes — weights left
            // untouched stay auto-derived from check-ins on every render.
            const updateGoals = (partial: Partial<TrajectoryGoals>) => {
              if (!roadmap) return;
              setRoadmap({ ...roadmap, trajectoryGoals: { ...(roadmap.trajectoryGoals || {}), ...partial } });
            };

            const ChartTooltip = ({ active, payload, label }: any) => {
              if (!active || !payload?.length) return null;
              const proj = payload.find((p: any) => p.dataKey === 'projected');
              const actual = payload.find((p: any) => p.dataKey === 'actual');
              return (
                <div className="bg-slate-900 text-white rounded-xl px-3 py-2 shadow-xl text-[10px] font-bold min-w-[120px]">
                  <div className="text-emerald-400 mb-1.5 uppercase tracking-widest">{label}</div>
                  {actual?.value != null && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />{t('planning_actual', { defaultValue: 'Actual' })}</span>
                      <span>{actual.value} kg</span>
                    </div>
                  )}
                  {proj?.value != null && (
                    <div className="flex items-center justify-between gap-3 mt-0.5">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />{t('planning_projected_short', { defaultValue: 'Projected' })}</span>
                      <span>{proj.value} kg</span>
                    </div>
                  )}
                </div>
              );
            };

            const kpiTile = (tone: string, label: string, value: React.ReactNode, sub?: React.ReactNode) => (
              <div className={`rounded-2xl p-4 border ${tone}`}>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
                <div className="flex items-baseline gap-1">{value}</div>
                {sub && <div className="mt-1 text-[10px] font-semibold opacity-70">{sub}</div>}
              </div>
            );

            return (
              <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Icon name="monitoring" className="text-emerald-500" />
                    {t('planning_goal_trajectory_predictions', { defaultValue: 'Goal Trajectory & Predictions' })}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" /></svg>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('planning_actual', { defaultValue: 'Actual' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#10b981" strokeWidth="3" strokeDasharray="5 3" strokeLinecap="round" /></svg>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('planning_projected', { defaultValue: 'Projected' })}</span>
                    </div>
                  </div>
                </div>

                {/* KPI ROW */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {kpiTile(
                    'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/40 text-blue-700 dark:text-blue-300',
                    isEs ? 'Peso actual' : 'Current weight',
                    <><span className="text-3xl font-extrabold">{currentW || '--'}</span><span className="text-sm font-bold opacity-70">kg</span></>,
                    hasActualData
                      ? (isEs ? 'Último check-in' : 'Latest check-in')
                      : (isEs ? 'Sin check-ins aún' : 'No check-ins yet')
                  )}
                  {kpiTile(
                    'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300',
                    isEs ? 'Objetivo' : 'Target',
                    <>
                      <input
                        type="number" step="0.5"
                        className="text-3xl font-extrabold bg-transparent border-none p-0 w-[4.5rem] focus:ring-0 outline-none"
                        value={tGoals.targetWeight || ''}
                        onChange={e => { const v = parseFloat(e.target.value); updateGoals({ targetWeight: isNaN(v) ? 0 : v }); }}
                      />
                      <span className="text-sm font-bold opacity-70">kg</span>
                    </>,
                    isEs ? 'Editable' : 'Editable'
                  )}
                  {kpiTile(
                    'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200',
                    isEs ? 'Por recorrer' : 'To go',
                    <>
                      <Icon name={losing ? 'trending_down' : remaining > 0 ? 'trending_up' : 'drag_handle'} className={`text-2xl ${losing ? 'text-emerald-500' : remaining > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                      <span className="text-3xl font-extrabold">{Math.abs(remaining) || 0}</span><span className="text-sm font-bold opacity-70">kg</span>
                    </>,
                    remaining === 0 ? (isEs ? 'En el objetivo' : 'At target') : losing ? (isEs ? 'para bajar' : 'to lose') : (isEs ? 'para subir' : 'to gain')
                  )}
                  {kpiTile(
                    'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/40 text-amber-700 dark:text-amber-300',
                    isEs ? 'Semana' : 'Week',
                    <><span className="text-3xl font-extrabold">{Math.min(currentWeekIndex + 1, totalWeeks)}</span><span className="text-sm font-bold opacity-70">/ {totalWeeks}</span></>,
                    weeksLeft > 0 ? (isEs ? `${weeksLeft} sem. restantes` : `${weeksLeft}w remaining`) : (isEs ? 'Programa finalizado' : 'Program finished')
                  )}
                </div>

                {/* Projection summary banner */}
                <div className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-4 text-xs font-bold ${
                  !hasActualData
                    ? 'bg-slate-50 dark:bg-slate-800/60 text-slate-500'
                    : onTrack
                      ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300'
                }`}>
                  <Icon name={!hasActualData ? 'info' : onTrack ? 'check_circle' : 'warning'} className="text-lg" />
                  <span>
                    {!hasActualData
                      ? (isEs ? 'Aún no hay check-ins de peso: la proyección se basa solo en las fases del plan.' : 'No weight check-ins yet — the projection is based on plan phases only.')
                      : onTrack
                        ? (isEs
                            ? `A este ritmo terminará en ~${finalProjected} kg, justo en el objetivo.`
                            : `At this pace they finish around ~${finalProjected} kg — right on target.`)
                        : (isEs
                            ? `A este ritmo terminará en ~${finalProjected} kg (${projGap > 0 ? '+' : ''}${projGap} kg del objetivo). Revisa las fases del plan.`
                            : `At this pace they finish around ~${finalProjected} kg (${projGap > 0 ? '+' : ''}${projGap} kg off target). Review the plan phases.`)}
                  </span>
                </div>

                {/* Phase strips */}
                {roadmap.nutrition.length > 0 && (
                  <div className="flex gap-1 px-1 mb-1.5">
                    {roadmap.nutrition.map(b => (
                      <div
                        key={b.id}
                        style={{ flex: Math.max(1, b.endWeek - b.startWeek + 1) }}
                        className={`h-2 rounded-full ${b.colorToken?.split(' ')[0] || 'bg-blue-200'}`}
                        title={`${b.title} (W${b.startWeek}–W${b.endWeek})`}
                      />
                    ))}
                  </div>
                )}

                {/* Chart */}
                <div className="w-full" style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 12, right: 64, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="traj-projected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.18}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />

                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fontWeight: 600, fill: '#94a3b8' }}
                        interval={totalWeeks > 16 ? Math.floor(totalWeeks / 8) : 1}
                      />
                      <YAxis
                        domain={[minW, maxW]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fontWeight: 600, fill: '#94a3b8' }}
                        tickCount={5}
                        tickFormatter={v => `${v}kg`}
                        width={42}
                      />

                      <RechartTooltip content={<ChartTooltip />} />

                      {/* Target weight reference line */}
                      {targetW > 0 && (
                        <ReferenceLine
                          y={targetW}
                          stroke="#10b981"
                          strokeDasharray="6 4"
                          strokeWidth={1.5}
                          label={{ value: `${isEs ? 'Objetivo' : 'Target'} ${targetW}kg`, position: 'right', fill: '#10b981', fontSize: 9, fontWeight: 700 }}
                        />
                      )}

                      {/* "Now" reference line */}
                      {chartData[currentWeekIndex] && (
                        <ReferenceLine
                          x={chartData[currentWeekIndex].label}
                          stroke="#64748b"
                          strokeDasharray="4 3"
                          strokeWidth={1.5}
                          label={{ value: isEs ? 'Hoy' : 'Now', position: 'top', fill: '#64748b', fontSize: 9, fontWeight: 700 }}
                        />
                      )}

                      {/* Projected (from current weight onward) */}
                      <Area
                        type="monotone"
                        dataKey="projected"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        strokeDasharray="7 4"
                        fill="url(#traj-projected)"
                        dot={false}
                        activeDot={{ r: 5, fill: '#10b981', stroke: 'white', strokeWidth: 2 }}
                        connectNulls
                      />

                      {/* Actual check-ins */}
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: 'white', stroke: '#3b82f6', strokeWidth: 2.5, r: 4 }}
                        activeDot={{ r: 7, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
                        connectNulls={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Compact settings row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-200 dark:border-slate-700">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('planning_program_start_date', { defaultValue: 'Start date' })}</p>
                    <input
                      type="date"
                      className="text-xs font-bold text-slate-800 dark:text-white bg-transparent border-none p-0 w-full focus:ring-0 outline-none"
                      value={tGoals.programStartDate || ''}
                      onChange={e => updateGoals({ programStartDate: e.target.value })}
                    />
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-200 dark:border-slate-700">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('total_duration', { defaultValue: 'Duration' })}</p>
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number" min="4" max="52"
                        className="text-sm font-bold text-slate-800 dark:text-white bg-transparent border-none p-0 w-10 focus:ring-0 outline-none"
                        value={tGoals.totalWeeks || ''}
                        onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) updateGoals({ totalWeeks: v }); }}
                      />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{t('weeks_label', { defaultValue: 'weeks' })}</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-200 dark:border-slate-700">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                      {t('start_weight', { defaultValue: 'Start weight' })}
                      {startIsAuto && <span className="text-[7px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 px-1 py-px rounded font-black">AUTO</span>}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number" step="0.5"
                        className="text-sm font-bold text-slate-800 dark:text-white bg-transparent border-none p-0 w-12 focus:ring-0 outline-none"
                        value={tGoals.startWeight || ''}
                        onChange={e => { const v = parseFloat(e.target.value); updateGoals({ startWeight: isNaN(v) ? 0 : v }); }}
                      />
                      <span className="text-[10px] font-bold text-slate-400">kg</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-200 dark:border-slate-700">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                      {isEs ? 'Peso actual' : 'Current weight'}
                      {currentIsAuto && <span className="text-[7px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 px-1 py-px rounded font-black">AUTO</span>}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number" step="0.5"
                        className="text-sm font-bold text-slate-800 dark:text-white bg-transparent border-none p-0 w-12 focus:ring-0 outline-none"
                        value={tGoals.currentWeight || ''}
                        onChange={e => { const v = parseFloat(e.target.value); updateGoals({ currentWeight: isNaN(v) ? 0 : v }); }}
                      />
                      <span className="text-[10px] font-bold text-slate-400">kg</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* --- 5. GOALS & TARGETS --- */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="flag" className="text-emerald-500" />
                {t('goals_targets')}
              </h3>
              <button
                onClick={addGoal}
                className="text-[10px] font-semibold text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-widest flex items-center gap-1"
              >
                <Icon name="add" className="text-[16px]" /> {t('planning_add_goal', { defaultValue: 'Add Goal' })}
              </button>
            </div>
            {roadmap.goals.length === 0 && (
              <div className="p-8 text-center text-slate-300 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl uppercase text-[10px] font-bold tracking-widest">
                {t('planning_no_goals', { defaultValue: 'No goals defined yet' })}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roadmap.goals.map((goal) => editingGoalId === goal.id ? (
                <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-emerald-500 ring-4 ring-emerald-500/5 flex flex-col gap-3">
                  <input
                    className="text-sm font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                    value={goal.label}
                    placeholder={t('planning_goal_label', { defaultValue: 'Goal name' })}
                    onChange={(e) => updateGoal(goal.id, { label: e.target.value })}
                  />
                  <Select
                    className="text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                    value={goal.type}
                    onChange={(val) => updateGoal(goal.id, { type: val as Goal['type'] })}
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
                    onChange={(e) => updateGoal(goal.id, { desc: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                      value={goal.currentLabel}
                      placeholder={t('planning_goal_current', { defaultValue: 'Current' })}
                      onChange={(e) => updateGoal(goal.id, { currentLabel: e.target.value })}
                    />
                    <input
                      className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                      value={goal.targetLabel}
                      placeholder={t('planning_goal_target', { defaultValue: 'Target' })}
                      onChange={(e) => updateGoal(goal.id, { targetLabel: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('planning_progress', { defaultValue: 'Progress' })}: {goal.value}%</label>
                    <input
                      type="range" min="0" max="100" value={goal.value}
                      onChange={(e) => updateGoal(goal.id, { value: parseInt(e.target.value) || 0 })}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => deleteGoal(goal.id)} className="flex-1 py-2 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100">{t('delete', { defaultValue: 'Delete' })}</button>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
            
            {/* --- 6. MILESTONES --- */}
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[11px] font-semibold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                  <Icon name="timeline" className="text-slate-400" />
                  {t('key_milestones')}
                </h3>
                <button onClick={addMilestone} className="text-[10px] font-semibold text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-widest">+ {t('planning_add_milestone', { defaultValue: 'Add Milestone' })}</button>
              </div>
              {roadmap.milestones.length === 0 && (
                <div className="p-6 text-center text-slate-300 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl uppercase text-[10px] font-bold tracking-widest">
                  {t('planning_no_milestones', { defaultValue: 'No milestones yet' })}
                </div>
              )}
              <div className="space-y-3">
                {roadmap.milestones.map((m) => (
                  <div key={m.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${m.status === 'next' ? 'bg-white dark:bg-[#1e293b] border-emerald-500 ring-4 ring-emerald-500/5' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.status === 'done' ? 'bg-green-500' : m.status === 'next' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <div className="flex-1 min-w-0">
                        <input
                          className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1.5 bg-transparent border-none p-0 focus:ring-0 outline-none w-full"
                          value={m.label}
                          onChange={(e) => updateMilestone(m.id, { label: e.target.value })}
                        />
                        <input
                          className={`text-[10px] font-semibold uppercase tracking-widest bg-transparent border-none p-0 focus:ring-0 outline-none w-full ${m.status === 'next' ? 'text-emerald-500' : 'text-slate-400'}`}
                          value={m.week}
                          onChange={(e) => updateMilestone(m.id, { week: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        className="px-2 py-1.5 text-[9px] font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 outline-none uppercase tracking-widest"
                        value={m.status}
                        onChange={(val) => updateMilestone(m.id, { status: val as Milestone['status'] })}
                      >
                        <option value="future">{t('planning_status_future', { defaultValue: 'Future' })}</option>
                        <option value="next">{t('planning_status_next', { defaultValue: 'Next' })}</option>
                        <option value="done">{t('planning_status_done', { defaultValue: 'Done' })}</option>
                      </Select>
                      <button
                        onClick={() => deleteMilestone(m.id)}
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
                    value={roadmap.assumptions.steps}
                    onChange={(e) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, steps: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{t('sleep_hygiene', { defaultValue: 'Sleep Hygiene' })}</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold" 
                    type="text" 
                    value={roadmap.assumptions.sleep}
                    onChange={(e) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, sleep: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{t('primary_constraints', { defaultValue: 'Primary Constraints' })}</label>
                  <textarea 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none font-medium leading-relaxed h-20" 
                    value={roadmap.assumptions.constraints}
                    onChange={(e) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, constraints: e.target.value } })}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* --- EDIT BLOCK MODAL --- */}
      <AnimatePresence>
        {editingBlockId && draftBlockValues && (() => {
          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => { setEditingBlockId(null); setDraftBlockValues(null); }}
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
                  <button onClick={() => { setEditingBlockId(null); setDraftBlockValues(null); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
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
                      onClick={() => deleteBlock(editingBlockId)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20 font-bold text-xs transition-colors border border-rose-100 dark:border-rose-800/50 flex items-center justify-center gap-2"
                    >
                      <Icon name="delete" className="text-[18px]" /> {t('planning_delete_block')}
                    </button>
                    <button 
                      onClick={() => {
                        if (updateBlockWithValidation(editingBlockId, draftBlockValues)) {
                          setEditingBlockId(null);
                          setDraftBlockValues(null);
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
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
