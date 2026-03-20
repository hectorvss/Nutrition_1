import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  PlayCircle as PlayIcon,
  Map as MapIcon,
  Flag,
  Accessibility,
  Utensils as NutritionIcon,
  Dumbbell as TrainingIcon,
  Brain as MindsetIcon,
  History as HistoryIcon,
  AlertTriangle as WarningIcon,
  TrendingUp as GrowthIcon,
  Scale as ScaleIcon,
  Sparkles,
  Zap as ZapIcon,
  Sticker,
  Moon,
  Footprints,
  Droplets,
  Activity
} from 'lucide-react';
import { fetchWithAuth } from '../../api';

// --- TYPES ---

interface RoadmapBlock {
  id: string;
  title: string;
  startWeek: number;
  endWeek: number;
  type: 'nutrition' | 'training';
  color: string;
  details: any;
}

interface IntelligenceSection {
  nutrition: {
    kcal: string;
    macros: string;
    deficit: string;
    water: string;
    rationale: string;
    timing: string[];
    micros: { label: string; value: string }[];
  };
  training: {
    focus: string;
    sessions: string;
    intensity: string;
    tempo: string;
    loading: string;
    scope: string;
    recovery: string;
  };
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
  intelligence: IntelligenceSection;
  goals: Goal[];
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
    { id: 'n1', title: 'Maintenance', startWeek: 1, endWeek: 4, type: 'nutrition', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600', details: {} },
    { id: 'n2', title: 'Deficit (-500)', startWeek: 5, endWeek: 8, type: 'nutrition', color: 'bg-amber-50 dark:bg-amber-900/30 border-emerald-500 border-y border-x-2 text-amber-700', details: {} },
    { id: 'n3', title: 'Maintenance', startWeek: 9, endWeek: 12, type: 'nutrition', color: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-600', details: {} },
  ],
  training: [
    { id: 't1', title: 'Hypertrophy Base (4x)', startWeek: 1, endWeek: 6, type: 'training', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-600', details: {} },
    { id: 't2', title: 'Strength Peak (3x)', startWeek: 7, endWeek: 12, type: 'training', color: 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800 text-rose-600', details: {} },
  ],
  intelligence: {
    nutrition: {
      kcal: '2,150',
      macros: '40/30/30',
      deficit: '-500',
      water: '3.5',
      rationale: 'Calculated -500kcal deficit targeting ~1lb/week fat loss. This moderate approach preserves metabolic flexibility while maximizing the 4-week hypertrophy block\'s protein turnover rate.',
      timing: [
        'Pre: 30g Protein / 40g Complex Carbs (90m prior)',
        'Intra: 10g EAAs + Electrolyte blend during lifting',
        'Post: 40g Whey / 50g Simple Carbs (within 60m)'
      ],
      micros: [
        { label: 'Magnesium', value: '400mg Glycinate (PM)' },
        { label: 'Vitamin D3+K2', value: '5000 IU (AM)' },
        { label: 'Omega-3', value: '2g EPA/DHA Daily' },
        { label: 'Zinc', value: '15mg for recovery' }
      ]
    },
    training: {
      focus: 'Hypertrophy',
      sessions: '4 Lift Days',
      intensity: 'RPE 7-9',
      tempo: '3-0-1-0',
      loading: 'Linear Periodization: Increase load by 2-5% weekly on primary compounds. Secondary movements focus on increasing total reps (8-12 range).',
      scope: 'Emphasis on Posterior Chain (Squat/DL) and Horizontal Pressing. Multi-joint exercises account for 70% of weekly working sets.',
      recovery: 'Automatic deload at Week 4. Reduce volume by 50% and intensity (RPE) to 5. Prioritize sleep hygiene (>7.5h nightly).'
    }
  },
  goals: [
    { id: 'g1', type: 'physical', label: 'Weight: 140 lbs', desc: 'Lose 10lbs fat, maintain muscle', value: 60, targetValue: '140 lbs', currentValue: '150 lbs' },
    { id: 'g2', type: 'nutrition', label: 'Adherence: 90%+', desc: 'Daily macro tracking accuracy', value: 85, targetValue: '90%+', currentValue: 'Consistent' },
    { id: 'g3', type: 'training', label: 'Frequency: 4x/wk', desc: 'Complete all hypertrophy sessions', value: 100, targetValue: '100%', currentValue: '16/16 sessions' },
    { id: 'g4', type: 'mindset', label: 'Sleep: 7.5h+', desc: 'Consistent sleep/wake hygiene', value: 70, targetValue: '7.5h+', currentValue: 'Avg 6.5h sleep' },
  ],
  assumptions: {
    steps: '10,000 - 12,000',
    sleep: '7.5 hours minimum',
    constraints: 'Dairy-free, prefers higher morning protein.'
  }
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
      if (data.data_json && data.data_json.intelligence) {
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#112116] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth no-scrollbar">
        <div className="max-w-[1200px] mx-auto space-y-6 text-slate-900 dark:text-slate-100">
          
          {/* 1. Header Section */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-[#17cf54]">Strategy Roadmap</h1>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Focus</p>
                <h2 className="text-2xl font-bold">Phase 2: Progressive Overload & Deficit</h2>
              </div>

              <div className="flex items-center gap-4 bg-[#17cf54] text-white px-5 py-3 rounded-2xl shadow-sm">
                <PlayIcon className="w-6 h-6 opacity-80" />
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none mb-1">Status: {roadmap.status}</span>
                  <span className="text-sm font-medium opacity-90">Week {roadmap.currentWeek} of {roadmap.totalWeeks}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Master Roadmap */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-[#17cf54]" />
              Master Roadmap
            </h3>

            <div className="overflow-x-auto pb-4 no-scrollbar">
              <div className="min-w-[1000px] space-y-4">
                <div className="flex justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} className={`w-1/12 text-center ${i + 1 >= 5 && i + 1 <= 8 ? 'text-[#17cf54] font-black' : ''}`}>W{i + 1}</span>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Nutrition</div>
                  <div className="flex-1 flex gap-1 h-10">
                    {roadmap.nutrition.map(block => (
                      <div 
                        key={block.id}
                        style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                        className={`border rounded-lg flex items-center justify-center text-[11px] font-bold relative ${block.color}`}
                      >
                        {block.title}
                        {block.title.includes('Deficit') && (
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#17cf54] rotate-45" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Training</div>
                  <div className="flex-1 flex gap-1 h-10">
                    {roadmap.training.map(block => (
                      <div 
                        key={block.id}
                        style={{ width: `${((block.endWeek - block.startWeek + 1) / 12) * 100}%` }}
                        className={`border rounded-lg flex items-center justify-center text-[11px] font-bold ${block.color}`}
                      >
                        {block.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. The Intelligence Board */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-50/50 dark:bg-slate-800/40 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54]">
                  <MindsetIcon className="w-5 h-5 fill-[#17cf54]/10" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-sm">The Intelligence Board</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Active Phase: Nutrition Deficit • Weeks 5-8</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#17cf54]/10 text-[#17cf54] border border-[#17cf54]/20 uppercase tracking-widest">Live Strategy</span>
            </div>

            <div className="p-6 space-y-10">
              {/* Nutrition Strategy */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-amber-600">
                  <NutritionIcon className="w-4 h-4" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest">Nutrition Strategy</h4>
                  <div className="flex-1 h-px bg-amber-100 dark:bg-amber-900/30"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target Daily Intake</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">{roadmap.intelligence.nutrition.kcal}</span>
                      <span className="text-[10px] font-bold text-amber-600 uppercase">KCAL</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Daily Macro Split</p>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold">{roadmap.intelligence.nutrition.macros}</span>
                      <span className="text-[9px] text-slate-400 uppercase font-medium">P / C / F %</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target Deficit</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-amber-600">{roadmap.intelligence.nutrition.deficit}</span>
                      <span className="text-[10px] font-bold text-amber-600">KCAL/DAY</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Water Target</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">{roadmap.intelligence.nutrition.water}</span>
                      <span className="text-[10px] font-bold text-blue-500 font-black uppercase">Liters</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <ZapIcon className="w-4 h-4 text-amber-400" /> Metabolic Rationale
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100/50">
                        {roadmap.intelligence.nutrition.rationale}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <HistoryIcon className="w-4 h-4 text-amber-400" /> Nutrient Timing
                      </h5>
                      <ul className="space-y-3 text-sm">
                        {roadmap.intelligence.nutrition.timing.map((item, i) => (
                          <li key={i} className="flex items-start gap-4 text-slate-600 dark:text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-[#17cf54] mt-1.5 shrink-0"></span>
                            <span className="font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sticker className="w-4 h-4 text-amber-400" /> Micronutrient Focus
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {roadmap.intelligence.nutrition.micros.map((m, i) => (
                        <div key={i} className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{m.label}</p>
                          <p className="text-sm font-bold">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

              {/* Training Strategy */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-purple-600">
                  <TrainingIcon className="w-4 h-4" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest">Training Strategy</h4>
                  <div className="flex-1 h-px bg-purple-100 dark:bg-purple-900/30"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Block Focus</p>
                    <span className="text-xl font-bold">{roadmap.intelligence.training.focus}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sessions / Week</p>
                    <span className="text-xl font-bold">{roadmap.intelligence.training.sessions}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target Intensity</p>
                    <span className="text-xl font-bold text-purple-600 font-black">{roadmap.intelligence.training.intensity}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tempo Protocol</p>
                    <span className="text-xl font-bold">{roadmap.intelligence.training.tempo}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                    <h5 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
                      <GrowthIcon className="w-4 h-4" /> Loading Strategy
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {roadmap.intelligence.training.loading}
                    </p>
                  </div>
                  <div className="p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                    <h5 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Anatomical Scope
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {roadmap.intelligence.training.scope}
                    </p>
                  </div>
                  <div className="p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                    <h5 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
                      <Moon className="w-4 h-4" /> Recovery Protocol
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {roadmap.intelligence.training.recovery}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* 4. Goals & Targets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmap.goals.map(goal => (
              <div key={goal.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${goal.type === 'physical' ? 'text-blue-500' : goal.type === 'nutrition' ? 'text-amber-500' : goal.type === 'training' ? 'text-purple-500' : 'text-rose-500'}`}>
                    {goal.type === 'physical' ? <ScaleIcon className="w-4 h-4" /> : goal.type === 'nutrition' ? <NutritionIcon className="w-4 h-4" /> : goal.type === 'training' ? <TrainingIcon className="w-4 h-4" /> : <MindsetIcon className="w-4 h-4" />}
                    {goal.type}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${goal.type === 'physical' ? 'bg-blue-50 text-blue-600' : goal.type === 'nutrition' ? 'bg-amber-50 text-amber-600' : goal.type === 'training' ? 'bg-purple-50 text-purple-600' : 'bg-rose-50 text-rose-600'}`}>{goal.value}%</span>
                </div>
                <p className="text-base font-bold mb-1">{goal.label}</p>
                <p className="text-xs text-slate-500 font-medium mb-5">{goal.desc}</p>
                <div className="mt-auto h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.value}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={`h-full rounded-full shadow-sm ${goal.type === 'physical' ? 'bg-blue-500' : goal.type === 'nutrition' ? 'bg-amber-500' : goal.type === 'training' ? 'bg-purple-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 5. Progress & Projections Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-4">
            <div className="bg-white dark:bg-slate-900 rounded-[28px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-sm font-bold uppercase tracking-widest">Body Progress Forecast</h3>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">UNIT: LBS</span>
              </div>
              <div className="h-48 w-full relative">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M 0 20 L 20 28 L 40 45 L 60 62 L 80 58 L 100 75" fill="none" stroke="#17cf54" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                  <circle cx="0" cy="20" fill="#17cf54" r="3" />
                  <circle cx="20" cy="28" fill="#17cf54" r="3" />
                  <circle cx="40" cy="45" fill="#17cf54" r="3" />
                  <circle cx="60" cy="62" fill="white" r="5" stroke="#17cf54" strokeWidth="2.5" />
                  <circle cx="80" cy="58" fill="#17cf54" opacity="0.4" r="2" />
                  <circle cx="100" cy="75" fill="#17cf54" opacity="0.4" r="2" />
                </svg>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-8 px-2 tracking-widest">
                  <span>W1</span><span>W2</span><span>W3</span><span className="text-[#17cf54] font-black">W4 (NOW)</span><span>W5</span><span>W6</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[28px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-sm font-bold uppercase tracking-widest">Strength Growth Projection</h3>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">METRIC: VOLUME</span>
              </div>
              <div className="h-48 w-full flex items-end gap-4 px-2">
                <div className="flex-1 bg-purple-100 dark:bg-purple-900/20 rounded-t-xl h-[40%]"></div>
                <div className="flex-1 bg-purple-200 dark:bg-purple-900/30 rounded-t-xl h-[55%]"></div>
                <div className="flex-1 bg-purple-300 dark:bg-purple-900/40 rounded-t-xl h-[65%]"></div>
                <div className="flex-1 bg-[#17cf54] rounded-t-xl h-[80%] shadow-[0_-8px_20px_rgba(23,207,84,0.3)] ring-1 ring-[#17cf54]/30 transition-all duration-1000"></div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-t-xl h-[85%] border-t-2 border-dashed border-slate-300 dark:border-slate-700"></div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-t-xl h-[95%] border-t-2 border-dashed border-slate-300 dark:border-slate-700"></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-8 px-4 tracking-widest">
                <span>W1</span><span>W2</span><span>W3</span><span className="text-[#17cf54] font-black">W4</span><span>W5</span><span>W6</span>
              </div>
            </div>
          </div>

          {/* 6. Assumptions & Variables */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                <WarningIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Assumptions & Variables</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Daily Step Target</label>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold flex items-center gap-3">
                  <Footprints className="w-5 h-5 text-[#17cf54]" />
                  {roadmap.assumptions.steps}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Sleep Hygiene Goal</label>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold flex items-center gap-3">
                  <Moon className="w-5 h-5 text-blue-500" />
                  {roadmap.assumptions.sleep}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Dietary Constraints</label>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-amber-500" />
                  <span className="line-clamp-1">{roadmap.assumptions.constraints}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-8"></div>
        </div>
      </div>

    </div>
  );
}
