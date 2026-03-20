import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlayCircle,
  Map as MapIcon,
  Flag,
  Accessibility,
  Utensils,
  Dumbbell,
  Brain,
  History,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Apple,
  Clock,
  Zap,
  Target,
  FileText
} from 'lucide-react';
import { fetchWithAuth } from '../../api';

// --- TYPES ---

interface Milestone {
  id: string;
  date: string;
  label: string;
  desc?: string;
  status: 'completed' | 'active' | 'upcoming';
}

interface StructuralNutrition {
  phaseName: string;
  strategy: string;
  objective: string;
  calories: string;
  margin: string;
  macros: { p: string; c: string; f: string; };
  fiber: string;
  water: string;
  meals: string;
  timing: string;
  refeeds: string;
  cardio: string;
  steps: string;
  supplements: string;
  adherence: string;
  triggers: { weight: boolean; energy: boolean; hunger: boolean; digestion: boolean; };
  notes: string;
  instructions: string;
}

interface StructuralTraining {
  phaseName: string;
  type: string;
  objective: string;
  frequency: string;
  split: string;
  volume: string;
  intensity: string;
  rpe: string;
  progressionModel: string;
  priorityExercises: string;
  muscleFocus: string;
  cardio: string;
  mobility: string;
  deloadLogic: string;
  expectedFatigue: string;
  revisionCriteria: string;
  constraints: string;
  notes: string;
  instructions: string;
}

interface RoadmapBlock {
  id: string;
  title: string;
  startWeek: number;
  endWeek: number;
  type: 'nutrition' | 'training' | 'combined';
  color: string;
  summary: {
    objective: string;
    expectedResult: string;
    successCriteria: string;
    proNotes: string;
  };
  nutrition?: StructuralNutrition;
  training?: StructuralTraining;
  status: 'draft' | 'active' | 'archived' | 'template';
}

interface RoadmapData {
  status: string;
  startDate: string;
  endDate: string;
  currentWeek: number;
  totalWeeks: number;
  nutrition: RoadmapBlock[];
  training: RoadmapBlock[];
  milestones: Milestone[];
  risks: string;
}

const getInitialData = (): RoadmapData => ({
  status: 'LIVE',
  startDate: '2023-10-01',
  endDate: '2024-01-15',
  currentWeek: 5,
  totalWeeks: 12,
  nutrition: [],
  training: [],
  milestones: [],
  risks: 'No risks identified.'
});

export default function ClientRoadmap() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const selectedBlock = useMemo(() => {
    if (!roadmap || !selectedBlockId) return null;
    return [...roadmap.nutrition, ...roadmap.training].find(b => b.id === selectedBlockId);
  }, [roadmap, selectedBlockId]);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const data = await fetchWithAuth('/client/roadmap');
      if (data.data_json && data.data_json.nutrition) {
        setRoadmap({
          ...getInitialData(),
          ...data.data_json,
          status: data.status || 'LIVE'
        });
      } else {
        setRoadmap(getInitialData());
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
      setRoadmap(getInitialData());
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" /></div>;
  if (!roadmap) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-display">
      
      <div className="flex-1 overflow-y-auto p-8 scroll-smooth no-scrollbar">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
          
          {/* HEADER */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-100 uppercase tracking-widest">Active Roadmap</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">W{roadmap.currentWeek} of {roadmap.totalWeeks}</span>
             </div>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Your Strategic Program</h1>
          </div>

          {/* MASTER ROADMAP (Navigator) */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
             <div className="relative w-full overflow-x-auto pb-4 no-scrollbar">
                <div className="min-w-[1000px] relative">
                   <div className="flex justify-between px-2 mb-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                     {Array.from({ length: roadmap.totalWeeks }).map((_, i) => (
                       <span key={i} className="w-[8%] text-center">Week {i + 1}</span>
                     ))}
                   </div>
                   <div className="space-y-4">
                      <div className="relative h-10 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl flex items-center px-2">
                         {roadmap.nutrition.map(block => (
                           <div 
                            key={block.id}
                            style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%`, left: `${((block.startWeek - 1) / roadmap.totalWeeks) * 100}%` }}
                            className={`absolute h-7 rounded-lg border flex items-center px-3 cursor-pointer transition-all ${selectedBlockId === block.id ? 'border-emerald-500 shadow-md scale-[1.02] z-10' : 'border-white dark:border-slate-800 shadow-sm'} ${block.color}`}
                            onClick={() => setSelectedBlockId(block.id)}
                           >
                              <span className="text-[9px] font-bold uppercase truncate">{block.title}</span>
                           </div>
                         ))}
                      </div>
                      <div className="relative h-10 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl flex items-center px-2">
                         {roadmap.training.map(block => (
                           <div 
                            key={block.id}
                            style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%`, left: `${((block.startWeek - 1) / roadmap.totalWeeks) * 100}%` }}
                            className={`absolute h-7 rounded-lg border flex items-center px-3 cursor-pointer transition-all ${selectedBlockId === block.id ? 'border-emerald-500 shadow-md scale-[1.02] z-10' : 'border-white dark:border-slate-800 shadow-sm'} ${block.color}`}
                            onClick={() => setSelectedBlockId(block.id)}
                           >
                              <span className="text-[9px] font-bold uppercase truncate">{block.title}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="absolute top-8 bottom-4 w-[1px] bg-emerald-500/50" style={{ left: `${((roadmap.currentWeek - 0.5) / roadmap.totalWeeks) * 100}%` }}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">TODAY</div>
                   </div>
                </div>
             </div>
          </div>

          {/* STRUCTURAL VIEW */}
          <div className="min-h-[400px]">
             <AnimatePresence mode="wait">
                {!selectedBlockId ? (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
                      <Target className="w-12 h-12 text-slate-200 mb-4" />
                      <p className="text-sm font-bold text-slate-400 italic">Select a phase to see your program structure</p>
                   </motion.div>
                ) : (
                   <motion.div key={selectedBlockId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                      {/* Block Detail Header */}
                      <div className={`p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between ${selectedBlock?.color}`}>
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center text-slate-800 shadow-sm">
                               {selectedBlock?.type === 'nutrition' ? <Utensils className="w-6 h-6" /> : <Dumbbell className="w-6 h-6" />}
                            </div>
                            <div>
                               <h2 className="text-2xl font-bold tracking-tight">{selectedBlock?.title}</h2>
                               <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Structural Phase Details • Week {selectedBlock?.startWeek}-{selectedBlock?.endWeek}</p>
                            </div>
                         </div>
                      </div>

                      <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-10">
                         {/* Nutrition Column */}
                         {selectedBlock?.nutrition && (
                            <div className="space-y-8">
                               <div className="flex items-center gap-3">
                                  <Apple className="w-5 h-5 text-emerald-500" />
                                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nutrition Structure</h3>
                               </div>
                               <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                  <DataPoint label="Strategy" value={selectedBlock.nutrition.strategy} />
                                  <DataPoint label="Target Calories" value={selectedBlock.nutrition.calories} />
                                  <div className="col-span-2 flex justify-between gap-4">
                                     <MacroPoint label="P" value={selectedBlock.nutrition.macros.p} color="text-emerald-500" />
                                     <MacroPoint label="C" value={selectedBlock.nutrition.macros.c} color="text-amber-500" />
                                     <MacroPoint label="F" value={selectedBlock.nutrition.macros.f} color="text-indigo-500" />
                                  </div>
                                  <DataPoint label="Water" value={selectedBlock.nutrition.water} />
                                  <DataPoint label="Focus" value={selectedBlock.summary.objective} />
                               </div>
                               <div className="space-y-4">
                                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Structural Notes</h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{selectedBlock.nutrition.notes || "Follow baseline protocol."}</p>
                               </div>
                            </div>
                         )}

                         {/* Training Column */}
                         {selectedBlock?.training && (
                            <div className="space-y-8">
                               <div className="flex items-center gap-3">
                                  <Dumbbell className="w-5 h-5 text-indigo-500" />
                                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Training Structure</h3>
                               </div>
                               <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                  <DataPoint label="Block Type" value={selectedBlock.training.type} />
                                  <DataPoint label="Frequency" value={selectedBlock.training.frequency} />
                                  <DataPoint label="Intensity" value={selectedBlock.training.rpe} />
                                  <DataPoint label="Progression" value={selectedBlock.training.progressionModel} />
                                  <DataPoint label="Focus" value={selectedBlock.training.muscleFocus} />
                                  <DataPoint label="Expected Fatigue" value={selectedBlock.training.expectedFatigue} />
                               </div>
                               <div className="space-y-4">
                                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Structural Notes</h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{selectedBlock.training.notes || "Preserve intensity at all costs."}</p>
                               </div>
                            </div>
                         )}
                      </div>

                      {/* Logic Footer */}
                      <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                         <div className="flex items-center gap-4">
                            <Zap className="w-5 h-5 text-amber-500" />
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic">"Plan your work and work your plan."</p>
                         </div>
                         <button onClick={() => setSelectedBlockId(null)} className="px-6 py-2 bg-white dark:bg-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all">Collapse Details</button>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* SIDEBAR CONTEXT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
             <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-500"><History className="w-6 h-6" /></div>
                <div>
                   <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Upcoming Milestone</h4>
                   <p className="text-[10px] text-slate-400 font-medium">Nov 15 — Phase 2 Review & Structural Adjustment</p>
                </div>
             </div>
             <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500"><AlertTriangle className="w-6 h-6" /></div>
                <div>
                   <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Coach's Focus</h4>
                   <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">"{roadmap.risks}"</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function DataPoint({ label, value }: { label: string, value: string }) {
  return (
    <div>
       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
       <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{value || "—"}</p>
    </div>
  );
}

function MacroPoint({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-inner flex flex-col items-center">
       <span className={`text-[9px] font-black ${color} mb-1`}>{label}</span>
       <span className="text-sm font-bold text-slate-900 dark:text-white">{value || "0"}g</span>
    </div>
  );
}
