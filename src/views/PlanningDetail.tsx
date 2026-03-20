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
  Calendar
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { useClient } from '../context/ClientContext';

// --- TYPES ---

interface Milestone {
  id: string;
  date: string;
  label: string;
  desc?: string;
  status: 'completed' | 'active' | 'upcoming';
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

interface RoadmapBlock {
  id: string;
  title: string;
  startWeek: number;
  endWeek: number;
  type: 'nutrition' | 'training';
  color: string;
  details: any;
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
  stats: {
    weight: string;
    weightChange: string;
    adherence: string;
    adherenceChange: string;
  };
  risks: string;
}

type EditContext = 'PHASE' | 'GOAL' | 'MILESTONE' | 'RISKS' | 'PROGRAM' | null;

// --- MOCK DATA GENERATOR ---
const getInitialData = (clientName: string): RoadmapData => ({
  status: 'LIVE',
  startDate: '2023-10-01',
  endDate: '2024-01-15',
  currentWeek: 5,
  totalWeeks: 12,
  nutrition: [
    { id: 'n1', title: 'Maintenance', startWeek: 1, endWeek: 4, type: 'nutrition', color: 'bg-blue-50/50 border-blue-100 text-blue-600', details: {} },
    { id: 'n2', title: 'Deficit (-500)', startWeek: 5, endWeek: 8, type: 'nutrition', color: 'bg-amber-50/50 border-amber-100 text-amber-600', details: {} },
    { id: 'n3', title: 'Maintenance', startWeek: 9, endWeek: 12, type: 'nutrition', color: 'bg-green-50/50 border-green-100 text-green-600', details: {} },
  ],
  training: [
    { id: 't1', title: 'Hypertrophy Base (4x)', startWeek: 1, endWeek: 6, type: 'training', color: 'bg-purple-50/50 border-purple-100 text-purple-600', details: {} },
    { id: 't2', title: 'Strength Peak (3x)', startWeek: 7, endWeek: 12, type: 'training', color: 'bg-rose-50/50 border-rose-100 text-rose-600', details: {} },
  ],
  goals: [
    { id: 'g1', type: 'physical', label: 'Physical', desc: 'Lose 10lbs fat, maintain muscle', value: 60, targetValue: '140 lbs', currentValue: '150 lbs' },
    { id: 'g2', type: 'nutrition', label: 'Nutrition', desc: 'Adherence to deficit macros', value: 85, targetValue: '90%+', currentValue: 'Consistent' },
    { id: 'g3', type: 'training', label: 'Training', desc: 'Complete all Hypertrophy sessions', value: 100, targetValue: '100%', currentValue: '16/16 sessions' },
    { id: 'g4', type: 'mindset', label: 'Mindset', desc: 'Improve sleep quality & stress', value: 70, targetValue: '7.5h+', currentValue: 'Avg 6.5h sleep' },
  ],
  milestones: [
    { id: 'm1', date: 'Oct 01', label: 'Program Start', status: 'completed' },
    { id: 'm2', date: 'Nov 15', label: 'Phase 2 Review', status: 'active', desc: 'Adjust deficit macros if plateaued' },
    { id: 'm3', date: 'Dec 15', label: 'Begin Strength Peak', status: 'upcoming' },
    { id: 'm4', date: 'Jan 15', label: 'Program End & Testing', status: 'upcoming' },
  ],
  stats: {
    weight: '146.5',
    weightChange: '-3.5',
    adherence: '92',
    adherenceChange: '+2'
  },
  risks: 'Client reported poor sleep quality last week. Monitor recovery during this higher volume training phase.'
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
      if (data.data_json && data.data_json.goals) {
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
      // Toast or simple feedback
    } catch (error) {
      console.error('Error saving roadmap:', error);
    }
  };

  const openEditor = (context: EditContext, target: any) => {
    setEditContext(context);
    setEditTarget(target);
    setIsSidebarOpen(true);
  };

  const updateGoal = (updatedGoal: Goal) => {
    if (!roadmap) return;
    setRoadmap({
      ...roadmap,
      goals: roadmap.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
    });
    setEditTarget(updatedGoal);
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
      color: type === 'nutrition' ? 'bg-rose-50/50 border-rose-100 text-rose-600' : 'bg-indigo-50/50 border-indigo-100 text-indigo-600',
      details: {}
    };
    setRoadmap({
      ...roadmap,
      [type]: [...roadmap[type], newBlock]
    });
    openEditor('PHASE', newBlock);
  };

  const deleteBlock = (id: string, type: 'nutrition' | 'training') => {
    if (!roadmap) return;
    setRoadmap({
      ...roadmap,
      [type]: roadmap[type].filter(b => b.id !== id)
    });
    setIsSidebarOpen(false);
  };

  const updateMilestone = (updated: Milestone) => {
    if (!roadmap) return;
    setRoadmap({
      ...roadmap,
      milestones: roadmap.milestones.map(m => m.id === updated.id ? updated : m)
    });
    setEditTarget(updated);
  };

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" /></div>;
  if (!roadmap) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-display">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-8 scroll-smooth no-scrollbar">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
          
          {/* TOP SECTION: BREADCRUMBS & PROFILE */}
          <div className="flex flex-col gap-6">
            <nav className="flex items-center gap-2 text-sm font-semibold">
              <button 
                onClick={() => onNavigate('planning')}
                className="text-slate-400 hover:text-emerald-500 transition-colors"
              >
                Planning
              </button>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-slate-900 dark:text-white">{client?.name}</span>
            </nav>

            <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex items-center gap-5">
                <div 
                  className="w-16 h-16 rounded-full bg-cover bg-center shadow-sm border border-slate-100 dark:border-slate-800" 
                  style={{ backgroundImage: `url(${client?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'})` }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{client?.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                      Active
                    </span>
                    <span className="text-sm text-slate-400 font-medium ml-2">Female, 28 y.o.</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-all border border-slate-200 dark:border-slate-700 active:scale-95">
                  <Edit3 className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-all border border-slate-200 dark:border-slate-700 active:scale-95">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/10 active:scale-95 transition-all flex items-center gap-2 ml-2"
                >
                  <Save className="w-4 h-4" />
                  Sync Changes
                </button>
              </div>
            </div>

            <div 
              onClick={() => openEditor('PROGRAM', roadmap)}
              className="bg-emerald-500 text-white rounded-[16px] p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-emerald-600 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <PlayCircle className="w-5 h-5 opacity-80" />
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base">Program: {roadmap.status}</span>
                  <span className="text-sm font-medium text-white/80 hidden sm:inline opacity-80">| Week {roadmap.currentWeek} of {roadmap.totalWeeks} (Phase 2: Deficit)</span>
                </div>
              </div>
              <div className="text-sm font-semibold opacity-90 pr-2">
                Ends: {roadmap.endDate}
              </div>
            </div>
          </div>

          {/* MAIN GRID: 70/30 */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN: 70% */}
            <div className="w-full lg:w-[70%] flex flex-col gap-6">
              
              {/* MASTER ROADMAP PANEL */}
              <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <MapIcon className="w-5 h-5 text-emerald-500" />
                    Master Roadmap
                  </h3>
                  <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-semibold rounded-md">
                    {roadmap.totalWeeks} Weeks
                  </div>
                </div>

                <div className="relative w-full overflow-x-auto pb-6 no-scrollbar">
                  <div className="min-w-[1000px] relative">
                    {/* Week Numbers */}
                    <div className="flex justify-between px-2 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {Array.from({ length: roadmap.totalWeeks }).map((_, i) => (
                        <span key={i} className="w-[8%] text-center">W{i + 1}</span>
                      ))}
                    </div>

                    {/* Nutrition Track */}
                    <div className="relative bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nutrition</h4>
                        <button 
                          onClick={() => addBlock('nutrition')}
                          className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-1 h-10">
                        {roadmap.nutrition.map(block => (
                          <div 
                            key={block.id}
                            style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%` }}
                            className={`rounded-lg border flex items-center justify-center relative group cursor-pointer hover:border-emerald-300 transition-all ${block.color}`}
                            onClick={() => openEditor('PHASE', block)}
                          >
                            <span className="text-[11px] font-semibold truncate px-2">{block.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Training Track */}
                    <div className="relative bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Training</h4>
                        <button 
                          onClick={() => addBlock('training')}
                          className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-1 h-10">
                        {roadmap.training.map(block => (
                          <div 
                            key={block.id}
                            style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%` }}
                            className={`rounded-lg border flex items-center justify-center relative group cursor-pointer hover:border-emerald-300 transition-all ${block.color}`}
                            onClick={() => openEditor('PHASE', block)}
                          >
                            <span className="text-[11px] font-semibold truncate px-2">{block.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Today Line */}
                    <div 
                      className="absolute top-8 bottom-4 w-[1px] bg-emerald-500 z-10"
                      style={{ left: `${((roadmap.currentWeek - 0.5) / roadmap.totalWeeks) * 100}%` }}
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">TODAY</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* GOALS & PROGRESS SECTION */}
              <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 mb-6">
                  <Flag className="w-5 h-5 text-emerald-500" />
                  Goals & Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roadmap.goals.map(goal => (
                    <div key={goal.id} onClick={() => openEditor('GOAL', goal)} className="cursor-pointer group">
                      <GoalCard goal={goal} />
                    </div>
                  ))}
                </div>
              </div>

              {/* CHARTS SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                {/* Body Progress Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center justify-between">
                    Body Progress
                    <span className="text-[10px] text-emerald-500 font-semibold">-3.5 lbs</span>
                  </h3>
                  <div className="h-48 relative pt-2">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <polyline 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        points="0,20 20,30 40,45 60,60 80,55 100,70" 
                      />
                      {[0, 20, 40, 60, 80, 100].map((x, i) => (
                        <circle key={i} cx={x} cy={[20, 30, 45, 60, 55, 70][i]} r="1.5" className="fill-emerald-500" />
                      ))}
                    </svg>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-300 uppercase mt-4">
                       <span>W1</span><span>W2</span><span>W3</span><span className="text-emerald-500">W4</span><span>W5</span><span>W6</span>
                    </div>
                  </div>
                </div>

                {/* Strength Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center justify-between">
                    Strength (Squat 1RM)
                    <span className="text-[10px] text-indigo-500 font-semibold">+12kg</span>
                  </h3>
                  <div className="h-48 flex items-end justify-between gap-3 pt-2 px-1">
                    {[40, 50, 60, 75, 85, 95].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          style={{ height: `${h}%` }}
                          className={`w-full rounded-t-lg transition-all ${i === 3 ? 'bg-emerald-500 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'}`}
                        />
                        <span className={`text-[10px] font-semibold ${i === 3 ? 'text-emerald-500' : 'text-slate-300'}`}>W{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 30% */}
            <div className="w-full lg:w-[30%] flex flex-col gap-6">
              
              {/* STATUS WIDGET */}
              <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Current Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-500 font-medium">Weight</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{roadmap.stats.weight} <span className="text-xs font-medium text-slate-400">lbs</span></p>
                    <p className="text-[11px] text-emerald-500 font-semibold flex items-center">
                      <ArrowDown className="w-3 h-3 mr-1" /> {roadmap.stats.weightChange} lbs
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-500 font-medium">Adherence</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{roadmap.stats.adherence}%</p>
                    <p className="text-[11px] text-emerald-500 font-semibold flex items-center">
                      <ArrowUp className="w-3 h-3 mr-1" /> {roadmap.stats.adherenceChange}%
                    </p>
                  </div>
                </div>
              </div>

              {/* CURRENT PHASE ACTION CARD */}
              <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-emerald-500/10 ring-1 ring-emerald-500/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all cursor-pointer">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                   <RefreshCw className="w-20 h-20 text-emerald-500" />
                </div>
                <div className="relative z-10">
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest mb-3 inline-block">Current Phase</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">Deficit & Hypertrophy</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">Transitioning from maintenance to active deficit while maintaining training intensity.</p>
                  <div className="flex flex-col gap-2">
                    <button className="w-full py-2 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all">
                      <Apple className="w-4 h-4 text-emerald-500" />
                      Apply to Nutrition
                    </button>
                    <button className="w-full py-2 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all">
                      <Dumbbell className="w-4 h-4 text-emerald-500" />
                      Apply to Training
                    </button>
                  </div>
                </div>
              </div>

              {/* MILTESTONES */}
              <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2.5">
                  <History className="w-4 h-4 text-slate-400" />
                  Milestones
                </h3>
                <div className="space-y-6">
                  {roadmap.milestones.map((m, i) => (
                    <div 
                      key={m.id} 
                      onClick={() => openEditor('MILESTONE', m)}
                      className="relative pl-6 border-l border-slate-100 dark:border-slate-800 cursor-pointer group"
                    >
                      <div className={`absolute -left-[4.5px] top-1 w-2 h-2 rounded-full ${m.status === 'completed' ? 'bg-slate-300' : m.status === 'active' ? 'bg-emerald-500 ring-4 ring-emerald-500/10' : 'bg-white border-2 border-slate-200'}`}></div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${m.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>{m.date}</p>
                      <h4 className={`text-sm font-bold group-hover:text-emerald-500 transition-colors ${m.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{m.label}</h4>
                      {m.desc && <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{m.desc}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* RISKS ALERT */}
              <div 
                onClick={() => openEditor('RISKS', roadmap.risks)}
                className="bg-amber-50 dark:bg-amber-900/10 rounded-[16px] p-4 border border-amber-200 dark:border-amber-800/30 cursor-pointer hover:border-amber-400 transition-all active:scale-[0.99]"
              >
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-1">Identified Risks</h4>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                      {roadmap.risks || "No risks reported yet for this phase."}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* DYNAMIC SIDEBAR EDITOR */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                  <Edit3 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit {editContext}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Planning Editor</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-white rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              
              {/* --- PHASE EDITOR --- */}
              {editContext === 'PHASE' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Phase Title</label>
                    <input 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 outline-none font-semibold text-slate-900 dark:text-white transition-all"
                      value={editTarget.title}
                      onChange={(e) => updateBlock({ ...editTarget, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Start Week</label>
                      <input 
                        type="number"
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-emerald-500 outline-none font-bold text-slate-600 dark:text-slate-300"
                        value={editTarget.startWeek}
                        onChange={(e) => updateBlock({ ...editTarget, startWeek: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">End Week</label>
                      <input 
                        type="number"
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-emerald-500 outline-none font-bold text-slate-600 dark:text-slate-300"
                        value={editTarget.endWeek}
                        onChange={(e) => updateBlock({ ...editTarget, endWeek: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Color Style</label>
                    <div className="flex gap-2 flex-wrap">
                      {['blue', 'rose', 'amber', 'indigo', 'purple', 'emerald', 'teal'].map(c => (
                        <button 
                          key={c}
                          onClick={() => updateBlock({ ...editTarget, color: `bg-${c}-50/50 border-${c}-100 text-${c}-600` })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${editTarget.color.includes(c) ? 'ring-2 ring-emerald-500 ring-offset-2' : ''} bg-${c}-500`}
                        />
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteBlock(editTarget.id, editTarget.type)}
                    className="w-full py-3.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Phase
                  </button>
                </div>
              )}

              {/* --- GOAL EDITOR --- */}
              {editContext === 'GOAL' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Goal Label</label>
                    <input 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-border-light dark:border-border-dark focus:bg-white focus:border-emerald-500 outline-none font-bold text-slate-900 dark:text-white transition-all"
                      value={editTarget.label}
                      onChange={(e) => updateGoal({ ...editTarget, label: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Description</label>
                    <textarea 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-border-light dark:border-border-dark focus:border-emerald-500 outline-none font-medium text-slate-600 dark:text-slate-300 min-h-[100px] text-sm"
                      value={editTarget.desc}
                      onChange={(e) => updateGoal({ ...editTarget, desc: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Current</label>
                      <input 
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-border-light focus:border-emerald-500 outline-none font-bold text-slate-600 dark:text-slate-300"
                        value={editTarget.currentValue}
                        onChange={(e) => updateGoal({ ...editTarget, currentValue: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Target</label>
                      <input 
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-border-light focus:border-emerald-500 outline-none font-bold text-slate-600 dark:text-slate-300"
                        value={editTarget.targetValue}
                        onChange={(e) => updateGoal({ ...editTarget, targetValue: e.target.value })}
                      />
                    </div>
                  </div>
                   <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Adherence / Value (%)</label>
                    <input 
                      type="range"
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      value={editTarget.value}
                      onChange={(e) => updateGoal({ ...editTarget, value: parseInt(e.target.value) })}
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                      <span>0%</span>
                      <span className="text-emerald-500">{editTarget.value}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* --- MILESTONE EDITOR --- */}
              {editContext === 'MILESTONE' && (
                <div className="space-y-6">
                   <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Milestone Name</label>
                    <input 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-border-light focus:border-emerald-500 outline-none font-bold text-slate-900 dark:text-white transition-all"
                      value={editTarget.label}
                      onChange={(e) => updateMilestone({ ...editTarget, label: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Date</label>
                    <input 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-border-light focus:border-emerald-500 outline-none font-bold text-slate-600 dark:text-slate-300"
                      value={editTarget.date}
                      onChange={(e) => updateMilestone({ ...editTarget, date: e.target.value })}
                      placeholder="e.g. Nov 15"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Status</label>
                    <select 
                       className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-border-light focus:border-emerald-500 outline-none font-bold text-slate-600 appearance-none"
                       value={editTarget.status}
                       onChange={(e) => updateMilestone({ ...editTarget, status: e.target.value as any })}
                    >
                      <option value="completed">Completed</option>
                      <option value="active">Active (Next)</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Details</label>
                    <textarea 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-border-light focus:border-emerald-500 outline-none font-medium text-slate-600 dark:text-slate-300 min-h-[80px]"
                      value={editTarget.desc}
                      onChange={(e) => updateMilestone({ ...editTarget, desc: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* --- RISKS EDITOR --- */}
              {editContext === 'RISKS' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Performance Observations</label>
                    <textarea 
                      className="w-full px-6 py-5 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-100 dark:border-amber-900/40 focus:bg-white focus:border-amber-500 outline-none font-medium text-amber-900 dark:text-slate-300 min-h-[240px] leading-relaxed shadow-inner"
                      value={roadmap.risks}
                      onChange={(e) => setRoadmap({ ...roadmap, risks: e.target.value })}
                      placeholder="Identify potential blockers or report recent observations..."
                    />
                  </div>
                </div>
              )}

              {/* --- PROGRAM INFO EDITOR --- */}
              {editContext === 'PROGRAM' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Current Week</label>
                      <input 
                        type="number"
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-border-light focus:border-emerald-500 outline-none font-bold text-slate-600"
                        value={roadmap.currentWeek}
                        onChange={(e) => setRoadmap({ ...roadmap, currentWeek: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Total Weeks</label>
                      <input 
                        type="number"
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-border-light focus:border-emerald-500 outline-none font-bold text-slate-600"
                        value={roadmap.totalWeeks}
                        onChange={(e) => setRoadmap({ ...roadmap, totalWeeks: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Estimated End Date</label>
                    <div className="relative">
                      <input 
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-border-light focus:border-emerald-500 outline-none font-bold text-slate-600 pr-12"
                        value={roadmap.endDate}
                        onChange={(e) => setRoadmap({ ...roadmap, endDate: e.target.value })}
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    </div>
                  </div>
                </div>
              )}

            </div>

             {/* Footer Action */}
             <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Confirm Strategy
                </button>
             </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const Icon = goal.type === 'physical' ? Accessibility : 
               goal.type === 'nutrition' ? Utensils : 
               goal.type === 'training' ? Dumbbell : Brain;
  
  const colors = {
    physical: 'text-blue-500 bg-blue-50/50',
    nutrition: 'text-amber-500 bg-amber-50/50',
    training: 'text-purple-500 bg-purple-50/50',
    mindset: 'text-rose-500 bg-rose-50/50'
  };

  const progressColors = {
    physical: 'bg-blue-500',
    nutrition: 'bg-amber-500',
    training: 'bg-purple-500',
    mindset: 'bg-rose-500'
  };

  return (
    <div className="bg-slate-50/30 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50 hover:border-emerald-200 transition-all shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
          <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-50 dark:border-slate-700`}>
            <Icon className={`w-4 h-4 ${colors[goal.type]}`} />
          </div>
          {goal.label}
        </h4>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${colors[goal.type]}`}>
          {goal.value}%
        </span>
      </div>
      <p className="text-[11px] font-medium text-slate-500 mb-4 h-8 line-clamp-2 leading-relaxed">{goal.desc}</p>
      
      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-2.5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${goal.value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`${progressColors[goal.type]} h-full rounded-full`}
        />
      </div>
      
      <div className="flex justify-between text-[10px] font-semibold text-slate-400">
        <span>{goal.currentValue}</span>
        <span>Target: {goal.targetValue}</span>
      </div>
    </div>
  );
}
