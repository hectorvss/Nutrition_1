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
  Apple
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { useClient } from '../context/ClientContext';

// --- TYPES ---

interface Milestone {
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

// --- MOCK DATA GENERATOR ---
const getInitialData = (clientName: string): RoadmapData => ({
  status: 'LIVE',
  startDate: '2023-10-01',
  endDate: '2024-01-15',
  currentWeek: 5,
  totalWeeks: 12,
  nutrition: [
    { id: 'n1', title: 'Maintenance', startWeek: 1, endWeek: 4, type: 'nutrition', color: 'bg-blue-100 border-blue-200 text-blue-700', details: {} },
    { id: 'n2', title: 'Deficit (-500)', startWeek: 5, endWeek: 8, type: 'nutrition', color: 'bg-amber-100 border-amber-200 text-amber-700', details: {} },
    { id: 'n3', title: 'Maintenance', startWeek: 9, endWeek: 12, type: 'nutrition', color: 'bg-green-100 border-green-200 text-green-700', details: {} },
  ],
  training: [
    { id: 't1', title: 'Hypertrophy Base (4x)', startWeek: 1, endWeek: 6, type: 'training', color: 'bg-purple-100 border-purple-200 text-purple-700', details: {} },
    { id: 't2', title: 'Strength Peak (3x)', startWeek: 7, endWeek: 12, type: 'training', color: 'bg-rose-100 border-rose-200 text-rose-700', details: {} },
  ],
  goals: [
    { id: 'g1', type: 'physical', label: 'Physical', desc: 'Lose 10lbs fat, maintain muscle', value: 60, targetValue: '140 lbs', currentValue: '150 lbs' },
    { id: 'g2', type: 'nutrition', label: 'Nutrition', desc: 'Adherence to deficit macros', value: 85, targetValue: '90%+', currentValue: 'Consistent' },
    { id: 'g3', type: 'training', label: 'Training', desc: 'Complete all Hypertrophy sessions', value: 100, targetValue: '100%', currentValue: '16/16 sessions' },
    { id: 'g4', type: 'mindset', label: 'Mindset', desc: 'Improve sleep quality & stress', value: 70, targetValue: '7.5h+', currentValue: 'Avg 6.5h sleep' },
  ],
  milestones: [
    { date: 'Oct 01', label: 'Program Start', status: 'completed' },
    { date: 'Nov 15', label: 'Phase 2 Review', status: 'active', desc: 'Adjust deficit macros if plateaued' },
    { date: 'Dec 15', label: 'Begin Strength Peak', status: 'upcoming' },
    { date: 'Jan 15', label: 'Program End & Testing', status: 'upcoming' },
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
      if (data.data_json && data.data_json.goals) {
        setRoadmap({
          ...getInitialData(client?.name || 'Client'),
          ...data.data_json,
          status: data.status || 'LIVE'
        });
      } else {
        // Fallback to initial mock data if no dashboard data exists yet
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
      alert('Strategic Roadmap synchronized!');
    } catch (error) {
      console.error('Error saving roadmap:', error);
    }
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
            <nav className="flex items-center gap-2 text-sm font-bold">
              <button 
                onClick={() => onNavigate('planning')}
                className="text-slate-400 hover:text-emerald-500 transition-colors"
              >
                Planning
              </button>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-slate-900 dark:text-white">{client?.name}</span>
            </nav>

            <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex items-center gap-5">
                <div 
                  className="w-16 h-16 rounded-full bg-cover bg-center shadow-md border-2 border-white dark:border-slate-800" 
                  style={{ backgroundImage: `url(${client?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'})` }}
                />
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{client?.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                      Active Client
                    </span>
                    <span className="text-sm text-slate-400 font-bold ml-2">Female, 28 y.o.</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-all border border-slate-200 dark:border-slate-700 active:scale-95">
                  <Edit3 className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-all border border-slate-200 dark:border-slate-700 active:scale-95">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-3 bg-slate-900 dark:bg-emerald-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 ml-2"
                >
                  <Save className="w-4 h-4" />
                  Sync Dashboard
                </button>
              </div>
            </div>

            <div className="bg-emerald-500 text-white rounded-[20px] p-5 flex items-center justify-between shadow-xl shadow-emerald-500/20">
              <div className="flex items-center gap-4">
                <PlayCircle className="w-6 h-6 fill-white/20" />
                <div className="flex items-center gap-3">
                  <span className="font-black text-lg">Program: {roadmap.status}</span>
                  <span className="text-sm font-bold text-white/80 hidden sm:inline opacity-80">| Week {roadmap.currentWeek} of {roadmap.totalWeeks} (Phase 2: Deficit)</span>
                </div>
              </div>
              <div className="text-sm font-black uppercase tracking-widest opacity-80 pr-2">
                Ends: {roadmap.endDate}
              </div>
            </div>
          </div>

          {/* MAIN GRID: 70/30 */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN: 70% */}
            <div className="w-full lg:w-[72%] flex flex-col gap-8">
              
              {/* MASTER ROADMAP PANEL */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <MapIcon className="w-6 h-6 text-emerald-500" />
                    Master Strategic Roadmap
                  </h3>
                  <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-md">
                    {roadmap.totalWeeks} Weeks Timeline
                  </div>
                </div>

                <div className="relative w-full overflow-x-auto pb-6 no-scrollbar">
                  <div className="min-w-[1000px] relative">
                    {/* Week Numbers */}
                    <div className="flex justify-between px-2 mb-4 text-[11px] font-black text-slate-300 uppercase tracking-widest">
                      {Array.from({ length: roadmap.totalWeeks }).map((_, i) => (
                        <span key={i} className="w-[8%] text-center">W{i + 1}</span>
                      ))}
                    </div>

                    {/* Nutrition Track */}
                    <div className="relative bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50 mb-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Nutrition Strategy</h4>
                      <div className="flex gap-1.5 h-12">
                        {roadmap.nutrition.map(block => (
                          <div 
                            key={block.id}
                            style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%` }}
                            className={`rounded-xl border flex items-center justify-center relative group cursor-pointer hover:scale-[1.02] transition-all shadow-sm ${block.color}`}
                            onClick={() => { setSelectedBlock(block); setIsSidebarOpen(true); }}
                          >
                            <span className="text-[11px] font-black uppercase tracking-tight truncate px-2">{block.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Training Track */}
                    <div className="relative bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Training Periodization</h4>
                      <div className="flex gap-1.5 h-12">
                        {roadmap.training.map(block => (
                          <div 
                            key={block.id}
                            style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%` }}
                            className={`rounded-xl border flex items-center justify-center relative group cursor-pointer hover:scale-[1.02] transition-all shadow-sm ${block.color}`}
                            onClick={() => { setSelectedBlock(block); setIsSidebarOpen(true); }}
                          >
                            <span className="text-[11px] font-black uppercase tracking-tight truncate px-2">{block.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Today Line */}
                    <div 
                      className="absolute top-8 bottom-6 w-[2px] bg-emerald-500 z-10"
                      style={{ left: `${((roadmap.currentWeek - 0.5) / roadmap.totalWeeks) * 100}%` }}
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">TODAY</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* GOALS & PROGRESS SECTION */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-10">
                  <Flag className="w-6 h-6 text-emerald-500" />
                  Key Objectives & Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {roadmap.goals.map(goal => (
                    <div key={goal.id}>
                      <GoalCard goal={goal} />
                    </div>
                  ))}
                </div>
              </div>

              {/* CHARTS SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Body Progress Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8 flex items-center justify-between">
                    Body Weight Progress
                    <span className="text-[10px] text-emerald-500">-3.5 lbs this month</span>
                  </h3>
                  <div className="h-56 relative pt-4">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.5" className="text-slate-100 dark:text-slate-800" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-slate-100 dark:text-slate-800" />
                      <line x1="0" y1="80" x2="100" y2="80" stroke="currentColor" strokeWidth="0.5" className="text-slate-100 dark:text-slate-800" />
                      
                      {/* Line Chart */}
                      <polyline 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points="0,20 20,30 40,45 60,60 80,55 100,70" 
                      />
                      {/* Points */}
                      {[0, 20, 40, 60, 80, 100].map((x, i) => {
                        const y = [20, 30, 45, 60, 55, 70][i];
                        return (
                          <circle 
                            key={i}
                            cx={x} cy={y} r={x === 60 ? "3" : "2"} 
                            className={x === 60 ? "fill-white stroke-emerald-500 stroke-2 shadow-lg" : "fill-emerald-500"} 
                          />
                        );
                      })}
                    </svg>
                    {/* X-Axis */}
                    <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase mt-4">
                       <span>W1</span><span>W2</span><span>W3</span><span className="text-emerald-500">W4</span><span>W5</span><span>W6</span>
                    </div>
                  </div>
                </div>

                {/* Strength Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8 flex items-center justify-between">
                    Performance: Squat
                    <span className="text-[10px] text-indigo-500">+15kg improvement</span>
                  </h3>
                  <div className="h-56 flex items-end justify-between gap-4 pt-4 px-2">
                    {[40, 55, 65, 85, 70, 95].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3">
                        <div 
                          style={{ height: `${h}%` }}
                          className={`w-full rounded-t-xl transition-all duration-1000 ${i === 3 ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : i > 3 ? 'bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}
                        />
                        <span className={`text-[10px] font-black ${i === 3 ? 'text-emerald-500' : 'text-slate-300'}`}>W{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 30% */}
            <div className="w-full lg:w-[28%] flex flex-col gap-8">
              
              {/* STATUS WIDGET */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8">Metrics Summary</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Weight</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{roadmap.stats.weight} <span className="text-sm font-bold text-slate-400">lbs</span></p>
                      <p className="text-[11px] text-emerald-500 font-bold flex items-center mt-1">
                        <ArrowDown className="w-3 h-3 mr-1" /> {roadmap.stats.weightChange} lbs
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Adherence</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{roadmap.stats.adherence}<span className="text-sm font-bold text-slate-400">%</span></p>
                      <p className="text-[11px] text-emerald-500 font-bold flex items-center mt-1">
                        <ArrowUp className="w-3 h-3 mr-1" /> {roadmap.stats.adherenceChange}%
                      </p>
                    </div>
                  </div>
              </div>

              {/* CURRENT PHASE ACTION CARD */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-emerald-500/20 ring-1 ring-emerald-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                   <RefreshCw className="w-24 h-24 text-emerald-500" />
                </div>
                <div className="relative z-10">
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-[0.2em] mb-4 inline-block">Current Phase</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">Deficit & Hypertrophy Focus</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">Maintain strength volume while sustaining a metabolic deficit to maximize body composition.</p>
                  <div className="flex flex-col gap-3">
                    <button className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-xs font-black text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 transition-all hover:border-emerald-200">
                      <Apple className="w-4 h-4 text-emerald-500" />
                      SYNC NUTRITION PLAN
                    </button>
                    <button className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-xs font-black text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 transition-all hover:border-emerald-200">
                      <Dumbbell className="w-4 h-4 text-emerald-500" />
                      SYNC TRAINING BLOCK
                    </button>
                  </div>
                </div>
              </div>

              {/* MILESTONES TIMELINE */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                  <History className="w-5 h-5 text-emerald-500" />
                  Strategic Milestones
                </h3>
                <div className="space-y-8 pl-4 border-l-2 border-slate-100 dark:border-slate-800 relative">
                  {roadmap.milestones.map((m, i) => (
                    <div key={i} className="relative pl-8">
                      <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${m.status === 'completed' ? 'bg-slate-300' : m.status === 'active' ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-white ring-2 ring-slate-100'}`}></div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${m.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>{m.date}</p>
                      <h4 className={`text-[13px] font-black ${m.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{m.label}</h4>
                      {m.desc && <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{m.desc}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* RISKS ALERT */}
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-[32px] p-6 border border-amber-100 dark:border-amber-900/30">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-800 flex items-center justify-center text-amber-600 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-900 dark:text-amber-500 mb-1">Identified Performance Risks</h4>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed font-medium">
                      {roadmap.risks}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const Icon = goal.type === 'physical' ? Accessibility : 
               goal.type === 'nutrition' ? Utensils : 
               goal.type === 'training' ? Dumbbell : Brain;
  
  const colors = {
    physical: 'text-blue-500 bg-blue-50',
    nutrition: 'text-amber-500 bg-amber-50',
    training: 'text-purple-500 bg-purple-50',
    mindset: 'text-rose-500 bg-rose-50'
  };

  const progressColors = {
    physical: 'bg-blue-500',
    nutrition: 'bg-amber-500',
    training: 'bg-purple-500',
    mindset: 'bg-rose-500'
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Icon className={`w-5 h-5 ${colors[goal.type]}`} />
          {goal.label}
        </h4>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${colors[goal.type]}`}>
          {goal.value}%
        </span>
      </div>
      <p className="text-[11px] text-slate-500 font-bold mb-4 uppercase tracking-widest opacity-60">{goal.desc}</p>
      
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${goal.value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`${progressColors[goal.type]} h-full rounded-full`}
        />
      </div>
      
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>{goal.currentValue}</span>
        <span>Target: {goal.targetValue}</span>
      </div>
    </div>
  );
}
