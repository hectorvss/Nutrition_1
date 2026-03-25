import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3,
  ChevronRight, 
  Edit3, 
  History,
  CheckCircle,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Zap,
  GripVertical,
  Map as MapIcon,
  Utensils as NutritionIcon,
  Dumbbell as TrainingIcon,
  Activity,
  Target,
  Scale as ScaleIcon,
  Brain as MindsetIcon,
  Footprints,
  Moon,
  Droplets,
  PlusCircle,
  Sticker,
  FileText,
  AlertTriangle as WarningIcon
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
  // Nutrition
  kcal?: string;
  macros?: string;
  deficit?: string;
  water?: string;
  rationale?: string;
  timing?: string[];
  micros?: { label: string; value: string }[];
  // Training
  focus?: string;
  sessions?: string;
  intensity?: string;
  tempo?: string;
  loading?: string;
  scope?: string;
  recovery?: string;
  // Analysis
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
      id: 'n1', title: 'Maintenance', startWeek: 1, endWeek: 4, type: 'nutrition', color: 'bg-blue-50 border-blue-100 text-blue-600',
      kcal: '2,650', macros: '30/40/30', deficit: '0', water: '3.0', 
      rationale: 'Initial phase to establish metabolic baseline.',
      timing: ['Pre: 40g Pro / 60g Carb', 'Post: 40g Pro / 80g Carb'],
    },
    { 
      id: 'n2', title: 'Deficit (-500)', startWeek: 5, endWeek: 8, type: 'nutrition', color: 'bg-amber-50 border-emerald-500 border-y border-x-2 text-amber-700',
      kcal: '2,150', macros: '40/30/30', deficit: '-500', water: '3.5',
      rationale: 'Calculated -500kcal deficit targeting ~1lb/week fat loss.',
      timing: ['Pre: 30g Pro / 40g Carb', 'Post: 40g Pro / 50g Carb'],
    },
    { 
      id: 'n3', title: 'Maintenance', startWeek: 9, endWeek: 12, type: 'nutrition', color: 'bg-green-50 border-green-100 text-green-600',
      kcal: '2,400', macros: '35/35/30', deficit: '0', water: '3.2',
      rationale: 'Reverse diet phase.',
      timing: ['Pre: 35g Pro / 50g Carb', 'Post: 40g Pro / 60g Carb'],
    },
  ],
  training: [
    { 
      id: 't1', title: 'Hypertrophy Base (4x)', startWeek: 1, endWeek: 6, type: 'training', color: 'bg-indigo-50 border-indigo-100 text-indigo-600',
      focus: 'Hypertrophy', sessions: '4 Lift Days', intensity: 'RPE 7-9', tempo: '3-0-1-0',
    },
    { 
      id: 't2', title: 'Strength Peak (3x)', startWeek: 7, endWeek: 12, type: 'training', color: 'bg-rose-50 border-rose-100 text-rose-600',
      focus: 'Strength', sessions: '3 Lift Days', intensity: 'RPE 8-10', tempo: '2-0-X-0',
    },
  ],
  goals: [
    { id: 'g1', type: 'physical', label: 'Weight Target', desc: 'Reach 140 lbs', value: 60, targetValue: '140 lbs', currentValue: '150 lbs' },
    { id: 'g2', type: 'nutrition', label: 'Adherence', desc: '90%+ Accuracy', value: 85, targetValue: '90%+', currentValue: 'Consistent' },
    { id: 'g3', type: 'training', label: 'Frequency', desc: '4x/wk Sessions', value: 100, targetValue: '100%', currentValue: '16/16 sessions' },
  ],
  assumptions: {
    steps: '10,000 - 12,000',
    sleep: '7.5 hours minimum',
    constraints: 'Dairy-free'
  }
});

// --- HELPER COMPONENTS ---

const InlineInput = ({ value, onChange, className = "", prefix = null, suffix = null }: any) => (
  <div className={`group relative flex items-center ${className}`}>
    {prefix && <span className="mr-1">{prefix}</span>}
    <input 
      className="bg-transparent border-none p-0 focus:ring-0 w-full font-bold outline-none selection:bg-emerald-100"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="..."
    />
    {suffix && <span className="ml-1">{suffix}</span>}
    <div className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#17cf54] transition-all group-focus-within:w-full" />
  </div>
);

const InlineTextarea = ({ value, onChange, className = "" }: any) => (
  <div className={`group relative ${className}`}>
    <textarea 
      className="bg-transparent border-none p-0 focus:ring-0 w-full outline-none resize-none font-medium text-slate-600 selection:bg-emerald-100"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type rationale here..."
      rows={3}
    />
    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#17cf54] transition-all group-focus-within:w-full" />
  </div>
);

const ListEditor = ({ items = [], onChange, className = "" }: any) => (
  <ul className={`space-y-2 ${className}`}>
    {items.map((item: string, i: number) => (
      <li key={i} className="flex items-start gap-3 group">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
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
          <div className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-focus-within:w-full" />
        </div>
        <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 rounded-lg transition-all">
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
        </button>
      </li>
    ))}
    <button onClick={() => onChange([...items, "New point"])} className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 hover:text-emerald-600 mt-2">
      <PlusCircle className="w-3.5 h-3.5" /> ADD POINT
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
    if (clientId) loadRoadmap();
  }, [clientId]);

  const loadRoadmap = async () => {
    try {
      const data = await fetchWithAuth(`/manager/clients/${clientId}/roadmap`);
      const roadmapData = data.data_json && data.data_json.nutrition ? data.data_json : getInitialData();
      setRoadmap(roadmapData);
      const currentWeek = roadmapData.currentWeek || 1;
      const currentNut = roadmapData.nutrition.find(b => currentWeek >= b.startWeek && currentWeek <= b.endWeek);
      setSelectedBlockId(currentNut?.id || roadmapData.nutrition[0]?.id || null);
    } catch (error) {
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
    } catch (e) {}
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
      color: type === 'nutrition' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600',
      ...(type === 'nutrition' ? { kcal: '2000', macros: '40/30/30', deficit: '0', water: '3.0', rationale: '', timing: [], micros: [] } : { focus: 'Strength', sessions: '3x', intensity: 'RPE 8', tempo: 'X', loading: '', scope: '', recovery: '' })
    };
    setRoadmap({ ...roadmap, [type]: [...roadmap[type], newBlock] });
    setSelectedBlockId(newId);
  };

  const selectedBlock = useMemo(() => {
    if (!roadmap) return null;
    return [...roadmap.nutrition, ...roadmap.training].find(b => b.id === selectedBlockId);
  }, [roadmap, selectedBlockId]);

  if (loading) return null;
  if (!roadmap) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 font-sans selection:bg-blue-100">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar scroll-smooth">
        <div className="max-w-[1440px] mx-auto space-y-6">
          
          {/* 1. Header Section */}
          <div className="space-y-6">
            <nav className="flex text-[10px] font-bold text-slate-400 gap-2 mb-2 uppercase tracking-widest">
              <button onClick={() => onNavigate('planning')} className="hover:text-blue-500 transition-colors">Planning</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900">{client?.name}</span>
            </nav>

            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-8">
                <div 
                  className="w-20 h-20 rounded-full bg-slate-100 bg-cover bg-center border-4 border-slate-50 shadow-sm"
                  style={{ backgroundImage: `url(${client?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'})` }}
                />
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{client?.name}</h2>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-blue-500"><TrendingUp className="w-4 h-4" /> Goal: {client?.goal || 'Maintenance'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                    <span>{client?.gender || 'Female'}, {client?.age || '28'}y</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                    <span>{client?.weight || '68'}kg Bodyweight</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 px-6 py-4 rounded-[20px] flex flex-col items-end shadow-inner">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Program Status</span>
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${roadmap.status === 'LIVE' ? 'bg-[#17cf54]' : 'bg-blue-500'}`} />
                  <span className="text-lg font-black text-slate-900 tracking-tight">{roadmap.status === 'LIVE' ? 'ACTIVE PROGRAM' : 'DRAFTING'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-3 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-2xl">
                <button className="px-8 py-3 rounded-xl bg-white shadow-sm text-slate-900 font-black text-xs uppercase tracking-widest border border-slate-100 transition-all">Program Planner</button>
                <button className="px-8 py-3 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-all">Historical View</button>
              </div>
              <div className="flex items-center gap-3 pr-4">
                <button onClick={handleSave} className="px-8 py-3 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                  <CheckCircle className="w-4 h-4" /> Save Program
                </button>
                <div className="w-px h-8 bg-slate-200 mx-2" />
                <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><History className="w-5 h-5" /></button>
                <button className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><BarChart3 className="w-5 h-5" /></button>
              </div>
            </div>
          </div>

          {/* 2. Main Two-Column Content */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Column A: Roadmap & Inspector (2/3) */}
            <div className="flex-1 space-y-8 min-w-0 w-full lg:w-2/3">
              
              {/* Master Roadmap Module */}
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-200 overflow-hidden relative group">
                <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm border border-emerald-100"><Calendar className="w-6 h-6" /></div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Master Roadmap</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Timeline Strategy & Blocks</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto pb-8 no-scrollbar relative">
                  <div className="min-w-[1000px] space-y-8 relative px-4">
                    {/* Weeks Legend */}
                    <div className="flex justify-between px-2 text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] relative z-10">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <span key={i} className={`w-1/12 text-center transition-colors ${i + 1 === roadmap.currentWeek ? 'text-emerald-500 scale-125' : ''}`}>W{i + 1}</span>
                      ))}
                    </div>

                    {/* Today Line */}
                    <div className="absolute top-0 bottom-0 w-1 bg-emerald-500/20 z-0 pointer-events-none rounded-full" style={{ left: `${((roadmap.currentWeek - 0.5) / 12) * 100}%` }}>
                       <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-md"></div>
                       <div className="absolute top-0 bottom-0 w-px bg-emerald-500/60 left-1/2 -translate-x-1/2"></div>
                    </div>
                    
                    {/* Interaction Lanes */}
                    <div className="space-y-6 relative">
                      {/* Nutrition Lane */}
                      <div className="flex items-center gap-10">
                        <div className="w-24 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Nutrition</div>
                        <div className="flex-1 flex gap-2 h-14 items-center">
                          {roadmap.nutrition.map(block => (
                            <motion.div 
                              key={block.id}
                              whileHover={{ y: -2 }}
                              style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                              onClick={() => setSelectedBlockId(block.id)}
                              className={`h-full border-[1.5px] rounded-2xl flex items-center justify-center text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all shadow-sm ${block.color} ${selectedBlockId === block.id ? 'ring-4 ring-emerald-500/10 border-emerald-500 shadow-lg scale-[1.03] z-10' : 'opacity-80 hover:opacity-100'}`}
                            >
                              {block.title}
                            </motion.div>
                          ))}
                          <button onClick={() => addBlock('nutrition')} className="w-12 h-12 rounded-full bg-slate-50 border-2 border-slate-100 border-dashed flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-all flex-shrink-0 ml-2"><Plus className="w-5 h-5" /></button>
                        </div>
                      </div>

                      {/* Training Lane */}
                      <div className="flex items-center gap-10">
                        <div className="w-24 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Training</div>
                        <div className="flex-1 flex gap-2 h-14 items-center">
                          {roadmap.training.map(block => (
                            <motion.div 
                              key={block.id}
                              whileHover={{ y: -2 }}
                              style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                              onClick={() => setSelectedBlockId(block.id)}
                              className={`h-full border-[1.5px] rounded-2xl flex items-center justify-center text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all shadow-sm ${block.color} ${selectedBlockId === block.id ? 'ring-4 ring-blue-500/10 border-blue-500 shadow-lg scale-[1.03] z-10' : 'opacity-80 hover:opacity-100'}`}
                            >
                              {block.title}
                            </motion.div>
                          ))}
                          <button onClick={() => addBlock('training')} className="w-12 h-12 rounded-full bg-slate-50 border-2 border-slate-100 border-dashed flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all flex-shrink-0 ml-2"><Plus className="w-5 h-5" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Block Inspector Module (Visual parity with Meal Item) */}
              <AnimatePresence mode="wait">
                {selectedBlock ? (
                  <motion.div 
                    key={selectedBlock.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-200 overflow-hidden"
                  >
                    {/* Header - Item Style */}
                    <div className="flex justify-between items-start mb-10 pb-10 border-b border-slate-100">
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-center ${selectedBlock.type === 'nutrition' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                          {selectedBlock.type === 'nutrition' ? <NutritionIcon className="w-8 h-8" /> : <TrainingIcon className="w-8 h-8" />}
                        </div>
                        <div>
                          <InlineInput value={selectedBlock.title} onChange={(v: string) => updateBlockData(selectedBlock.id, { title: v })} className="text-3xl font-black text-slate-900 tracking-tight" />
                          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                             <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Week {selectedBlock.startWeek} - {selectedBlock.endWeek}</span>
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                             <span className={selectedBlock.type === 'nutrition' ? 'text-emerald-500' : 'text-blue-500'}>{selectedBlock.type} strategy</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-6 py-2.5 rounded-xl bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all shadow-sm">View Dataset</button>
                        <button className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>

                    {/* KPI Cards Grid */}
                    <div className="space-y-4">
                      {selectedBlock.type === 'nutrition' ? (
                        <>
                          <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[24px] group transition-all hover:bg-white hover:shadow-lg hover:border-emerald-100">
                            <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm"><Zap className="w-6 h-6" /></div>
                              <div>
                                <p className="text-sm font-black text-slate-900 tracking-tight">Daily Caloric Target</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{selectedBlock.deficit} kcal relative deficit</p>
                              </div>
                            </div>
                            <div className="bg-white px-8 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
                              <InlineInput value={selectedBlock.kcal} onChange={(v: string) => updateBlockData(selectedBlock.id, { kcal: v })} suffix="kcal" className="text-lg font-black text-blue-600" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[24px] group transition-all hover:bg-white hover:shadow-lg hover:border-emerald-100">
                            <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shadow-sm"><Activity className="w-6 h-6" /></div>
                              <div>
                                <p className="text-sm font-black text-slate-900 tracking-tight">Macro Breakdown</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Protein / Carbs / Fats Split</p>
                              </div>
                            </div>
                            <div className="bg-white px-8 py-3 rounded-2xl border border-slate-200 shadow-sm">
                              <InlineInput value={selectedBlock.macros} onChange={(v: string) => updateBlockData(selectedBlock.id, { macros: v })} className="text-lg font-black text-emerald-600" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                            <div className="p-8 bg-slate-50 rounded-[24px] border border-slate-100">
                               <div className="flex items-center gap-3 mb-6">
                                 <History className="w-5 h-5 text-emerald-500" />
                                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Timing Protocols</h4>
                               </div>
                               <ListEditor items={selectedBlock.timing} onChange={(v: string[]) => updateBlockData(selectedBlock.id, { timing: v })} />
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[24px] border border-slate-100">
                               <div className="flex items-center gap-3 mb-6">
                                 <Sparkles className="w-5 h-5 text-blue-500" />
                                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Clinical Rationale</h4>
                               </div>
                               <InlineTextarea value={selectedBlock.rationale} onChange={(v: string) => updateBlockData(selectedBlock.id, { rationale: v })} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[24px] group transition-all hover:bg-white hover:shadow-lg hover:border-blue-100">
                            <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-purple-500 shadow-sm"><TrainingIcon className="w-6 h-6" /></div>
                              <div>
                                <p className="text-sm font-black text-slate-900 tracking-tight">Primary Focus</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{selectedBlock.sessions} workload volume</p>
                              </div>
                            </div>
                            <div className="bg-white px-8 py-3 rounded-2xl border border-slate-200 shadow-sm">
                              <InlineInput value={selectedBlock.focus} onChange={(v: string) => updateBlockData(selectedBlock.id, { focus: v })} className="text-lg font-black text-purple-600" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[24px] group transition-all hover:bg-white hover:shadow-lg hover:border-blue-100">
                            <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm"><Zap className="w-6 h-6" /></div>
                              <div>
                                <p className="text-sm font-black text-slate-900 tracking-tight">Intensity & Tempo</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Execution Profile</p>
                              </div>
                            </div>
                            <div className="bg-white px-8 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
                               <span className="text-[10px] font-bold text-slate-400">{selectedBlock.intensity} | </span>
                               <InlineInput value={selectedBlock.tempo} onChange={(v: string) => updateBlockData(selectedBlock.id, { tempo: v })} className="text-lg font-black text-blue-600" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                            <div className="p-8 bg-slate-50 rounded-[24px] border border-slate-100">
                               <div className="flex items-center gap-3 mb-6">
                                 <Target className="w-5 h-5 text-purple-500" />
                                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Volume/Loading Strategy</h4>
                               </div>
                               <InlineTextarea value={selectedBlock.loading} onChange={(v: string) => updateBlockData(selectedBlock.id, { loading: v })} />
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[24px] border border-slate-100">
                               <div className="flex items-center gap-3 mb-6">
                                 <Moon className="w-5 h-5 text-blue-500" />
                                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Recovery Protocols</h4>
                               </div>
                               <InlineTextarea value={selectedBlock.recovery} onChange={(v: string) => updateBlockData(selectedBlock.id, { recovery: v })} />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Analysis Block */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 !mt-10">
                         <div className="p-8 bg-emerald-50/50 rounded-[32px] border border-emerald-100 group">
                            <div className="flex items-center gap-3 mb-6">
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                              <h4 className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Success Metrics</h4>
                            </div>
                            <InlineTextarea value={selectedBlock.successCriteria} onChange={(v: string) => updateBlockData(selectedBlock.id, { successCriteria: v })} className="text-emerald-900" />
                         </div>
                         <div className="p-8 bg-rose-50/50 rounded-[32px] border border-rose-100 group">
                            <div className="flex items-center gap-3 mb-6">
                              <WarningIcon className="w-5 h-5 text-rose-500" />
                              <h4 className="text-[11px] font-black text-rose-700 uppercase tracking-widest">Risk Red Flags</h4>
                            </div>
                            <InlineTextarea value={selectedBlock.redFlags} onChange={(v: string) => updateBlockData(selectedBlock.id, { redFlags: v })} className="text-rose-900" />
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-white rounded-[32px] p-20 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200 mb-6 shadow-inner border border-slate-100 transition-transform group-hover:scale-110">
                      <MapIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Strategy Workspace</h3>
                    <p className="text-slate-400 mt-3 text-sm max-w-xs font-medium">Select a nutritional or training block from the roadmap above to configure details.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Column B: Sidebar Widgets (1/3) */}
            <aside className="w-full lg:w-1/3 space-y-6">
              
              {/* Program Analytics Module */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Program Macro Progress</h3>
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100 shadow-sm animate-pulse">Live</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative w-52 h-52 mb-10 flex items-center justify-center group pointer-events-none">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="104" cy="104" r="90" stroke="#f8fafc" strokeWidth="20" fill="transparent" />
                      <circle 
                        cx="104" cy="104" r="90" stroke="#3b82f6" strokeWidth="20" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 90} 
                        strokeDashoffset={(2 * Math.PI * 90) * (1 - roadmap.currentWeek / roadmap.totalWeeks)}
                        strokeLinecap="round" 
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">W{roadmap.currentWeek}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">OF {roadmap.totalWeeks} Weeks</span>
                    </div>
                    <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  
                  <div className="w-full space-y-4">
                     <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-[22px] group transition-all hover:bg-white hover:shadow-md">
                       <div className="flex items-center gap-4">
                         <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></span>
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Protein Intake</span>
                       </div>
                       <span className="text-sm font-black text-slate-900">180g / Day</span>
                     </div>
                     <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-[22px] group transition-all hover:bg-white hover:shadow-md">
                       <div className="flex items-center gap-4">
                         <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm shadow-blue-100"></span>
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Glucose Reserve</span>
                       </div>
                       <span className="text-sm font-black text-slate-900">220g / Day</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Targets Module */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200">
                 <div className="flex items-center gap-4 mb-10">
                   <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 shadow-sm"><Target className="w-5 h-5" /></div>
                   <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Key Program Targets</h3>
                 </div>
                 <div className="space-y-8">
                   {roadmap.goals.map(goal => (
                     <div key={goal.id} className="space-y-3 px-2">
                       <div className="flex justify-between items-end">
                         <div className="flex flex-col">
                           <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{goal.label}</span>
                           <span className="text-[9px] font-bold text-slate-400 mt-0.5">{goal.desc}</span>
                         </div>
                         <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md shadow-sm border border-blue-100">{goal.value}%</span>
                       </div>
                       <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 relative shadow-inner">
                         <motion.div 
                           initial={{ width: 0 }} 
                           animate={{ width: `${goal.value}%` }} 
                           className="h-full bg-blue-500 rounded-full shadow-lg shadow-blue-500/30"
                         />
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

              {/* Assumptions & Variables Module */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200">
                 <div className="flex items-center gap-4 mb-10">
                   <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm"><Zap className="w-5 h-5" /></div>
                   <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Strategic Variables</h3>
                 </div>
                 <div className="space-y-4">
                    <div className="p-5 bg-slate-50 rounded-[20px] border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <Footprints className="w-4 h-4 text-[#17cf54]" />
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Min Daily Steps</label>
                      </div>
                      <InlineInput value={roadmap.assumptions.steps} onChange={(v: string) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, steps: v } })} className="text-md font-black text-slate-900" />
                    </div>
                    <div className="p-5 bg-slate-50 rounded-[20px] border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <Moon className="w-4 h-4 text-blue-500" />
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sleep Requirement</label>
                      </div>
                      <InlineInput value={roadmap.assumptions.sleep} onChange={(v: string) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, sleep: v } })} className="text-md font-black text-slate-900" />
                    </div>
                    <div className="p-5 bg-slate-50 rounded-[20px] border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <Droplets className="w-4 h-4 text-amber-500" />
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dietary Restrictions</label>
                      </div>
                      <InlineInput value={roadmap.assumptions.constraints} onChange={(v: string) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, constraints: v } })} className="text-md font-black text-slate-900" />
                    </div>
                 </div>
              </div>

            </aside>
          </div>
          
          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
}
