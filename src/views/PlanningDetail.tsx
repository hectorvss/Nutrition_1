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
  Calendar as CalendarIcon
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
        // Use defaults from the backend response which already includes empty arrays
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
      alert('Roadmap saved successfully!');
    } catch (error) {
      console.error('Error saving roadmap:', error);
      alert('Failed to save roadmap.');
    }
  };

  const addBlock = (type: 'nutrition' | 'training') => {
    const newBlock: RoadmapBlock = {
      id: Math.random().toString(36).substr(2, 9),
      title: type === 'nutrition' ? 'New Nutrition Phase' : 'New Training Block',
      weeks: 'WK 1-4',
      type,
      color: type === 'nutrition' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600',
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

  if (loading) return <div className="p-8">Loading roadmap...</div>;

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('planning')}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">Master Roadmap</h1>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded uppercase tracking-wider">
                  PLAN: {roadmap.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{client?.name}'s long-term progression plan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Roadmap
            </button>
          </div>
        </header>

        {/* Roadmap Display Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* NUTRITION FOCUS */}
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Nutrition Focus</h3>
                <button 
                  onClick={() => addBlock('nutrition')}
                  className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
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
                {roadmap.nutrition.length === 0 && (
                  <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-8 text-slate-400 italic text-sm">
                    No nutrition blocks added yet. Click + to start.
                  </div>
                )}
              </div>
            </section>

            {/* TRAINING BLOCK */}
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Training Block</h3>
                <button 
                  onClick={() => addBlock('training')}
                  className="p-1.5 hover:bg-indigo-50 text-indigo-500 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
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
                {roadmap.training.length === 0 && (
                  <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-8 text-slate-400 italic text-sm">
                    No training blocks added yet. Click + to start.
                  </div>
                )}
              </div>
            </section>

            {/* Timeline Placeholder */}
            <div className="pt-12 border-t border-slate-200">
              <div className="relative h-px bg-slate-200 w-full flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                <span>OCT</span>
                <div className="flex flex-col items-center">
                   <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm mb-1"></div>
                   <span className="text-emerald-600">CURRENT</span>
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
                      <h2 className="font-bold text-slate-900">Block Details</h2>
                      <p className="text-xs text-slate-500 font-medium">Guideline & Objectives</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => deleteBlock(selectedBlock.id, selectedBlock.type)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Phase Title</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-900 transition-all placeholder-slate-400"
                        value={selectedBlock.title}
                        onChange={(e) => updateBlock({ ...selectedBlock, title: e.target.value })}
                        placeholder="e.g. Aggressive Deficit"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Duration (Weeks)</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 transition-all placeholder-slate-400"
                        value={selectedBlock.weeks}
                        onChange={(e) => updateBlock({ ...selectedBlock, weeks: e.target.value })}
                        placeholder="e.g. WK 1-4"
                      />
                    </div>
                  </div>

                  {/* Objectives */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                         <Target className="w-4 h-4 text-emerald-500" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Core Objectives</label>
                      </div>
                      <textarea 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 transition-all min-h-[100px] text-sm leading-relaxed"
                        value={selectedBlock.details.objectives}
                        onChange={(e) => updateBlock({ ...selectedBlock, details: { ...selectedBlock.details, objectives: e.target.value } })}
                        placeholder="What are we trying to achieve in this phase?"
                      />
                    </div>
                  </div>

                  {/* Weight & Nutrition Focus */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                         <Scale className="w-4 h-4 text-rose-500" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Weight Goal</label>
                      </div>
                      <input 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 transition-all text-sm"
                        value={selectedBlock.details.weight}
                        onChange={(e) => updateBlock({ ...selectedBlock, details: { ...selectedBlock.details, weight: e.target.value } })}
                        placeholder="e.g. 82kg -> 79kg"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                         <TrendingUp className="w-4 h-4 text-indigo-500" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nutrition Strategy</label>
                      </div>
                      <input 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 transition-all text-sm"
                        value={selectedBlock.details.nutrition}
                        onChange={(e) => updateBlock({ ...selectedBlock, details: { ...selectedBlock.details, nutrition: e.target.value } })}
                        placeholder="e.g. Carb Cycling"
                      />
                    </div>
                  </div>

                  {/* Precautions */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                         <AlertTriangle className="w-4 h-4 text-amber-500" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Precautions & Risks</label>
                      </div>
                      <textarea 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 transition-all min-h-[80px] text-sm"
                        value={selectedBlock.details.precautions}
                        onChange={(e) => updateBlock({ ...selectedBlock, details: { ...selectedBlock.details, precautions: e.target.value } })}
                        placeholder="Any injuries or fatigue signals to monitor?"
                      />
                    </div>
                  </div>

                  {/* Improvements */}
                  <div className="pb-8">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Aspects to Improve</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 transition-all min-h-[80px] text-sm"
                      value={selectedBlock.details.improvements}
                      onChange={(e) => updateBlock({ ...selectedBlock, details: { ...selectedBlock.details, improvements: e.target.value } })}
                      placeholder="Feedback from previous phase to address..."
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                 <div className="w-16 h-16 rounded-3xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                    <Info className="w-8 h-8 text-slate-300" />
                 </div>
                 <h3 className="font-bold text-slate-900 mb-1">Select a Block</h3>
                 <p className="text-sm text-slate-500 max-w-[240px]">Click on any block in the roadmap to view and edit its detailed guideline.</p>
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
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`min-w-[280px] flex-1 p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-center items-center gap-1.5 shadow-sm hover:shadow-md ${
        isSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
      } ${block.color}`}
    >
      <span className="font-bold text-lg leading-tight text-center">{block.title}</span>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{block.weeks}</span>
    </motion.div>
  );
}
