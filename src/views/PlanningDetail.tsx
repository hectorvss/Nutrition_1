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
  AlertTriangle as WarningIcon,
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  Info
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

interface Milestone {
  id: string;
  label: string;
  week: number;
  status: 'done' | 'pending';
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
  milestones: Milestone[];
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
      id: 'n1', title: 'Maintenance', startWeek: 1, endWeek: 4, type: 'nutrition', color: 'bg-[#f0fdf4] border-[#17cf54] text-[#166534]',
      kcal: '2,650', macros: '30/40/30', deficit: '0', water: '3.0', 
      rationale: 'Initial phase to establish metabolic baseline.',
      timing: ['Pre: 40g Pro / 60g Carb', 'Post: 40g Pro / 80g Carb'],
    },
    { 
      id: 'n2', title: 'Deficit (-500)', startWeek: 5, endWeek: 8, type: 'nutrition', color: 'bg-[#fffbeb] border-[#f59e0b] text-[#92400e]',
      kcal: '2,150', macros: '40/30/30', deficit: '-500', water: '3.5',
      rationale: 'Calculated -500kcal deficit targeting ~1lb/week fat loss.',
      timing: ['Pre: 30g Pro / 40g Carb', 'Post: 40g Pro / 50g Carb'],
    },
  ],
  training: [
    { 
      id: 't1', title: 'Hypertrophy Base (4x)', startWeek: 1, endWeek: 6, type: 'training', color: 'bg-[#eef2ff] border-[#6366f1] text-[#3730a3]',
      focus: 'Hypertrophy', sessions: '4 Lift Days', intensity: 'RPE 7-9', tempo: '3-0-1-0',
    },
    { 
      id: 't2', title: 'Strength Peak (3x)', startWeek: 7, endWeek: 12, type: 'training', color: 'bg-[#fff1f2] border-[#f43f5e] text-[#9f1239]',
      focus: 'Strength', sessions: '3 Lift Days', intensity: 'RPE 8-10', tempo: '2-0-X-0',
    },
  ],
  goals: [
    { id: 'g1', type: 'physical', label: 'Weight Target', desc: 'Reach 140 lbs', value: 60, targetValue: '140 lbs', currentValue: '150 lbs' },
    { id: 'g2', type: 'nutrition', label: 'Adherence', desc: '90%+ Accuracy', value: 85, targetValue: '90%+', currentValue: 'Consistent' },
    { id: 'g3', type: 'training', label: 'Frequency', desc: '4x/wk Sessions', value: 100, targetValue: '100%', currentValue: '16/16 sessions' },
  ],
  milestones: [
    { id: 'm1', label: 'Functional Baseline Established', week: 2, status: 'done' },
    { id: 'm2', label: 'Metabolic Flexibility Optimization', week: 6, status: 'pending' },
    { id: 'm3', label: 'Peak Performance Cycle Start', week: 9, status: 'pending' },
  ],
  assumptions: {
    steps: '10,000 - 12,000',
    sleep: '7.5 hours minimum',
    constraints: 'Dairy-free'
  }
});

// --- HELPER COMPONENTS ---

const InlineInput = ({ value, onChange, className = "", prefix = null, suffix = null, placeholder = "..." }: any) => (
  <div className={`group relative flex items-center ${className}`}>
    {prefix && <span className="mr-1">{prefix}</span>}
    <input 
      className="bg-transparent border-none p-0 focus:ring-0 w-full font-bold outline-none selection:bg-emerald-100"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
    {suffix && <span className="ml-1">{suffix}</span>}
    <div className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#17cf54] transition-all group-focus-within:w-full" />
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, action = null }: { icon: any, title: string, subtitle: string, action?: any }) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
    {action}
  </div>
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
      
      // Ensure milestones exist
      if (!roadmapData.milestones) roadmapData.milestones = getInitialData().milestones;
      
      setRoadmap(roadmapData);
      const currentWeek = roadmapData.currentWeek || 1;
      const currentNut = roadmapData.nutrition.find(b => currentWeek >= b.startWeek && currentWeek <= b.endWeek);
      setSelectedBlockId(currentNut?.id || (roadmapData.nutrition && roadmapData.nutrition.length > 0 ? roadmapData.nutrition[0].id : null));
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

  const selectedBlock = useMemo(() => {
    if (!roadmap) return null;
    return [...roadmap.nutrition, ...roadmap.training].find(b => b.id === selectedBlockId);
  }, [roadmap, selectedBlockId]);

  if (loading || !roadmap) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] font-sans selection:bg-[#17cf54]/20 no-scrollbar">
      <div className="max-w-[1240px] mx-auto p-4 md:p-8 space-y-8 pb-20">
        
        {/* --- 1. HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 gap-6">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div 
              className="w-16 h-16 rounded-[20px] bg-slate-100 bg-cover bg-center border-2 border-slate-50 shadow-sm"
              style={{ backgroundImage: `url(${client?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'})` }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{client?.name}</h1>
                <span className="bg-amber-100 text-amber-700 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-200 shadow-sm">Editing Draft</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Week: <span className="text-slate-900">{roadmap.currentWeek}</span></span>
                <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Goal: <span className="text-[#17cf54]">{client?.goal || 'Body Composition'}</span></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-widest border border-slate-200 transition-all hover:text-slate-600 hover:border-slate-300">
               Program: <span className="text-[#17cf54]">Live</span>
            </button>
            <button onClick={handleSave} className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl bg-[#17cf54] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#14b549] transition-all shadow-lg shadow-[#17cf54]/20 active:scale-95">
              <CheckCircle className="w-4 h-4" /> Save Program
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-8">
          
          {/* --- 2. MASTER ROADMAP --- */}
          <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 overflow-hidden relative group">
            <SectionHeader 
              icon={MapIcon} 
              title="Master Roadmap" 
              subtitle="Program Strategy Timeline" 
              action={
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-xl bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest border border-slate-200 hover:text-[#17cf54] hover:bg-[#17cf54]/5 transition-all">Add Phase</button>
                  <button className="p-2.5 text-slate-300 hover:text-slate-600 transition-colors"><Info className="w-5 h-5" /></button>
                </div>
              }
            />

            <div className="overflow-x-auto pb-8 relative no-scrollbar">
              <div className="min-w-[1000px] space-y-6 relative px-4">
                
                {/* Timeline Header */}
                <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">
                  {Array.from({ length: roadmap.totalWeeks }).map((_, i) => (
                    <span key={i} className={`w-1/12 text-center ${i + 1 === roadmap.currentWeek ? 'text-[#17cf54]' : ''}`}>W{i + 1}</span>
                  ))}
                </div>

                {/* Vertical Separators */}
                <div className="absolute inset-x-4 top-8 bottom-0 flex justify-between pointer-events-none opacity-20">
                  {Array.from({ length: roadmap.totalWeeks + 1 }).map((_, i) => (
                    <div key={i} className="w-px h-full bg-slate-200"></div>
                  ))}
                </div>

                {/* Today Line */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-[#17cf54]/30 z-[5] pointer-events-none" style={{ left: `${((roadmap.currentWeek - 1 + 0.5) / roadmap.totalWeeks) * 100}%` }}>
                  <div className="absolute -top-1 left-1/2 -translateX-1/2 w-3 h-3 bg-[#17cf54] rounded-full border-2 border-white shadow-sm" />
                </div>

                {/* Nutrition Lane */}
                <div className="flex items-center gap-6">
                  <div className="w-20 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Nutrition</div>
                  <div className="flex-1 flex gap-2 h-16 relative">
                    {roadmap.nutrition.map(block => (
                      <motion.div 
                        key={block.id}
                        whileHover={{ y: -2 }}
                        style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%` }}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`h-full border-[1.5px] rounded-[18px] flex flex-col items-center justify-center p-2 cursor-pointer transition-all shadow-sm ${block.color} ${selectedBlockId === block.id ? 'ring-4 ring-[#17cf54]/10 border-current shadow-lg scale-[1.02] z-10' : 'opacity-80 hover:opacity-100'}`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider text-center line-clamp-1">{block.title}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Training Lane */}
                <div className="flex items-center gap-6">
                  <div className="w-20 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Training</div>
                  <div className="flex-1 flex gap-2 h-16 relative">
                    {roadmap.training.map(block => (
                      <motion.div 
                        key={block.id}
                        whileHover={{ y: -2 }}
                        style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%` }}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`h-full border-[1.5px] rounded-[18px] flex flex-col items-center justify-center p-2 cursor-pointer transition-all shadow-sm ${block.color} ${selectedBlockId === block.id ? 'ring-4 ring-blue-500/10 border-current shadow-lg scale-[1.02] z-10' : 'opacity-80 hover:opacity-100'}`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider text-center line-clamp-1">{block.title}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend Footer */}
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#17cf54]"></span> ACTIVE PHASE</div>
               <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span> FUTURE PLANNED</div>
               <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 opacity-20"></span> COMPLETED</div>
            </div>
          </section>

          {/* --- 3. GOAL TRAJECTORY --- */}
          <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <SectionHeader icon={TrendingUp} title="Goal Trajectory & Predictions" subtitle="Forecasted vs. Actual Progress" />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 h-[300px] relative mt-4">
                <svg viewBox="0 0 800 200" className="w-full h-full">
                  {/* Grid Lines */}
                  {[0, 50, 100, 150].map(y => (
                    <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  ))}
                  
                  {/* Projected Trajectory (Dashed) */}
                  <path 
                    d="M 0 150 Q 200 130 400 110 T 800 80" 
                    fill="none" 
                    stroke="#17cf54" 
                    strokeWidth="2" 
                    strokeDasharray="8 4" 
                    className="opacity-40"
                  />
                  
                  {/* Actual Progress (Solid) */}
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    d="M 0 150 L 50 148 L 100 145 L 150 146 L 200 142 L 250 138" 
                    fill="none" 
                    stroke="#17cf54" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    className="drop-shadow-sm"
                  />
                  
                  {/* Highlight Points */}
                  <circle cx="250" cy="138" r="6" fill="#17cf54" stroke="white" strokeWidth="3" />
                  <motion.circle 
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    cx="250" cy="138" r="10" fill="#17cf54" opacity="0.2" 
                  />
                </svg>
                
                {/* Labels */}
                <div className="absolute top-0 left-0 text-[10px] font-black text-slate-400 uppercase">160 lbs</div>
                <div className="absolute bottom-0 left-0 text-[10px] font-black text-slate-400 uppercase">Current W{roadmap.currentWeek}</div>
                <div className="absolute bottom-0 right-0 text-[10px] font-black text-slate-400 uppercase">Target W12</div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 flex justify-between items-center group transition-all hover:bg-white hover:shadow-md">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projected End Weight</span>
                     <span className="text-xl font-black text-slate-900 tracking-tight">142.5 <span className="text-sm font-bold text-slate-400">lbs</span></span>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#17cf54] shadow-sm border border-slate-100"><ArrowUpRight className="w-5 h-5" /></div>
                </div>
                <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 flex justify-between items-center group transition-all hover:bg-white hover:shadow-md">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength Capability</span>
                     <span className="text-xl font-black text-slate-900 tracking-tight">+14% <span className="text-sm font-bold text-slate-400">Increase</span></span>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm border border-slate-100"><Zap className="w-5 h-5" /></div>
                </div>
                <button className="w-full py-4 rounded-[24px] bg-[#17cf54]/5 border border-[#17cf54]/20 text-[#17cf54] text-[11px] font-black uppercase tracking-widest hover:bg-[#17cf54]/10 transition-all">Generate New Prediction</button>
              </div>
            </div>
          </section>

          {/* --- 4. STRATEGIC DETAILS (Unified) --- */}
          <section className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 flex gap-4">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <Calendar className="w-3.5 h-3.5" /> Weeks {selectedBlock?.startWeek} - {selectedBlock?.endWeek}
               </div>
            </div>

            <SectionHeader icon={Zap} title="Block Strategic Details" subtitle="Unified Execution Protocol" />

            <AnimatePresence mode="wait">
              {selectedBlock ? (
                <motion.div 
                  key={selectedBlock.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12"
                >
                  {/* Nutrition Strategy Panel */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><NutritionIcon className="w-4 h-4" /></div>
                       <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Nutrition Strategy</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 group transition-all hover:bg-white hover:border-[#17cf54]/30 hover:shadow-lg">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Daily Goal</p>
                          <InlineInput value={selectedBlock.kcal} onChange={(v: string) => updateBlockData(selectedBlock.id, { kcal: v })} suffix="kcal" className="text-xl font-black text-slate-900 tracking-tight" />
                       </div>
                       <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 group transition-all hover:bg-white hover:border-[#17cf54]/30 hover:shadow-lg">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">P / C / F Ratio</p>
                          <InlineInput value={selectedBlock.macros} onChange={(v: string) => updateBlockData(selectedBlock.id, { macros: v })} className="text-xl font-black text-[#17cf54] tracking-tight" />
                       </div>
                    </div>

                    <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-100 space-y-4">
                       <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Metabolic Rationale</span>
                       </div>
                       <textarea 
                         className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-slate-600 outline-none resize-none leading-relaxed"
                         value={selectedBlock.rationale}
                         onChange={(e) => updateBlockData(selectedBlock.id, { rationale: e.target.value })}
                         placeholder="Explain the coaching rationale..."
                         rows={4}
                       />
                    </div>
                  </div>

                  {/* Training Strategy Panel */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><TrainingIcon className="w-4 h-4" /></div>
                       <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Training Strategy</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 group transition-all hover:bg-white hover:border-blue-500/30 hover:shadow-lg">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Intensity Profile</p>
                          <InlineInput value={selectedBlock.intensity} onChange={(v: string) => updateBlockData(selectedBlock.id, { intensity: v })} className="text-xl font-black text-slate-900 tracking-tight" />
                       </div>
                       <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 group transition-all hover:bg-white hover:border-blue-500/30 hover:shadow-lg">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Workload Frequency</p>
                          <InlineInput value={selectedBlock.sessions} onChange={(v: string) => updateBlockData(selectedBlock.id, { sessions: v })} className="text-xl font-black text-blue-600 tracking-tight" />
                       </div>
                    </div>

                    <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-100 space-y-4">
                       <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Focus & Mechanics</span>
                       </div>
                       <textarea 
                         className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-slate-600 outline-none resize-none leading-relaxed"
                         value={selectedBlock.focus}
                         onChange={(e) => updateBlockData(selectedBlock.id, { focus: e.target.value })}
                         placeholder="Describe training methodology..."
                         rows={4}
                       />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 mt-10">
                   <p className="text-slate-400 text-sm font-bold">Select a timeline block above to view execution details</p>
                </div>
              )}
            </AnimatePresence>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* --- 5. GOALS & TARGETS --- */}
            <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
               <SectionHeader icon={Target} title="Program KPI Targets" subtitle="Adherence & Results Tracking" />
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  {roadmap.goals.map(goal => (
                    <div key={goal.id} className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                       <div className="flex justify-between items-start mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm ${goal.type === 'physical' ? 'bg-emerald-50 text-[#17cf54]' : 'bg-blue-50 text-blue-500'}`}>
                             {goal.type === 'physical' ? <ScaleIcon className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                          </div>
                          <span className="text-xs font-black text-slate-900">{goal.value}%</span>
                       </div>
                       <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">{goal.label}</h4>
                       <p className="text-[9px] font-bold text-slate-400 uppercase mb-4">{goal.desc}</p>
                       <div className="h-1.5 bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.value}%` }}
                            className={`h-full rounded-full ${goal.type === 'physical' ? 'bg-[#17cf54]' : 'bg-blue-500'}`}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            {/* --- 6. MILESTONES --- */}
            <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
              <SectionHeader icon={Flag} title="Key Roadmap Milestones" subtitle="Essential Program Benchmarks" />
              <div className="space-y-4 mt-8">
                {roadmap.milestones.map((m, i) => (
                  <div key={m.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[20px] border border-slate-100 group hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${m.status === 'done' ? 'bg-[#17cf54] text-white' : 'bg-white border border-slate-200 text-slate-200 group-hover:border-[#17cf54] group-hover:text-[#17cf54]'}`}>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{m.label}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expected Completion: <span className="text-[#17cf54]">Week {m.week}</span></p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 px-4 py-2 rounded-lg bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all">Convert to Task</button>
                  </div>
                ))}
                <button className="w-full py-4 rounded-[20px] bg-slate-50 border-2 border-dashed border-slate-200 text-slate-300 text-[11px] font-black uppercase tracking-widest hover:border-[#17cf54] hover:text-[#17cf54] transition-all flex items-center justify-center gap-2">
                   <PlusCircle className="w-4 h-4" /> Add Strategic Milestone
                </button>
              </div>
            </section>

          </div>

          {/* --- 7. ASSUMPTIONS --- */}
          <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
             <SectionHeader icon={Zap} title="Strategic Assumptions" subtitle="Base Variables for Model Predictions" />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#17cf54] shadow-sm"><Footprints className="w-4 h-4" /></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Steps / Day</span>
                   </div>
                   <InlineInput value={roadmap.assumptions.steps} onChange={(v: string) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, steps: v } })} className="text-xl font-black text-slate-900" />
                </div>
                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm"><Moon className="w-4 h-4" /></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sleep Hygiene</span>
                   </div>
                   <InlineInput value={roadmap.assumptions.sleep} onChange={(v: string) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, sleep: v } })} className="text-xl font-black text-slate-900" />
                </div>
                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-amber-500 shadow-sm"><Droplets className="w-4 h-4" /></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Constraints</span>
                   </div>
                   <InlineInput value={roadmap.assumptions.constraints} onChange={(v: string) => setRoadmap({ ...roadmap, assumptions: { ...roadmap.assumptions, constraints: v } })} className="text-xl font-black text-slate-900" />
                </div>
             </div>
          </section>

        </main>
      </div>
    </div>
  );
}

// Add Flag to imports
const Flag = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" x2="4" y1="22" y2="15" />
  </svg>
)
