import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
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
  Sparkles,
  ChevronRight,
  Apple
} from 'lucide-react';
import { fetchWithAuth } from '../../api';

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

// --- MOCK DATA GENERATOR ---
const getInitialData = (): RoadmapData => ({
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
  risks: 'Reported poor sleep quality last week. Monitor recovery during this higher volume training phase.'
});

export default function ClientRoadmap() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const data = await fetchWithAuth('/client/roadmap');
      if (data.data_json && data.data_json.goals) {
        setRoadmap({
          ...getInitialData(),
          ...data.data_json,
          status: data.status || 'LIVE'
        });
      } else {
        setRoadmap(getInitialData());
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
      setRoadmap(getInitialData());
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" /></div>;
  if (!roadmap) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-display">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-8 scroll-smooth no-scrollbar">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Strategy Roadmap</h1>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest opacity-80">Phase 2: Progressive Overload & Deficit</p>
            </div>

            <div className="bg-emerald-500 text-white rounded-[20px] p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <PlayCircle className="w-6 h-6 opacity-80" />
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none mb-1">Status: {roadmap.status}</span>
                  <span className="text-sm font-medium text-white/80 opacity-90">Week {roadmap.currentWeek} of {roadmap.totalWeeks} (Phase 2: Deficit)</span>
                </div>
              </div>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Program End Date</span>
                <span className="font-bold text-base">{roadmap.endDate}</span>
              </div>
            </div>
          </div>

          {/* MAIN GRID: 70/30 */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN: 70% */}
            <div className="w-full lg:w-[70%] flex flex-col gap-6">
              
              {/* MASTER ROADMAP PANEL */}
              <div className="bg-white dark:bg-slate-900 rounded-[20px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] transition-opacity">
                   <MapIcon className="w-80 h-80 text-emerald-500" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/5 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-100">
                        <MapIcon className="w-5 h-5" />
                      </div>
                      Program Timeline
                    </h3>
                    <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg border border-slate-100 dark:border-slate-800 uppercase tracking-widest">
                       {roadmap.totalWeeks} Week Cycle
                    </div>
                  </div>

                  <div className="relative w-full overflow-x-auto pb-8 no-scrollbar">
                    <div className="min-w-[1000px] relative">
                      {/* Week Numbers */}
                      <div className="flex justify-between px-2 mb-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        {Array.from({ length: roadmap.totalWeeks }).map((_, i) => (
                          <span key={i} className="w-[8%] text-center">W{i + 1}</span>
                        ))}
                      </div>

                      {/* Tracks */}
                      <div className="space-y-4">
                        {/* Nutrition */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Nutrition Focus</h4>
                          <div className="flex gap-1.5 h-12">
                            {roadmap.nutrition.map(block => (
                              <div 
                                key={block.id}
                                style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%` }}
                                className={`rounded-xl border flex items-center justify-center relative shadow-sm ${block.color} border-white/50 dark:border-slate-800`}
                              >
                                <span className="text-[11px] font-bold uppercase tracking-tight truncate px-3">{block.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Training */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Training Block</h4>
                          <div className="flex gap-1.5 h-12">
                            {roadmap.training.map(block => (
                              <div 
                                key={block.id}
                                style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%` }}
                                className={`rounded-xl border flex items-center justify-center relative shadow-sm ${block.color} border-white/50 dark:border-slate-800`}
                              >
                                <span className="text-[11px] font-bold uppercase tracking-tight truncate px-3">{block.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Today Marker */}
                      <div 
                        className="absolute top-10 bottom-8 w-[1px] bg-emerald-500 z-10 shadow-sm"
                        style={{ left: `${((roadmap.currentWeek - 0.5) / roadmap.totalWeeks) * 100}%` }}
                      >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">TODAY</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OBJECTIVES GRID */}
              <div className="bg-white dark:bg-slate-900 rounded-[20px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 bg-emerald-500/5 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-100">
                    <Flag className="w-5 h-5" />
                  </div>
                  Daily Objectives
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {roadmap.goals.map(goal => (
                    <div key={goal.id}>
                      <GoalCard goal={goal} />
                    </div>
                  ))}
                </div>
              </div>

              {/* PROGRESS CHARTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
                {/* Weight Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-[20px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-1">Weight Evolution</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Consistently trending downwards</p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">-3.5 lbs</span>
                  </div>
                  <div className="h-48 relative">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <polyline 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        points="0,20 20,30 40,45 60,60 80,55 100,70" 
                      />
                      {[0, 20, 40, 60, 80, 100].map((x, i) => (
                        <circle key={i} cx={x} cy={[20, 30, 45, 60, 55, 70][i]} r="1.5" className="fill-emerald-500" />
                      ))}
                    </svg>
                    <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase mt-6 tracking-widest">
                       <span>W1</span><span>W2</span><span>W3</span><span className="text-emerald-500 font-bold">W4</span><span>W5</span>
                    </div>
                  </div>
                </div>

                {/* Strength Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-[20px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-1">Strength (Squat 1RM)</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Projected progression</p>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">+12kg</span>
                  </div>
                  <div className="h-48 flex items-end justify-between gap-4 px-1">
                    {[40, 50, 65, 80, 75, 95].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3">
                        <div 
                          style={{ height: `${h}%` }}
                          className={`w-full rounded-t-xl transition-all duration-1000 ${i === 3 ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' : i > 3 ? 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700' : 'bg-indigo-300 opacity-20'}`}
                        />
                        <span className={`text-[10px] font-bold ${i === 3 ? 'text-emerald-500' : 'text-slate-300'}`}>W{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 30% */}
            <div className="w-full lg:w-[30%] flex flex-col gap-8">
              
              {/* STATUS SUMMARY */}
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Performance Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Weight</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{roadmap.stats.weight} <span className="text-[10px] text-slate-400 font-bold">lbs</span></p>
                      <p className="text-[11px] text-emerald-500 font-bold flex items-center mt-1">
                        <ArrowDown className="w-3 h-3 mr-1" /> {roadmap.stats.weightChange} lbs
                      </p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Adherence</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{roadmap.stats.adherence}<span className="text-[10px] text-slate-400 font-bold">%</span></p>
                      <p className="text-[11px] text-emerald-500 font-bold flex items-center mt-1">
                        <ArrowUp className="w-3 h-3 mr-1" /> {roadmap.stats.adherenceChange}%
                      </p>
                   </div>
                </div>
              </div>

              {/* CURRENT PHASE CARD */}
              <div className="bg-white dark:bg-slate-900 rounded-[28px] p-8 shadow-sm border border-emerald-500/10 ring-1 ring-emerald-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                   <RefreshCw className="w-24 h-24 text-emerald-500" />
                </div>
                <div className="relative z-10">
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest mb-5 inline-block shadow-sm">Current Focus</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-none">Deficit & Hypertrophy</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-10 opacity-80">Transitioning to active metabolic deficit while maintaining lifting intensity to preserve lean mass.</p>
                  
                  <div className="flex flex-col gap-3">
                     <button className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-[11px] font-bold text-slate-700 dark:text-slate-200 rounded-xl border border-slate-100 dark:border-slate-700 transition-all flex items-center justify-center gap-2">
                        <Apple className="w-4 h-4 text-emerald-500" />
                        VIEW NUTRITION PLAN
                     </button>
                     <button className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-[11px] font-bold text-slate-700 dark:text-slate-200 rounded-xl border border-slate-100 dark:border-slate-700 transition-all flex items-center justify-center gap-2">
                        <Dumbbell className="w-4 h-4 text-emerald-500" />
                        VIEW TRAINING PLAN
                     </button>
                  </div>
                </div>
              </div>

              {/* MILTESTONES */}
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-10 flex items-center gap-3">
                  <History className="w-4 h-4 text-slate-400" />
                  Key Milestones
                </h3>
                <div className="space-y-8 pl-5 border-l border-slate-100 dark:border-slate-800 relative ml-1">
                  {roadmap.milestones.map((m, i) => (
                    <div key={m.id} className="relative pl-8">
                      <div className={`absolute -left-[24.5px] top-1 w-2 h-2 rounded-full ${m.status === 'completed' ? 'bg-slate-300' : m.status === 'active' ? 'bg-emerald-500 ring-4 ring-emerald-500/10' : 'bg-white border-2 border-slate-100'}`}></div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${m.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>{m.date}</p>
                      <h4 className={`text-sm font-bold tracking-tight ${m.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{m.label}</h4>
                      {m.desc && <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-relaxed opacity-80">{m.desc}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* RISKS/WARNING */}
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-[24px] p-6 border border-amber-100 dark:border-amber-900/40">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-amber-500/10">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-500 mb-1 leading-tight">Coach's Risk Assessment</h4>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed font-semibold italic">
                      "{roadmap.risks}"
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
    physical: 'text-blue-500 bg-blue-50/50 dark:bg-blue-500/10',
    nutrition: 'text-amber-500 bg-amber-50/50 dark:bg-amber-500/10',
    training: 'text-purple-500 bg-purple-50/50 dark:bg-purple-500/10',
    mindset: 'text-rose-500 bg-rose-50/50 dark:bg-rose-500/10'
  };

  const progressColors = {
    physical: 'bg-blue-500',
    nutrition: 'bg-amber-500',
    training: 'bg-purple-500',
    mindset: 'bg-rose-500'
  };

  return (
    <div className="bg-slate-50/30 dark:bg-slate-800/20 rounded-[20px] p-6 border border-slate-100/50 dark:border-slate-800/50 shadow-inner">
      <div className="flex justify-between items-center mb-5">
        <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-50 dark:border-slate-750`}>
            <Icon className="w-4 h-4" />
          </div>
          {goal.label}
        </h4>
        <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${colors[goal.type]}`}>
          {goal.value}%
        </div>
      </div>
      <p className="text-[11px] text-slate-400 font-bold mb-5 uppercase tracking-widest opacity-60 ml-0.5">{goal.desc}</p>
      
      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-3 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${goal.value}%` }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          className={`${progressColors[goal.type]} h-full rounded-full shadow-sm`}
        />
      </div>
      
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 px-0.5">
        <span className="text-slate-700 dark:text-slate-300">{goal.currentValue}</span>
        <span className="opacity-40">Target: {goal.targetValue}</span>
      </div>
    </div>
  );
}
