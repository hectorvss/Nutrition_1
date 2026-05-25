import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  PlayCircle as PlayIcon,
  Map as MapIcon,
  Utensils as NutritionIcon,
  Dumbbell as TrainingIcon,
  Brain as MindsetIcon,
  Scale as ScaleIcon,
  Sparkles,
  Target as TargetIcon,
  CheckCircle2 as CheckIcon,
  StickyNote as NoteIcon,
  Activity as ActivityIcon,
} from 'lucide-react';
import { fetchWithAuth } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

// --- TYPES ---

interface BlockStrat {
  summary?: string;
  primaryObjective?: string;
  secondaryObjectives?: string[];
  kpis?: string[];
  successCriteria?: string[];
  coachNotes?: string;
  risksAndConstraints?: string[];
  // Nutrition
  kcal?: string;
  macros?: string;
  freq?: string;
  water?: string;
  // Training
  trainingFocus?: string;
  trainingVolume?: string;
  trainingIntensity?: string;
  cardio?: string;
  sessions?: string;
  deload?: string;
  intensityTargets?: string[];
}

interface RoadmapBlock {
  id: string;
  title: string;
  startWeek: number;
  endWeek: number;
  type: 'nutrition' | 'training';
  color: string;
  strat: BlockStrat;
  // Flat fields kept for backward compatibility with the timeline pill.
  kcal?: string;
  macros?: string;
  water?: string;
  focus?: string;
  sessions?: string;
  intensity?: string;
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
  goals: Goal[];
  assumptions: {
    steps: string;
    sleep: string;
    constraints: string;
  };
}

// --- EMPTY SCAFFOLD ---
// No mock data: a client without a published roadmap sees a real empty state.
const getEmptyData = (): RoadmapData => ({
  status: 'Empty',
  startDate: '',
  endDate: '',
  currentWeek: 1,
  totalWeeks: 12,
  nutrition: [],
  training: [],
  goals: [],
  assumptions: { steps: '', sleep: '', constraints: '' }
});

// The manager editor (PlanningDetail) saves blocks with `colorToken` + a
// `stratData` object plus partial legacy fields. This view renders a slightly
// different shape (`color`, `intensity`, `tempo`, `timing`, `micros`, ...).
// Normalize both schemas here so whatever the coach saved is actually shown.
const normalizeBlock = (b: any): RoadmapBlock => {
  const s = b.stratData || {};
  const strat: BlockStrat = {
    summary: s.summary ?? b.rationale ?? '',
    primaryObjective: s.primaryObjective ?? b.scope ?? '',
    secondaryObjectives: Array.isArray(s.secondaryObjectives) ? s.secondaryObjectives : (Array.isArray(b.timing) ? b.timing : []),
    kpis: Array.isArray(s.kpis) ? s.kpis : [],
    successCriteria: Array.isArray(s.successCriteria) ? s.successCriteria : [],
    coachNotes: s.coachNotes ?? '',
    risksAndConstraints: Array.isArray(s.risksAndConstraints) ? s.risksAndConstraints : [],
    kcal: s.kcal ?? b.kcal,
    macros: s.macros ?? b.macros,
    freq: s.freq ?? b.freq,
    water: s.water ?? b.water,
    trainingFocus: s.trainingFocus ?? b.focus,
    trainingVolume: s.trainingVolume ?? b.loading,
    trainingIntensity: s.trainingIntensity ?? b.intensity,
    cardio: s.cardio,
    sessions: s.sessions ?? b.sessions,
    deload: s.deload,
    intensityTargets: Array.isArray(s.intensityTargets) ? s.intensityTargets : [],
  };
  return {
    id: b.id,
    title: b.title || '',
    startWeek: b.startWeek ?? 1,
    endWeek: b.endWeek ?? 1,
    type: b.type,
    color: b.color || b.colorToken || 'bg-slate-50 border-slate-100 text-slate-600',
    strat,
    kcal: strat.kcal,
    macros: strat.macros,
    water: strat.water,
    focus: strat.trainingFocus,
    sessions: strat.sessions,
    intensity: strat.trainingIntensity,
  };
};

const normalizeGoal = (g: any): Goal => ({
  id: g.id,
  type: g.type,
  label: g.label || '',
  desc: g.desc || '',
  value: typeof g.value === 'number' ? g.value : 0,
  targetValue: g.targetValue ?? g.targetLabel ?? '',
  currentValue: g.currentValue ?? g.currentLabel ?? '',
});

export default function ClientRoadmap() {
  const { t } = useLanguage();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedNutritionId, setSelectedNutritionId] = useState<string | null>(null);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);

  const loadRoadmap = async () => {
    setLoadError(null);
    try {
      const data = await fetchWithAuth('/client/roadmap');
      // Backend returns a record with a `data_json` column (or a default
      // { data_json: {...}, status: 'Empty' } object when none exists).
      const rawJson = data?.data_json
        ? (typeof data.data_json === 'string' ? JSON.parse(data.data_json) : data.data_json)
        : null;

      const empty = getEmptyData();
      // Fall back to the row's created_at / updated_at as the roadmap
      // "start date" when the manager hasn't set one explicitly inside
      // data_json. Without this, safeCurrentWeek had no anchor and the
      // progress marker stayed frozen at week 1 forever — the manager
      // would have had to manually update `currentWeek` for the bar to
      // move. Now the marker auto-progresses one week per real week.
      const rowStartFallback = data?.created_at || data?.updated_at || null;
      const roadmapData: RoadmapData = rawJson
        ? {
            ...empty,
            ...rawJson,
            // Record-level status overrides any stale status inside data_json.
            status: data?.status || rawJson.status || empty.status,
            // Preserve the manager-set start date when available; otherwise
            // use when the roadmap row was first saved on the server.
            startDate: rawJson.startDate || rawJson.start_date || rawJson.activatedAt || rawJson.activated_at || rowStartFallback,
            nutrition: Array.isArray(rawJson.nutrition) ? rawJson.nutrition.map(normalizeBlock) : [],
            training: Array.isArray(rawJson.training) ? rawJson.training.map(normalizeBlock) : [],
            goals: Array.isArray(rawJson.goals) ? rawJson.goals.map(normalizeGoal) : [],
            totalWeeks: rawJson.totalWeeks || empty.totalWeeks,
            currentWeek: rawJson.currentWeek || empty.currentWeek,
          }
        : empty;

      setRoadmap(roadmapData);

      const currentWeek = roadmapData.currentWeek || 1;
      const currentNut = roadmapData.nutrition.find(b => currentWeek >= b.startWeek && currentWeek <= b.endWeek);
      const currentTra = roadmapData.training.find(b => currentWeek >= b.startWeek && currentWeek <= b.endWeek);

      setSelectedNutritionId(currentNut?.id || roadmapData.nutrition[0]?.id || null);
      setSelectedTrainingId(currentTra?.id || roadmapData.training[0]?.id || null);
    } catch (error: unknown) {
      // fetchWithAuth throws on non-ok responses. Surface a real error
      // state instead of silently showing invented data.
      console.error('Error loading roadmap:', error);
      const msg = error instanceof Error ? error.message : String(error);
      setLoadError(msg || t('error_loading_data', { defaultValue: 'Error loading data' }));
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, []);

  const activeNutrition = useMemo(() => roadmap?.nutrition.find(b => b.id === selectedNutritionId), [roadmap, selectedNutritionId]);
  const activeTraining = useMemo(() => roadmap?.training.find(b => b.id === selectedTrainingId), [roadmap, selectedTrainingId]);

  // A roadmap with no phases — OR one still in Draft status — is treated as
  // "not yet published": the client should not see unfinished coach drafts.
  const isDraftStatus = !!roadmap && /draft|empty/i.test(roadmap.status || '');
  const isEmptyRoadmap = !!roadmap &&
    (isDraftStatus || (roadmap.nutrition.length === 0 && roadmap.training.length === 0));
  const safeTotalWeeks = (roadmap && roadmap.totalWeeks > 0) ? roadmap.totalWeeks : 12;
  // Real-time "today" position: if the manager provided a start date for the
  // roadmap (or we know when it was activated), compute the current week
  // from that instead of relying on the stale stored `currentWeek`. Falls
  // back to the stored value when no date is known.
  const safeCurrentWeek = (() => {
    const startStr = (roadmap as any)?.startDate
      || (roadmap as any)?.start_date
      || (roadmap as any)?.activatedAt
      || (roadmap as any)?.activated_at;
    if (startStr) {
      const start = new Date(startStr).getTime();
      if (!Number.isNaN(start)) {
        const daysElapsed = (Date.now() - start) / (24 * 60 * 60 * 1000);
        const wk = Math.floor(daysElapsed / 7) + 1;
        return Math.min(Math.max(wk, 1), safeTotalWeeks);
      }
    }
    return (roadmap && typeof roadmap.currentWeek === 'number' && roadmap.currentWeek > 0)
      ? Math.min(roadmap.currentWeek, safeTotalWeeks)
      : 1;
  })();
  // Position inside the current week (0..1) so the "today" line drifts day
  // by day instead of jumping in weekly steps. If we don't know the start
  // date we centre it in the middle of the week (0.5).
  const dayProgress = (() => {
    const startStr = (roadmap as any)?.startDate
      || (roadmap as any)?.start_date
      || (roadmap as any)?.activatedAt
      || (roadmap as any)?.activated_at;
    if (!startStr) return 0.5;
    const start = new Date(startStr).getTime();
    if (Number.isNaN(start)) return 0.5;
    const daysElapsed = (Date.now() - start) / (24 * 60 * 60 * 1000);
    return Math.max(0, Math.min(1, (daysElapsed / 7) - Math.floor(daysElapsed / 7)));
  })();

  if (loading) return (
    <div className="p-10 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium italic">{t('loading_your_planning')}</p>
      </div>
    </div>
  );
  if (loadError) return (
    <div className="p-10 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="material-symbols-outlined text-5xl text-rose-400">error</span>
        <p className="text-sm font-medium text-rose-500">{loadError}</p>
        <button
          onClick={() => { setLoading(true); loadRoadmap(); }}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors"
        >
          {t('retry', { defaultValue: 'Retry' })}
        </button>
      </div>
    </div>
  );

  if (!roadmap) return null;

  if (isEmptyRoadmap) return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-950 gap-4 p-10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
        <MapIcon className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('strategic_roadmap')}</h2>
      <p className="text-sm text-slate-500 max-w-sm">
        {t('roadmap_not_ready', { defaultValue: 'Your coach has not published a strategic roadmap yet. It will appear here once it is ready.' })}
      </p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth no-scrollbar">
        <div className="max-w-[1440px] mx-auto space-y-6">
          
          {/* 1. Header Area */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
              <div className="w-16 h-16 rounded-2xl bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54]">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">{t('your_clinical_strategy')}</p>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{t('strategic_roadmap')}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Decorative status badge — flat span, not a button-shaped div
                  with cursor-default that misled users into clicking. */}
              <span className="bg-[#17cf54] px-5 py-3 rounded-2xl text-white inline-flex items-center gap-3 shadow-lg shadow-[#17cf54]/20 font-bold text-xs tracking-widest uppercase">
                <PlayIcon className="w-5 h-5 fill-white/20" />
                <span>{t('status')}: {roadmap.status}</span>
              </span>
            </div>
          </div>

          {/* Master Roadmap */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
             <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <MapIcon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">{t('timeline_architecture')}</h3>
            </div>

            {/* Timeline now fits the container width — no more horizontal
                slider. The labels and bars share the same flex distribution,
                so the layout scales to whatever weekly horizon the plan has. */}
            <div className="pb-6 relative">
              <div className="space-y-6 relative">
                 <div className="flex px-4 text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                  {Array.from({ length: safeTotalWeeks }).map((_, i) => (
                    <span key={i} style={{ width: `${100 / safeTotalWeeks}%` }} className={`text-center ${i + 1 === safeCurrentWeek ? 'text-[#17cf54] font-black' : ''}`}>{t('planning_week_label_short', { week: i + 1 })}</span>
                  ))}
                </div>

                {/* Today indicator — drifts day by day inside the current
                    week when we know the real plan start date; otherwise it
                    sits at the centre of the stored current week. */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-[#17cf54] z-20 pointer-events-none"
                  style={{ left: `${(Math.min(Math.max(safeCurrentWeek, 1), safeTotalWeeks) - 1 + dayProgress) / safeTotalWeeks * 100}%` }}
                >
                  <div className="absolute top-0 -translate-x-1/2 bg-[#17cf54] text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg shadow-emerald-500/20 tracking-tighter uppercase leading-none">{t('today')}</div>
                </div>

                <div className="space-y-4 px-2">
                  <div className="flex items-center gap-8">
                    <div className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('nutrition')}</div>
                    <div className="flex-1 flex gap-1 h-12 relative">
                      {roadmap.nutrition.map(block => (
                        <motion.div 
                          key={block.id}
                          layoutId={block.id}
                          style={{ width: `${((block.endWeek - block.startWeek + 1) / safeTotalWeeks) * 100}%` }}
                          onClick={() => setSelectedNutritionId(block.id)}
                          className={`border rounded-2xl flex items-center justify-center text-xs font-bold cursor-pointer transition-all relative ${block.color} ${selectedNutritionId === block.id ? 'ring-2 ring-[#17cf54] shadow-md z-10' : 'opacity-80 hover:opacity-100'}`}
                        >
                          {block.title}
                          {selectedNutritionId === block.id && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#17cf54] rotate-45" />}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('training')}</div>
                    <div className="flex-1 flex gap-1 h-12 relative">
                      {roadmap.training.map(block => (
                        <motion.div 
                          key={block.id}
                          layoutId={block.id}
                          style={{ width: `${((block.endWeek - block.startWeek + 1) / safeTotalWeeks) * 100}%` }}
                          onClick={() => setSelectedTrainingId(block.id)}
                          className={`border rounded-2xl flex items-center justify-center text-xs font-bold cursor-pointer transition-all relative ${block.color} ${selectedTrainingId === block.id ? 'ring-2 ring-[#17cf54] shadow-md z-10' : 'opacity-80 hover:opacity-100'}`}
                        >
                          {block.title}
                          {selectedTrainingId === block.id && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#17cf54] rotate-45" />}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active block detail — mirrors the manager's BlockStrategyEditor cards
              but read-only and stripped of "AI-templated" copy. */}
          <BlockDetailCard
            nutrition={activeNutrition}
            training={activeTraining}
            currentWeek={safeCurrentWeek}
            t={t}
          />


          {/* Goals */}
          {roadmap.goals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmap.goals.map(goal => (
              <div key={goal.id} className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <span className={`text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 ${goal.type === 'physical' ? 'text-blue-500' : goal.type === 'nutrition' ? 'text-amber-500' : goal.type === 'training' ? 'text-purple-500' : 'text-rose-500'}`}>
                    {goal.type === 'physical' ? <ScaleIcon className="w-5 h-5" /> : goal.type === 'nutrition' ? <NutritionIcon className="w-5 h-5" /> : goal.type === 'training' ? <TrainingIcon className="w-5 h-5" /> : <MindsetIcon className="w-5 h-5" />}
                    {goal.type === 'physical' ? t('physical') : goal.type === 'nutrition' ? t('nutrition') : goal.type === 'training' ? t('training') : t('mindset')}
                  </span>
                  <span className={`text-[11px] font-bold px-3 py-1.5 rounded-xl ${goal.type === 'physical' ? 'bg-blue-50 text-blue-600 shadow-blue-500/5' : goal.type === 'nutrition' ? 'bg-amber-50 text-amber-600 shadow-amber-500/5' : goal.type === 'training' ? 'bg-purple-50 text-purple-600 shadow-purple-500/5' : 'bg-rose-50 text-rose-600 shadow-rose-500/5'}`}>{goal.value}%</span>
                </div>
                <p className="text-xl font-bold mb-1">{goal.label}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-6">{goal.desc}</p>
                <div className="mt-auto h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.value}%` }}
                    transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                    className={`h-full rounded-full shadow-lg ${goal.type === 'physical' ? 'bg-blue-500' : goal.type === 'nutrition' ? 'bg-amber-500' : goal.type === 'training' ? 'bg-purple-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
          )}

          <div className="h-12"></div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Block detail — read-only mirror of the manager's BlockStrategyEditor card.
// Two columns (Nutrición | Entrenamiento), each with primary objective, key
// prescription chips, success criteria bullets and coach notes. Empty rows
// are omitted instead of rendering "—" placeholders.
// ---------------------------------------------------------------------------

interface BlockDetailCardProps {
  nutrition?: RoadmapBlock;
  training?: RoadmapBlock;
  currentWeek: number;
  t: (key: string, vars?: any) => string;
}

const hasText = (v?: string | null) => !!(v && String(v).trim().length > 0);
const hasList = (v?: string[] | null) => Array.isArray(v) && v.some(x => hasText(x));

function BlockDetailCard({ nutrition, training, currentWeek, t }: BlockDetailCardProps) {
  if (!nutrition && !training) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center text-sm text-slate-400">
        {t('client_roadmap_no_active_block', { defaultValue: 'No hay un bloque activo en esta semana.' })}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <ActivityIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('client_roadmap_current_phase', { defaultValue: 'Fase actual' })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('planning_week_number', { week: currentWeek, defaultValue: `Semana ${currentWeek}` })}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-widest">
          {t('planning_active_phase', { defaultValue: 'Activa' })}
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BlockPanel
          accent="amber"
          icon={<NutritionIcon className="w-4 h-4" />}
          sectionLabel={t('nutrition', { defaultValue: 'Nutrición' })}
          block={nutrition}
          emptyLabel={t('client_roadmap_no_nutrition_block', { defaultValue: 'Sin bloque de nutrición asignado.' })}
          t={t}
        />
        <BlockPanel
          accent="purple"
          icon={<TrainingIcon className="w-4 h-4" />}
          sectionLabel={t('training', { defaultValue: 'Entrenamiento' })}
          block={training}
          emptyLabel={t('client_roadmap_no_training_block', { defaultValue: 'Sin bloque de entrenamiento asignado.' })}
          t={t}
        />
      </div>
    </div>
  );
}

interface BlockPanelProps {
  accent: 'amber' | 'purple';
  icon: React.ReactNode;
  sectionLabel: string;
  block?: RoadmapBlock;
  emptyLabel: string;
  t: (key: string, vars?: any) => string;
}

function BlockPanel({ accent, icon, sectionLabel, block, emptyLabel, t }: BlockPanelProps) {
  const accentText = accent === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-purple-600 dark:text-purple-400';
  const accentSoftBg = accent === 'amber' ? 'bg-amber-50/60 dark:bg-amber-900/10' : 'bg-purple-50/60 dark:bg-purple-900/10';
  const accentBorder = accent === 'amber' ? 'border-amber-100 dark:border-amber-900/30' : 'border-purple-100 dark:border-purple-900/30';
  const accentDot = accent === 'amber' ? 'bg-amber-500' : 'bg-purple-500';

  if (!block) {
    return (
      <div className={`rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2`}>
        <div className={accentText}>{icon}</div>
        <span className="font-semibold uppercase tracking-widest">{sectionLabel}</span>
        <p className="text-[11px] text-slate-400 normal-case tracking-normal">{emptyLabel}</p>
      </div>
    );
  }

  const s = block.strat;
  const isNutrition = block.type === 'nutrition';

  // Build the prescription chips — only those with real values.
  const chips: { label: string; value: string }[] = [];
  if (isNutrition) {
    if (hasText(s.kcal)) chips.push({ label: 'kcal', value: `${s.kcal}` });
    if (hasText(s.macros)) chips.push({ label: t('macros', { defaultValue: 'Macros' }), value: `${s.macros}` });
    if (hasText(s.freq)) chips.push({ label: t('planning_meal_freq', { defaultValue: 'Comidas' }), value: `${s.freq}` });
    if (hasText(s.water)) chips.push({ label: t('water', { defaultValue: 'Agua' }), value: `${s.water}` });
  } else {
    if (hasText(s.trainingFocus)) chips.push({ label: t('block_focus', { defaultValue: 'Foco' }), value: `${s.trainingFocus}` });
    if (hasText(s.trainingVolume)) chips.push({ label: t('planning_volume_sets', { defaultValue: 'Volumen' }), value: `${s.trainingVolume}` });
    if (hasText(s.trainingIntensity)) chips.push({ label: t('intensity', { defaultValue: 'Intensidad' }), value: `${s.trainingIntensity}` });
    if (hasText(s.sessions)) chips.push({ label: t('sessions_per_week', { defaultValue: 'Sesiones' }), value: `${s.sessions}` });
    else if (hasText(s.cardio)) chips.push({ label: t('planning_cardio', { defaultValue: 'Cardio' }), value: `${s.cardio}` });
  }

  return (
    <motion.div
      key={block.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 overflow-hidden flex flex-col"
    >
      {/* Sub-header */}
      <div className={`px-5 py-4 border-b border-slate-200 dark:border-slate-800 ${accentSoftBg} flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={accentText}>{icon}</span>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${accentText}`}>{sectionLabel}</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
          {t('planning_week_range_short', { start: block.startWeek, end: block.endWeek, defaultValue: `S${block.startWeek}–S${block.endWeek}` })}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Title */}
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{block.title}</h4>
          {hasText(s.summary) && (
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.summary}</p>
          )}
        </div>

        {/* Prescription chips */}
        {chips.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {chips.map((c, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-3 py-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{c.label}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Primary objective */}
        {hasText(s.primaryObjective) && (
          <div>
            <h5 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-1.5">
              <TargetIcon className="w-3.5 h-3.5" />
              {t('planning_primary_objective', { defaultValue: 'Objetivo principal' })}
            </h5>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{s.primaryObjective}</p>
          </div>
        )}

        {/* KPIs */}
        {hasList(s.kpis) && (
          <div>
            <h5 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
              {t('planning_kpis_short', { defaultValue: 'KPIs' })}
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {s.kpis!.filter(hasText).map((k, i) => (
                <span key={i} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40">
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Success criteria */}
        {hasList(s.successCriteria) && (
          <div>
            <h5 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-1.5">
              <CheckIcon className="w-3.5 h-3.5" />
              {t('planning_success_criteria', { defaultValue: 'Criterios de éxito' })}
            </h5>
            <ul className="space-y-1.5">
              {s.successCriteria!.filter(hasText).map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${accentDot}`} />
                  <span className="leading-snug">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Secondary objectives */}
        {hasList(s.secondaryObjectives) && (
          <div>
            <h5 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
              {t('planning_secondary_objectives', { defaultValue: 'Objetivos secundarios' })}
            </h5>
            <ul className="space-y-1.5">
              {s.secondaryObjectives!.filter(hasText).map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${accentDot} opacity-70`} />
                  <span className="leading-snug">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Coach notes */}
        {hasText(s.coachNotes) && (
          <div className={`rounded-xl border ${accentBorder} ${accentSoftBg} px-4 py-3`}>
            <h5 className={`text-[10px] font-bold mb-1 uppercase tracking-widest flex items-center gap-1.5 ${accentText}`}>
              <NoteIcon className="w-3.5 h-3.5" />
              {t('client_roadmap_coach_notes', { defaultValue: 'Notas del coach' })}
            </h5>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{s.coachNotes}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
