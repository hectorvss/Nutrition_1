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
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Your Master Roadmap</h1>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.3em] opacity-80">Elite Athletic Progression Strategy</p>
            </div>

            <div className="bg-emerald-500 text-white rounded-[24px] p-6 flex items-center justify-between shadow-2xl shadow-emerald-500/20">
              <div className="flex items-center gap-5">
                <PlayCircle className="w-8 h-8 fill-white/20" />
                <div className="flex flex-col">
                  <span className="font-black text-xl leading-none mb-1">Status: {roadmap.status}</span>
                  <span className="text-sm font-bold text-white/80 opacity-90">Week {roadmap.currentWeek} of {roadmap.totalWeeks} (Phase 2: Deficit)</span>
                </div>
              </div>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Target End Date</span>
                <span className="font-black text-lg">{roadmap.endDate}</span>
              </div>
            </div>
          </div>

          {/* MAIN GRID: 70/30 */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN: 72% */}
            <div className="w-full lg:w-[72%] flex flex-col gap-8">
              
              {/* MASTER ROADMAP PANEL */}
              <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-5 transition-opacity duration-1000">
                   <MapIcon className="w-80 h-80 text-emerald-500" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-12">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-100">
                        <MapIcon className="w-6 h-6" />
                      </div>
                      Strategic Progression
                    </h3>
                    <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-black rounded-xl border border-slate-100 dark:border-slate-800/50 uppercase tracking-widest">
                       12 Week Full Cycle
                    </div>
                  </div>

                  <div className="relative w-full overflow-x-auto pb-8 no-scrollbar">
                    <div className="min-w-[1000px] relative">
                      {/* Week Numbers */}
                      <div className="flex justify-between px-2 mb-6 text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">
                        {Array.from({ length: roadmap.totalWeeks }).map((_, i) => (
                          <span key={i} className="w-[8%] text-center">W{i + 1}</span>
                        ))}
                      </div>

                      {/* Tracks */}
                      <div className="space-y-6">
                        {/* Nutrition */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-[28px] p-6 border border-slate-100/50 dark:border-slate-800/50">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 ml-2">Nutrition Phases</h4>
                          <div className="flex gap-2 h-14">
                            {roadmap.nutrition.map(block => (
                              <div 
                                key={block.id}
                                style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%` }}
                                className={`rounded-[20px] border-2 flex items-center justify-center relative shadow-sm ${block.color} border-white dark:border-slate-800`}
                              >
                                <span className="text-xs font-black uppercase tracking-tighter truncate px-4">{block.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Training */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-[28px] p-6 border border-slate-100/50 dark:border-slate-800/50">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 ml-2">Training Blocks</h4>
                          <div className="flex gap-2 h-14">
                            {roadmap.training.map(block => (
                              <div 
                                key={block.id}
                                style={{ width: `${((block.endWeek - block.startWeek + 1) / roadmap.totalWeeks) * 100}%` }}
                                className={`rounded-[20px] border-2 flex items-center justify-center relative shadow-sm ${block.color} border-white dark:border-slate-800`}
                              >
                                <span className="text-xs font-black uppercase tracking-tighter truncate px-4">{block.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Today Marker */}
                      <div 
                        className="absolute top-10 bottom-8 w-1 bg-emerald-500 z-10 shadow-lg shadow-emerald-500/20"
                        style={{ left: `${((roadmap.currentWeek - 0.5) / roadmap.totalWeeks) * 100}%` }}
                      >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-xl">CURRENT WEEK</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OBJECTIVES GRID */}
              <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-100">
                    <Flag className="w-6 h-6" />
                  </div>
                  Goals & Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {roadmap.goals.map(goal => (
                    <div key={goal.id}>
                      <GoalCard goal={goal} />
                    </div>
                  ))}
                </div>
              </div>

              {/* PROGRESS CHARTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                {/* Weight Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-1">Weight Evolution</h3>
                      <p className="text-[11px] text-slate-400 font-bold">Consistently trending downwards</p>
                    </div>
                    <span className="text-[11px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">-3.5 lbs</span>
                  </div>
                  <div className="h-60 relative">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path 
                        d="M0,20 Q20,30 40,45 T100,70" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        className="drop-shadow-lg"
                      />
                      {[0, 25, 50, 75, 100].map((x, i) => (
                        <circle key={i} cx={x} cy={[20, 28, 52, 60, 70][i]} r="3" className="fill-white stroke-emerald-500 stroke-2" />
                      ))}
                    </svg>
                    <div className="flex justify-between text-[11px] font-black text-slate-300 uppercase mt-6 tracking-widest">
                       <span>W1</span><span>W2</span><span>W3</span><span className="text-emerald-500 font-black">W4</span><span>W5</span>
                    </div>
                  </div>
                </div>

                {/* Strength Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-1">Strength: Squat 1RM</h3>
                      <p className="text-[11px] text-slate-400 font-bold">Projected path vs actual performance</p>
                    </div>
                    <span className="text-[11px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">+15kg</span>
                  </div>
                  <div className="h-60 flex items-end justify-between gap-5 px-2">
                    {[45, 55, 62, 80, 72, 95].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-4">
                        <div 
                          style={{ height: `${h}%` }}
                          className={`w-full rounded-t-2xl transition-all duration-1000 ${i === 3 ? 'bg-emerald-500 shadow-xl shadow-emerald-500/20' : i > 3 ? 'bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700' : 'bg-indigo-400 opacity-20'}`}
                        />
                        <span className={`text-[11px] font-black ${i === 3 ? 'text-emerald-500' : 'text-slate-300'}`}>W{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 28% */}
            <div className="w-full lg:w-[28%] flex flex-col gap-8">
              
              {/* CURRENT PHASE CARD */}
              <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 border border-emerald-500/20 ring-1 ring-emerald-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                   <RefreshCw className="w-32 h-32 text-emerald-500" />
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl uppercase tracking-[0.25em] mb-6 inline-block shadow-sm">Current Phase</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter leading-none">Deficit & Hypertrophy</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 opacity-80">Transitioning to active metabolic deficit while maintaining lifting intensity to preserve lean mass.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Wt</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{roadmap.stats.weight} <span className="text-[10px] text-slate-400 font-bold">lbs</span></p>
                     </div>
                     <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Adherence</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{roadmap.stats.adherence}<span className="text-[10px] text-slate-400 font-bold">%</span></p>
                     </div>
                  </div>
                </div>
              </div>

              {/* MILTESTONES */}
              <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-4">
                  <History className="w-5 h-5 text-emerald-500" />
                  Your Timeline
                </h3>
                <div className="space-y-10 pl-5 border-l-2 border-slate-100 dark:border-slate-800 relative ml-2">
                  {roadmap.milestones.map((m, i) => (
                    <div key={i} className="relative pl-10">
                      <div className={`absolute -left-[45px] top-1.5 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 shadow-md ${m.status === 'completed' ? 'bg-slate-300' : m.status === 'active' ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-white ring-2 ring-slate-50'}`}></div>
                      <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${m.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>{m.date}</p>
                      <h4 className={`text-[15px] font-black tracking-tight ${m.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{m.label}</h4>
                      {m.desc && <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed opacity-70">{m.desc}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* RISKS/WARNING */}
              <div className="bg-amber-500/10 dark:bg-amber-900/10 rounded-[40px] p-8 border border-amber-500/20 shadow-inner">
                <div className="flex gap-5">
                  <div className="w-14 h-14 rounded-3xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-amber-900 dark:text-amber-500 mb-2 leading-tight">Priority Performance Riscks</h4>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed font-bold italic">
                      "Coach Note: {roadmap.risks}"
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
    physical: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
    nutrition: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
    training: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10',
    mindset: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10'
  };

  const progressColors = {
    physical: 'bg-blue-500',
    nutrition: 'bg-amber-500',
    training: 'bg-purple-500',
    mindset: 'bg-rose-500'
  };

  return (
    <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800/50 shadow-inner">
      <div className="flex justify-between items-center mb-5">
        <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${colors[goal.type]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {goal.label}
        </h4>
        <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm ${colors[goal.type]}`}>
          {goal.value}%
        </div>
      </div>
      <p className="text-[11px] text-slate-400 font-black mb-6 uppercase tracking-widest opacity-60 ml-1">{goal.desc}</p>
      
      <div className="w-full bg-white dark:bg-slate-800 rounded-full h-3 mb-4 shadow-inner p-0.5 border border-slate-100 dark:border-slate-700/50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${goal.value}%` }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          className={`${progressColors[goal.type]} h-full rounded-full shadow-lg`}
        />
      </div>
      
      <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
        <span className="text-slate-900 dark:text-slate-300">{goal.currentValue}</span>
        <span className="opacity-40">Target: {goal.targetValue}</span>
      </div>
    </div>
  );
}
