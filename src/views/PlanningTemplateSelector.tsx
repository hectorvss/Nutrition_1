import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Grid, 
  Filter, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  Settings2,
  Calendar,
  Layers,
  Zap,
  Target
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Select from '../components/ui/Select';
import { fetchWithAuth } from '../api';
import { unwrapList } from '../api/unwrap';

interface PlanningTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  phases: number;
  goalType: string;
  intensity: 'low' | 'moderate' | 'high';
  roadmapPreview: string; // Text summary or simplified visual
  badge?: string;
  /** Full data_json blueprint (blocks, KPIs, goals…) when available. */
  data?: any;
}

interface PlanningTemplateSelectorProps {
  client?: any;
  onBack: () => void;
  onSelect: (templateId: string, settings: any) => void;
}

// Helper: ICON COMPONENT (Material Symbols compatibility)
const Icon = ({ name, className = "" }: { name: string, className?: string }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: 'inherit' }}>{name}</span>
);

// Deterministic roadmap-phase generator. Given a template's phase count and the
// editor's duration/intensity selection, it produces real nutrition + training
// blocks (and milestones) spread across the plan weeks — so the planning editor
// actually materialises a structured roadmap instead of an empty scaffold.
function buildRoadmapPhases(
  phasesCount: number,
  totalWeeks: number,
  intensity: string,
  goalType: string,
  phaseDefs?: { name: string; focus: string }[],
) {
  // When the template carries authored phases (name + focus per phase) use
  // them verbatim; otherwise fall back to a generic N-phase split.
  const defs = Array.isArray(phaseDefs) && phaseDefs.length ? phaseDefs : null;
  const n = defs ? defs.length : Math.max(1, Math.min(phasesCount || 3, 8));
  const weeks = Math.max(n, totalWeeks || 12);
  const per = Math.floor(weeks / n);
  const nutrition: any[] = [];
  const training: any[] = [];
  const milestones: any[] = [];
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const startWeek = acc + 1;
    const span = i === n - 1 ? weeks - acc : per;
    const endWeek = acc + span;
    acc = endWeek;
    const def = defs ? defs[i] : null;
    const label = (def?.name || '').trim() || `Fase ${i + 1}`;
    const objective = (def?.focus || '').trim() || (goalType ? goalType.replace(/_/g, ' ') : label);
    const strat = (_track: 'nutrition' | 'training') => ({
      summary: '',
      primaryObjective: objective,
      secondaryObjectives: [],
      trainingIntensity: intensity,
      kpis: [],
      successCriteria: [],
      coachNotes: '',
      risksAndConstraints: [],
    });
    nutrition.push({
      id: `nut-${i}-${Date.now()}`, type: 'nutrition', title: label,
      startWeek, endWeek, duration: span, order: i, stratData: strat('nutrition'),
    });
    training.push({
      id: `tra-${i}-${Date.now()}`, type: 'training', title: label,
      startWeek, endWeek, duration: span, order: i, stratData: strat('training'),
    });
    milestones.push({
      id: `ms-${i}-${Date.now()}`, label, week: `${startWeek}`,
      status: i === 0 ? 'next' : 'future',
    });
  }
  return { nutrition, training, milestones };
}

export default function PlanningTemplateSelector({ client, onBack, onSelect }: PlanningTemplateSelectorProps) {
  const { t, language } = useLanguage();
  const builtInTemplates: PlanningTemplate[] = [
    {
      id: 'pt1',
      name: 'Fat Loss Foundation',
      description: 'Metabolic adaptation followed by steady deficit',
      duration: 12,
      phases: 3,
      goalType: 'Fat Loss',
      intensity: 'low',
      badge: 'Balanced',
      roadmapPreview: 'Maintain (4w) → Deficit (4w) → Reverse (4w)'
    },
    {
      id: 'pt2',
      name: 'Recomposition Starter',
      description: 'Simultaneous fat loss and muscle retention',
      duration: 16,
      phases: 4,
      goalType: 'Recomp',
      intensity: 'moderate',
      badge: 'High Carb',
      roadmapPreview: 'Maintenance (4w) → Body Recomp (8w) → Consolidation (4w)'
    },
    {
      id: 'pt3',
      name: 'Muscle Gain Base',
      description: 'Progressive surplus with volume peaking',
      duration: 12,
      phases: 3,
      goalType: 'Muscle Gain',
      intensity: 'high',
      badge: 'High Protein',
      roadmapPreview: 'Hypertrophy Focus (6w) → Strength Peak (6w)'
    },
    {
      id: 'pt4',
      name: 'Performance Build',
      description: 'Athletic capacity and strength optimization',
      duration: 10,
      phases: 2,
      goalType: 'Performance',
      intensity: 'high',
      badge: 'Standard',
      roadmapPreview: 'Power Output (5w) → Skill Integration (5w)'
    },
    {
      id: 'pt5',
      name: 'Lifestyle Reset',
      description: 'Habit formation and health baseline reset',
      duration: 8,
      phases: 2,
      goalType: 'Health',
      intensity: 'low',
      badge: 'Balanced+',
      roadmapPreview: 'Base Reset (4w) → Maintenance Plus (4w)'
    }
  ];

  // Coach-created planning templates loaded from the backend.
  const [customTemplates, setCustomTemplates] = useState<PlanningTemplate[]>([]);
  useEffect(() => {
    fetchWithAuth('/manager/planning-templates?limit=200').then(unwrapList)
      .then((rows: any[]) => {
        if (!Array.isArray(rows)) return;
        setCustomTemplates(rows.map((r) => ({
          id: r.key || r.id,
          name: r.name,
          description: r.description || '',
          duration: r.duration_weeks || 12,
          phases: r.phases || 3,
          goalType: r.goal_type || 'custom',
          intensity: (r.intensity === 'aggressive' || r.intensity === 'elite' ? 'high'
            : r.intensity === 'low' ? 'low' : 'moderate') as PlanningTemplate['intensity'],
          roadmapPreview: r.data_json?.preview || '',
          badge: r.goal_type ? t(`analytics_${r.goal_type}`, { defaultValue: r.goal_type }) : undefined,
          data: r.data_json || null,
        })));
      })
      .catch(() => {});
  }, []);

  // Only the real coach-managed planning templates are offered — the legacy
  // hard-coded presets are intentionally excluded.
  void builtInTemplates;
  const templates: PlanningTemplate[] = customTemplates;

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Settings state
  const [settings, setSettings] = useState({
    duration: 12,
    trainingFreq: '4',
    nutritionApproach: 'High Protein',
    intensityLevel: 'moderate',
    primaryGoal: 'fat_loss'
  });

  // Selecting a template pre-fills the settings panel from its blueprint.
  const selectTemplate = (tpl: PlanningTemplate) => {
    setSelectedTemplateId(tpl.id);
    setSettings(s => ({
      ...s,
      duration: tpl.duration || s.duration,
      intensityLevel: tpl.intensity === 'high' ? 'aggressive' : tpl.intensity || s.intensityLevel,
      primaryGoal: ['fat_loss', 'muscle_gain', 'body_recomposition', 'metabolic_reset', 'endurance_focus'].includes(tpl.goalType)
        ? tpl.goalType : s.primaryGoal,
    }));
  };

  const getTemplateText = (template: PlanningTemplate) => {
    const map: Record<string, { name: string; description: string; badge?: string; preview: string }> = {
      pt1: { name: t('fat_loss_foundation'), description: t('fat_loss_foundation_desc'), badge: t('balanced'), preview: t('planning_preview_pt1') },
      pt2: { name: t('recomposition_starter'), description: t('recomposition_desc'), badge: t('high_carb'), preview: t('planning_preview_pt2') },
      pt3: { name: t('muscle_gain_base'), description: t('muscle_gain_desc'), badge: t('high_protein'), preview: t('planning_preview_pt3') },
      pt4: { name: t('performance_build'), description: t('performance_desc'), badge: t('standard'), preview: t('planning_preview_pt4') },
      pt5: { name: t('lifestyle_reset'), description: t('lifestyle_desc'), badge: t('balanced_plus'), preview: t('planning_preview_pt5') }
    };
    return map[template.id] || { name: template.name, description: template.description, badge: template.badge, preview: template.roadmapPreview };
  };

  // Assign the selected template: its full authored roadmap is copied onto
  // the client so the planning is really persisted.
  const handleCreateDraft = () => {
    if (!selectedTemplateId || !selectedTemplate) return;
    void buildRoadmapPhases;
    onSelect(selectedTemplateId, { template: selectedTemplate });
  };

  // "Custom Strategy" = start from a blank roadmap (no template applied).
  const handleCreateCustom = () => {
    onSelect('custom', { template: null });
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Breadcrumb & Header */}
      <div className="p-4 md:p-6 pb-2">
        <nav className="flex text-sm text-slate-500 mb-4 font-medium">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <button onClick={onBack} className="inline-flex items-center text-slate-500 hover:text-emerald-600 transition-colors">
                {t('planning_management')}
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <ArrowRight className="w-4 h-4 text-slate-400 mx-1" />
                <span className="text-slate-800 font-bold">{client?.name || t('not_defined', { defaultValue: 'Client' })}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-4 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl shadow-sm">{t('setup_required')}</div>
          
          <div className="relative flex-shrink-0">
            {client?.avatar ? (
              <div
                className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-inner border-2 border-slate-50"
                style={{ backgroundImage: `url("${client.avatar}")` }}
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shadow-inner border-2 border-slate-50 text-slate-300">
                <Icon name="person" className="text-[32px]" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{client?.name || t('not_defined', { defaultValue: 'Client' })}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Icon name="target" className="text-slate-400" />
                {t('no_strategic_plan')}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
              <span className="flex items-center gap-1 uppercase tracking-widest text-[10px] font-bold">{t('planning_profile_placeholder')}</span>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 text-center">{t('status')}</div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              {t('planning_ready_to_program')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 pt-2 lg:items-start">
        {/* Left Column: Templates — scrolls with the page */}
        <div className="flex-1 lg:basis-[70%] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
              <Grid className="w-5 h-5 text-emerald-500" />
              {t('strategic_templates')}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Create New Roadmap Card (Mirroring Nutrition's "Create New Plan") */}
            <button
              onClick={handleCreateCustom}
              className="group w-full flex items-center justify-between p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-left leading-tight">
                  <h3 className="font-bold text-lg text-slate-700 uppercase tracking-tight">{t('custom_strategy')}</h3>
                  <p className="text-sm text-slate-500 font-medium">{t('custom_strategy_desc')}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </button>

            {/* Template Cards */}
            {templates.map((template) => (
              <div 
                key={template.id}
                onClick={() => selectTemplate(template)}
                className={`group w-full bg-white rounded-2xl border p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer relative flex flex-col sm:flex-row items-center gap-6 ${
                  selectedTemplateId === template.id ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-200'
                }`}
              >
                {selectedTemplateId === template.id && (
                  <div className="absolute top-4 right-4 text-emerald-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}
                
                {/* Duration & Basic Info (Mirroring Nutrition Calories/Name) */}
                <div className="w-full sm:w-1/4 flex-shrink-0 flex sm:block flex-col items-center text-center sm:text-left border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0 sm:pr-6">
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start text-emerald-600 font-bold text-xl mb-1">
                    <Calendar className="w-5 h-5" />
                    {template.duration} {t('weeks_label')}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight uppercase tracking-tight">{getTemplateText(template).name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-widest">{getTemplateText(template).description}</p>
                </div>

                {/* Strategy Summary Info (Mirroring Macros Bar) */}
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase tracking-widest border border-emerald-100">
                      {getTemplateText(template).badge || t('standard')}
                    </span>
                    <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-emerald-400" />
                        {template.phases} {t('phases_label')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {t(`planning_intensity_${template.intensity}`)} {t('intensity_level')}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex shadow-inner">
                      {/* Simple visual preview based on phases */}
                      {Array.from({ length: template.phases }).map((_, idx) => (
                        <div 
                          key={idx}
                          className={`h-full border-r border-white last:border-0 ${
                            idx % 2 === 0 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${100 / template.phases}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 italic tracking-tight flex items-center gap-2">
                    <Icon name="route" className="text-slate-400" />
                    {getTemplateText(template).preview}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Right Column — FLOATING: sticks in the viewport while the left
            template list scrolls. Bounded to the viewport height so the
            config card + button below always stay visible. */}
        <div className="w-full lg:basis-[30%] lg:shrink-0 flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start lg:h-[calc(100vh-2rem)] min-h-0">
          {/* Scrollable area — preview + blueprint scroll independently so the
              config card + button below stay pinned and always visible. */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-hide flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 text-center shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors"></div>
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
              <Eye className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-tight">{t('template_preview')}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {selectedTemplate
                ? (selectedTemplate.data?.summary
                    || t('planning_selected_template_summary', { name: getTemplateText(selectedTemplate).name, preview: getTemplateText(selectedTemplate).preview }))
                : t('select_template_preview')
              }
            </p>
          </div>

          {/* Detailed blueprint — surfaces the template's data_json (blocks
              week-by-week, KPI targets, goals) so the coach sees exactly what
              the plan contains before creating the draft. */}
          {selectedTemplate?.data?.blocks?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4 text-left">
              <h3 className="font-bold text-slate-900 uppercase tracking-tight text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                {t('plan_blueprint', { defaultValue: 'Estructura del plan' })}
              </h3>

              {/* KPI targets */}
              {selectedTemplate.data.kpiTargets && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(selectedTemplate.data.kpiTargets).map(([k, v]) => (
                    <span key={k} className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100">
                      {k}: <span className="font-medium text-emerald-600">{String(v)}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Block-by-block */}
              <div className="flex flex-col gap-3">
                {selectedTemplate.data.blocks.map((b: any, i: number) => (
                  <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-800 text-sm">{b.name}</span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider shrink-0">
                        {t('weeks_label')} {b.weeks}
                      </span>
                    </div>
                    {b.goal && <p className="text-xs text-slate-500 mb-2 leading-snug">{b.goal}</p>}
                    {Array.isArray(b.weeklyFocus) && (
                      <ul className="space-y-0.5 mb-2">
                        {b.weeklyFocus.map((w: string, wi: number) => (
                          <li key={wi} className="text-[11px] text-slate-600 flex gap-1.5">
                            <span className="text-emerald-400">•</span>{w}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {b.training && (
                        <div className="bg-white rounded-lg border border-slate-100 p-2">
                          <div className="font-bold text-amber-600 uppercase tracking-wider mb-0.5">{t('training_label', { defaultValue: 'Entreno' })}</div>
                          <div className="text-slate-500">{b.training.frequency}x · {b.training.split}</div>
                          <div className="text-slate-400">{b.training.intensity}</div>
                        </div>
                      )}
                      {b.nutrition && (
                        <div className="bg-white rounded-lg border border-slate-100 p-2">
                          <div className="font-bold text-blue-600 uppercase tracking-wider mb-0.5">{t('nutrition_label', { defaultValue: 'Nutrición' })}</div>
                          <div className="text-slate-500">{b.nutrition.approach}</div>
                          <div className="text-slate-400">{b.nutrition.protein} prot.</div>
                        </div>
                      )}
                    </div>
                    {Array.isArray(b.kpis) && b.kpis.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {b.kpis.map((kp: any, ki: number) => (
                          <span key={ki} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {kp.metric}: {kp.target}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedTemplate.data.coachNotes && (
                <p className="text-[11px] text-slate-400 italic leading-snug border-t border-slate-100 pt-3">
                  {selectedTemplate.data.coachNotes}
                </p>
              )}
            </div>
          )}
          </div>{/* end scrollable preview area */}

          {/* Always-visible config card — pinned, no scroll needed to reach
              the "create draft" button. */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col gap-6 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <Settings2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 uppercase tracking-tight">{t('planning_settings')}</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1 leading-none">{t('total_duration')}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <Icon name="schedule" className="text-[20px]" />
                  </div>
                  <Select
                    className="w-full pl-12 pr-3 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold"
                    value={settings.duration}
                    onChange={(val) => setSettings({...settings, duration: Number(val)})}
                  >
                    <option value={8}>8 {t('weeks_label')}</option>
                    <option value={10}>10 {t('weeks_label')}</option>
                    <option value={12}>12 {t('weeks_label')}</option>
                    <option value={16}>16 {t('weeks_label')}</option>
                    <option value={20}>20 {t('weeks_label')}</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1 leading-none">{t('training_frequency')}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-amber-500 transition-colors">
                    <Icon name="fitness_center" className="text-[20px]" />
                  </div>
                  <Select
                    className="w-full pl-12 pr-3 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold"
                    value={settings.trainingFreq}
                    onChange={(val) => setSettings({...settings, trainingFreq: val})}
                  >
                    <option value="2">2 {t('days_week')}</option>
                    <option value="3">3 {t('days_week')}</option>
                    <option value="4">4 {t('days_week')}</option>
                    <option value="5">5 {t('days_week')}</option>
                    <option value="6">6 {t('days_week')}</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1 leading-none">{t('intensity_level')}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-rose-500 transition-colors">
                    <Icon name="speed" className="text-[20px]" />
                  </div>
                  <Select
                    className="w-full pl-12 pr-3 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold"
                    value={settings.intensityLevel}
                    onChange={(val) => setSettings({...settings, intensityLevel: val})}
                  >
                    <option value="low">{t('planning_intensity_low')}</option>
                    <option value="moderate">{t('planning_intensity_moderate')}</option>
                    <option value="aggressive">{t('planning_intensity_aggressive')}</option>
                    <option value="elite">{t('planning_intensity_elite')}</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1 leading-none">{t('primary_goal_override')}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
                    <Icon name="target" className="text-[20px]" />
                  </div>
                  <Select
                    className="w-full pl-12 pr-3 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold"
                    value={settings.primaryGoal}
                    onChange={(val) => setSettings({...settings, primaryGoal: val})}
                  >
                    <option value="fat_loss">{t('analytics_fat_loss')}</option>
                    <option value="muscle_gain">{t('analytics_muscle_gain')}</option>
                    <option value="body_recomposition">{t('body_recomposition')}</option>
                    <option value="metabolic_reset">{t('metabolic_reset')}</option>
                    <option value="endurance_focus">{t('endurance_focus')}</option>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <button 
                disabled={!selectedTemplateId}
                onClick={handleCreateDraft}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed border border-transparent active:scale-95 text-sm"
              >
                <CheckCircle2 className="w-5 h-5 group-hover:animate-pulse" />
                {t('create_planning_action', { defaultValue: language === 'es' ? 'Crear planificación' : 'Create planning' })}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
