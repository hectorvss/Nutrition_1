import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchWithAuth } from '../api';
import { useClient } from '../context/ClientContext';

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
}

// --- INITIAL DATA FACTORY ---
const getInitialData = (): RoadmapData => ({
  status: 'LIVE',
  currentWeek: 4,
  totalWeeks: 12,
  nutrition: [
    { 
      id: 'n1', title: 'Maintenance', startWeek: 1, endWeek: 4, type: 'nutrition', 
      duration: 4, order: 1,
      colorToken: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
      kcal: '2,450', macros: '35/35/30', freq: '4 Meals', water: '3.0 L',
      rationale: 'Establishing metabolic baseline and assessing initial response.',
      stratData: {
        summary: 'Maintenance phase to establish a metabolic baseline.',
        primaryObjective: 'Metabolic Stabilization',
        secondaryObjectives: ['Gut Health Assessment', 'Sleep Optimization'],
        kpis: ['Weight Stability (+/- 0.5kg)', 'Energy Levels 8/10'],
        successCriteria: ['Consistent digestion', 'Recovery improved'],
        coachNotes: 'Client sensitive to high fats, keep within 30%.',
        risksAndConstraints: ['Weekend travel in Week 3'],
        kcal: '2,450', macros: '35/35/30', freq: '4 Meals', water: '3.0 L'
      }
    },
    { 
      id: 'n2', title: 'Deficit (-500)', startWeek: 5, endWeek: 8, type: 'nutrition', 
      duration: 4, order: 2,
      colorToken: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
      kcal: '2,150', macros: '40/30/30', freq: '4 Meals', water: '3.5 L',
      deficit: '-500',
      rationale: 'Aggressive fat loss while preserving lean mass.',
      focusItems: ['Timing: 40g Protein pre/post workout', 'Supplements: Electrolyte support'],
      stratData: {
        summary: 'Aggressive fat loss phase with high protein focus.',
        primaryObjective: 'Fat Loss (-0.5% BW/week)',
        secondaryObjectives: ['Preserve Lean Mass', 'Maintain Training Intensity'],
        kpis: ['Waist Circumference', 'Bio-feedback scores'],
        successCriteria: ['Visible muscle definition', 'Hunger managed'],
        coachNotes: 'Increase fiber if hunger spikes in W7.',
        risksAndConstraints: ['Stress at work may impact adherence'],
        kcal: '2,150', macros: '40/30/30', freq: '4 Meals', water: '3.5 L'
      }
    },
    { 
      id: 'n3', title: 'Maintenance', startWeek: 9, endWeek: 12, type: 'nutrition', 
      duration: 4, order: 3,
      colorToken: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
      kcal: '2,300', macros: '35/35/30', freq: '4 Meals', water: '3.2 L',
      rationale: 'Reverse diet phase to solidify progress.',
      stratData: {
        summary: 'Reverse dieting and progress solidification.',
        primaryObjective: 'Metabolic Adaptation',
        secondaryObjectives: ['Long-term habit formation'],
        kpis: ['Strength Maintenance'],
        successCriteria: ['Progress kept', 'Calories increased'],
        coachNotes: 'Add carbs slowly (+20g/week).',
        risksAndConstraints: [],
        kcal: '2,300', macros: '35/35/30', freq: '4 Meals', water: '3.2 L'
      }
    },
  ],
  training: [
    { 
      id: 't1', title: 'Hypertrophy Base (4x)', startWeek: 1, endWeek: 6, type: 'training', 
      duration: 6, order: 1,
      colorToken: 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400',
      focus: 'Hypertrophy', sessions: '4 Sessions', deload: 'Active',
      intensityTargets: ['RPE 7-9 (Technical)', 'Rest: 60-90s'],
      stratData: {
        summary: 'Building physical foundation and technical mastery.',
        primaryObjective: 'Hypertrophy & Work Capacity',
        secondaryObjectives: ['Improved Squat Depth', 'Core Stability'],
        trainingVolume: 'Moderate (12-15 sets/muscle)',
        trainingIntensity: 'RPE 7-8',
        cardio: 'LISS 30min 2x/week',
        kpis: ['Total Volume Load', 'Rest intervals'],
        successCriteria: ['Form consistency', 'No joint pain'],
        coachNotes: 'Focus on mind-muscle connection.',
        risksAndConstraints: ['Avoid excessive failure sets early on'],
        trainingFocus: 'Hypertrophy', sessions: '4 Sessions', deload: 'Active',
        intensityTargets: ['RPE 7-9 (Technical)', 'Rest: 60-90s']
      }
    },
    { 
      id: 't2', title: 'Strength Peak (3x)', startWeek: 7, endWeek: 12, type: 'training', 
      duration: 6, order: 2,
      colorToken: 'bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400',
      focus: 'Strength', sessions: '3 Sessions', deload: 'Passive',
      intensityTargets: ['RPE 8-10', 'Rest: 120-180s'],
      stratData: {
        summary: 'Peaking for maximum strength on compound lifts.',
        primaryObjective: 'Absolute Strength Increase',
        secondaryObjectives: ['Neurological adaptation'],
        trainingVolume: 'Low (6-10 sets/muscle)',
        trainingIntensity: 'RPE 9-10',
        cardio: 'LISS 20min 1x/week',
        kpis: ['1RM Projected', 'Bar Speed'],
        successCriteria: ['PRs achieved', 'Peak recovered'],
        coachNotes: 'Prioritize sleep and recovery between sessions.',
        risksAndConstraints: ['CNS fatigue risk'],
        trainingFocus: 'Strength', sessions: '3 Sessions', deload: 'Passive',
        intensityTargets: ['RPE 8-10', 'Rest: 120-180s']
      }
    },
  ],
  goals: [
    { id: 'g1', type: 'physical', label: 'Physical', desc: 'Lose 10lbs fat, maintain muscle', value: 60, currentLabel: '150 lbs', targetLabel: 'Target: 140 lbs' },
    { id: 'g2', type: 'nutrition', label: 'Nutrition', desc: 'Adherence to deficit macros', value: 85, currentLabel: 'Consistent', targetLabel: 'Target: 90%+' },
    { id: 'g3', type: 'training', label: 'Training', desc: 'Complete all Hypertrophy sessions', value: 100, currentLabel: '16/16 sessions', targetLabel: 'Target: 100%' },
    { id: 'g4', type: 'mindset', label: 'Mindset', desc: 'Improve sleep quality & stress', value: 70, currentLabel: 'Avg 6.5h sleep', targetLabel: 'Target: 7.5h+' },
  ],
  milestones: [
    { id: 'm1', label: 'Program Start', week: 'Oct 01', status: 'done' },
    { id: 'm2', label: 'Phase 2 Review', week: 'Nov 15 (Next)', status: 'next' },
    { id: 'm3', label: 'Begin Strength Peak', week: 'Dec 15', status: 'future' },
  ],
  assumptions: {
    steps: '10,000 - 12,000',
    sleep: '7.5 hours minimum',
    constraints: 'Dairy-free, prefers higher protein distribution early in day.'
  }
});

// --- HELPER: ICON COMPONENT ---
const Icon = ({ name, className = "" }: { name: string, className?: string }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: 'inherit' }}>{name}</span>
);

export default function PlanningDetail({ onNavigate, clientId, initialRoadmap }: { onNavigate: (view: string) => void, clientId?: string, initialRoadmap?: RoadmapData }) {
  const { clients, reloadClients } = useClient();
  const client = clients.find(c => c.id === clientId);

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [draftBlockValues, setDraftBlockValues] = useState<Partial<RoadmapBlock> | null>(null);
  const [draftStratData, setDraftStratData] = useState<BlockStrategicDetails | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

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
    if (clientId) loadRoadmap();
  }, [clientId]);

  const loadRoadmap = async () => {
    try {
      const data = await fetchWithAuth(`/manager/clients/${clientId}/roadmap`);
      
      // The backend returns a record with a 'data_json' column
      let remoteRoadmap = null;
      if (data && data.data_json) {
        remoteRoadmap = typeof data.data_json === 'string' ? JSON.parse(data.data_json) : data.data_json;
      }

      // Use initialRoadmap (draft) if provided, otherwise remote data, otherwise default
      const roadmapData = initialRoadmap || remoteRoadmap || getInitialData();
      
      // Ensure we merge with structural defaults to prevent TypeErrors
      const finalRoadmap = {
        ...getInitialData(),
        ...roadmapData,
        // Preserve status from the record level if available
        status: data?.status || roadmapData.status || 'Draft'
      };
      
      setRoadmap(finalRoadmap);
      
      // Default selection to current phase
      const currentWeek = roadmapData.currentWeek || 4;
      const currentNut = roadmapData.nutrition.find(b => currentWeek >= b.startWeek && currentWeek <= b.endWeek);
      setSelectedBlockId(currentNut?.id || roadmapData.nutrition[0]?.id || null);
    } catch (error) {
      setRoadmap(getInitialData());
    } finally {
      setLoading(false);
    }
  };

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    if (saveStatus === 'saving') return;
    
    setSaveStatus('saving');
    try {
      if (!roadmap) {
        throw new Error("No roadmap data to save");
      }
      
      // Ensure we have a complete structure
      const payload = {
        ...getInitialData(),
        ...roadmap,
        // Status should be preserved or defaulted to LIVE if we are in Detail view
        status: roadmap.status || 'LIVE',
        updated_at: new Date().toISOString(),
        // Ensure arrays are never stripped
        goals: roadmap.goals || [],
        milestones: roadmap.milestones || [],
        nutrition: roadmap.nutrition || [],
        training: roadmap.training || []
      };

      console.log('DEBUG: Saving Roadmap Payload:', payload);

      const response = await fetchWithAuth(`/manager/clients/${clientId}/roadmap`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response || response.error) {
        throw new Error(response?.error || "Server failed to save roadmap");
      }
      
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

  const findFirstGap = (blocks: RoadmapBlock[]): number | null => {
    const occupied = new Set<number>();
    blocks.forEach(b => {
      for (let i = b.startWeek; i <= b.endWeek; i++) occupied.add(i);
    });
    for (let w = 1; w <= 12; w++) {
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
      alert("No available gap found in the roadmap (W1-W12).");
      return;
    }

    const newBlock: RoadmapBlock = {
      id: `${type[0]}${Date.now()}`,
      title: type === 'nutrition' ? 'New Nutrition Phase' : 'New Training Block',
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
    if (proposed.startWeek < 1 || proposed.endWeek > 12 || proposed.startWeek > proposed.endWeek) {
      setEditError(`Invalid range: W${proposed.startWeek} - W${proposed.endWeek}`);
      return false;
    }

    // Overlap Validation
    const hasOverlap = blocks.some(b => {
      if (b.id === blockId) return false;
      return (proposed.startWeek <= b.endWeek && proposed.endWeek >= b.startWeek);
    });

    if (hasOverlap) {
      setEditError("Conflict detected: This range overlaps with another block.");
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

  if (loading || !roadmap) return null;

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
                    Planning
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
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-bold px-4 py-1 rounded-bl-lg shadow-sm z-10 uppercase tracking-wider">
                Editing Draft
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div 
                  className="w-16 h-16 rounded-full bg-cover bg-center shadow-inner border-2 border-slate-50" 
                  style={{ backgroundImage: `url("${client?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'}")` }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{client?.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-slate-500">{client?.gender}, {client?.age} y.o.</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 relative z-10">
                <div className="bg-emerald-500 text-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center sm:justify-start">
                  <Icon name="play_circle" className="fill-1" />
                  <span className="font-bold text-sm">Program: {roadmap.status}</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm transition-colors border border-slate-200 dark:border-slate-700">
                    Discard
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={saveStatus === 'saving'}
                    className={`flex-1 sm:flex-none py-2 px-6 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 min-w-[120px] ${
                      saveStatus === 'saved' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                      saveStatus === 'error' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                      'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {saveStatus === 'saving' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {saveStatus === 'saved' && <Icon name="check_circle" className="text-white" />}
                    {saveStatus === 'error' && <Icon name="error" className="text-white" />}
                    
                    <span>
                      {saveStatus === 'saving' ? 'Saving...' : 
                       saveStatus === 'saved' ? 'Saved!' : 
                       saveStatus === 'error' ? 'Error!' : 
                       'Save Draft'}
                    </span>
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
                Master Roadmap
              </h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => addBlock('nutrition')}
                  className="group flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Icon name="add" className="text-[18px]" /> Nutrition Phase
                </button>
                <button 
                  onClick={() => addBlock('training')}
                  className="group flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Icon name="add" className="text-[18px]" /> Training Block
                </button>
              </div>
            </div>

            <div className="relative w-full overflow-x-auto pb-4 scrollbar-hide">
              <div className="min-w-[1000px]">
                {/* Week Labels */}
                <div className="flex justify-between px-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} className="w-1/12 text-center">W{i + 1}</span>
                  ))}
                </div>

                {/* Nutrition Lane */}
                <div className="relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-4">
                  <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Nutrition</h4>
                  <div className="flex gap-1 h-12 relative">
                    {roadmap.nutrition.map((block) => (
                      <div 
                        key={block.id}
                        onClick={() => setSelectedBlockId(block.id)}
                        style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                        className={`group relative flex items-center justify-center cursor-pointer transition-all border ${block.id === selectedBlockId ? 'ring-2 ring-emerald-500/50 scale-[0.99] z-10' : 'hover:scale-[0.99]'} ${block.colorToken} ${block.startWeek === 1 ? 'rounded-l-xl' : ''} ${block.endWeek === 12 ? 'rounded-r-xl' : ''}`}
                      >
                        <span className="text-sm font-bold truncate px-2">{block.title}</span>
                        {block.startWeek <= roadmap.currentWeek && block.endWeek >= roadmap.currentWeek && (
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
                  <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Training</h4>
                  <div className="flex gap-1 h-12">
                    {roadmap.training.map((block) => (
                      <div 
                        key={block.id}
                        onClick={() => setSelectedBlockId(block.id)}
                        style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                        className={`group relative flex items-center justify-center cursor-pointer transition-all border ${block.id === selectedBlockId ? 'ring-2 ring-emerald-500/50 scale-[0.99] z-10' : 'hover:scale-[0.99]'} ${block.colorToken} ${block.startWeek === 1 ? 'rounded-l-xl' : ''} ${block.endWeek === 12 ? 'rounded-r-xl' : ''}`}
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
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Block Strategic Details</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Strategy Roadmap • Week {roadmap.currentWeek} Intelligence
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 uppercase tracking-widest">Active Phase</span>
                <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Icon name="settings" /></button>
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
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Active Phase Selection</span>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedBlock.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                         <button 
                          onClick={() => setDraftStratData(JSON.parse(JSON.stringify(selectedBlock.stratData)))}
                          className="px-4 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                        >
                          Reset
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
                          Save Details
                        </button>
                      </div>
                    </div>

                    {/* Nutrition Section */}
                    {selectedBlock.type === 'nutrition' && (
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                          <Icon name="restaurant" className="text-[20px]" />
                          <h4 className="font-semibold text-xs uppercase tracking-widest">Nutrition Strategy</h4>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">(W{selectedBlock.startWeek}-{selectedBlock.endWeek})</span>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Calories</p>
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Macro Split</p>
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Meal Freq</p>
                          <input 
                            className="text-xl font-bold bg-transparent border-none p-0 focus:ring-0 outline-none text-slate-900 dark:text-white"
                            value={draftStratData?.freq || ''}
                            onChange={(e) => setDraftStratData(prev => prev ? { ...prev, freq: e.target.value } : null)}
                          />
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hydration</p>
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
                              onClick={() => setDraftStratData(prev => prev ? { ...prev, secondaryObjectives: [...prev.secondaryObjectives, 'New Objective'] } : null)}
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
                          <h4 className="font-semibold text-xs uppercase tracking-widest">Training Strategy</h4>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">(W{selectedBlock.startWeek}-{selectedBlock.endWeek})</span>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Block Focus</p>
                          <input 
                            className="text-xl font-bold bg-transparent border-none p-0 focus:ring-0 outline-none text-slate-900 dark:text-white"
                            value={draftStratData?.trainingFocus || ''}
                            onChange={(e) => setDraftStratData(prev => prev ? { ...prev, trainingFocus: e.target.value } : null)}
                          />
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Volume (Sets)</p>
                          <input 
                            className="text-xl font-bold bg-transparent border-none p-0 focus:ring-0 outline-none text-slate-900 dark:text-white w-full"
                            value={draftStratData?.trainingVolume || ''}
                            onChange={(e) => setDraftStratData(prev => prev ? { ...prev, trainingVolume: e.target.value } : null)}
                          />
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Intensity</p>
                          <input 
                            className="text-xl font-bold bg-transparent border-none p-0 focus:ring-0 outline-none text-slate-900 dark:text-white"
                            value={draftStratData?.trainingIntensity || ''}
                            onChange={(e) => setDraftStratData(prev => prev ? { ...prev, trainingIntensity: e.target.value } : null)}
                          />
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cardio</p>
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
                              onClick={() => setDraftStratData(prev => prev ? { ...prev, risksAndConstraints: [...prev.risksAndConstraints, 'New Risk'] } : null)}
                              className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-1 hover:underline"
                            >
                              + Add Risk
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
                            onClick={() => setDraftStratData(prev => prev ? { ...prev, successCriteria: [...prev.successCriteria, 'New Criteria'] } : null)}
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
                            onClick={() => setDraftStratData(prev => prev ? { ...prev, kpis: [...prev.kpis, 'New KPI'] } : null)}
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
                    <p className="font-bold uppercase tracking-widest text-[11px]">Select a roadmap phase to inspect strategic intelligence</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* --- 4. GOAL TRAJECTORY & PREDICTIONS (Moved Down) --- */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="analytics" className="text-emerald-500" />
                Goal Trajectory & Predictions
              </h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-emerald-500"></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Projected</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50">
                  <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5">Projected Weight</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">141.2</span>
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">lbs</span>
                  </div>
                  <p className="text-[10px] text-blue-600/70 mt-2 flex items-center gap-1 font-bold uppercase tracking-tight">
                    <Icon name="trending_down" className="text-[14px]" /> -8.8 lbs vs start
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/50">
                  <p className="text-[10px] font-semibold text-purple-600 dark:bg-purple-400 uppercase tracking-widest mb-1.5">Strength Peak</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-purple-700 dark:text-purple-300">+12%</span>
                  </div>
                  <p className="text-[10px] text-purple-600/70 mt-2 flex items-center gap-1 font-bold uppercase tracking-tight">
                    <Icon name="bolt" className="text-[14px]" /> Expected Week 12
                  </p>
                </div>
              </div>

              <div className="lg:col-span-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 relative shadow-inner">
                <div className="h-40 flex items-end justify-between relative mb-8">
                  <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1200 160">
                    <path d="M 0,20 L 100,28 L 200,45 L 300,65" fill="none" stroke="#3b82f6" strokeLinecap="round" strokeWidth="4" />
                    <path d="M 300,65 L 400,85 L 500,105 L 600,125 L 700,120 L 800,115 L 900,125 L 1000,135 L 1100,145 L 1200,150" fill="none" stroke="#10b981" strokeDasharray="10 8" strokeLinecap="round" strokeWidth="4" />
                    <circle cx="300" cy="65" fill="white" r="6" stroke="#3b82f6" strokeWidth="3" />
                  </svg>
                  <div className="absolute left-1/4 top-1/4 -translate-x-1/2 -mt-12">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-md text-[10px] font-bold uppercase tracking-widest">
                      Current: 148.5
                    </div>
                    <div className="w-px h-10 bg-slate-300 mx-auto mt-1" />
                  </div>
                  <div className="absolute right-0 bottom-0 mb-4 mr-2">
                    <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 text-[10px] font-bold uppercase tracking-widest ring-4 ring-white dark:ring-slate-800">
                      Target: 141.2
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  <span>W1</span><span>W2</span><span>W3</span>
                  <span className="text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full ring-1 ring-emerald-500/30">W4 (Now)</span>
                  <span>W5</span><span>W6</span><span>W7</span><span>W8</span><span>W9</span><span>W10</span><span>W11</span><span>W12</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- 5. GOALS & TARGETS --- */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="flag" className="text-emerald-500" />
                Goals & Targets
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roadmap.goals.map((goal) => (
                <div key={goal.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 relative group cursor-pointer hover:border-emerald-500 transition-all hover:shadow-md">
                  <button className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-emerald-500 bg-white rounded-lg shadow-sm border border-slate-100"><Icon name="edit" className="text-[16px]" /></button>
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
                  Key Milestones
                </h3>
                <button className="text-[10px] font-semibold text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-widest">+ Add Milestone</button>
              </div>
              <div className="space-y-3">
                {roadmap.milestones.map((m) => (
                  <div key={m.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${m.status === 'next' ? 'bg-white dark:bg-[#1e293b] border-emerald-500 ring-4 ring-emerald-500/5' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full ${m.status === 'done' ? 'bg-green-500' : m.status === 'next' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1.5">{m.label}</p>
                        <p className={`text-[10px] font-semibold uppercase tracking-widest ${m.status === 'next' ? 'text-emerald-500' : 'text-slate-400'}`}>{m.week}</p>
                      </div>
                    </div>
                    {m.status !== 'done' && (
                      <button className="px-3 py-1.5 text-[9px] font-semibold bg-white dark:bg-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 uppercase tracking-widest shadow-sm">
                        <Icon name="task" className="text-[14px]" /> Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* --- 7. ASSUMPTIONS --- */}
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-[11px] font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Icon name="rule" className="text-slate-400" />
                Strategic Assumptions
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Daily Steps Target</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold" 
                    type="text" 
                    value={roadmap.assumptions.steps}
                    onChange={(e) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, steps: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Sleep Hygiene</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold" 
                    type="text" 
                    value={roadmap.assumptions.sleep}
                    onChange={(e) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, sleep: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Primary Constraints</label>
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
                    Edit {draftBlockValues.type === 'nutrition' ? 'Nutrition' : 'Training'} Block
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
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Block Title</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      value={draftBlockValues.title || ''}
                      onChange={(e) => setDraftBlockValues({ ...draftBlockValues, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Start Week</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        value={draftBlockValues.startWeek}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const duration = (draftBlockValues.endWeek || 1) - (draftBlockValues.startWeek || 1);
                          setDraftBlockValues({ 
                            ...draftBlockValues, 
                            startWeek: val, 
                            endWeek: Math.min(val + duration, 12) 
                          });
                        }}
                      >
                        {Array.from({ length: 12 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Duration</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        value={(draftBlockValues.endWeek || 1) - (draftBlockValues.startWeek || 1) + 1}
                        onChange={(e) => {
                          const dur = parseInt(e.target.value);
                          setDraftBlockValues({ 
                            ...draftBlockValues, 
                            endWeek: Math.min((draftBlockValues.startWeek || 1) + dur - 1, 12) 
                          });
                        }}
                      >
                        {Array.from({ length: 12 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1} Weeks</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">End Week</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        value={draftBlockValues.endWeek}
                        onChange={(e) => setDraftBlockValues({ ...draftBlockValues, endWeek: parseInt(e.target.value) })}
                      >
                        {Array.from({ length: 12 }).map((_, i) => (
                          <option key={i + 1} disabled={i + 1 < (draftBlockValues.startWeek || 1)} value={i + 1}>Week {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Block Color</label>
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
                      <Icon name="delete" className="text-[18px]" /> Delete Block
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
                      Confirm Changes
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
