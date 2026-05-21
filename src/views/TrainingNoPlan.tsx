import React, { useState } from 'react';
import { useClient } from '../context/ClientContext';
import { motion } from 'motion/react';
import { fetchWithAuth } from '../api';
import { unwrapList } from '../api/unwrap';
import { PROGRAM_TEMPLATES } from '../constants/training_presets';
import { trainingPrograms } from '../constants/training';
import { useLanguage } from '../context/LanguageContext';

interface TrainingNoPlanProps {
  client: any;
  onBack: () => void;
  onStartPlan: (preset?: any, initialPlanData?: any) => void;
}
const PRESETS = [
  {
    id: 'strength_start',
    title: 'Fuerza Start',
    level: 'Beginner',
    levelColor: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900',
    type: 'Full Body',
    desc: 'Foundation strength program focusing on compound lifts.',
    intensity: { label: 'Low', pct: 30, color: 'bg-emerald-400' },
    volume: { label: 'Medium', pct: 50, color: 'bg-blue-400' },
    tags: [
      { icon: 'calendar_today', text: '3x / week' },
      { icon: 'timer', text: '45 min' },
      { icon: 'fitness_center', text: 'Strength' }
    ],
    scheduleLabel: 'Mon, Wed, Fri active',
    schedule: ['M', null, 'W', null, 'F', null, null],
    freqValue: '3x',
    focusValue: 'Full Body Strength',
    recommended: ['Not Set']
  },
  {
    id: 'strength_regular',
    title: 'Fuerza Regular',
    level: 'Intermediate',
    levelColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    type: 'Split',
    desc: 'Upper/Lower split designed for intermediate lifters.',
    intensity: { label: 'Moderate', pct: 60, color: 'bg-amber-400' },
    volume: { label: 'High', pct: 70, color: 'bg-blue-500' },
    tags: [
      { icon: 'calendar_today', text: '4x / week' },
      { icon: 'timer', text: '60 min' },
      { icon: 'arrow_upward', text: 'Upper/Lower' }
    ],
    scheduleLabel: '4 days active',
    schedule: ['M', 'T', null, 'T', 'F', null, null],
    freqValue: '4x',
    focusValue: 'Full Body Strength',
    recommended: ['Weight Loss']
  },
  {
    id: 'strength_pro',
    title: 'Fuerza Pro',
    level: 'Advanced',
    levelColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    type: 'Hybrid',
    desc: 'High frequency training with specialized blocks.',
    intensity: { label: 'High', pct: 80, color: 'bg-red-400' },
    volume: { label: 'Max', pct: 90, color: 'bg-purple-500' },
    tags: [
      { icon: 'calendar_today', text: '5x / week' },
      { icon: 'timer', text: '75 min' },
      { icon: 'horizontal_split', text: 'PPL' }
    ],
    scheduleLabel: 'Weekdays active',
    schedule: ['M', 'T', 'W', 'T', 'F', null, null],
    freqValue: '5x',
    focusValue: 'Full Body Strength',
    recommended: []
  },
  {
    id: 'p4',
    title: 'Pérdida de Grasa',
    level: 'High Intensity',
    levelColor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900',
    type: 'Cardio',
    desc: 'Metabolic conditioning mixed with strength circuits.',
    intensity: { label: 'Very High', pct: 90, color: 'bg-orange-500' },
    volume: { label: 'High', pct: 75, color: 'bg-blue-500' },
    tags: [
      { icon: 'calendar_today', text: '4x / week' },
      { icon: 'bolt', text: 'Cardio & Strength' },
      { icon: 'directions_run', text: 'HIIT' }
    ],
    scheduleLabel: '4 days active',
    schedule: ['M', 'T', null, 'T', 'F', null, null],
    freqValue: '4x',
    focusValue: 'Endurance',
    recommended: ['Weight Loss']
  },
  {
    id: 'hypertrophy_volume',
    title: 'Hipertrofia',
    level: 'Volume',
    levelColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    type: 'Growth',
    desc: 'Maximal hypertrophy focus with moderate intensity.',
    intensity: { label: 'Moderate', pct: 65, color: 'bg-amber-400' },
    volume: { label: 'Very High', pct: 95, color: 'bg-purple-500' },
    tags: [
      { icon: 'calendar_today', text: '5x / week' },
      { icon: 'timer', text: '60 min' },
      { icon: 'expand', text: 'High Volume' }
    ],
    scheduleLabel: 'Weekdays active',
    schedule: ['M', 'T', 'W', 'T', 'F', null, null],
    freqValue: '5x',
    focusValue: 'Hypertrophy',
    recommended: ['Muscle Gain']
  },
  {
    id: 'mobility_recovery',
    title: 'Movilidad & Recuperación',
    level: 'Restorative',
    levelColor: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900',
    type: 'Mobility',
    desc: 'Improve flexibility and joint health.',
    intensity: { label: 'Low', pct: 20, color: 'bg-teal-400' },
    volume: { label: 'Low', pct: 30, color: 'bg-teal-400' },
    tags: [
      { icon: 'calendar_today', text: '3x / week' },
      { icon: 'self_improvement', text: 'Mobility' },
      { icon: 'spa', text: 'Yoga' }
    ],
    scheduleLabel: '3 days active',
    schedule: ['M', 'W', 'F'],
    freqValue: '3x',
    focusValue: 'Mobility',
    recommended: ['Maintenance']
  },
  {
    id: 'p7',
    title: 'Resistencia',
    level: 'Endurance',
    levelColor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900',
    type: 'Endurance',
    desc: 'Sustained activity training to improve cardiovascular health.',
    intensity: { label: 'Moderate', pct: 60, color: 'bg-amber-400' },
    volume: { label: 'High', pct: 85, color: 'bg-blue-500' },
    tags: [
      { icon: 'calendar_today', text: '4x / week' },
      { icon: 'speed', text: 'High Volume' },
      { icon: 'sprint', text: 'Running' }
    ],
    scheduleLabel: '4 days active',
    schedule: ['M', 'T', 'T', 'F'],
    freqValue: '4x',
    focusValue: 'Endurance',
    recommended: ['Performance']
  }
];

// Canonical weekday spread per weekly frequency. A variant simply redistributes
// the template's workouts across these days so the chosen frequency actually
// changes the real training structure (not just a metadata label).
const FREQ_DAY_SPREAD: Record<number, string[]> = {
  2: ['monday', 'thursday'],
  3: ['monday', 'wednesday', 'friday'],
  4: ['monday', 'tuesday', 'thursday', 'friday'],
  5: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  6: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
};

// Build a weeklySchedule (day -> workoutId) by spreading the workout list
// across `freq` training days, cycling if there are fewer workouts than days.
function buildWeeklySchedule(workouts: any[], freq: number): Record<string, string> {
  const days = FREQ_DAY_SPREAD[freq] || FREQ_DAY_SPREAD[3];
  const sched: Record<string, string> = {};
  if (!workouts.length) return sched;
  days.forEach((d, i) => { sched[d] = workouts[i % workouts.length].id; });
  return sched;
}

// Intensity adjustment — re-tunes every MAIN-block exercise so the chosen
// intensity actually changes the training stimulus instead of being a label.
// Low = more reps in reserve + longer rest (easier); High = closer to failure
// + shorter rest. Warm-up and cooldown blocks are left untouched.
type IntensityLevel = 'low' | 'moderate' | 'high';
const INTENSITY_CFG: Record<IntensityLevel, { rir: number; rest: number }> = {
  low: { rir: 1, rest: 15 },
  moderate: { rir: 0, rest: 0 },
  high: { rir: -1, rest: -15 },
};
function applyIntensity(dataJson: any, level: IntensityLevel): any {
  const cfg = INTENSITY_CFG[level] || INTENSITY_CFG.moderate;
  if (cfg.rir === 0 && cfg.rest === 0) return dataJson;
  const adjRir = (v: any) => {
    if (v === null || v === undefined || v === '') return v;
    const n = parseInt(String(v), 10);
    if (Number.isNaN(n)) return v;
    return String(Math.max(0, n + cfg.rir));
  };
  const adjRest = (v: any) => {
    if (typeof v !== 'string') return v;
    const m = v.match(/^(\d+)\s*(s|min)?$/i);
    if (!m) return v;
    let secs = parseInt(m[1], 10);
    if ((m[2] || 's').toLowerCase() === 'min') secs *= 60;
    secs = Math.max(20, secs + cfg.rest);
    return secs >= 60 && secs % 60 === 0 ? `${secs / 60}min` : `${secs}s`;
  };
  const adjEx = (e: any) => ({
    ...e,
    rir: adjRir(e.rir),
    rest: adjRest(e.rest),
    setDetails: Array.isArray(e.setDetails)
      ? e.setDetails.map((s: any) => ({ ...s, rir: adjRir(s.rir), rest: adjRest(s.rest) }))
      : e.setDetails,
  });
  return {
    ...dataJson,
    workouts: (dataJson.workouts || []).map((w: any) => ({
      ...w,
      blocks: (w.blocks || []).map((b: any) =>
        b.type === 'main'
          ? { ...b, exercises: (b.exercises || []).map(adjEx) }
          : b
      ),
    })),
  };
}

const WEEKDAYS = [
  { char: 'M', full: 'Monday' },
  { char: 'T', full: 'Tuesday' },
  { char: 'W', full: 'Wednesday' },
  { char: 'T', full: 'Thursday' },
  { char: 'F', full: 'Friday' },
  { char: 'S', full: 'Saturday' },
  { char: 'S', full: 'Sunday' }
];

export default function TrainingNoPlan({ client, onBack, onStartPlan }: TrainingNoPlanProps) {
  const { t } = useLanguage();
  const { assignTrainingPlan, reloadClients, clients } = useClient();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  // Resolve the full client from context to access assigned-planning fields.
  const fullClient = clients.find((c: any) => c.id === client?.id) || client;
  const clientGoal = fullClient?.goal || client?.goal || 'Not Set';
  

  // Fetch templates from backend on mount
  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const data = await fetchWithAuth('/manager/training-templates');
        // The endpoint returns a paginated object ({ data, nextCursor }), not a
        // raw array — unwrapList handles both so the DB templates actually load
        // instead of silently falling back to the sparse hardcoded presets.
        setTemplates(unwrapList(data));
      } catch (err) {
        console.error('Error fetching templates in NoPlan:', err);
        setTemplates([]);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  // Show the manager's real templates (from the template library). Fall back
  // to the built-in presets only when there are no templates yet.
  const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dbPresets = (Array.isArray(templates) ? templates : []).map((tpl: any) => ({
    id: tpl.key,
    title: tpl.name,
    level: tpl.level || 'Intermediate',
    levelColor: tpl.level === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900' :
                tpl.level === 'Advanced' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    type: tpl.type || 'Full Body',
    desc: tpl.description || '',
    intensity: { label: 'Moderate', pct: 60, color: 'bg-amber-400' },
    volume: { label: 'Moderate', pct: 60, color: 'bg-blue-400' },
    tags: [
      { icon: 'calendar_today', text: `${tpl.weekly_frequency || 3}x / week` },
      { icon: 'fitness_center', text: tpl.type || 'Strength' },
      { icon: 'exercise', text: `${tpl.data_json?.workouts?.length || 0} ${t('workouts', { defaultValue: 'entrenos' })}` },
    ],
    scheduleLabel: `${tpl.weekly_frequency || 3} ${t('days_label', { defaultValue: 'días' })}`,
    schedule: DAY_KEYS.map((d, i) => (tpl.data_json?.weeklySchedule && tpl.data_json.weeklySchedule[d]) ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i] : null),
    freqValue: `${tpl.weekly_frequency || 3}x`,
    focusValue: tpl.data_json?.goal || 'Full Body Strength',
    recommended: tpl.data_json?.goal ? [tpl.data_json.goal] : [],
    isDbTemplate: true,
    data_json: tpl.data_json,
  }));
  const allPresets: any[] = dbPresets.length > 0 ? dbPresets : [...PRESETS];

  // When the client has an assigned planning, its goal drives which training
  // template is recommended (preselected).
  const planningKey = String(fullClient?.planFamilyKey || '').toLowerCase();
  const TRA_HINTS: Record<string, string[]> = {
    fat_loss: ['fat loss', 'grasa', 'circuit', 'circuito', 'hiit', 'quema'],
    muscle_gain: ['hypertrophy', 'hipertrofia', 'push', 'torso', 'split', 'arms', 'brazos', 'glute', 'glúteo', 'gluteo'],
    body_recomposition: ['recomposition', 'recomposic', 'upper', 'torso', 'powerbuilding'],
    performance: ['performance', 'rendimiento', 'crossfit', 'hyrox', 'powerlifting', 'strength', 'fuerza', 'athletic', 'atlético', 'atletico'],
    endurance_focus: ['running', 'carrera', 'engine', '5k', 'hyrox', 'crossfit'],
    health: ['mobility', 'movilidad', 'beginner', 'principiante', 'full body', 'completo', 'functional', 'funcional'],
    metabolic_reset: ['full body', 'completo', 'beginner', 'principiante', '5x5', 'strength', 'fuerza'],
  };
  const planningHintMatch = planningKey && TRA_HINTS[planningKey]
    ? allPresets.find(p => TRA_HINTS[planningKey].some(h => String(p.title || '').toLowerCase().includes(h)))
    : null;
  const recommendedPreset = planningHintMatch ||
                           allPresets.find(p => Array.isArray(p.recommended) && p.recommended.includes(clientGoal)) ||
                           allPresets[0];

  const [selectedId, setSelectedId] = useState<string>(recommendedPreset.id);
  const selectedPreset = allPresets.find(p => p.id === selectedId) || recommendedPreset;

  // Once the real templates have loaded, snap the selection to the recommended one.
  React.useEffect(() => {
    if (isLoadingTemplates) return;
    if (!allPresets.some(p => p.id === selectedId)) setSelectedId(recommendedPreset.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingTemplates]);

  // Editable program settings. Frequency follows the selected preset; the
  // intensity level re-tunes the exercises (RIR + rest) on apply.
  const [freqOverride, setFreqOverride] = useState<string>(selectedPreset.freqValue);
  const [intensityLevel, setIntensityLevel] = useState<IntensityLevel>('moderate');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  React.useEffect(() => {
    setFreqOverride(selectedPreset.freqValue);
  }, [selectedId]);

  const handleConfirm = async () => {
    if (!client?.id) {
      setSaveError(t('error_loading_data'));
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    try {
      const selectedProgram = allPresets.find(p => p.id === selectedId) || recommendedPreset;
      let dataJson: any;

      const parsedFreq = parseInt(freqOverride, 10) || 3;

      if ((selectedProgram as any).isDbTemplate) {
        const baseJson = (selectedProgram as any).data_json || {};
        const workouts = Array.isArray(baseJson.workouts) ? baseJson.workouts : [];
        dataJson = {
          ...baseJson,
          frequency: parsedFreq,
          // Rebuild the schedule so changing the frequency really changes the
          // training week instead of leaving the template's original days.
          weeklySchedule: buildWeeklySchedule(workouts, parsedFreq),
        };
      } else {
        const template = PROGRAM_TEMPLATES[selectedId];
        // Use the program the coach actually selected — never fall back to a
        // different one from `trainingPrograms`.
        const prog: any = selectedProgram;
        const workouts = template?.workouts || [];

        dataJson = {
          name: prog.name,
          level: prog.level,
          focus: prog.focus,
          frequency: parsedFreq,
          duration: prog.duration,
          schedule: prog.schedule,
          description: prog.description,
          workouts,
          weeklySchedule: buildWeeklySchedule(workouts, parsedFreq),
        };
      }

      // Re-tune every exercise to the chosen intensity, then record the level.
      dataJson = applyIntensity(dataJson, intensityLevel);
      dataJson.intensity = intensityLevel;

      const finalPlanData = {
        name: dataJson.name || (selectedProgram as any)?.name || 'Training Program',
        data_json: dataJson
      };

      await fetchWithAuth(`/manager/clients/${client.id}/training-program`, {
        method: 'POST',
        body: JSON.stringify(finalPlanData)
      });

      await reloadClients();
      onStartPlan(null, finalPlanData);
    } catch (err: any) {
      console.error('Error applying training program:', err);
      setSaveError(err?.message || t('plan_save_error_alert'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = () => {
    assignTrainingPlan(client.id);
    onStartPlan(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="flex-1 overflow-y-auto">
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header Breadcrumb & Status */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <button onClick={onBack} className="hover:text-emerald-500 cursor-pointer transition-colors">{t('training')}</button>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="font-medium text-slate-900 dark:text-white">{client?.name}</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div 
                  className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm" 
                  style={{ backgroundImage: `url("${client?.avatar || 'https://ui-avatars.com/api/?name=C&background=random'}")` }}
                ></div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{client?.name}</h1>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-emerald-500">flag</span>
                    {t('goal_label')}: {clientGoal}
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <div className="flex items-center gap-1 text-slate-400">
                    {client?.age || '--'} {t('years_label')}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-slate-400">info</span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('status_label')}: <span className="text-amber-500 font-bold animate-pulse">{t('no_plan_yet')}</span></span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Programs */}
          <div className="w-full lg:w-[70%] space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-emerald-500">library_add</span>
              {t('assign_program')}
            </h2>

            <div className="flex flex-col gap-4">
              {/* Scratch / Blank option */}
              <button 
                onClick={handleCreateNew}
                className="group w-full relative bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all cursor-pointer flex items-center gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                  <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-emerald-500 transition-colors">add</span>
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{t('create_scratch')}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('create_scratch_desc')}</p>
                </div>
              </button>

              {/* Template Cards */}
              {isLoadingTemplates ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">{t('loading_templates')}</p>
                </div>
              ) : allPresets.map((preset) => {
                const isSelected = selectedId === preset.id;

                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedId(preset.id)}
                    className={`group w-full text-left p-6 rounded-2xl border transition-all relative overflow-hidden ${
                      isSelected 
                        ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-6">

                      {/* Details — the left icon/type panel was removed so every
                          card shares the exact same structure. The program type
                          is still shown as a tag in the metadata row below. */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{preset.title}</h3>
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wide border ${preset.levelColor}`}>{preset.level}</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{preset.desc}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                              <span>{t('intensity_label')}</span>
                              <span>{preset.intensity.label}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                              <div className={`h-full ${preset.intensity.color} rounded-full`} style={{ width: `${preset.intensity.pct}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                              <span>{t('volume_label')}</span>
                              <span>{preset.volume.label}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                              <div className={`h-full ${preset.volume.color} rounded-full`} style={{ width: `${preset.volume.pct}%` }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {preset.tags.map((tag, tIndex) => (
                            <span key={tIndex} className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[18px] text-slate-400">{tag.icon}</span> 
                              {tag.text}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Side: Schedule UI */}
                      <div className="md:w-48 pt-2 md:pt-0 md:border-l border-slate-200 dark:border-slate-700 md:pl-6 flex flex-col justify-center">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          <span>{t('schedule_label')}</span>
                        </div>
                        <div className="flex justify-between items-center relative gap-1">
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 -z-10 rounded-full"></div>
                          
                          {/* Rendering the 7 days schedule dots */}
                          {WEEKDAYS.map((day, dIdx) => {
                            // Find how many of this day (M, T, W, ...) exist in the preset's schedule array
                            // Simplified for the UI mockup matching: we just map based on the preset.schedule array
                            // which has an exact matching logic in the HTML.
                            // The HTML hardcoded the days active. Let's do a simple check.
                            const isActive = preset.schedule[dIdx] || false; 
                            
                            if (isActive) {
                              return (
                                <div key={dIdx} className="flex flex-col items-center gap-1 z-0">
                                  <div className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold shadow-sm ring-2 ring-white dark:ring-slate-800 ${isSelected ? 'bg-emerald-600' : 'bg-emerald-500'}`}>{isActive}</div>
                                </div>
                              );
                            } else {
                              return (
                                <div key={dIdx} className="flex flex-col items-center gap-1 z-0">
                                  <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                </div>
                              );
                            }
                          })}
                        </div>
                        <div className="mt-3 text-[10px] text-center text-slate-400">{preset.scheduleLabel}</div>
                      </div>

                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Settings */}
          <div className="w-full lg:w-[30%] flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('program_settings')}</h2>
              
              <div className="flex flex-col gap-5">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('weekly_frequency')}</label>
                  <div className="grid grid-cols-5 gap-2">
                    {['2x', '3x', '4x', '5x', '6x'].map((freq) => {
                      const isFreqSelected = freqOverride === freq;
                      return (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setFreqOverride(freq)}
                          className={`p-2 rounded-lg border text-sm transition-colors ${
                          isFreqSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/50'
                            : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-medium'
                        }`}>
                          {freq}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('intensity_level', { defaultValue: 'Nivel de intensidad' })}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      ['low', t('intensity_low', { defaultValue: 'Baja' })],
                      ['moderate', t('intensity_moderate', { defaultValue: 'Moderada' })],
                      ['high', t('intensity_high', { defaultValue: 'Alta' })],
                    ] as [IntensityLevel, string][]).map(([val, label]) => {
                      const isSel = intensityLevel === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setIntensityLevel(val)}
                          className={`p-2 rounded-lg border text-sm transition-colors ${
                            isSel
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/50'
                              : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-medium'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">
                    {intensityLevel === 'low'
                      ? t('intensity_low_hint', { defaultValue: 'Más repeticiones en reserva y descansos más largos — entreno más asequible.' })
                      : intensityLevel === 'high'
                      ? t('intensity_high_hint', { defaultValue: 'Series más cerca del fallo y descansos más cortos — máximo estímulo.' })
                      : t('intensity_moderate_hint', { defaultValue: 'Prescripción equilibrada tal y como está diseñada la plantilla.' })}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{t('program_preview')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{selectedPreset.title}</div>
	                        <div className="text-xs text-slate-500 dark:text-slate-400">{t('selected_template')}</div>
                      </div>
                    </div>
                    <div className="h-px bg-slate-200 dark:border-slate-700 w-full"></div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {selectedPreset.desc}
                    </div>
                  </div>
                </div>

                {saveError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs font-medium mt-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{saveError}</span>
                  </div>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={isSaving}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-4 group"
                >
                  <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">{isSaving ? 'sync' : 'assignment_add'}</span>
                  {isSaving ? t('saving_btn') : t('assign_btn')}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
