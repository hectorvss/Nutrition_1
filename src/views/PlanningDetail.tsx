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
  GripVertical,
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
  ChevronRight as ChevronIcon,
  PlusCircle,
  FileText
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
  // Analysis specific
  successCriteria?: string;
  redFlags?: string;
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

// --- HELPER COMPONENTS FOR INLINE EDITING ---

const InlineInput = ({ value, onChange, className = "", prefix = null, suffix = null }: any) => (
  <div className={`group relative flex items-center ${className}`}>
    {prefix && <span className="mr-1">{prefix}</span>}
    <input 
      className="bg-transparent border-none p-0 focus:ring-0 w-full font-bold outline-none selection:bg-emerald-100"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type here..."
    />
    {suffix && <span className="ml-1">{suffix}</span>}
    <div className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#17cf54] transition-all group-focus-within:w-full" />
  </div>
);

const InlineTextarea = ({ value, onChange, className = "" }: any) => (
  <div className={`group relative ${className}`}>
    <textarea 
      className="bg-transparent border-none p-0 focus:ring-0 w-full outline-none resize-none font-medium text-slate-600 dark:text-slate-300 selection:bg-emerald-100"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Describe the clinical rationale..."
      rows={3}
    />
    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#17cf54] transition-all group-focus-within:w-full" />
  </div>
);

const ListEditor = ({ items = [], onChange, className = "" }: any) => (
  <ul className={`space-y-2 ${className}`}>
    {items.map((item: string, i: number) => (
      <li key={i} className="flex items-start gap-3 group">
        <span className="w-1.5 h-1.5 rounded-full bg-[#17cf54] mt-2 shrink-0"></span>
        <div className="flex-1 relative">
          <input 
            className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-slate-500 outline-none"
            value={item}
            onChange={(e) => {
              const newItems = [...items];
              newItems[i] = e.target.value;
              onChange(newItems);
            }}
          />
          <div className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#17cf54] transition-all group-focus-within:w-full" />
        </div>
        <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 rounded-lg transition-all">
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
        </button>
      </li>
    ))}
    <button onClick={() => onChange([...items, "New point"])} className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 hover:text-emerald-600 mt-2">
      <PlusCircle className="w-3.5 h-3.5" /> ADD TIMING POINT
    </button>
  </ul>
);

export default function PlanningDetail({ onNavigate, clientId }: { onNavigate: (view: string) => void, clientId?: string }) {
  const { clients } = useClient();
  const client = clients.find(c => c.id === clientId);

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (clientId) {
      loadRoadmap();
    }
  }, [clientId]);

  const loadRoadmap = async () => {
    try {
      const data = await fetchWithAuth(`/manager/clients/${clientId}/roadmap`);
      const roadmapData = data.data_json && data.data_json.nutrition ? data.data_json : getInitialData();
      setRoadmap(roadmapData);
      
      // Default selection to current week nutrition block
      const currentWeek = roadmapData.currentWeek || 1;
      const currentNut = roadmapData.nutrition.find(b => currentWeek >= b.startWeek && currentWeek <= b.endWeek);
      setSelectedBlockId(currentNut?.id || roadmapData.nutrition[0]?.id || roadmapData.training[0]?.id || null);

    } catch (error) {
      console.error('Error loading roadmap:', error);
      const initial = getInitialData();
      setRoadmap(initial);
      setSelectedBlockId(initial.nutrition[1].id); // n2 is deficit
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
    } catch (error) {
      console.error('Error saving roadmap:', error);
    }
  };

  const updateBlockData = (blockId: string, updates: Partial<RoadmapBlock>) => {
    if (!roadmap) return;
    const isNutrition = roadmap.nutrition.some(b => b.id === blockId);
    const key = isNutrition ? 'nutrition' : 'training';
    
    setRoadmap({
      ...roadmap,
      [key]: roadmap[key].map(b => b.id === blockId ? { ...b, ...updates } : b)
    });
  };

  const addBlock = (type: 'nutrition' | 'training') => {
    if (!roadmap) return;
    const newId = Math.random().toString(36).substr(2, 9);
    const newBlock: RoadmapBlock = {
      id: newId,
      title: 'New Phase',
      startWeek: roadmap.currentWeek,
      endWeek: roadmap.currentWeek + 2,
      type,
      color: type === 'nutrition' 
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 text-emerald-600' 
        : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 text-indigo-600',
      ...(type === 'nutrition' ? {
        kcal: '2000', macros: '40/30/30', deficit: '0', water: '3.0', rationale: '', timing: [], micros: []
      } : {
        focus: 'Strength', sessions: '3x', intensity: 'RPE 8', tempo: 'X', loading: '', scope: '', recovery: ''
      })
    };
    
    setRoadmap({
      ...roadmap,
      [type]: [...roadmap[type], newBlock]
    });
    setSelectedBlockId(newId);
  };

  const selectedBlock = useMemo(() => {
    if (!roadmap) return null;
    return [...roadmap.nutrition, ...roadmap.training].find(b => b.id === selectedBlockId);
  }, [roadmap, selectedBlockId]);

  if (loading) return (
    <div className="p-10 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium italic">Loading planning data...</p>
      </div>
    </div>
  );
  if (!roadmap) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth no-scrollbar">
        <div className="max-w-[1440px] mx-auto space-y-6">
          
          {/* 1. Client Header */}
          <div className="space-y-4">
            <nav className="flex text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <ol className="inline-flex items-center space-x-2">
                <li><button onClick={() => onNavigate('planning')} className="hover:text-emerald-500 transition-colors uppercase">Planning</button></li>
                <li className="flex items-center gap-2">
                  <ChevronIcon className="w-3 h-3" />
                  <span className="text-slate-900 dark:text-white uppercase">{client?.name}</span>
                </li>
              </ol>
            </nav>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-6">
                <div 
                  className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-[#17cf54]/10 shadow-xl shadow-[#17cf54]/5" 
                  style={{ backgroundImage: `url(${client?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'})` }}
                />
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-2">{client?.name}</h2>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 tracking-wider">
                      <span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> High Motivation</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></span>
                      <span>Client since Oct 2023</span>
                    </div>
                    {roadmap && (
                      <p className="text-xs font-bold text-emerald-500/80 dark:text-emerald-400/80 uppercase tracking-widest mt-1">
                        Active Phase: {roadmap.nutrition.find(b => roadmap.currentWeek >= b.startWeek && roadmap.currentWeek <= b.endWeek)?.title || 'Steady State'} | Week {roadmap.currentWeek} of {roadmap.totalWeeks}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={handleSave} 
                    className="flex-1 px-8 py-3 rounded-xl bg-[#17cf54] text-white font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95 shadow-lg shadow-emerald-500/20"
                  >
                    <SaveIcon className="w-4 h-4" />
                    Save Program
                  </button>
                  <button 
                    className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 bg-white text-xs uppercase tracking-widest active:scale-95 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    Discard
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Master Roadmap */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-10 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none opacity-50" />
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Master Roadmap</h3>
              </div>
            </div>

            <div className="overflow-x-auto pb-6 no-scrollbar relative">
              <div className="min-w-[1240px] space-y-6 relative">
                
                {/* Weeks Header */}
                <div className="flex justify-between px-4 text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} className={`w-1/12 text-center ${i + 1 === roadmap.currentWeek ? 'text-[#17cf54] font-black' : ''}`}>W{i + 1}</span>
                  ))}
                </div>

                {/* Today Indicator Line (Spanning both lanes) */}
                <div 
                  className="absolute top-0 bottom-0 w-px bg-[#17cf54] z-20 pointer-events-none"
                  style={{ left: `${((roadmap.currentWeek - 0.5) / 12) * 100}%` }}
                >
                  <div className="absolute top-0 bottom-0 w-px bg-[#17cf54] z-20 pointer-events-none"></div>
                  <div className="absolute top-0 bottom-0 w-8 -ml-4 bg-emerald-500/5 dark:bg-emerald-500/10 blur-xl pointer-events-none" />
                </div>

                {/* Lanes */}
                <div className="space-y-4 px-2 relative">
                  {/* Nutrition Lane */}
                  <div className="flex items-center gap-8 relative">
                    <div className="w-20 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">Nutrition</div>
                    <div className="flex-1 flex gap-1 h-12 relative items-center">
                      {roadmap.nutrition.map(block => (
                        <motion.div 
                          key={block.id}
                          layoutId={block.id}
                          style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                          onClick={() => setSelectedBlockId(block.id)}
                          className={`group/block h-full border rounded-2xl flex items-center justify-center text-xs font-bold cursor-pointer transition-all relative ${block.color} ${selectedBlockId === block.id ? 'ring-2 ring-[#17cf54] shadow-md z-10 scale-[1.02] bg-white dark:bg-slate-800' : 'opacity-80 hover:opacity-100'}`}
                        >
                          <GripVertical className="w-3 h-3 absolute left-2 opacity-0 group-hover/block:opacity-40 transition-opacity" />
                          {block.title}
                          {roadmap.currentWeek >= block.startWeek && roadmap.currentWeek <= block.endWeek && (
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#17cf54] rotate-45 shadow-sm" />
                          )}
                        </motion.div>
                      ))}
                      <button 
                        onClick={() => addBlock('nutrition')}
                        className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 border-dashed flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all ml-2 shrink-0 group"
                        title="Add Nutrition Phase"
                      >
                        <PlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Training Lane */}
                  <div className="flex items-center gap-8 relative">
                    <div className="w-20 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">Training</div>
                    <div className="flex-1 flex gap-1 h-12 relative items-center">
                      {roadmap.training.map(block => (
                        <motion.div 
                          key={block.id}
                          layoutId={block.id}
                          style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                          onClick={() => setSelectedBlockId(block.id)}
                          className={`group/block h-full border rounded-2xl flex items-center justify-center text-xs font-bold cursor-pointer transition-all relative ${block.color} ${selectedBlockId === block.id ? 'ring-2 ring-purple-500 shadow-md z-10 scale-[1.02] bg-white dark:bg-slate-800' : 'opacity-80 hover:opacity-100'}`}
                        >
                          <GripVertical className="w-3 h-3 absolute left-2 opacity-0 group-hover/block:opacity-40 transition-opacity" />
                          {block.title}
                          {roadmap.currentWeek >= block.startWeek && roadmap.currentWeek <= block.endWeek && (
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-500 rotate-45 shadow-sm" />
                          )}
                        </motion.div>
                      ))}
                      <button 
                        onClick={() => addBlock('training')}
                        className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 border-dashed flex items-center justify-center text-slate-400 hover:text-purple-500 hover:border-purple-500/50 transition-all ml-2 shrink-0 group"
                        title="Add Training Block"
                      >
                        <PlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Selected Block Detail Panel */}
          <AnimatePresence mode="wait">
            {selectedBlock ? (
              <motion.div 
                key={selectedBlock.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                {/* Panel Header */}
                <div className={`px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${selectedBlock.type === 'nutrition' ? 'bg-emerald-50/30' : 'bg-purple-50/30'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedBlock.type === 'nutrition' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-purple-500/10 text-purple-500'}`}>
                      {selectedBlock.type === 'nutrition' ? <Utensils className="w-6 h-6" /> : <Dumbbell className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{selectedBlock.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${roadmap.currentWeek >= selectedBlock.startWeek && roadmap.currentWeek <= selectedBlock.endWeek ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                          {roadmap.currentWeek >= selectedBlock.startWeek && roadmap.currentWeek <= selectedBlock.endWeek ? 'Current Phase' : 'Planned'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mt-1">Week {selectedBlock.startWeek} - {selectedBlock.endWeek} | {selectedBlock.type.toUpperCase()} STRATEGY</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all" title="Edit Block"><Edit3 className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all" title="Duplicate"><Sparkles className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all" title="Add Notes"><FileText className="w-4 h-4" /></button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                    <button className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">End Block</button>
                  </div>
                </div>

                <div className="p-8 space-y-10">
                  {/* KPI Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {selectedBlock.type === 'nutrition' ? (
                      <>
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Daily Intake</p>
                          <InlineInput value={selectedBlock.kcal} onChange={(v: string) => updateBlockData(selectedBlock.id, { kcal: v })} suffix="KCAL" className="text-xl text-slate-900 dark:text-white" />
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Macro Split</p>
                          <InlineInput value={selectedBlock.macros} onChange={(v: string) => updateBlockData(selectedBlock.id, { macros: v })} className="text-xl text-slate-900 dark:text-white" />
                        </div>
                        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Target Deficit</p>
                          <InlineInput value={selectedBlock.deficit} onChange={(v: string) => updateBlockData(selectedBlock.id, { deficit: v })} suffix="KCAL" className="text-xl text-amber-600" />
                        </div>
                        <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Water Target</p>
                          <InlineInput value={selectedBlock.water} onChange={(v: string) => updateBlockData(selectedBlock.id, { water: v })} suffix="L" className="text-xl text-blue-600" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Block Focus</p>
                          <InlineInput value={selectedBlock.focus} onChange={(v: string) => updateBlockData(selectedBlock.id, { focus: v })} className="text-xl text-slate-900 dark:text-white" />
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sessions / Week</p>
                          <InlineInput value={selectedBlock.sessions} onChange={(v: string) => updateBlockData(selectedBlock.id, { sessions: v })} className="text-xl text-slate-900 dark:text-white" />
                        </div>
                        <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                          <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">Target Intensity</p>
                          <InlineInput value={selectedBlock.intensity} onChange={(v: string) => updateBlockData(selectedBlock.id, { intensity: v })} className="text-xl text-purple-600" />
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tempo Protocol</p>
                          <InlineInput value={selectedBlock.tempo} onChange={(v: string) => updateBlockData(selectedBlock.id, { tempo: v })} className="text-xl text-slate-900 dark:text-white" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Detail Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-10">
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <ZapIcon className="w-4 h-4 text-emerald-500" /> {selectedBlock.type === 'nutrition' ? 'Metabolic Rationale' : 'Loading Strategy'}
                        </h5>
                        <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 group">
                          <InlineTextarea value={selectedBlock.type === 'nutrition' ? selectedBlock.rationale : selectedBlock.loading} onChange={(v: string) => updateBlockData(selectedBlock.id, selectedBlock.type === 'nutrition' ? { rationale: v } : { loading: v })} />
                        </div>
                      </div>

                      {selectedBlock.type === 'nutrition' ? (
                        <div>
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <HistoryIcon className="w-4 h-4 text-emerald-500" /> Nutrient Timing Protocol
                          </h5>
                          <ListEditor items={selectedBlock.timing} onChange={(v: string[]) => updateBlockData(selectedBlock.id, { timing: v })} />
                        </div>
                      ) : (
                        <div>
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-purple-500" /> Anatomical Scope
                          </h5>
                          <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 group">
                            <InlineTextarea value={selectedBlock.scope} onChange={(v: string) => updateBlockData(selectedBlock.id, { scope: v })} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-10">
                      {selectedBlock.type === 'nutrition' ? (
                        <div>
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Sticker className="w-4 h-4 text-emerald-500" /> Micronutrient Stack
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedBlock.micros?.map((m: any, i: number) => (
                              <div key={i} className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group">
                                <input 
                                  className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-transparent border-none p-0 focus:ring-0 w-full outline-none mb-1"
                                  value={m.label}
                                  onChange={(e) => {
                                    const newMicros = [...(selectedBlock.micros || [])];
                                    newMicros[i] = { ...newMicros[i], label: e.target.value };
                                    updateBlockData(selectedBlock.id, { micros: newMicros });
                                  }}
                                />
                                <InlineInput value={m.value} onChange={(v: string) => {
                                  const newMicros = [...(selectedBlock.micros || [])];
                                  newMicros[i] = { ...newMicros[i], value: v };
                                  updateBlockData(selectedBlock.id, { micros: newMicros });
                                }} className="text-sm font-semibold text-slate-900 dark:text-white" />
                              </div>
                            ))}
                            <button 
                              onClick={() => updateBlockData(selectedBlock.id, { micros: [...(selectedBlock.micros || []), { label: 'New', value: '...' }] })}
                              className="md:col-span-2 p-3 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
                            >
                              + Add Supplement
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Moon className="w-4 h-4 text-purple-500" /> Recovery Protocol
                          </h5>
                          <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 group">
                            <InlineTextarea value={selectedBlock.recovery} onChange={(v: string) => updateBlockData(selectedBlock.id, { recovery: v })} />
                          </div>
                        </div>
                      )}

                      {/* Analysis Block (Success Criteria & Red Flags) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30">
                          <h6 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> {selectedBlock.type === 'nutrition' ? 'Success Criteria' : 'Success Metrics'}
                          </h6>
                          <div className="space-y-4">
                            <InlineTextarea value={selectedBlock.successCriteria || (selectedBlock.type === 'nutrition' ? '• Expected adherence: 90%+\n• Weight trend: -0.5kg/wk\n• Satiety: Moderate' : '• Strength: +2.5kg on compounds\n• Recovery: RPE within range\n• Fatigue: Managed deloads')} onChange={(v: string) => updateBlockData(selectedBlock.id, { successCriteria: v })} />
                          </div>
                        </div>
                        <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30">
                          <h6 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <WarningIcon className="w-4 h-4" /> Red Flags
                          </h6>
                          <div className="space-y-4">
                            <InlineTextarea value={selectedBlock.redFlags || (selectedBlock.type === 'nutrition' ? '• Excessive hunger\n• Low adherence\n• Digestive issues' : '• Fatigue accumulation\n• Pain / discomfort\n• Recovery issues')} onChange={(v: string) => updateBlockData(selectedBlock.id, { redFlags: v })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-4">
                  <MapIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Planning Board</h3>
                <p className="text-slate-500 mt-2">Select a roadmap block to inspect and edit details below.</p>
              </div>
            )}
          </AnimatePresence>

          {/* 4. Secondary Strategic Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54]">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">Strategic Insights</h3>
              </div>
              <div className="space-y-6">
                <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                  {selectedBlock?.type === 'nutrition' 
                    ? "Based on the selected nutrition profile, the client is projected to reach metabolic stability within 3 weeks. Adherence risk is low given the current morning protein preference." 
                    : "Training volume is currently optimized for hypertrophy base. Monitor RPE closely during week 3 to ensure recovery protocol is sufficient."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-100">Transition Ready</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100">Low Risk</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <ZapIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">Transition Forecast</h3>
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Projected next phase adaptation:</p>
              <div className="flex items-center gap-6">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-amber-500 rounded-full"></div>
                </div>
                <span className="text-xs font-black text-amber-600">65% Readiness</span>
              </div>
            </div>
          </div>

          {/* 4. Goals & Targets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmap.goals.map(goal => (
              <div 
                key={goal.id} 
                className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-200 dark:border-slate-800"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 ${goal.type === 'physical' ? 'text-blue-500' : goal.type === 'nutrition' ? 'text-amber-500' : goal.type === 'training' ? 'text-purple-500' : 'text-rose-500'}`}>
                    {goal.type === 'physical' ? <ScaleIcon className="w-4 h-4" /> : goal.type === 'nutrition' ? <NutritionIcon className="w-4 h-4" /> : goal.type === 'training' ? <TrainingIcon className="w-4 h-4" /> : <MindsetIcon className="w-4 h-4" />}
                    {goal.type}
                  </span>
                  <div className="relative group/val">
                    <input 
                      type="number"
                      className="w-10 bg-transparent border-none p-0 focus:ring-0 text-[11px] font-bold text-slate-400 text-right"
                      value={goal.value}
                      onChange={(e) => {
                        const newGoals = roadmap.goals.map(g => g.id === goal.id ? { ...g, value: parseInt(e.target.value) } : g);
                        setRoadmap({ ...roadmap, goals: newGoals });
                      }}
                    />
                    <span className="text-[11px] font-bold text-slate-400">%</span>
                  </div>
                </div>
                <input 
                  className="text-md font-bold text-slate-900 dark:text-white mb-1 w-full bg-transparent border-none p-0 focus:ring-0"
                  value={goal.label}
                  onChange={(e) => {
                    const newGoals = roadmap.goals.map(g => g.id === goal.id ? { ...g, label: e.target.value } : g);
                    setRoadmap({ ...roadmap, goals: newGoals });
                  }}
                />
                <input 
                  className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-4 w-full bg-transparent border-none p-0 focus:ring-0"
                  value={goal.desc}
                  onChange={(e) => {
                    const newGoals = roadmap.goals.map(g => g.id === goal.id ? { ...g, desc: e.target.value } : g);
                    setRoadmap({ ...roadmap, goals: newGoals });
                  }}
                />
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.value}%` }}
                    className={`h-full rounded-full ${goal.type === 'physical' ? 'bg-blue-500' : goal.type === 'nutrition' ? 'bg-amber-500' : goal.type === 'training' ? 'bg-purple-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 5. Progress Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">Body Progress Forecast</h3>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Unit: LBS</span>
              </div>
              <div className="h-48 w-full relative group">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M 0 20 L 20 28 L 40 45 L 60 62 L 80 58 L 100 75" fill="none" stroke="#17cf54" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                  <circle cx="0" cy="20" fill="#17cf54" r="3" />
                  <circle cx="20" cy="28" fill="#17cf54" r="3" />
                  <circle cx="40" cy="45" fill="#17cf54" r="3" />
                  <circle cx="60" cy="62" fill="white" r="5" stroke="#17cf54" strokeWidth="2.5" />
                  <circle cx="80" cy="58" fill="#17cf54" opacity="0.4" r="2" />
                  <circle cx="100" cy="75" fill="#17cf54" opacity="0.4" r="2" />
                </svg>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 mt-10 px-2 uppercase tracking-widest">
                  <span>W1</span><span>W2</span><span>W3</span><span className="text-[#17cf54] font-black">W4 (NOW)</span><span>W5</span><span>W6</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">Strength Growth Projection</h3>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Metric: Volume</span>
              </div>
              <div className="h-48 w-full flex items-end gap-4 px-2">
                <div className="flex-1 bg-purple-100 dark:bg-purple-900/20 rounded-t-xl h-[40%]"></div>
                <div className="flex-1 bg-purple-200 dark:bg-purple-900/30 rounded-t-xl h-[55%]"></div>
                <div className="flex-1 bg-purple-300 dark:bg-purple-900/40 rounded-t-xl h-[65%]"></div>
                <div className="flex-1 bg-[#17cf54] rounded-t-xl h-[80%] shadow-xl shadow-emerald-500/20"></div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-t-xl h-[85%] border-t-2 border-dashed border-slate-200 dark:border-slate-700"></div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-t-xl h-[95%] border-t-2 border-dashed border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-300 mt-10 px-6 uppercase tracking-widest">
                <span>W1</span><span>W2</span><span>W3</span><span className="text-[#17cf54] font-black">W4</span><span>W5</span><span>W6</span>
              </div>
            </div>
          </div>

          {/* 6. Assumptions & Variables */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                <WarningIcon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Assumptions & Variables</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Daily Step Target</label>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 group">
                  <Footprints className="w-6 h-6 text-[#17cf54]" />
                  <div className="flex-1 relative">
                    <input 
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-900 dark:text-white outline-none"
                      value={roadmap.assumptions.steps}
                      onChange={(e) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, steps: e.target.value } })}
                    />
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#17cf54] transition-all group-focus-within:w-full" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Sleep Hygiene Goal</label>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 group">
                  <Moon className="w-6 h-6 text-blue-500" />
                   <div className="flex-1 relative">
                    <input 
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-900 dark:text-white outline-none"
                      value={roadmap.assumptions.sleep}
                      onChange={(e) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, sleep: e.target.value } })}
                    />
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#17cf54] transition-all group-focus-within:w-full" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Dietary Constraints</label>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 group">
                  <Droplets className="w-6 h-6 text-amber-500" />
                  <div className="flex-1 relative">
                    <input 
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-900 dark:text-white outline-none"
                      value={roadmap.assumptions.constraints}
                      onChange={(e) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, constraints: e.target.value } })}
                    />
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#17cf54] transition-all group-focus-within:w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
}
