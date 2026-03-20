import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Trash2, 
  Info, 
  X,
  Target,
  AlertTriangle,
  TrendingUp,
  Scale,
  Calendar as CalendarIcon,
  Apple,
  Dumbbell,
  Sparkles
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { useClient } from '../context/ClientContext';

interface RoadmapBlock {
  id: string;
  title: string;
  weeks: string;
  type: 'nutrition' | 'training';
  color: string;
  details: {
    nutrition?: string;
    training?: string;
    weight?: string;
    notices?: string;
    objectives?: string;
    precautions?: string;
    improvements?: string;
  };
}

interface RoadmapData {
  nutrition: RoadmapBlock[];
  training: RoadmapBlock[];
  status: string;
}

export default function PlanningDetail({ onNavigate, clientId }: { onNavigate: (view: string) => void, clientId?: string }) {
  const { clients } = useClient();
  const client = clients.find(c => c.id === clientId);

  const [roadmap, setRoadmap] = useState<RoadmapData>({ nutrition: [], training: [], status: 'Draft' });
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<RoadmapBlock | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (clientId) {
      loadRoadmap();
    }
  }, [clientId]);

  const loadRoadmap = async () => {
    try {
      const data = await fetchWithAuth(`/manager/clients/${clientId}/roadmap`);
      if (data.data_json) {
        setRoadmap({
          nutrition: data.data_json.nutrition || [],
          training: data.data_json.training || [],
          status: data.status || 'Draft'
        });
      } else {
        setRoadmap(data);
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
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
      alert('Master Roadmap updated successfully!');
    } catch (error) {
      console.error('Error saving roadmap:', error);
    }
  };

  const addBlock = (type: 'nutrition' | 'training') => {
    const newBlock: RoadmapBlock = {
      id: Math.random().toString(36).substr(2, 9),
      title: type === 'nutrition' ? 'Deficit Phase' : 'Metabolic Work',
      weeks: 'WK 1-4',
      type,
      color: type === 'nutrition' ? 'bg-rose-500/10 text-rose-600 border-rose-200' : 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
      details: {
        objectives: '',
        notices: '',
        precautions: ''
      }
    };

    setRoadmap(prev => ({
      ...prev,
      [type]: [...prev[type], newBlock]
    }));
    
    setSelectedBlock(newBlock);
    setIsSidebarOpen(true);
  };

  const updateBlock = (block: RoadmapBlock) => {
    setRoadmap(prev => ({
      ...prev,
      [block.type]: prev[block.type].map(b => b.id === block.id ? block : b)
    }));
    setSelectedBlock(block);
  };

  const deleteBlock = (id: string, type: 'nutrition' | 'training') => {
    setRoadmap(prev => ({
      ...prev,
      [type]: prev[type].filter(b => b.id !== id)
    }));
    if (selectedBlock?.id === id) {
      setIsSidebarOpen(false);
      setSelectedBlock(null);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" /></div>;

  return (
    <div className="flex h-full overflow-hidden bg-slate-50/50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Modern Header */}
        <header className="px-10 py-8 flex justify-between items-center bg-white/40 backdrop-blur-md border-b border-white z-10 shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('planning')}
              className="group p-3 bg-white hover:bg-slate-100 rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Master Roadmap</h1>
                <div className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-lg shadow-emerald-500/20">
                  {roadmap.status}
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-sm text-slate-500 font-bold uppercase tracking-wider opacity-60">Building {client?.name}'s Legacy</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-900/10 transition-all flex items-center gap-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            Sync Progress
          </button>
        </header>

        {/* Roadmap Display Area */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-10 pb-20">
            
            {/* NUTRITION FOCUS CARD */}
            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Apple className="w-64 h-64 text-rose-500 rotate-12" />
               </div>
               
               <div className="relative z-10">
                 <div className="flex justify-between items-center mb-10">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm">
                       <Apple className="w-7 h-7" />
                     </div>
                     <div>
                       <h3 className="text-2xl font-black text-slate-900">Nutrition Focus</h3>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Metabolic & Fueling Blocks</p>
                     </div>
                   </div>
                   <button 
                    onClick={() => addBlock('nutrition')}
                    className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                   >
                     <Plus className="w-5 h-5" />
                     New Phase
                   </button>
                 </div>

                 <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                   {roadmap.nutrition.map(block => (
                     <RoadmapBlockItem 
                       key={block.id} 
                       block={block} 
                       isSelected={selectedBlock?.id === block.id}
                       onClick={() => {
                         setSelectedBlock(block);
                         setIsSidebarOpen(true);
                       }} 
                     />
                   ))}
                   <button 
                    onClick={() => addBlock('nutrition')}
                    className="min-w-[240px] h-[140px] border-2 border-dashed border-rose-100 hover:border-rose-400 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:bg-rose-50/50 group/add"
                   >
                     <div className="w-12 h-12 bg-rose-50 flex items-center justify-center rounded-2xl group-hover/add:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-rose-400" />
                     </div>
                     <span className="text-sm font-black text-rose-300 uppercase tracking-widest group-hover/add:text-rose-500">Add Next Phase</span>
                   </button>
                 </div>
               </div>
            </div>

            {/* TRAINING BLOCK CARD */}
            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Dumbbell className="w-64 h-64 text-indigo-500 -rotate-12" />
               </div>
               
               <div className="relative z-10">
                 <div className="flex justify-between items-center mb-10">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-100 shadow-sm">
                       <Dumbbell className="w-7 h-7" />
                     </div>
                     <div>
                       <h3 className="text-2xl font-black text-slate-900">Training Blocks</h3>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Strength & Adaptation Phases</p>
                     </div>
                   </div>
                   <button 
                    onClick={() => addBlock('training')}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                   >
                     <Plus className="w-5 h-5" />
                     New Phase
                   </button>
                 </div>

                 <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                   {roadmap.training.map(block => (
                     <RoadmapBlockItem 
                       key={block.id} 
                       block={block} 
                       isSelected={selectedBlock?.id === block.id}
                       onClick={() => {
                         setSelectedBlock(block);
                         setIsSidebarOpen(true);
                       }} 
                     />
                   ))}
                   <button 
                    onClick={() => addBlock('training')}
                    className="min-w-[240px] h-[140px] border-2 border-dashed border-indigo-100 hover:border-indigo-400 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:bg-indigo-50/50 group/add"
                   >
                     <div className="w-12 h-12 bg-indigo-50 flex items-center justify-center rounded-2xl group-hover/add:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-indigo-400" />
                     </div>
                     <span className="text-sm font-black text-indigo-300 uppercase tracking-widest group-hover/add:text-indigo-500">Add Next Phase</span>
                   </button>
                 </div>
               </div>
            </div>

            {/* Master Timeline Bottom */}
            <div className="pt-10 flex flex-col items-center">
              <div className="relative w-full max-w-4xl h-1 bg-slate-200 rounded-full mb-4">
                 <div className="absolute top-0 left-1/4 w-1/2 h-full bg-emerald-500/20 rounded-full"></div>
                 <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-6 h-6 bg-white border-4 border-emerald-500 rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <div className="absolute -bottom-10 whitespace-nowrap text-[10px] font-black text-emerald-600 uppercase tracking-widest">Current Progression</div>
                 </div>
              </div>
              <div className="flex justify-between w-full max-w-4xl px-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                 <span>Q1 Focus</span>
                 <span>Q2 Expansion</span>
                 <span>Q3 Peak</span>
                 <span>Q4 Maintain</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Sidebar Details Panel */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-[480px] bg-white border-l border-slate-100 shadow-2xl z-20 flex flex-col"
          >
            {selectedBlock ? (
              <>
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100`}>
                      <Info className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Phase Guideline</h2>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Strategic Briefing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => deleteBlock(selectedBlock.id, selectedBlock.type)}
                      className="p-3 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-95"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-3 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-2xl transition-all active:scale-95"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Phase Identifier</label>
                      <input 
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-black text-slate-900 transition-all placeholder-slate-300 shadow-inner"
                        value={selectedBlock.title}
                        onChange={(e) => updateBlock({ ...selectedBlock, title: e.target.value })}
                        placeholder="e.g. Metabolic Conditioning"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Timeframe</label>
                      <input 
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 outline-none font-bold text-slate-600 transition-all placeholder-slate-300 text-sm"
                        value={selectedBlock.weeks}
                        onChange={(e) => updateBlock({ ...selectedBlock, weeks: e.target.value })}
                        placeholder="e.g. WK 1-4"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Status</label>
                      <div className="w-full px-6 py-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-black text-xs uppercase tracking-widest text-center">
                        Active Profile
                      </div>
                    </div>
                  </div>

                  {/* Core Objectives */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <Target className="w-5 h-5 text-emerald-500" />
                       <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest block">Main Objectives</label>
                    </div>
                    <textarea 
                      className="w-full px-6 py-5 rounded-[32px] bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium text-slate-600 transition-all min-h-[140px] text-sm leading-relaxed shadow-inner"
                      value={selectedBlock.details.objectives}
                      onChange={(e) => updateBlock({ ...selectedBlock, details: { ...selectedBlock.details, objectives: e.target.value } })}
                      placeholder="Define the primary mission for this phase..."
                    />
                  </div>

                  {/* Weight & Strategy Grid */}
                  <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-inner">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                         <Scale className="w-4 h-4 text-rose-500" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target Wt</label>
                      </div>
                      <input 
                        className="w-full bg-white px-4 py-3 rounded-xl border border-white focus:border-rose-300 outline-none font-bold text-slate-700 transition-all text-sm shadow-sm"
                        value={selectedBlock.details.weight}
                        onChange={(e) => updateBlock({ ...selectedBlock, details: { ...selectedBlock.details, weight: e.target.value } })}
                        placeholder="80kg -> 78kg"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                         <TrendingUp className="w-4 h-4 text-indigo-500" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Fueling</label>
                      </div>
                      <input 
                        className="w-full bg-white px-4 py-3 rounded-xl border border-white focus:border-indigo-300 outline-none font-bold text-slate-700 transition-all text-sm shadow-sm"
                        value={selectedBlock.details.nutrition}
                        onChange={(e) => updateBlock({ ...selectedBlock, details: { ...selectedBlock.details, nutrition: e.target.value } })}
                        placeholder="Carb Cycling"
                      />
                    </div>
                  </div>

                  {/* Alert Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <AlertTriangle className="w-5 h-5 text-amber-500" />
                       <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest block">Critical Notices</label>
                    </div>
                    <textarea 
                      className="w-full px-6 py-5 rounded-[32px] bg-amber-500/5 border border-amber-500/10 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none font-medium text-slate-600 transition-all min-h-[100px] text-sm leading-relaxed"
                      value={selectedBlock.details.precautions}
                      onChange={(e) => updateBlock({ ...selectedBlock, details: { ...selectedBlock.details, precautions: e.target.value } })}
                      placeholder="Monitor recovery and total volume..."
                    />
                  </div>

                  <div className="pb-10 pt-4 opacity-40 hover:opacity-100 transition-opacity">
                      <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-all font-bold text-sm">
                         <Sparkles className="w-4 h-4" />
                         Generate AI Insights
                      </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/20 backdrop-blur-sm">
                 <div className="w-24 h-24 rounded-[40px] bg-white shadow-2xl shadow-slate-200 flex items-center justify-center mb-8 relative">
                    <Sparkles className="w-10 h-10 text-emerald-500/30 absolute animate-pulse" />
                    <Info className="w-10 h-10 text-slate-200" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 mb-2">Phase Strategy</h3>
                 <p className="text-sm text-slate-500 max-w-[280px] font-medium leading-relaxed">Select a roadmap phase to build your client's elite progression strategy.</p>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function RoadmapBlockItem({ block, onClick, isSelected }: { block: RoadmapBlock; onClick: () => void; isSelected: boolean; key?: string }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`min-w-[280px] h-[140px] px-8 rounded-[32px] border transition-all cursor-pointer flex flex-col justify-center gap-1 shadow-sm hover:shadow-2xl hover:shadow-slate-200 relative overflow-hidden ${
        isSelected ? 'ring-4 ring-emerald-500/20 border-emerald-500/50 bg-white shadow-xl shadow-emerald-500/10' : 'bg-white border-slate-100'
      }`}
    >
      {/* Decorative accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${block.type === 'nutrition' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
      
      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{block.weeks}</span>
      <span className="font-black text-xl leading-snug text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{block.title}</span>
      
      <div className="mt-4 flex items-center gap-3">
         <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${block.type === 'nutrition' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
            {block.type}
         </div>
         {block.details.objectives && (
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
         )}
      </div>
    </motion.div>
  );
}
