import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Info, 
  X,
  Target,
  AlertTriangle,
  TrendingUp,
  Scale,
  Apple,
  Dumbbell,
  Sparkles
} from 'lucide-react';
import { fetchWithAuth } from '../../api';

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

export default function ClientRoadmap() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<RoadmapBlock | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const data = await fetchWithAuth('/client/roadmap');
      if (data.data_json) {
        setRoadmap({
          nutrition: data.data_json.nutrition || [],
          training: data.data_json.training || [],
          status: data.status || 'Live'
        });
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><Sparkles className="w-8 h-8 text-[#17cf54] animate-pulse" /></div>;

  if (!roadmap || (roadmap.nutrition.length === 0 && roadmap.training.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 m-10">
        <div className="w-24 h-24 rounded-[40px] bg-slate-50 border border-slate-100 flex items-center justify-center mb-8">
          <Sparkles className="w-10 h-10 text-slate-200" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Master Roadmap Pending</h2>
        <p className="text-slate-500 max-w-md font-medium leading-relaxed">Your professional progression strategy is currently being finalized by your coach. Check back soon for your roadmap!</p>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-slate-50/50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Modern Header */}
        <header className="px-10 py-10 bg-white/40 backdrop-blur-md border-b border-white z-10 shadow-sm flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Your Master Roadmap</h1>
              <div className="px-3 py-1 bg-[#17cf54] text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-lg shadow-[#17cf54]/20">
                {roadmap.status.toUpperCase()}
              </div>
            </div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60">Elite Athletic Progression Strategy</p>
          </div>
          <div className="flex items-center gap-2 text-[#17cf54] font-black text-xs uppercase tracking-widest bg-[#17cf54]/5 px-4 py-2 rounded-xl border border-[#17cf54]/10">
             <div className="w-2 h-2 rounded-full bg-[#17cf54] animate-pulse"></div>
             Live Strategy
          </div>
        </header>

        {/* Roadmap Display Area */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-12 pb-24">
            
            {/* NUTRITION PHASES CARD */}
            <div className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                   <Apple className="w-80 h-80 text-rose-500" />
               </div>
               
               <div className="relative z-10">
                 <div className="flex items-center gap-5 mb-12">
                   <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm">
                     <Apple className="w-8 h-8" />
                   </div>
                   <div>
                     <h3 className="text-3xl font-black text-slate-900 tracking-tight">Nutrition Phases</h3>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Fueling & Body Comp Strategy</p>
                   </div>
                 </div>

                 <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide">
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
                 </div>
               </div>
            </div>

            {/* TRAINING BLOCKS CARD */}
            <div className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                   <Dumbbell className="w-80 h-80 text-indigo-500" />
               </div>
               
               <div className="relative z-10">
                 <div className="flex items-center gap-5 mb-12">
                   <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-100 shadow-sm">
                     <Dumbbell className="w-8 h-8" />
                   </div>
                   <div>
                     <h3 className="text-3xl font-black text-slate-900 tracking-tight">Training Blocks</h3>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Performance & Adaptation Programming</p>
                   </div>
                 </div>

                 <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide">
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
                 </div>
               </div>
            </div>

            {/* Timeline Placeholder */}
            <div className="pt-16 flex flex-col items-center">
              <div className="relative w-full max-w-4xl h-1.5 bg-slate-100 rounded-full mb-6">
                 <div className="absolute top-0 left-1/3 w-1/3 h-full bg-[#17cf54]/20 rounded-full"></div>
                 <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-8 h-8 bg-white border-4 border-[#17cf54] rounded-full shadow-xl shadow-[#17cf54]/20 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#17cf54] rounded-full"></div>
                    <div className="absolute -bottom-10 whitespace-nowrap text-[12px] font-black text-[#17cf54] uppercase tracking-widest">Active Phase</div>
                 </div>
              </div>
              <div className="flex justify-between w-full max-w-4xl px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                 <span>Phase Prep</span>
                 <span>Main Focus</span>
                 <span>Peak Strategy</span>
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
            className="w-[500px] bg-white border-l border-slate-100 shadow-2xl z-20 flex flex-col"
          >
            {selectedBlock ? (
              <>
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-[28px] bg-white shadow-2xl shadow-slate-200/50 border border-slate-100`}>
                      <Info className="w-7 h-7 text-[#17cf54]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedBlock.title}</h2>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Phase Guidelines</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-4 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all active:scale-95"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide pb-20">
                  {/* Strategic Briefing */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <Target className="w-6 h-6 text-[#17cf54]" />
                       <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest block">Core Strategy</label>
                    </div>
                    <div className="p-10 rounded-[44px] bg-[#17cf54]/[0.03] border border-[#17cf54]/10 text-slate-700 text-base leading-relaxed whitespace-pre-line font-medium italic shadow-inner">
                      {selectedBlock.details.objectives || "Your coach will define the specific strategy for this phase."}
                    </div>
                  </div>

                  {/* Weight & Focus Stats */}
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <Scale className="w-5 h-5 text-rose-500" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target weight</label>
                      </div>
                      <div className="font-black text-xl text-slate-900 bg-slate-50 px-6 py-4 rounded-[28px] border border-slate-100 shadow-inner">
                        {selectedBlock.details.weight || "TBD"}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <TrendingUp className="w-5 h-5 text-indigo-500" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Fueling Logic</label>
                      </div>
                      <div className="font-black text-xl text-slate-900 bg-slate-50 px-6 py-4 rounded-[28px] border border-slate-100 shadow-inner">
                        {selectedBlock.details.nutrition || "TBD"}
                      </div>
                    </div>
                  </div>

                  {/* Precautions */}
                  {selectedBlock.details.precautions && (
                    <div className="space-y-6 pt-8 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                         <AlertTriangle className="w-6 h-6 text-amber-500" />
                         <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest block">Critical Advice</label>
                      </div>
                      <div className="p-8 rounded-[36px] bg-amber-500/[0.04] border border-amber-500/10 text-amber-900/80 text-sm font-bold leading-relaxed shadow-inner">
                        {selectedBlock.details.precautions}
                      </div>
                    </div>
                  )}

                  {/* Extra Notes */}
                  {selectedBlock.details.improvements && (
                    <div className="pt-8 border-t border-slate-50">
                      <label className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-4 block">Coach's Extra Notes</label>
                      <div className="text-slate-600 text-base leading-relaxed font-medium pl-2 border-l-4 border-slate-100">
                        {selectedBlock.details.improvements}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function RoadmapBlockItem({ block, onClick, isSelected }: { block: RoadmapBlock; onClick: () => void; isSelected: boolean; key?: string }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`min-w-[320px] h-[160px] px-10 rounded-[44px] border transition-all cursor-pointer flex flex-col justify-center gap-2 shadow-sm hover:shadow-2xl hover:shadow-slate-200 relative overflow-hidden bg-white ${
        isSelected ? 'ring-4 ring-[#17cf54]/20 border-[#17cf54]/50 shadow-xl shadow-[#17cf54]/10' : 'border-slate-100'
      }`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${block.type === 'nutrition' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
      
      <span className="text-[11px] font-black uppercase tracking-[0.25em] opacity-40 mb-1">{block.weeks}</span>
      <span className="font-black text-2xl leading-tight text-slate-900 uppercase tracking-tighter">{block.title}</span>
      
      <div className="mt-6 flex items-center gap-4">
         <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${block.type === 'nutrition' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
            {block.type} phase
         </div>
         <Sparkles className="w-4 h-4 text-emerald-500/30" />
      </div>
    </motion.div>
  );
}
