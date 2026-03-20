import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlayCircle as PlayIcon,
  Map as MapIcon,
  Calendar,
  Utensils as NutritionIcon,
  Dumbbell as TrainingIcon,
  Brain as MindsetIcon,
  History as HistoryIcon,
  AlertTriangle as WarningIcon,
  TrendingUp as GrowthIcon,
  Scale as ScaleIcon,
  Sparkles,
  Zap as ZapIcon,
  Sticker,
  Moon,
  Footprints,
  Droplets,
  Activity
} from 'lucide-react';
import { fetchWithAuth } from '../../api';

// --- TYPES ---

interface RoadmapBlock {
  id: string;
  title: string;
  startWeek: number;
  endWeek: number;
  type: 'nutrition' | 'training';
  color: string;
  // Nutrition specific
  kcal?: string;
  macros?: string;
  deficit?: string;
  water?: string;
  rationale?: string;
  timing?: string[];
  micros?: { label: string; value: string }[];
  // Training specific
  focus?: string;
  sessions?: string;
  intensity?: string;
  tempo?: string;
  loading?: string;
  scope?: string;
  recovery?: string;
}

interface Goal {
  id: string;
  type: 'physical' | 'nutrition' | 'training' | 'mindset';
  label: string;
  desc: string;
  value: number;
  targetValue: string;
  currentValue: string;
}

interface RoadmapData {
  status: string;
  startDate: string;
  endDate: string;
  currentWeek: number;
  totalWeeks: number;
  nutrition: RoadmapBlock[];
  training: RoadmapBlock[];
  goals: Goal[];
  assumptions: {
    steps: string;
    sleep: string;
    constraints: string;
  };
}

// --- MOCK DATA GENERATOR ---
const getInitialData = (): RoadmapData => ({
  status: 'LIVE',
  startDate: '2023-10-01',
  endDate: '2024-01-15',
  currentWeek: 5,
  totalWeeks: 12,
  nutrition: [
    { 
      id: 'n1', title: 'Maintenance', startWeek: 1, endWeek: 4, type: 'nutrition', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600',
      kcal: '2,650', macros: '30/40/30', deficit: '0', water: '3.0', 
      rationale: 'Initial phase to establish metabolic baseline and assess maintenance calories before entering deficit.',
      timing: ['Pre: 40g Pro / 60g Carb', 'Post: 40g Pro / 80g Carb'],
      micros: [{ label: 'Magnesium', value: '400mg' }]
    },
    { 
      id: 'n2', title: 'Deficit (-500)', startWeek: 5, endWeek: 8, type: 'nutrition', color: 'bg-amber-50 dark:bg-amber-900/30 border-[#17cf54] border-y border-x-2 text-amber-700',
      kcal: '2,150', macros: '40/30/30', deficit: '-500', water: '3.5',
      rationale: 'Calculated -500kcal deficit targeting ~1lb/week fat loss while maintaining muscle mass.',
      timing: ['Pre: 30g Pro / 40g Carb', 'Post: 40g Pro / 50g Carb'],
      micros: [{ label: 'Zinc', value: '15mg' }]
    },
    { 
      id: 'n3', title: 'Maintenance', startWeek: 9, endWeek: 12, type: 'nutrition', color: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-600',
      kcal: '2,400', macros: '35/35/30', deficit: '0', water: '3.2',
      rationale: 'Reverse diet phase to bring calories back to maintenance after the deficit block.',
      timing: ['Pre: 35g Pro / 50g Carb', 'Post: 40g Pro / 60g Carb'],
      micros: [{ label: 'Vitamin D', value: '5000 IU' }]
    },
  ],
  training: [
    { 
      id: 't1', title: 'Hypertrophy Base (4x)', startWeek: 1, endWeek: 6, type: 'training', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-600',
      focus: 'Hypertrophy', sessions: '4 Lift Days', intensity: 'RPE 7-9', tempo: '3-0-1-0',
      loading: 'Linear Periodization: Increase load by 2-5% weekly.',
      scope: 'Posterior Chain focus.',
      recovery: 'Prioritize sleep (>7.5h).'
    },
    { 
      id: 't2', title: 'Strength Peak (3x)', startWeek: 7, endWeek: 12, type: 'training', color: 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800 text-rose-600',
      focus: 'Strength', sessions: '3 Lift Days', intensity: 'RPE 8-10', tempo: '2-0-X-0',
      loading: 'Wave Loading: Alternating heavy/medium intensities.',
      scope: 'Compound lifts maximization.',
      recovery: 'Extended rest between sets.'
    },
  ],
  goals: [
    { id: 'g1', type: 'physical', label: 'Weight: 140 lbs', desc: 'Lose 10lbs fat, maintain muscle', value: 60, targetValue: '140 lbs', currentValue: '150 lbs' },
    { id: 'g2', type: 'nutrition', label: 'Adherence: 90%+', desc: 'Daily macro tracking accuracy', value: 85, targetValue: '90%+', currentValue: 'Consistent' },
    { id: 'g3', type: 'training', label: 'Frequency: 4x/wk', desc: 'Complete all hypertrophy sessions', value: 100, targetValue: '100%', currentValue: '16/16 sessions' },
    { id: 'g4', type: 'mindset', label: 'Sleep: 7.5h+', desc: 'Consistent sleep/wake hygiene', value: 70, targetValue: '7.5h+', currentValue: 'Avg 6.5h sleep' },
  ],
  assumptions: {
    steps: '10,000 - 12,000',
    sleep: '7.5 hours minimum',
    constraints: 'Dairy-free, prefers higher morning protein.'
  }
});

export default function ClientRoadmap() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const data = await fetchWithAuth('/client/roadmap');
      const roadmapData = data.data_json && data.data_json.nutrition ? data.data_json : getInitialData();
      setRoadmap(roadmapData);
      
      // Select first block by default
      if (roadmapData.nutrition.length > 0) {
        setSelectedBlockId(roadmapData.nutrition[0].id);
      } else if (roadmapData.training.length > 0) {
        setSelectedBlockId(roadmapData.training[0].id);
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
      const initial = getInitialData();
      setRoadmap(initial);
      setSelectedBlockId(initial.nutrition[0].id);
    } finally {
      setLoading(false);
    }
  };

  const selectedBlock = useMemo(() => {
    if (!roadmap || !selectedBlockId) return null;
    return roadmap.nutrition.find(b => b.id === selectedBlockId) || roadmap.training.find(b => b.id === selectedBlockId);
  }, [roadmap, selectedBlockId]);

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" /></div>;
  if (!roadmap) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#112116] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Scrollable Container - WIDER LAYOUT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth no-scrollbar">
        <div className="max-w-[1440px] mx-auto space-y-6 text-slate-900 dark:text-slate-100">
          
          {/* 1. Header Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black tracking-tight text-[#17cf54]">Strategic Roadmap</h1>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-black text-slate-500 uppercase tracking-widest leading-none mt-1">Status: {roadmap.status}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
              <div className="flex flex-col">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 font-black">Plan Objective</p>
                <h2 className="text-3xl font-black tracking-tight leading-tight">Elite Body Recomposition & Metabolic Priming</h2>
              </div>

              <div className="flex items-center gap-6 bg-[#17cf54] text-white px-8 py-5 rounded-3xl shadow-xl shadow-[#17cf54]/20 ring-4 ring-emerald-500/10">
                <div className="relative">
                  <PlayIcon className="w-10 h-10 fill-white/20" />
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-2xl tracking-tight leading-none mb-1">Week {roadmap.currentWeek}</span>
                  <span className="text-xs font-black uppercase tracking-widest opacity-80 leading-none">Of {roadmap.totalWeeks} Phase Cycle</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Master Roadmap */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
             <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                <MapIcon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Timeline Architecture</h3>
            </div>

            <div className="overflow-x-auto pb-6 no-scrollbar">
              <div className="min-w-[1200px] space-y-8">
                <div className="flex justify-between px-4 text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} className={`w-1/12 text-center ${i + 1 === roadmap.currentWeek ? 'text-[#17cf54] scale-110' : ''}`}>Week {i + 1}</span>
                  ))}
                </div>

                <div className="space-y-4 px-2">
                  <div className="flex items-center gap-8">
                    <div className="w-24 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Nutrition</div>
                    <div className="flex-1 flex gap-1 h-14 relative">
                      {roadmap.nutrition.map(block => (
                        <motion.div 
                          key={block.id}
                          layoutId={block.id}
                          style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                          onClick={() => setSelectedBlockId(block.id)}
                          className={`border rounded-2xl flex items-center justify-center text-xs font-black cursor-pointer transition-all relative ${block.color} ${selectedBlockId === block.id ? 'ring-4 ring-[#17cf54]/30 shadow-lg z-10' : 'opacity-70 hover:opacity-100 scale-95 hover:scale-100'}`}
                        >
                          {block.title}
                          {selectedBlockId === block.id && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-white dark:bg-slate-900 border-2 border-[#17cf54] rounded-full shadow-lg" />}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="w-24 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Training</div>
                    <div className="flex-1 flex gap-1 h-14 relative">
                      {roadmap.training.map(block => (
                        <motion.div 
                          key={block.id}
                          layoutId={block.id}
                          style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                          onClick={() => setSelectedBlockId(block.id)}
                          className={`border rounded-2xl flex items-center justify-center text-xs font-black cursor-pointer transition-all relative ${block.color} ${selectedBlockId === block.id ? 'ring-4 ring-[#17cf54]/30 shadow-lg z-10' : 'opacity-70 hover:opacity-100 scale-95 hover:scale-100'}`}
                        >
                          {block.title}
                          {selectedBlockId === block.id && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-white dark:bg-slate-900 border-2 border-[#17cf54] rounded-full shadow-lg" />}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. The Intelligence Board */}
          <AnimatePresence mode="wait">
            {selectedBlock && (
              <motion.div 
                key={selectedBlock.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="bg-slate-50/50 dark:bg-slate-800/40 px-10 py-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-xl ${selectedBlock.type === 'nutrition' ? 'bg-amber-100 text-amber-600 shadow-amber-500/10' : 'bg-purple-100 text-purple-600 shadow-purple-500/10'}`}>
                      {selectedBlock.type === 'nutrition' ? <NutritionIcon className="w-8 h-8" /> : <TrainingIcon className="w-8 h-8" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedBlock.title}</h3>
                        <span className="px-4 py-1.5 rounded-xl text-xs font-black border border-slate-200 uppercase tracking-widest text-slate-400">Phase Segment: W{selectedBlock.startWeek}-W{selectedBlock.endWeek}</span>
                      </div>
                      <p className="text-xs text-[#17cf54] font-black uppercase tracking-[0.2em] mt-2">Active Strategy Intelligence Board</p>
                    </div>
                  </div>
                  <span className="px-6 py-2.5 rounded-full text-xs font-black bg-[#17cf54]/10 text-[#17cf54] border border-[#17cf54]/20 uppercase tracking-widest flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#17cf54] animate-pulse" /> Strategy View
                  </span>
                </div>

                <div className="p-10 space-y-12">
                  {selectedBlock.type === 'nutrition' ? (
                    <section className="space-y-10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Daily Intake Hub</p>
                          <div className="flex items-baseline gap-2">
                             <span className="text-4xl font-black tracking-tight">{selectedBlock.kcal}</span>
                             <span className="text-xs font-black text-amber-500 uppercase tracking-widest">KCAL</span>
                          </div>
                        </div>
                        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">P / C / F Ratio</p>
                          <span className="text-4xl font-black tracking-tight">{selectedBlock.macros}</span>
                        </div>
                        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Net Deficit Goal</p>
                          <div className="flex items-baseline gap-2">
                             <span className="text-4xl font-black tracking-tight text-amber-600">{selectedBlock.deficit}</span>
                             <span className="text-xs font-black text-amber-600 uppercase tracking-widest font-black">Daily</span>
                          </div>
                        </div>
                        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Hydration Standard</p>
                          <div className="flex items-baseline gap-2">
                             <span className="text-4xl font-black tracking-tight text-blue-500">{selectedBlock.water}</span>
                             <span className="text-xs font-black text-blue-500 uppercase tracking-widest">LITERS</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-10">
                          <div>
                            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                              <ZapIcon className="w-5 h-5 text-amber-400" /> Metabolic Rationale
                            </h5>
                            <p className="text-md text-slate-600 dark:text-slate-300 leading-relaxed bg-[#fbfcfb] dark:bg-slate-800/30 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm italic">
                              "{selectedBlock.rationale}"
                            </p>
                          </div>
                          <div>
                            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                              <HistoryIcon className="w-5 h-5 text-amber-400" /> Nutrient Timing Matrix
                            </h5>
                            <ul className="space-y-4">
                              {selectedBlock.timing?.map((item: string, i: number) => (
                                <li key={i} className="flex items-center gap-5 p-4 bg-white dark:bg-slate-800/5 rounded-2xl border border-slate-50 dark:border-slate-800 shadow-sm font-medium text-slate-500">
                                  <div className="w-3 h-3 rounded-full bg-[#17cf54] shadow-md shadow-emerald-500/20" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <Sticker className="w-5 h-5 text-amber-400" /> Micronutrient Optimization
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {selectedBlock.micros?.map((m: any, i: number) => (
                              <div key={i} className="p-6 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 rounded-3xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 -mr-8 -mt-8 rotate-45" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white">{m.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  ) : (
                     <section className="space-y-10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Neuro-Focus</p>
                          <span className="text-4xl font-black tracking-tight">{selectedBlock.focus}</span>
                        </div>
                        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Weekly Effort</p>
                          <span className="text-4xl font-black tracking-tight">{selectedBlock.sessions}</span>
                        </div>
                        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Load Intensity</p>
                          <span className="text-4xl font-black tracking-tight text-purple-600">{selectedBlock.intensity}</span>
                        </div>
                        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Tempo Pattern</p>
                          <span className="text-4xl font-black tracking-tight">{selectedBlock.tempo}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 bg-white dark:bg-slate-800/40 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
                          <h5 className="text-[11px] font-black text-purple-600 uppercase tracking-[0.3em] flex items-center gap-3">
                            <GrowthIcon className="w-6 h-6" /> Loading Strategy
                          </h5>
                          <p className="text-md text-slate-500 font-medium leading-relaxed italic">
                            "{selectedBlock.loading}"
                          </p>
                        </div>
                        <div className="p-8 bg-white dark:bg-slate-800/40 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
                          <h5 className="text-[11px] font-black text-purple-600 uppercase tracking-[0.3em] flex items-center gap-3">
                            <Activity className="w-6 h-6" /> Anatomical Context
                          </h5>
                          <p className="text-md text-slate-500 font-medium leading-relaxed italic">
                            "{selectedBlock.scope}"
                          </p>
                        </div>
                        <div className="p-8 bg-white dark:bg-slate-800/40 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
                          <h5 className="text-[11px] font-black text-purple-600 uppercase tracking-[0.3em] flex items-center gap-3">
                            <Moon className="w-6 h-6" /> Recovery Protocol
                          </h5>
                          <p className="text-md text-slate-500 font-medium leading-relaxed italic">
                            "{selectedBlock.recovery}"
                          </p>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. Goals & Targets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmap.goals.map(goal => (
              <div key={goal.id} className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <span className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-3 ${goal.type === 'physical' ? 'text-blue-500' : goal.type === 'nutrition' ? 'text-amber-500' : goal.type === 'training' ? 'text-purple-500' : 'text-rose-500'}`}>
                    {goal.type === 'physical' ? <ScaleIcon className="w-5 h-5" /> : goal.type === 'nutrition' ? <NutritionIcon className="w-5 h-5" /> : goal.type === 'training' ? <TrainingIcon className="w-5 h-5" /> : <MindsetIcon className="w-5 h-5" />}
                    {goal.type}
                  </span>
                  <span className={`text-[11px] font-black px-3 py-1.5 rounded-xl ${goal.type === 'physical' ? 'bg-blue-50 text-blue-600 shadow-blue-500/5' : goal.type === 'nutrition' ? 'bg-amber-50 text-amber-600 shadow-amber-500/5' : goal.type === 'training' ? 'bg-purple-50 text-purple-600 shadow-purple-500/5' : 'bg-rose-50 text-rose-600 shadow-rose-500/5'}`}>{goal.value}%</span>
                </div>
                <p className="text-xl font-black mb-1">{goal.label}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">{goal.desc}</p>
                <div className="mt-auto h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.value}%` }}
                    transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                    className={`h-full rounded-full shadow-lg ${goal.type === 'physical' ? 'bg-blue-500 shadow-blue-500/20' : goal.type === 'nutrition' ? 'bg-amber-500 shadow-amber-500/20' : goal.type === 'training' ? 'bg-purple-500 shadow-purple-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 5. Progress Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-xs font-black uppercase tracking-[0.3em]">Neural Progress Forecast</h3>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">UNIT: LBS</span>
              </div>
              <div className="h-48 w-full relative">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M 0 20 L 20 28 L 40 45 L 60 62 L 80 58 L 100 75" fill="none" stroke="#17cf54" strokeWidth="4" vectorEffect="non-scaling-stroke" />
                  <circle cx="0" cy="20" fill="#17cf54" r="4" />
                  <circle cx="20" cy="28" fill="#17cf54" r="4" />
                  <circle cx="40" cy="45" fill="#17cf54" r="4" />
                  <circle cx="60" cy="62" fill="white" r="6" stroke="#17cf54" strokeWidth="3" />
                  <circle cx="80" cy="58" fill="#17cf54" opacity="0.4" r="3" />
                  <circle cx="100" cy="75" fill="#17cf54" opacity="0.4" r="3" />
                </svg>
                <div className="flex justify-between text-[11px] font-black text-slate-300 mt-10 px-4 tracking-[0.3em] uppercase">
                  <span>W1</span><span>W2</span><span>W3</span><span className="text-[#17cf54] scale-110">W4 NOW</span><span>W5</span><span>W6</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-xs font-black uppercase tracking-[0.3em]">Volume Capacity Projection</h3>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">KPI: INTENSITY</span>
              </div>
              <div className="h-48 w-full flex items-end gap-5 px-4">
                <div className="flex-1 bg-purple-100 dark:bg-purple-900/20 rounded-t-2xl h-[40%]"></div>
                <div className="flex-1 bg-purple-200 dark:bg-purple-900/30 rounded-t-2xl h-[55%]"></div>
                <div className="flex-1 bg-purple-300 dark:bg-purple-900/40 rounded-t-2xl h-[65%]"></div>
                <div className="flex-1 bg-[#17cf54] rounded-t-2xl h-[80%] shadow-2xl shadow-[#17cf54]/30 ring-4 ring-[#17cf54]/5"></div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-t-2xl h-[85%] border-t-4 border-dotted border-slate-200 dark:border-slate-700"></div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-t-2xl h-[95%] border-t-4 border-dotted border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="flex justify-between text-[11px] font-black text-slate-300 mt-10 px-8 tracking-[0.3em] uppercase">
                <span>W1</span><span>W2</span><span>W3</span><span className="text-[#17cf54] scale-110">W4</span><span>W5</span><span>W6</span>
              </div>
            </div>
          </div>

          {/* 6. Assumptions & Variables */}
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-[20px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <WarningIcon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Assumptions & Static Variables</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Basal Step Target</label>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-[28px] px-8 py-5 text-lg font-black flex items-center gap-4 shadow-inner">
                  <Footprints className="w-7 h-7 text-[#17cf54]" />
                  {roadmap.assumptions.steps}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Sleep Recovery Goal</label>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-[28px] px-8 py-5 text-lg font-black flex items-center gap-4 shadow-inner">
                  <Moon className="w-7 h-7 text-blue-500" />
                  {roadmap.assumptions.sleep}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Clinical Constraints</label>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-[28px] px-8 py-5 text-lg font-black flex items-center gap-4 shadow-inner">
                  <Droplets className="w-7 h-7 text-amber-500" />
                  <span className="truncate">{roadmap.assumptions.constraints}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-12"></div>
        </div>
      </div>
    </div>
  );
}
