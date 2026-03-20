import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3,
  ChevronRight, 
  Edit3, 
  MoreHorizontal, 
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
  Save,
  ChevronLeft,
  Sparkles,
  Info,
  X,
  Target,
  Scale,
  TrendingUp,
  Apple,
  Plus,
  Trash2,
  Calendar,
  Zap,
  LayoutDashboard,
  CheckCircle,
  Menu,
  Utensils as NutritionIcon,
  Dumbbell as TrainingIcon,
  Brain as MindsetIcon,
  History as HistoryIcon,
  AlertTriangle as WarningIcon,
  TrendingUp as GrowthIcon,
  Scale as ScaleIcon,
  Plus as PlusIcon,
  Trash2 as DeleteIcon,
  Save as SaveIcon,
  X as CloseIcon,
  Zap as ZapIcon,
  Sticker,
  Moon,
  Footprints,
  Droplets,
  Activity,
  PlayCircle as PlayIcon,
  ChevronRight as ChevronIcon
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { useClient } from '../context/ClientContext';

// --- TYPES ---

interface RoadmapBlock {
  id: string;
  title: string;
  startWeek: number;
  endWeek: number;
  type: 'nutrition' | 'training';
  color: string;
  details: any;
}

interface IntelligenceSection {
  nutrition: {
    kcal: string;
    macros: string;
    deficit: string;
    water: string;
    rationale: string;
    timing: string[];
    micros: { label: string; value: string }[];
  };
  training: {
    focus: string;
    sessions: string;
    intensity: string;
    tempo: string;
    loading: string;
    scope: string;
    recovery: string;
  };
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
  intelligence: IntelligenceSection;
  goals: Goal[];
  assumptions: {
    steps: string;
    sleep: string;
    constraints: string;
  };
}

type EditContext = 'PHASE' | 'GOAL' | 'NUTRITION_STRATEGY' | 'TRAINING_STRATEGY' | 'ASSUMPTIONS' | 'PROGRAM' | null;

// --- MOCK DATA GENERATOR ---
const getInitialData = (): RoadmapData => ({
  status: 'LIVE',
  startDate: '2023-10-01',
  endDate: '2024-01-15',
  currentWeek: 5,
  totalWeeks: 12,
  nutrition: [
    { id: 'n1', title: 'Maintenance', startWeek: 1, endWeek: 4, type: 'nutrition', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600', details: {} },
    { id: 'n2', title: 'Deficit (-500)', startWeek: 5, endWeek: 8, type: 'nutrition', color: 'bg-amber-50 dark:bg-amber-900/30 border-primary border-y border-x-2 text-amber-700', details: {} },
    { id: 'n3', title: 'Maintenance', startWeek: 9, endWeek: 12, type: 'nutrition', color: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-600', details: {} },
  ],
  training: [
    { id: 't1', title: 'Hypertrophy Base (4x)', startWeek: 1, endWeek: 6, type: 'training', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-600', details: {} },
    { id: 't2', title: 'Strength Peak (3x)', startWeek: 7, endWeek: 12, type: 'training', color: 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800 text-rose-600', details: {} },
  ],
  intelligence: {
    nutrition: {
      kcal: '2,150',
      macros: '40/30/30',
      deficit: '-500',
      water: '3.5',
      rationale: 'Calculated -500kcal deficit targeting ~1lb/week fat loss. This moderate approach preserves metabolic flexibility while maximizing the 4-week hypertrophy block\'s protein turnover rate.',
      timing: [
        'Pre: 30g Protein / 40g Complex Carbs (90m prior)',
        'Intra: 10g EAAs + Electrolyte blend during lifting',
        'Post: 40g Whey / 50g Simple Carbs (within 60m)'
      ],
      micros: [
        { label: 'Magnesium', value: '400mg Glycinate (PM)' },
        { label: 'Vitamin D3+K2', value: '5000 IU (AM)' },
        { label: 'Omega-3', value: '2g EPA/DHA Daily' },
        { label: 'Zinc', value: '15mg for recovery' }
      ]
    },
    training: {
      focus: 'Hypertrophy',
      sessions: '4 Lift Days',
      intensity: 'RPE 7-9',
      tempo: '3-0-1-0',
      loading: 'Linear Periodization: Increase load by 2-5% weekly on primary compounds. Secondary movements focus on increasing total reps (8-12 range).',
      scope: 'Emphasis on Posterior Chain (Squat/DL) and Horizontal Pressing. Multi-joint exercises account for 70% of weekly working sets.',
      recovery: 'Automatic deload at Week 4. Reduce volume by 50% and intensity (RPE) to 5. Prioritize sleep hygiene (>7.5h nightly).'
    }
  },
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

export default function PlanningDetail({ onNavigate, clientId }: { onNavigate: (view: string) => void, clientId?: string }) {
  const { clients } = useClient();
  const client = clients.find(c => c.id === clientId);

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editContext, setEditContext] = useState<EditContext>(null);
  const [editTarget, setEditTarget] = useState<any>(null);

  useEffect(() => {
    if (clientId) {
      loadRoadmap();
    }
  }, [clientId]);

  const loadRoadmap = async () => {
    try {
      const data = await fetchWithAuth(`/manager/clients/${clientId}/roadmap`);
      if (data.data_json && data.data_json.intelligence) {
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

  const handleSave = async () => {
    try {
      await fetchWithAuth(`/manager/clients/${clientId}/roadmap`, {
        method: 'POST',
        body: JSON.stringify(roadmap)
      });
      // Simple feedback: could use a toast here
    } catch (error) {
      console.error('Error saving roadmap:', error);
    }
  };

  const openEditor = (context: EditContext, target: any) => {
    setEditContext(context);
    setEditTarget(target);
    setIsSidebarOpen(true);
  };

  const updateBlock = (updatedBlock: RoadmapBlock) => {
    if (!roadmap) return;
    const key = updatedBlock.type === 'nutrition' ? 'nutrition' : 'training';
    setRoadmap({
      ...roadmap,
      [key]: roadmap[key].map(b => b.id === updatedBlock.id ? updatedBlock : b)
    });
    setEditTarget(updatedBlock);
  };

  const addBlock = (type: 'nutrition' | 'training') => {
    if (!roadmap) return;
    const newBlock: RoadmapBlock = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Phase',
      startWeek: roadmap.currentWeek,
      endWeek: roadmap.currentWeek + 2,
      type,
      color: type === 'nutrition' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 text-rose-600' : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 text-indigo-600',
      details: {}
    };
    setRoadmap({
      ...roadmap,
      [type]: [...roadmap[type], newBlock]
    });
    openEditor('PHASE', newBlock);
  };

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" /></div>;
  if (!roadmap) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth no-scrollbar">
        <div className="max-w-[1200px] mx-auto space-y-6">
          
          {/* 1. Client Header & Breadcrumbs */}
          <div className="space-y-4">
            <nav className="flex text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <ol className="inline-flex items-center space-x-2">
                <li><button onClick={() => onNavigate('planning')} className="hover:text-emerald-500 transition-colors uppercase">Planning</button></li>
                <li className="flex items-center gap-2">
                  <ChevronIcon className="w-3 h-3" />
                  <span className="text-slate-900 dark:text-white">{client?.name}</span>
                </li>
              </ol>
            </nav>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-5">
                <div 
                  className="w-20 h-20 rounded-full bg-cover bg-center border-2 border-emerald-500/20" 
                  style={{ backgroundImage: `url(${client?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'})` }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{client?.name}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                    <span>Female, 28 y.o.</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800"></span>
                    <span>Client since Oct 2023</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div 
                  onClick={() => openEditor('PROGRAM', roadmap)}
                  className="bg-emerald-500 px-4 py-2.5 rounded-xl text-white flex items-center gap-2 shadow-sm font-bold text-sm w-full sm:w-auto justify-center cursor-pointer hover:bg-emerald-600 transition-all active:scale-95"
                >
                  <PlayIcon className="w-5 h-5 fill-white/20" />
                  <span>Program: {roadmap.status}</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button className="flex-1 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95">Discard</button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-sm shadow-emerald-500/10 active:scale-95"
                  >
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Master Roadmap */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Master Roadmap</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => addBlock('nutrition')}
                  className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-800/30 hover:bg-amber-100 transition-all"
                >
                  + Nutrition Phase
                </button>
                <button 
                  onClick={() => addBlock('training')}
                  className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-100 dark:border-purple-800/30 hover:bg-purple-100 transition-all"
                >
                  + Training Block
                </button>
              </div>
            </div>

            <div className="overflow-x-auto pb-4 no-scrollbar">
              <div className="min-w-[1000px] space-y-4">
                <div className="flex justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} className={`w-1/12 text-center ${i + 1 >= 5 && i + 1 <= 8 ? 'text-emerald-500 font-black' : ''}`}>W{i + 1}</span>
                  ))}
                </div>

                {/* Nutrition Lane */}
                <div className="flex items-center gap-4">
                  <div className="w-20 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Nutrition</div>
                  <div className="flex-1 flex gap-1 h-10">
                    {roadmap.nutrition.map(block => (
                      <div 
                        key={block.id}
                        style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                        onClick={() => openEditor('PHASE', block)}
                        className={`border rounded-lg flex items-center justify-center text-[11px] font-bold cursor-pointer transition-all hover:ring-2 hover:ring-emerald-500/20 relative ${block.color}`}
                      >
                        {block.title}
                        {block.title.includes('Deficit') && (
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-500 rotate-45" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Training Lane */}
                <div className="flex items-center gap-4">
                  <div className="w-20 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Training</div>
                  <div className="flex-1 flex gap-1 h-10">
                    {roadmap.training.map(block => (
                      <div 
                        key={block.id}
                        style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                        onClick={() => openEditor('PHASE', block)}
                        className={`border rounded-lg flex items-center justify-center text-[11px] font-bold cursor-pointer transition-all hover:ring-2 hover:ring-emerald-500/20 ${block.color}`}
                      >
                        {block.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. The Intelligence Board */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-50/50 dark:bg-slate-800/40 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <MindsetIcon className="w-5 h-5 fill-emerald-500/10" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">The Intelligence Board</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Active Phase: Nutrition Deficit • Weeks 5-8</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 uppercase tracking-widest">Live Strategy</span>
            </div>

            <div className="p-6 space-y-8">
              {/* Nutrition Strategy */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-amber-600">
                  <NutritionIcon className="w-4 h-4 fill-amber-500/10" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest">Nutrition Strategy</h4>
                  <div className="flex-1 h-px bg-amber-100 dark:bg-amber-900/30"></div>
                  <button onClick={() => openEditor('NUTRITION_STRATEGY', roadmap.intelligence.nutrition)} className="p-1 hover:bg-amber-50 rounded-lg transition-all">
                    <Edit3 className="w-3.5 h-3.5 text-amber-400 hover:text-amber-600" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target Daily Intake</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">{roadmap.intelligence.nutrition.kcal}</span>
                      <span className="text-[10px] font-bold text-amber-600">KCAL</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Daily Macro Split</p>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">{roadmap.intelligence.nutrition.macros}</span>
                      <span className="text-[9px] text-slate-400 uppercase font-medium">P / C / F %</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target Deficit</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-amber-600">{roadmap.intelligence.nutrition.deficit}</span>
                      <span className="text-[10px] font-bold text-amber-600">KCAL/DAY</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Water Target</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">{roadmap.intelligence.nutrition.water}</span>
                      <span className="text-[10px] font-bold text-blue-500 font-black">LITERS</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <ZapIcon className="w-3.5 h-3.5 text-amber-400" /> Metabolic Rationale
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        {roadmap.intelligence.nutrition.rationale}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <HistoryIcon className="w-3.5 h-3.5 text-amber-400" /> Nutrient Timing
                      </h5>
                      <ul className="space-y-2 text-sm">
                        {roadmap.intelligence.nutrition.timing.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Sticker className="w-3.5 h-3.5 text-amber-400" /> Micronutrient Focus
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {roadmap.intelligence.nutrition.micros.map((m, i) => (
                        <div key={i} className="p-3 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{m.label}</p>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

              {/* Training Strategy */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-purple-600">
                  <TrainingIcon className="w-4 h-4 fill-purple-500/10" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest">Training Strategy</h4>
                  <div className="flex-1 h-px bg-purple-100 dark:bg-purple-900/30"></div>
                  <button onClick={() => openEditor('TRAINING_STRATEGY', roadmap.intelligence.training)} className="p-1 hover:bg-purple-50 rounded-lg transition-all">
                    <Edit3 className="w-3.5 h-3.5 text-purple-400 hover:text-purple-600" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Block Focus</p>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{roadmap.intelligence.training.focus}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sessions / Week</p>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{roadmap.intelligence.training.sessions}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target Intensity</p>
                    <span className="text-xl font-bold text-purple-600 font-black">{roadmap.intelligence.training.intensity}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tempo Protocol</p>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{roadmap.intelligence.training.tempo}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <h5 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-1">
                      <GrowthIcon className="w-3.5 h-3.5" /> Loading Strategy
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {roadmap.intelligence.training.loading}
                    </p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <h5 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" /> Anatomical Scope
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {roadmap.intelligence.training.scope}
                    </p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <h5 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5" /> Recovery Protocol
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {roadmap.intelligence.training.recovery}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* 4. Goals & Targets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmap.goals.map(goal => (
              <div 
                key={goal.id} 
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-emerald-500/20 transition-all"
                onClick={() => openEditor('GOAL', goal)}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${goal.type === 'physical' ? 'text-blue-500' : goal.type === 'nutrition' ? 'text-amber-500' : goal.type === 'training' ? 'text-purple-500' : 'text-rose-500'}`}>
                    {goal.type === 'physical' ? <ScaleIcon className="w-3.5 h-3.5" /> : goal.type === 'nutrition' ? <NutritionIcon className="w-3.5 h-3.5" /> : goal.type === 'training' ? <TrainingIcon className="w-3.5 h-3.5" /> : <MindsetIcon className="w-3.5 h-3.5" />}
                    {goal.type}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${goal.type === 'physical' ? 'bg-blue-50 text-blue-600' : goal.type === 'nutrition' ? 'bg-amber-50 text-amber-600' : goal.type === 'training' ? 'bg-purple-50 text-purple-600' : 'bg-rose-50 text-rose-600'}`}>{goal.value}%</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1 truncate">{goal.label}</p>
                <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase truncate">{goal.desc}</p>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.value}%` }}
                    className={`h-full rounded-full ${goal.type === 'physical' ? 'bg-blue-500' : goal.type === 'nutrition' ? 'bg-amber-500' : goal.type === 'training' ? 'bg-purple-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 5. Progress & Projections Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Body Progress Forecast</h3>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Unit: LBS</span>
              </div>
              <div className="h-48 w-full relative">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M 0 20 L 20 28 L 40 45 L 60 62 L 80 58 L 100 75" fill="none" stroke="#10b981" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <circle cx="0" cy="20" fill="#10b981" r="2" />
                  <circle cx="20" cy="28" fill="#10b981" r="2" />
                  <circle cx="40" cy="45" fill="#10b981" r="2" />
                  <circle cx="60" cy="62" fill="white" r="3" stroke="#10b981" strokeWidth="2" />
                  <circle cx="80" cy="58" fill="#10b981" opacity="0.4" r="1.5" />
                  <circle cx="100" cy="75" fill="#10b981" opacity="0.4" r="1.5" />
                </svg>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-6 px-2">
                  <span>W1</span><span>W2</span><span>W3</span><span className="text-emerald-500 font-black">W4 (NOW)</span><span>W5</span><span>W6</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Strength Growth Projection</h3>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Metric: Volume</span>
              </div>
              <div className="h-48 w-full flex items-end gap-3 px-2">
                <div className="flex-1 bg-purple-100 dark:bg-purple-900/20 rounded-t-lg h-[40%]"></div>
                <div className="flex-1 bg-purple-200 dark:bg-purple-900/30 rounded-t-lg h-[55%]"></div>
                <div className="flex-1 bg-purple-300 dark:bg-purple-900/40 rounded-t-lg h-[65%]"></div>
                <div className="flex-1 bg-emerald-500 rounded-t-lg h-[80%] shadow-[0_-4px_12px_rgba(16,185,129,0.2)]"></div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-t-lg h-[85%] border-t-2 border-dashed border-slate-200 dark:border-slate-700"></div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-t-lg h-[95%] border-t-2 border-dashed border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-6 px-4">
                <span>W1</span><span>W2</span><span>W3</span><span className="text-emerald-500 font-black">W4</span><span>W5</span><span>W6</span>
              </div>
            </div>
          </div>

          {/* 6. Assumptions & Variables */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <WarningIcon className="w-4 h-4 text-slate-400 fill-slate-400/10" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Assumptions & Variables</h3>
              </div>
              <button onClick={() => openEditor('ASSUMPTIONS', roadmap.assumptions)} className="p-1 hover:bg-slate-50 rounded-lg transition-all">
                <Edit3 className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Daily Step Target</label>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-emerald-500" />
                  {roadmap.assumptions.steps}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Sleep Hygiene Goal</label>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold flex items-center gap-2">
                  <Moon className="w-4 h-4 text-blue-500" />
                  {roadmap.assumptions.sleep}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Dietary Constraints</label>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-amber-500" />
                  <span className="truncate">{roadmap.assumptions.constraints}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer spacing */}
          <div className="h-8"></div>
        </div>
      </div>

      {/* DYNAMIC SIDEBAR EDITOR */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 bottom-0 w-[450px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                  <Edit3 className="w-5 h-5" />
                </div>
                Edit {editContext?.replace('_', ' ')}
              </h2>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {/* --- PHASE EDITOR --- */}
              {editContext === 'PHASE' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Phase Title</label>
                    <input 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      value={editTarget.title}
                      onChange={(e) => updateBlock({ ...editTarget, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Start Week</label>
                      <input type="number" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold" value={editTarget.startWeek} onChange={(e) => updateBlock({ ...editTarget, startWeek: parseInt(e.target.value) })} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">End Week</label>
                      <input type="number" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold" value={editTarget.endWeek} onChange={(e) => updateBlock({ ...editTarget, endWeek: parseInt(e.target.value) })} />
                    </div>
                  </div>
                </div>
              )}

              {/* --- NUTRITION STRATEGY EDITOR --- */}
              {editContext === 'NUTRITION_STRATEGY' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">KCAL Target</label>
                      <input 
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold"
                        value={roadmap.intelligence.nutrition.kcal}
                        onChange={(e) => setRoadmap({ ...roadmap, intelligence: { ...roadmap.intelligence, nutrition: { ...roadmap.intelligence.nutrition, kcal: e.target.value } } })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Macro Split</label>
                      <input 
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold"
                        value={roadmap.intelligence.nutrition.macros}
                         onChange={(e) => setRoadmap({ ...roadmap, intelligence: { ...roadmap.intelligence, nutrition: { ...roadmap.intelligence.nutrition, macros: e.target.value } } })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Metabolic Rationale</label>
                    <textarea 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold min-h-[120px]"
                      value={roadmap.intelligence.nutrition.rationale}
                       onChange={(e) => setRoadmap({ ...roadmap, intelligence: { ...roadmap.intelligence, nutrition: { ...roadmap.intelligence.nutrition, rationale: e.target.value } } })}
                    />
                  </div>
                </div>
              )}

              {/* --- TRAINING STRATEGY EDITOR --- */}
              {editContext === 'TRAINING_STRATEGY' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Loading Strategy</label>
                    <textarea 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold min-h-[100px]"
                      value={roadmap.intelligence.training.loading}
                       onChange={(e) => setRoadmap({ ...roadmap, intelligence: { ...roadmap.intelligence, training: { ...roadmap.intelligence.training, loading: e.target.value } } })}
                    />
                  </div>
                   <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Recovery Protocol</label>
                    <textarea 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold min-h-[100px]"
                      value={roadmap.intelligence.training.recovery}
                       onChange={(e) => setRoadmap({ ...roadmap, intelligence: { ...roadmap.intelligence, training: { ...roadmap.intelligence.training, recovery: e.target.value } } })}
                    />
                  </div>
                </div>
              )}

              {/* --- ASSUMPTIONS EDITOR --- */}
              {editContext === 'ASSUMPTIONS' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Steps Target</label>
                    <input 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold"
                      value={roadmap.assumptions.steps}
                      onChange={(e) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, steps: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Dietary Constraints</label>
                    <textarea 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold min-h-[80px]"
                      value={roadmap.assumptions.constraints}
                      onChange={(e) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, constraints: e.target.value } })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Sync Strategy
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
