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
  Activity,
  ChevronRight as ChevronIcon
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
      id: 't1', title: 'Hypertrophy Base (4x)', startWeek: 1, endWeek: 6, type: 'training', color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 text-indigo-600',
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
  const [selectedNutritionId, setSelectedNutritionId] = useState<string | null>(null);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const data = await fetchWithAuth('/client/roadmap');
      const roadmapData = data.data_json && data.data_json.nutrition ? data.data_json : getInitialData();
      setRoadmap(roadmapData);
      
      const currentWeek = roadmapData.currentWeek || 1;
      const currentNut = roadmapData.nutrition.find(b => currentWeek >= b.startWeek && currentWeek <= b.endWeek);
      const currentTra = roadmapData.training.find(b => currentWeek >= b.startWeek && currentWeek <= b.endWeek);

      setSelectedNutritionId(currentNut?.id || (roadmapData.nutrition[0]?.id || null));
      setSelectedTrainingId(currentTra?.id || (roadmapData.training[0]?.id || null));
    } catch (error) {
      console.error('Error loading roadmap:', error);
      const initial = getInitialData();
      setRoadmap(initial);
      setSelectedNutritionId(initial.nutrition[0].id);
      setSelectedTrainingId(initial.training[0].id);
    } finally {
      setLoading(false);
    }
  };

  const activeNutrition = useMemo(() => roadmap?.nutrition.find(b => b.id === selectedNutritionId), [roadmap, selectedNutritionId]);
  const activeTraining = useMemo(() => roadmap?.training.find(b => b.id === selectedTrainingId), [roadmap, selectedTrainingId]);

  if (loading) return (
    <div className="p-10 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium italic">Cargando tu planificación...</p>
      </div>
    </div>
  );
  if (!roadmap) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth no-scrollbar">
        <div className="max-w-[1440px] mx-auto space-y-6">
          
          {/* 1. Header Area */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
              <div className="w-16 h-16 rounded-2xl bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54]">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Tu Estrategia Clínica</p>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Strategic Roadmap</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#17cf54] px-5 py-3 rounded-2xl text-white flex items-center gap-3 shadow-lg shadow-[#17cf54]/20 font-bold text-xs tracking-widest uppercase cursor-default">
                <PlayIcon className="w-5 h-5 fill-white/20" />
                <span>Estado: {roadmap.status}</span>
              </div>
            </div>
          </div>

          {/* Master Roadmap */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
             <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <MapIcon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Timeline Architecture</h3>
            </div>

            <div className="overflow-x-auto pb-6 no-scrollbar relative">
              <div className="min-w-[1240px] space-y-6 relative">
                 <div className="flex justify-between px-4 text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} className={`w-1/12 text-center ${i + 1 === roadmap.currentWeek ? 'text-[#17cf54] font-black' : ''}`}>W{i + 1}</span>
                  ))}
                </div>

                {/* Today Indicator Line */}
                <div 
                  className="absolute top-0 bottom-0 w-px bg-[#17cf54] z-20 pointer-events-none"
                  style={{ left: `${((roadmap.currentWeek - 0.5) / 12) * 100}%` }}
                >
                  <div className="absolute top-0 -translate-x-1/2 bg-[#17cf54] text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg shadow-emerald-500/20 tracking-tighter uppercase leading-none">TODAY</div>
                </div>

                <div className="space-y-4 px-2">
                  <div className="flex items-center gap-8">
                    <div className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Nutrition</div>
                    <div className="flex-1 flex gap-1 h-12 relative">
                      {roadmap.nutrition.map(block => (
                        <motion.div 
                          key={block.id}
                          layoutId={block.id}
                          style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                          onClick={() => setSelectedNutritionId(block.id)}
                          className={`border rounded-2xl flex items-center justify-center text-xs font-bold cursor-pointer transition-all relative ${block.color} ${selectedNutritionId === block.id ? 'ring-2 ring-[#17cf54] shadow-md z-10' : 'opacity-80 hover:opacity-100'}`}
                        >
                          {block.title}
                          {selectedNutritionId === block.id && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#17cf54] rotate-45" />}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Training</div>
                    <div className="flex-1 flex gap-1 h-12 relative">
                      {roadmap.training.map(block => (
                        <motion.div 
                          key={block.id}
                          layoutId={block.id}
                          style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                          onClick={() => setSelectedTrainingId(block.id)}
                          className={`border rounded-2xl flex items-center justify-center text-xs font-bold cursor-pointer transition-all relative ${block.color} ${selectedTrainingId === block.id ? 'ring-2 ring-[#17cf54] shadow-md z-10' : 'opacity-80 hover:opacity-100'}`}
                        >
                          {block.title}
                          {selectedTrainingId === block.id && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#17cf54] rotate-45" />}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Board - CLIENT VIEW */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-50/50 dark:bg-slate-800/40 px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54]">
                  <MindsetIcon className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">The Intelligence Board</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mt-1">Multi-Strategy Clinical Optimization</p>
                </div>
              </div>
              <span className="px-4 py-1.5 rounded-full text-[10px] font-bold bg-[#17cf54]/10 text-[#17cf54] border border-[#17cf54]/20 uppercase tracking-widest">Active Strategy View</span>
            </div>

            <div className="p-8 space-y-12">
               {/* Nutrition */}
              <section className="space-y-8">
                <div className="flex items-center gap-3 text-amber-600">
                  <NutritionIcon className="w-5 h-5" />
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.2em]">Nutrition Strategy: {activeNutrition?.title}</h4>
                  <div className="flex-1 h-px bg-amber-100 dark:bg-amber-900/30"></div>
                </div>

                {activeNutrition ? (
                  <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-emerald-500/20 group/card">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-semibold italic">Ingesta Diaria</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">{activeNutrition.kcal} <span className="text-[10px] text-slate-400 font-bold tracking-widest">KCAL</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-emerald-500/20 group/card">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-semibold italic">Macros</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">{activeNutrition.macros}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-center relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-amber-500/20 group/card">
                    <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest mb-1 font-semibold italic">Déficit</p>
                    <p className="text-xl font-bold text-amber-600 tracking-tight leading-none">{activeNutrition.deficit} <span className="text-[10px] text-amber-500/50 font-bold tracking-widest">KCAL/D</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 text-center relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-blue-500/20 group/card">
                    <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest mb-1 font-semibold italic">Agua</p>
                    <p className="text-xl font-bold text-blue-500 tracking-tight leading-none">{activeNutrition.water} <span className="text-[10px] text-blue-400/50 font-bold tracking-widest">LITROS</span></p>
                  </div>
                </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-8">
                        <div>
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             Metabolic Rationale
                          </h5>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 italic">
                             "{activeNutrition.rationale}"
                          </p>
                        </div>
                        <div>
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                             Nutrient Timing Matrix
                          </h5>
                           <ul className="space-y-3">
                            {activeNutrition.timing?.map((item: string, i: number) => (
                              <li key={i} className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#17cf54] shadow-md shadow-emerald-500/20" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                           Micronutrient Optimization
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          {activeNutrition.micros?.map((m: any, i: number) => (
                            <div key={i} className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">{m.label}</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white font-semibold">{m.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                   <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl uppercase text-[10px] font-bold tracking-widest italic">Nutrition Phase Data Pending</div>
                )}
              </section>

              <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

              {/* Training */}
              <section className="space-y-8">
                  <div className="flex items-center gap-3 text-purple-600">
                  <TrainingIcon className="w-5 h-5" />
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.2em]">Training Strategy: {activeTraining?.title}</h4>
                  <div className="flex-1 h-px bg-purple-100 dark:bg-purple-900/30"></div>
                </div>

                {activeTraining ? (
                   <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-emerald-500/20 group/card">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-semibold italic">Enfoque del Bloque</p>
                          <p className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">{activeTraining.focus}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-emerald-500/20 group/card">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-semibold italic">Sesiones / Sem</p>
                          <p className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">{activeTraining.sessions}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 text-center relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-purple-500/20 group/card">
                          <p className="text-[10px] font-bold text-purple-600/60 uppercase tracking-widest mb-1 font-semibold italic">Intensidad</p>
                          <p className="text-xl font-bold text-purple-600 tracking-tight leading-none">{activeTraining.intensity}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-emerald-500/20 group/card">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-semibold italic">Protocolo Tempo</p>
                          <p className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight font-mono leading-none">{activeTraining.tempo}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                          <h5 className="text-[9px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
                             Loading Strategy
                          </h5>
                          <p className="text-sm text-slate-500 font-medium italic">
                            "{activeTraining.loading}"
                          </p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                          <h5 className="text-[9px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
                             Anatomical Context
                          </h5>
                          <p className="text-sm text-slate-500 font-medium italic">
                            "{activeTraining.scope}"
                          </p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                          <h5 className="text-[9px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
                             Recovery Protocol
                          </h5>
                          <p className="text-sm text-slate-500 font-medium italic">
                            "{activeTraining.recovery}"
                          </p>
                        </div>
                      </div>
                    </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl uppercase text-[10px] font-bold tracking-widest italic">Training Block Data Pending</div>
                )}
              </section>
            </div>
          </div>

          {/* Goals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmap.goals.map(goal => (
              <div key={goal.id} className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <span className={`text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 ${goal.type === 'physical' ? 'text-blue-500' : goal.type === 'nutrition' ? 'text-amber-500' : goal.type === 'training' ? 'text-purple-500' : 'text-rose-500'}`}>
                    {goal.type === 'physical' ? <ScaleIcon className="w-5 h-5" /> : goal.type === 'nutrition' ? <NutritionIcon className="w-5 h-5" /> : goal.type === 'training' ? <TrainingIcon className="w-5 h-5" /> : <MindsetIcon className="w-5 h-5" />}
                    {goal.type}
                  </span>
                  <span className={`text-[11px] font-bold px-3 py-1.5 rounded-xl ${goal.type === 'physical' ? 'bg-blue-50 text-blue-600 shadow-blue-500/5' : goal.type === 'nutrition' ? 'bg-amber-50 text-amber-600 shadow-amber-500/5' : goal.type === 'training' ? 'bg-purple-50 text-purple-600 shadow-purple-500/5' : 'bg-rose-50 text-rose-600 shadow-rose-500/5'}`}>{goal.value}%</span>
                </div>
                <p className="text-xl font-bold mb-1">{goal.label}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-6">{goal.desc}</p>
                <div className="mt-auto h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.value}%` }}
                    transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                    className={`h-full rounded-full shadow-lg ${goal.type === 'physical' ? 'bg-blue-500' : goal.type === 'nutrition' ? 'bg-amber-500' : goal.type === 'training' ? 'bg-purple-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="h-12"></div>
        </div>
      </div>
    </div>
  );
}
