import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Info, 
  X,
  Target,
  AlertTriangle,
  TrendingUp,
  Scale
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

  if (loading) return <div className="p-8">Loading your roadmap...</div>;
  if (!roadmap || (roadmap.nutrition.length === 0 && roadmap.training.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm m-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
          <Info className="w-8 h-8 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Roadmap Yet</h2>
        <p className="text-slate-500 max-w-md">Your coach hasn't published your long-term roadmap yet. Check back soon for your progression plan!</p>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="p-8 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Roadmap</h1>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-wider">
              {roadmap.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-tight">A complete visualization of your long-term progression plan</p>
        </header>

        {/* Roadmap Display Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-12 pb-16">
            
            {/* NUTRITION FOCUS */}
            <section className="space-y-6">
              <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Nutrition Phases</h3>
              <div className="flex gap-4 min-h-[100px] overflow-x-auto pb-4 scrollbar-hide">
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
            </section>

            {/* TRAINING BLOCK */}
            <section className="space-y-6">
              <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Training Blocks</h3>
              <div className="flex gap-4 min-h-[100px] overflow-x-auto pb-4 scrollbar-hide">
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
            </section>

            {/* Timeline Placeholder */}
            <div className="pt-12 border-t border-slate-200">
              <div className="relative h-px bg-slate-200 w-full flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                <span>OCT</span>
                <div className="flex flex-col items-center">
                   <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm mb-1"></div>
                   <span className="text-emerald-600">NOW</span>
                </div>
                <span>NOV</span>
                <span>DEC</span>
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
            className="w-[450px] bg-white border-l border-slate-200 shadow-2xl z-20 flex flex-col"
          >
            {selectedBlock ? (
              <>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-white shadow-sm border border-slate-100`}>
                      <Info className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">{selectedBlock.title}</h2>
                      <p className="text-xs text-slate-500 font-medium">Block Guidelines</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {/* Objectives */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                       <Target className="w-4 h-4 text-emerald-500" />
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Objectives</label>
                    </div>
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100/50 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium italic">
                      {selectedBlock.details.objectives || "No objectives set for this block."}
                    </div>
                  </div>

                  {/* Weight & Nutrition Focus */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                         <Scale className="w-4 h-4 text-rose-500" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Weight Goal</label>
                      </div>
                      <div className="font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedBlock.details.weight || "-"}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                         <TrendingUp className="w-4 h-4 text-indigo-500" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Strategy</label>
                      </div>
                      <div className="font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedBlock.details.nutrition || "-"}</div>
                    </div>
                  </div>

                  {/* Precautions */}
                  {selectedBlock.details.precautions && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                         <AlertTriangle className="w-4 h-4 text-amber-500" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Precautions</label>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-amber-800 text-sm font-medium">
                        {selectedBlock.details.precautions}
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {selectedBlock.details.improvements && (
                    <div className="pb-8 pt-4 border-t border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block text-slate-400 leading-wider">Notes for this phase</label>
                      <div className="text-slate-600 text-sm leading-relaxed font-medium">
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
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`min-w-[280px] p-8 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-center items-center gap-2 shadow-sm hover:shadow-md ${
        isSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
      } ${block.color}`}
    >
      <span className="font-bold text-xl leading-tight text-center">{block.title}</span>
      <span className="text-xs font-black uppercase tracking-widest opacity-70">{block.weeks}</span>
    </motion.div>
  );
}
