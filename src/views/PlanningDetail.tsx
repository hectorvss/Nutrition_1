import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
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
  Layers,
  Zap,
  Activity,
  ArrowRight,
  Copy,
  ChevronDown,
  Layout,
  Settings,
  MessageSquare
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { useClient } from '../context/ClientContext';

// --- UPDATED TYPES ---

interface Milestone {
  id: string;
  date: string;
  label: string;
  desc?: string;
  status: 'completed' | 'active' | 'upcoming';
}

interface StructuralNutrition {
  phaseName: string;
  strategy: 'maintenance' | 'deficit' | 'surplus' | 'recomposition' | 'diet break' | 'refeed' | 'custom';
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
  type: 'hypertrophy' | 'strength' | 'deload' | 'maintenance' | 'peak' | 'conditioning' | 'custom';
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

interface StructuralLogic {
  whenToUse: string;
  targetClient: string;
  nextPhaseConditions: string;
  signalsToModify: string;
  dependencies: string;
  relationNutTrain: string;
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
  logic?: StructuralLogic;
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

// --- DEFAULT GENERATORS ---

const createDefaultNutrition = (): StructuralNutrition => ({
  phaseName: '',
  strategy: 'maintenance',
  objective: '',
  calories: '',
  margin: '±100',
  macros: { p: '', c: '', f: '' },
  fiber: '25-35g',
  water: '3-4L',
  meals: '4',
  timing: 'Protein centered every 4-5h',
  refeeds: 'None',
  cardio: 'LISS 20min 3x/week',
  steps: '8000-10000',
  supplements: 'Whey, Creatine, Multivitamin',
  adherence: '90%+',
  triggers: { weight: true, energy: true, hunger: false, digestion: false },
  notes: '',
  instructions: ''
});

const createDefaultTraining = (): StructuralTraining => ({
  phaseName: '',
  type: 'hypertrophy',
  objective: '',
  frequency: '4x',
  split: 'Upper/Lower',
  volume: '10-12 sets/muscle',
  intensity: '75-85% 1RM',
  rpe: '7-9',
  progressionModel: 'Linear double progression',
  priorityExercises: 'Squat, Bench, Row',
  muscleFocus: 'Posterior chain',
  cardio: 'None',
  mobility: 'Dynamic warmup 10min',
  deloadLogic: 'Every 4th or 5th week',
  expectedFatigue: 'Moderate',
  revisionCriteria: 'Stale strength for 2 consecutive weeks',
  constraints: 'No heavy overhead pressing',
  notes: '',
  instructions: ''
});

const createDefaultLogic = (): StructuralLogic => ({
  whenToUse: '',
  targetClient: '',
  nextPhaseConditions: '',
  signalsToModify: '',
  dependencies: '',
  relationNutTrain: ''
});

const getInitialData = (clientName: string): RoadmapData => ({
  status: 'LIVE',
  startDate: '2023-10-01',
  endDate: '2024-01-15',
  currentWeek: 5,
  totalWeeks: 12,
  nutrition: [
    { 
      id: 'n1', title: 'Maintenance Phase', startWeek: 1, endWeek: 4, type: 'nutrition', color: 'bg-blue-50/50 border-blue-100 text-blue-600', status: 'active',
      summary: { objective: 'Stabilize metabolism', expectedResult: 'Weight stability', successCriteria: '±1lb variation', proNotes: '' },
      nutrition: { ...createDefaultNutrition(), calories: '2500', strategy: 'maintenance' }
    },
    { 
      id: 'n2', title: 'Calculated Deficit', startWeek: 5, endWeek: 8, type: 'nutrition', color: 'bg-amber-50/50 border-amber-100 text-amber-600', status: 'active',
      summary: { objective: 'Fat loss focus', expectedResult: '-2kg weight', successCriteria: 'Visual definition improvement', proNotes: '' },
      nutrition: { ...createDefaultNutrition(), calories: '2100', strategy: 'deficit' }
    }
  ],
  training: [
    { 
      id: 't1', title: 'Accumulation 1', startWeek: 1, endWeek: 6, type: 'training', color: 'bg-purple-50/50 border-purple-100 text-purple-600', status: 'active',
      summary: { objective: 'Build base volume', expectedResult: 'Improved work capacity', successCriteria: 'All sets completed', proNotes: '' },
      training: { ...createDefaultTraining(), volume: '12-15 sets', type: 'hypertrophy' }
    }
  ],
  milestones: [
    { id: 'm1', date: 'Oct 01', label: 'Program Start', status: 'completed' },
    { id: 'm2', date: 'Nov 15', label: 'Phase 2 Review', status: 'active', desc: 'Adjust deficit macros' }
  ],
  risks: 'Client reported poor sleep quality last week.'
});

export default function PlanningDetail({ onNavigate, clientId }: { onNavigate: (view: string) => void, clientId?: string }) {
  const { clients } = useClient();
  const client = clients.find(c => c.id === clientId);

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Selection
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const selectedBlock = useMemo(() => {
    if (!roadmap || !selectedBlockId) return null;
    return [...roadmap.nutrition, ...roadmap.training].find(b => b.id === selectedBlockId);
  }, [roadmap, selectedBlockId]);

  useEffect(() => {
    if (clientId) {
      loadRoadmap();
    }
  }, [clientId]);

  const loadRoadmap = async () => {
    try {
      const data = await fetchWithAuth(`/manager/clients/${clientId}/roadmap`);
      if (data.data_json && data.data_json.nutrition) {
        setRoadmap({
          ...getInitialData(client?.name || 'Client'),
          ...data.data_json,
          status: data.status || 'LIVE'
        });
      } else {
        setRoadmap(getInitialData(client?.name || 'Client'));
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
      setRoadmap(getInitialData(client?.name || 'Client'));
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
      alert('Structural Design Saved Successfully');
    } catch (error) {
      console.error('Error saving roadmap:', error);
    }
  };

  const updateBlock = (updated: RoadmapBlock) => {
    if (!roadmap) return;
    const typeKey = updated.type === 'nutrition' ? 'nutrition' : 'training';
    setRoadmap({
      ...roadmap,
      [typeKey]: roadmap[typeKey].map(b => b.id === updated.id ? updated : b)
    });
  };

  const addBlock = (type: 'nutrition' | 'training') => {
    if (!roadmap) return;
    const newBlock: RoadmapBlock = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Structural Phase',
      startWeek: roadmap.currentWeek,
      endWeek: roadmap.currentWeek + 3,
      type,
      color: type === 'nutrition' ? 'bg-rose-50/50 border-rose-100 text-rose-600' : 'bg-indigo-50/50 border-indigo-100 text-indigo-600',
      status: 'draft',
      summary: { objective: '', expectedResult: '', successCriteria: '', proNotes: '' },
      nutrition: type === 'nutrition' ? createDefaultNutrition() : undefined,
      training: type === 'training' ? createDefaultTraining() : undefined,
      logic: createDefaultLogic()
    };
    setRoadmap({
      ...roadmap,
      [type]: [...roadmap[type], newBlock]
    });
    setSelectedBlockId(newBlock.id);
  };

  const deleteBlock = (id: string, type: 'nutrition' | 'training' | 'combined') => {
    if (!roadmap) return;
    const typeKey = type === 'nutrition' ? 'nutrition' : 'training';
    setRoadmap({
      ...roadmap,
      [typeKey]: roadmap[typeKey].filter(b => b.id !== id)
    });
    setSelectedBlockId(null);
  };

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" /></div>;
  if (!roadmap) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-display">
      
      {/* Scrollable Workspace */}
      <div className="flex-1 overflow-y-auto p-8 scroll-smooth no-scrollbar">
        <div className="max-w-[1500px] mx-auto flex flex-col gap-10">
          
          {/* HEADER (Compact) */}
          <div className="flex flex-col gap-6">
            <nav className="flex items-center gap-2 text-sm font-semibold">
              <button onClick={() => onNavigate('planning')} className="text-slate-400 hover:text-emerald-500 transition-colors">Planning</button>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-slate-900 dark:text-white font-bold">{client?.name}</span>
            </nav>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-cover bg-center border border-slate-100 dark:border-slate-800" style={{ backgroundImage: `url(${client?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'})` }} />
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-2">{client?.name} <span className="text-slate-400 font-medium ml-2">— Structural Workspace</span></h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-emerald-100">Live Program</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End: {roadmap.endDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button onClick={handleSave} className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/10 active:scale-95 transition-all flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Strategy
                 </button>
              </div>
            </div>
          </div>

          {/* MASTER ROADMAP (Visual Navigator) */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                 <MapIcon className="w-5 h-5 text-emerald-500" />
                 Program Roadmap
               </h3>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-800">{roadmap.totalWeeks} Weeks Total</span>
               </div>
            </div>

            <div className="relative w-full overflow-x-auto pb-4 no-scrollbar">
               <div className="min-w-[1200px] relative">
                  {/* Grid Lines */}
                  <div className="flex justify-between px-2 mb-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    {Array.from({ length: roadmap.totalWeeks }).map((_, i) => (
                      <span key={i} className="w-[8%] text-center">Week {i + 1}</span>
                    ))}
                  </div>

                  {/* Tracks */}
                  <div className="space-y-4">
                    {/* Nutrition Track */}
                    <div className="relative h-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl flex items-center px-2 group">
                       <button onClick={() => addBlock('nutrition')} className="absolute -left-10 opacity-0 group-hover:opacity-100 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-100 text-emerald-500 shadow-sm transition-all"><Plus className="w-4 h-4" /></button>
                       {roadmap.nutrition.map(block => (
                         <div 
                          key={block.id}
                          style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%`, left: `${((block.startWeek - 1) / roadmap.totalWeeks) * 100}%` }}
                          className={`absolute h-8 rounded-xl border-2 flex items-center justify-between px-3 cursor-pointer transition-all ${selectedBlockId === block.id ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg scale-[1.02] z-20' : 'border-white dark:border-slate-800 shadow-sm'} ${block.color}`}
                          onClick={() => setSelectedBlockId(block.id)}
                         >
                           <span className="text-[10px] font-bold truncate">{block.title}</span>
                         </div>
                       ))}
                    </div>

                    {/* Training Track */}
                    <div className="relative h-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl flex items-center px-2 group">
                       <button onClick={() => addBlock('training')} className="absolute -left-10 opacity-0 group-hover:opacity-100 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-100 text-emerald-500 shadow-sm transition-all"><Plus className="w-4 h-4" /></button>
                       {roadmap.training.map(block => (
                         <div 
                          key={block.id}
                          style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%`, left: `${((block.startWeek - 1) / roadmap.totalWeeks) * 100}%` }}
                          className={`absolute h-8 rounded-xl border-2 flex items-center justify-between px-3 cursor-pointer transition-all ${selectedBlockId === block.id ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg scale-[1.02] z-20' : 'border-white dark:border-slate-800 shadow-sm'} ${block.color}`}
                          onClick={() => setSelectedBlockId(block.id)}
                         >
                           <span className="text-[10px] font-bold truncate">{block.title}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Indicators */}
                  <div className="absolute top-10 bottom-4 w-[1px] bg-emerald-500/30 border-l border-dashed border-emerald-500/50" style={{ left: `${((roadmap.currentWeek - 0.5) / roadmap.totalWeeks) * 100}%` }}>
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">TODAY</div>
                  </div>
               </div>
            </div>
          </div>

          {/* STRUCTURAL BLOCK EDITOR */}
          <div className="min-h-[600px] flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {!selectedBlockId ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="w-full flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-sm"
                >
                   <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-6">
                      <Layout className="w-10 h-10" />
                   </div>
                   <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 italic opacity-60">Select a structural block to edit its design</h4>
                   <p className="text-sm text-slate-400 font-medium">Click on any phase in the roadmap above to launch the structural editor.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key={selectedBlockId}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
                >
                  {/* Editor Header */}
                  <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-slate-50/30 dark:bg-slate-800/20">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-[24px] border-2 border-white shadow-xl flex items-center justify-center ${selectedBlock?.color}`}>
                         {selectedBlock?.type === 'nutrition' ? <Apple className="w-8 h-8" /> : <Dumbbell className="w-8 h-8" />}
                      </div>
                      <div>
                        <input 
                          value={selectedBlock?.title}
                          onChange={(e) => updateBlock({ ...selectedBlock!, title: e.target.value })}
                          className="text-3xl font-bold text-slate-900 dark:text-white bg-transparent outline-none focus:text-emerald-500 transition-colors w-full max-w-[400px]"
                        />
                        <div className="flex items-center gap-3 mt-2">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{selectedBlock?.type} Phase</span>
                           <span className="text-slate-300">•</span>
                           <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">Week {selectedBlock?.startWeek} to {selectedBlock?.endWeek}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                       <button className="flex-1 md:flex-initial px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"><Copy className="w-4 h-4" /> Duplicate</button>
                       <button className="flex-1 md:flex-initial px-6 py-3 bg-rose-50 text-rose-500 rounded-2xl text-xs font-bold border border-rose-100 hover:bg-rose-100 transition-all" onClick={() => { if(selectedBlock) deleteBlock(selectedBlock.id, selectedBlock.type as any); }}><Trash2 className="w-4 h-4" /></button>
                       <button className="flex-1 md:flex-initial p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all" onClick={() => setSelectedBlockId(null)}><X className="w-5 h-5" /></button>
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-slate-50/20 dark:bg-slate-800/10 border-b border-slate-50 dark:border-slate-800">
                     <EditorField label="Core Objective" value={selectedBlock?.summary.objective || ''} onChange={(val) => updateBlock({...selectedBlock!, summary: {...selectedBlock!.summary, objective: val}})} placeholder="e.g. Metabolic Adaptation" />
                     <EditorField label="Expected Result" value={selectedBlock?.summary.expectedResult || ''} onChange={(val) => updateBlock({...selectedBlock!, summary: {...selectedBlock!.summary, expectedResult: val}})} placeholder="e.g. -2% Body Fat" />
                     <EditorField label="Success Criteria" value={selectedBlock?.summary.successCriteria || ''} onChange={(val) => updateBlock({...selectedBlock!, summary: {...selectedBlock!.summary, successCriteria: val}})} placeholder="e.g. Consistent 1RM gains" />
                     <EditorField label="Professional Notes" value={selectedBlock?.summary.proNotes || ''} onChange={(val) => updateBlock({...selectedBlock!, summary: {...selectedBlock!.summary, proNotes: val}})} placeholder="Internal observations..." />
                  </div>

                  {/* Deep Dive Sections (Nutrition & Training) */}
                  <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-slate-100 dark:divide-slate-800">
                     
                     {/* NUTRITION SECTION */}
                     <div className="flex-1 p-10 flex flex-col gap-10">
                        <SectionHeader icon={<Apple className="w-5 h-5 text-emerald-500" />} title="Structural Nutrition" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <EditorSelect 
                              label="Primary Strategy" 
                              value={selectedBlock?.nutrition?.strategy || 'maintenance'} 
                              options={['maintenance', 'deficit', 'surplus', 'recomposition', 'diet break', 'refeed', 'custom']} 
                              onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, strategy: val as any}})} 
                           />
                           <EditorInput label="Calories Target" value={selectedBlock?.nutrition?.calories || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, calories: val}})} placeholder="e.g. 2500 kcal" />
                           <EditorInput label="Margin (±)" value={selectedBlock?.nutrition?.margin || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, margin: val}})} placeholder="e.g. 100 kcal" />
                           <div className="grid grid-cols-3 gap-4">
                              <EditorInput label="Protein" value={selectedBlock?.nutrition?.macros.p || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, macros: {...selectedBlock!.nutrition!.macros, p: val}}})} placeholder="g" />
                              <EditorInput label="Carbs" value={selectedBlock?.nutrition?.macros.c || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, macros: {...selectedBlock!.nutrition!.macros, c: val}}})} placeholder="g" />
                              <EditorInput label="Fats" value={selectedBlock?.nutrition?.macros.f || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, macros: {...selectedBlock!.nutrition!.macros, f: val}}})} placeholder="g" />
                           </div>
                           <EditorInput label="Fiber Goal" value={selectedBlock?.nutrition?.fiber || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, fiber: val}})} placeholder="g" />
                           <EditorInput label="Water Target" value={selectedBlock?.nutrition?.water || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, water: val}})} placeholder="L" />
                           <EditorInput label="Meal Count" value={selectedBlock?.nutrition?.meals || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, meals: val}})} placeholder="e.g. 4" />
                           <EditorInput label="Timing/Distribution" value={selectedBlock?.nutrition?.timing || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, timing: val}})} placeholder="e.g. 30g P / meal" />
                           <EditorInput label="Refeeds/High Days" value={selectedBlock?.nutrition?.refeeds || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, refeeds: val}})} placeholder="e.g. Sat/Sun refeed" />
                           <EditorInput label="Associated Cardio" value={selectedBlock?.nutrition?.cardio || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, cardio: val}})} placeholder="e.g. 3x30min LISS" />
                           <EditorInput label="Step Goal" value={selectedBlock?.nutrition?.steps || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, steps: val}})} placeholder="e.g. 10k" />
                           <EditorInput label="Supplements" value={selectedBlock?.nutrition?.supplements || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, supplements: val}})} placeholder="e.g. Creatine" />
                           <EditorInput label="Target Adherence" value={selectedBlock?.nutrition?.adherence || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, adherence: val}})} placeholder="%" />
                           <div className="md:col-span-2">
                              <EditorArea label="Review Triggers & Contraindications" value={selectedBlock?.nutrition?.notes || ''} onChange={(val) => updateBlock({...selectedBlock!, nutrition: {...selectedBlock!.nutrition!, notes: val}})} placeholder="When to review? Contraindications?" />
                           </div>
                        </div>
                     </div>

                     {/* TRAINING SECTION */}
                     <div className="flex-1 p-10 flex flex-col gap-10 bg-slate-50/10 dark:bg-slate-800/5">
                        <SectionHeader icon={<Dumbbell className="w-5 h-5 text-indigo-500" />} title="Structural Training" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <EditorSelect 
                              label="Block Type" 
                              value={selectedBlock?.training?.type || 'hypertrophy'} 
                              options={['hypertrophy', 'strength', 'deload', 'maintenance', 'peak', 'conditioning', 'custom']} 
                              onChange={(val) => updateBlock({...selectedBlock!, training: {...selectedBlock!.training!, type: val as any}})} 
                           />
                           <EditorInput label="Frequency" value={selectedBlock?.training?.frequency || ''} onChange={(val) => updateBlock({...selectedBlock!, training: {...selectedBlock!.training!, frequency: val}})} />
                           <EditorInput label="Split" value={selectedBlock?.training?.split || ''} onChange={(val) => updateBlock({...selectedBlock!, training: {...selectedBlock!.training!, split: val}})} />
                           <EditorInput label="Volume Target" value={selectedBlock?.training?.volume || ''} onChange={(val) => updateBlock({...selectedBlock!, training: {...selectedBlock!.training!, volume: val}})} />
                           <EditorInput label="Intensity Focus" value={selectedBlock?.training?.intensity || ''} onChange={(val) => updateBlock({...selectedBlock!, training: {...selectedBlock!.training!, intensity: val}})} />
                           <EditorInput label="RPE/RIR Guide" value={selectedBlock?.training?.rpe || ''} onChange={(val) => updateBlock({...selectedBlock!, training: {...selectedBlock!.training!, rpe: val}})} />
                           <EditorInput label="Progression Model" value={selectedBlock?.training?.progressionModel || ''} onChange={(val) => updateBlock({...selectedBlock!, training: {...selectedBlock!.training!, progressionModel: val}})} />
                           <EditorInput label="Priority Exercises" value={selectedBlock?.training?.priorityExercises || ''} onChange={(val) => updateBlock({...selectedBlock!, training: {...selectedBlock!.training!, priorityExercises: val}})} />
                           <EditorInput label="Focus Area" value={selectedBlock?.training?.muscleFocus || ''} onChange={(val) => updateBlock({...selectedBlock!, training: {...selectedBlock!.training!, muscleFocus: val}})} />
                           <EditorInput label="Deload Logic" value={selectedBlock?.training?.deloadLogic || ''} onChange={(val) => updateBlock({...selectedBlock!, training: {...selectedBlock!.training!, deloadLogic: val}})} />
                           <EditorInput label="Expected Fatigue" value={selectedBlock?.training?.expectedFatigue || ''} onChange={(val) => updateBlock({...selectedBlock!, training: {...selectedBlock!.training!, expectedFatigue: val}})} />
                           <EditorInput label="Revision Criteria" value={selectedBlock?.training?.revisionCriteria || ''} onChange={(val) => updateBlock({...selectedBlock!, training: {...selectedBlock!.training!, revisionCriteria: val}})} />
                           <div className="md:col-span-2">
                              <EditorArea label="Limitations & Constraints" value={selectedBlock?.training?.notes || ''} onChange={(val) => updateBlock({...selectedBlock!, training: {...selectedBlock!.training!, notes: val}})} placeholder="Injuries, equipment limits..." />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Rules & Logic Footer */}
                  <div className="p-10 bg-slate-900 dark:bg-slate-800/50 flex flex-col gap-8">
                     <SectionHeader icon={<Zap className="w-5 h-5 text-emerald-400" />} title="Rules & Architecture Logic" light />
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <EditorField label="Context: When to use?" light value={selectedBlock?.logic?.whenToUse || ''} onChange={(val) => updateBlock({...selectedBlock!, logic: {...selectedBlock!.logic!, whenToUse: val}})} />
                        <EditorField label="Ideal Client Profile" light value={selectedBlock?.logic?.targetClient || ''} onChange={(val) => updateBlock({...selectedBlock!, logic: {...selectedBlock!.logic!, targetClient: val}})} />
                        <EditorField label="Transition: Next Phase Criteria" light value={selectedBlock?.logic?.nextPhaseConditions || ''} onChange={(val) => updateBlock({...selectedBlock!, logic: {...selectedBlock!.logic!, nextPhaseConditions: val}})} />
                        <EditorField label="Modification Signals" light value={selectedBlock?.logic?.signalsToModify || ''} onChange={(val) => updateBlock({...selectedBlock!, logic: {...selectedBlock!.logic!, signalsToModify: val}})} />
                        <EditorField label="Block Dependencies" light value={selectedBlock?.logic?.dependencies || ''} onChange={(val) => updateBlock({...selectedBlock!, logic: {...selectedBlock!.logic!, dependencies: val}})} />
                        <EditorField label="Nut/Train Relationship" light value={selectedBlock?.logic?.relationNutTrain || ''} onChange={(val) => updateBlock({...selectedBlock!, logic: {...selectedBlock!.logic!, relationNutTrain: val}})} />
                     </div>
                     <div className="flex flex-col md:flex-row gap-4 mt-4 pt-8 border-t border-white/5">
                        <button className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.01] transition-all">Apply both modules</button>
                        <button className="flex-1 py-4 bg-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all">Save as Structural Template</button>
                        <button className="px-8 py-4 bg-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500/30 transition-all" onClick={() => setSelectedBlockId(null)}>Close Editor</button>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SECONDARY SIDEBAR CONTEXT (Optional Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
             <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><History className="w-4 h-4" /> Global Milestones</h4>
                <div className="space-y-4">
                   {roadmap.milestones.map(m => (
                     <div key={m.id} className="flex gap-4 items-start">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${m.status === 'active' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-slate-200'}`} />
                        <div>
                           <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{m.label}</p>
                           <p className="text-[10px] text-slate-400 font-medium">{m.date}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500"><AlertTriangle className="w-6 h-6" /></div>
                <div>
                   <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Identified Strategic Risks</h4>
                   <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">"{roadmap.risks}"</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function EditorField({ label, value, onChange, placeholder, light }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, light?: boolean }) {
  return (
    <div className="space-y-1.5">
       <label className={`text-[9px] font-bold uppercase tracking-[0.2em] ml-1 ${light ? 'text-white/40' : 'text-slate-400'}`}>{label}</label>
       <input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-transparent border-b outline-none text-xs font-bold py-1.5 transition-all focus:border-emerald-500 ${light ? 'text-white border-white/10' : 'text-slate-800 dark:text-white border-slate-100 dark:border-slate-800'}`}
       />
    </div>
  );
}

function EditorInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
       <input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all text-xs"
       />
    </div>
  );
}

function EditorArea({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
       <textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 outline-none font-semibold text-slate-500 dark:text-slate-400 transition-all text-xs min-h-[80px]"
       />
    </div>
  );
}

function EditorSelect({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
       <div className="relative">
          <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all text-xs appearance-none pr-10 uppercase tracking-widest"
          >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
       </div>
    </div>
  );
}

function SectionHeader({ icon, title, light }: { icon: React.ReactNode, title: string, light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
       <div className={`p-2.5 rounded-xl ${light ? 'bg-white/5 border border-white/10' : 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700'}`}>
          {icon}
       </div>
       <h4 className={`text-base font-bold tracking-tight ${light ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{title}</h4>
    </div>
  );
}
