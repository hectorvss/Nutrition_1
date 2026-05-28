import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Zap, Send, Clock, ClipboardList, Edit2,
  AlertCircle, Plus, Sunrise, Sun, Moon, Search, X, CheckCheck, Pause,
  ChevronDown, Bell, CalendarPlus, ClipboardCheck, Filter,
} from 'lucide-react';
import { AutomationDeliveryRules } from '../context/AutomationContext';
import { useClient } from '../context/ClientContext';
import { useLanguage } from '../context/LanguageContext';
import Select from '../components/ui/Select';
import TimeSelect from '../components/ui/TimeSelect';
import { fetchWithAuth } from '../api';
import { AutomationStep } from '../components/automations/StepSequence';
import AutomationCard, { FlowConnector } from '../components/automations/AutomationCard';

interface AutomationFlowBuilderProps {
  triggerId: string;
  triggerName: string;
  initialMessage: string;
  initialRules: AutomationDeliveryRules;
  isEditing: boolean;
  onBack: () => void;
  onNext: (message: string, deliveryRules: AutomationDeliveryRules) => void;
}

// Full set of message variables — must stay in sync with KNOWN_VARIABLES in
// server/lib/messageTemplate.ts (the only place these resolve to real values).
const VARIABLES = [
  { label: '{First Name}',        desc: 'Nombre de pila del cliente' },
  { label: '{Client Name}',       desc: 'Nombre completo del cliente' },
  { label: '{Coach Name}',        desc: 'Tu nombre completo' },
  { label: '{Coach First Name}',  desc: 'Tu nombre de pila' },
  { label: '{Current Weight}',    desc: 'Último peso registrado' },
  { label: '{Goal Weight}',       desc: 'Peso objetivo' },
  { label: '{Goal}',              desc: 'Objetivo del cliente' },
  { label: '{Height}',            desc: 'Altura del cliente' },
  { label: '{Age}',               desc: 'Edad del cliente' },
  { label: '{Adherence Rate}',    desc: 'Adherencia de la última semana' },
  { label: '{Mood}',              desc: 'Ánimo del último check-in' },
  { label: '{RPE}',               desc: 'Esfuerzo percibido del último entreno' },
  { label: '{Check-in Day}',      desc: 'Día de check-in asignado' },
  { label: '{Days Inactive}',     desc: 'Días sin abrir la app' },
  { label: '{Days Until Expiry}', desc: 'Días hasta que vence el plan' },
  { label: '{Today}',             desc: 'Fecha de hoy' },
  { label: '{Payment Link}',      desc: 'Link de pago del cobro activo del cliente' },
];

// Metadata for every action-step kind: icon, label and the card's icon colour.
const STEP_META: Record<AutomationStep['kind'], { label: string; tag: string; icon: React.ElementType; iconClass: string }> = {
  message:       { label: 'Enviar mensaje',       tag: 'ACCIÓN', icon: Send,          iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  wait:          { label: 'Esperar / pausa',      tag: 'ACCIÓN', icon: Clock,         iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  create_task:   { label: 'Escalada (tarea)',     tag: 'ACCIÓN', icon: ClipboardList, iconClass: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  notify_coach:  { label: 'Notificarme a mí',     tag: 'ACCIÓN', icon: Bell,          iconClass: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  create_event:  { label: 'Agendar evento',       tag: 'ACCIÓN', icon: CalendarPlus,  iconClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
  assign_checkin:{ label: 'Asignar check-in',     tag: 'ACCIÓN', icon: ClipboardCheck,iconClass: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
  assign_onboarding:{ label: 'Asignar onboarding', tag: 'ACCIÓN', icon: ClipboardCheck, iconClass: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
  set_field:     { label: 'Etiquetar al cliente', tag: 'ACCIÓN', icon: Edit2,         iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  stop_if:       { label: 'Parar si…',            tag: 'ACCIÓN', icon: AlertCircle,   iconClass: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
};

const ADDABLE: Array<{ kind: AutomationStep['kind']; desc: string }> = [
  { kind: 'message',        desc: 'Envía un mensaje al chat del cliente.' },
  { kind: 'wait',           desc: 'Pausa la cadena X horas o días.' },
  { kind: 'create_task',    desc: 'Crea una tarea en tu panel (escalada).' },
  { kind: 'notify_coach',   desc: 'Te envía una notificación push al instante.' },
  { kind: 'create_event',   desc: 'Agenda un evento en tu calendario.' },
  { kind: 'assign_checkin', desc: 'Asigna una plantilla de check-in al cliente.' },
  { kind: 'assign_onboarding', desc: 'Asigna un formulario de onboarding al cliente.' },
  { kind: 'set_field',      desc: 'Cambia un campo del cliente (status/goal/notas).' },
  // `stop_if` is intentionally NOT addable here — the "Condiciones de parada"
  // module always renders at the end of the flow, so offering it as a step too
  // would duplicate the same concept. Existing stop_if steps still render.
];

function defaultStepFor(kind: AutomationStep['kind']): AutomationStep {
  switch (kind) {
    case 'message':        return { kind, message: '' };
    case 'wait':           return { kind, amount: 1, unit: 'days', cancelIfReplied: true };
    case 'create_task':    return { kind, title: '', type: 'Admin', priority: 'medium' };
    case 'notify_coach':   return { kind, title: 'Revisar a {Client Name}', body: '' };
    case 'create_event':   return { kind, title: 'Sesión con {First Name}', eventType: 'Call', offsetDays: 3, time: '09:00' };
    case 'assign_checkin': return { kind, templateId: '' };
    case 'assign_onboarding': return { kind, templateId: '' };
    case 'set_field':      return { kind, field: 'status', value: 'Active' };
    case 'stop_if':        return { kind, conditionType: 'reply', operator: 'within', value: '24' };
  }
}

export default function AutomationFlowBuilder({
  triggerId, triggerName, initialMessage, initialRules, isEditing, onBack, onNext,
}: AutomationFlowBuilderProps) {
  const { t } = useLanguage();
  const { clients } = useClient();

  const [rules, setRules] = useState<AutomationDeliveryRules>(initialRules);
  const [steps, setSteps] = useState<AutomationStep[]>(
    Array.isArray((initialRules as any)?.steps) && (initialRules as any).steps.length > 0
      ? (initialRules as any).steps
      : [{ kind: 'message', message: initialMessage || '' }],
  );
  const [adding, setAdding] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [catalog, setCatalog] = useState<{ stopConditions: any[]; activationConditions: any[]; limits: { maxStepsPerFlow: number | null } } | null>(null);
  const [checkinTemplates, setCheckinTemplates] = useState<Array<{ id: string; name: string }>>([]);
  const [onboardingTemplates, setOnboardingTemplates] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchWithAuth('/automations/catalog');
        setCatalog(data);
      } catch (e) { console.error('catalog load failed', e); }
      try {
        const tpls = await fetchWithAuth('/check-ins/manager/checkin-templates');
        const arr = Array.isArray(tpls) ? tpls : (tpls?.data || tpls?.templates || []);
        setCheckinTemplates(arr.map((x: any) => ({ id: x.id, name: x.name || x.title || 'Plantilla' })));
      } catch (e) { console.error('checkin templates load failed', e); }
      try {
        const tpls = await fetchWithAuth('/onboarding/manager/templates');
        const arr = Array.isArray(tpls) ? tpls : (tpls?.data || tpls?.templates || []);
        setOnboardingTemplates(arr.map((x: any) => ({ id: x.id, name: x.name || x.title || 'Plantilla' })));
      } catch (e) { console.error('onboarding templates load failed', e); }
    })();
  }, []);

  const updateRule = <K extends keyof AutomationDeliveryRules>(key: K, value: AutomationDeliveryRules[K]) =>
    setRules(prev => ({ ...prev, [key]: value }));

  const updateStep = (i: number, next: AutomationStep) => setSteps(steps.map((s, idx) => idx === i ? next : s));
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));
  const moveStep = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    setSteps(next);
  };
  const addStep = (kind: AutomationStep['kind']) => { setSteps([...steps, defaultStepFor(kind)]); setAdding(false); };

  const maxSteps = catalog?.limits?.maxStepsPerFlow ?? null;
  const atCap = maxSteps != null && steps.length >= maxSteps;

  // Adds a condition (activation or stop) from the catalog dropdown. If it's
  // already present it's a no-op — the user removes it from the chip list.
  const addCondition = (key: 'stop_conditions' | 'activation_conditions', type: string) => {
    const cat = key === 'stop_conditions' ? catalog?.stopConditions : catalog?.activationConditions;
    const def = (cat || []).find((c: any) => c.id === type);
    if (!def) return;
    const current = (rules[key] || []) as any[];
    if (current.some(c => c.type === type)) return;
    updateRule(key, [...current, { type, operator: def.defaultOperator, value: def.defaultValue, enabled: true }] as any);
  };
  const removeCondition = (key: 'stop_conditions' | 'activation_conditions', type: string) => {
    updateRule(key, ((rules[key] || []) as any[]).filter(c => c.type !== type) as any);
  };
  const updateCondition = (key: 'stop_conditions' | 'activation_conditions', type: string, patch: any) => {
    updateRule(key, ((rules[key] || []) as any[]).map(c => c.type === type ? { ...c, ...patch } : c) as any);
  };

  const removeClient = (id: string) => updateRule('selected_client_ids', (rules.selected_client_ids || []).filter(x => x !== id));
  const addClient = (id: string) => {
    if (!(rules.selected_client_ids || []).includes(id)) updateRule('selected_client_ids', [...(rules.selected_client_ids || []), id]);
    setClientSearch('');
  };
  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) && !(rules.selected_client_ids || []).includes(c.id));

  const firstMessage = (steps.find(s => s.kind === 'message') as any)?.message || '';
  const canContinue = steps.length > 0 &&
    !(steps.length === 1 && steps[0].kind === 'message' && !steps[0].message.trim());

  const handleContinue = () => {
    const enrichedRules: any = { ...rules, steps };
    onNext(firstMessage, enrichedRules);
  };

  // Appends a {Variable} into whatever text field the step exposes.
  const insertVar = (i: number, variable: string) => {
    const s = steps[i];
    if (s.kind === 'message')      updateStep(i, { ...s, message: (s.message || '') + variable });
    if (s.kind === 'create_task')  updateStep(i, { ...s, title: (s.title || '') + variable });
    if (s.kind === 'create_event') updateStep(i, { ...s, title: (s.title || '') + variable });
    if (s.kind === 'notify_coach') updateStep(i, { ...s, body: (s.body || '') + variable });
  };

  // Reusable variable-insertion dropdown — same custom <Select> everywhere.
  const variableSelect = (i: number) => (
    <Select
      value=""
      onChange={(v) => v && insertVar(i, v)}
      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs px-2 py-1.5"
    >
      <option value="">{t('insert_variable', { defaultValue: '+ Insertar variable…' })}</option>
      {VARIABLES.map(v => (
        <option key={v.label} value={v.label}>{v.label} — {v.desc}</option>
      ))}
    </Select>
  );

  // Renders a condition module: a Select to add any condition from the full
  // catalog, plus a configurable row per selected condition. Used for both
  // the activation filter and the stop conditions so they look identical.
  const renderConditionModule = (
    key: 'activation_conditions' | 'stop_conditions',
    catalogList: any[],
    color: 'teal' | 'rose',
  ) => {
    const selected = ((rules[key] || []) as any[]);
    const available = catalogList.filter(c => !selected.some(s => s.type === c.id));
    const accent = color === 'teal' ? 'text-teal-600' : 'text-rose-600';
    return (
      <div className="space-y-3">
        {/* Add dropdown — covers the whole catalog without a wall of chips */}
        <Select
          value=""
          onChange={(v) => v && addCondition(key, v)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm px-3 py-2"
        >
          <option value="">{t('add_condition', { defaultValue: '+ Añadir condición…' })}</option>
          {available.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </Select>

        {/* Configurable rows */}
        {selected.length > 0 ? (
          <div className="space-y-2">
            {selected.map((c) => {
              const def = catalogList.find(d => d.id === c.type);
              const ops: string[] = def?.operators || ['>', '<', '==', 'within'];
              return (
                <div key={c.type} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className={`text-[11px] font-bold ${accent} flex-1 min-w-0 truncate`}>{def?.label || c.type}</span>
                  <Select value={c.operator}
                    onChange={(v) => updateCondition(key, c.type, { operator: v })}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 py-1">
                    {ops.map(op => <option key={op} value={op}>{op === 'within' ? 'en' : op}</option>)}
                  </Select>
                  <input type="text" value={c.value}
                    onChange={(e) => updateCondition(key, c.type, { value: e.target.value })}
                    className="w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 py-1 focus:ring-1 focus:ring-emerald-500 outline-none" />
                  {def?.hint && <span className="text-[10px] text-slate-400 shrink-0">{def.hint}</span>}
                  <button onClick={() => removeCondition(key, c.type)} className="text-slate-300 hover:text-red-500 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">{t('no_conditions_yet', { defaultValue: 'Sin condiciones — se aplica siempre.' })}</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden p-6 gap-6">
      <div className="w-full flex flex-col h-full max-w-3xl mx-auto">
        {/* Header — mirrors step 1 (trigger) layout: title + 3-step indicator */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 shrink-0">
          <div>
            <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1 text-sm font-medium mb-2">
              <ArrowLeft className="w-4 h-4" />
              {isEditing ? t('back_to_automations') : t('back_to_trigger', { defaultValue: 'Volver' })}
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEditing ? t('edit_automation') : t('create_new_automation')}
            </h1>
          </div>
          <div className="flex items-center">
            <div className="flex items-center relative">
              <div className="flex flex-col items-center relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm ring-4 ring-white dark:ring-slate-900 text-sm">
                  <Check className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs font-semibold mt-2 text-emerald-500">{t('trigger_label', { defaultValue: 'Disparador' })}</span>
              </div>
              <div className="w-16 md:w-24 h-1 bg-emerald-500 -ml-2 -mr-2 relative z-0"></div>
              <div className="flex flex-col items-center relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm ring-4 ring-white dark:ring-slate-900 text-sm">2</div>
                <span className="text-xs font-semibold mt-2 text-emerald-500">{t('message_label', { defaultValue: 'Flujo' })}</span>
              </div>
              <div className="w-16 md:w-24 h-1 bg-slate-200 dark:bg-slate-800 -ml-2 -mr-2 relative z-0"></div>
              <div className="flex flex-col items-center relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center font-semibold shadow-sm ring-4 ring-white dark:ring-slate-900 text-sm">3</div>
                <span className="text-xs font-medium mt-2 text-slate-400">{t('review', { defaultValue: 'Revisar' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Everything sits inside one white panel, like the trigger step */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col flex-1">
          <div className="px-6 md:px-8 py-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('build_your_flow', { defaultValue: 'Construye tu flujo' })}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t('flow_builder_desc', { defaultValue: 'Disparador, acciones, cuándo se envía y condiciones de parada.' })}
            </p>
          </div>

          {/* Scrollable card flow */}
          <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 scrollbar-hide">
          {/* 1. Trigger */}
          <AutomationCard
            variant="trigger"
            icon={Zap}
            iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            tag={t('trigger_label', { defaultValue: 'DISPARADOR' })}
            title={triggerName || t('your_trigger', { defaultValue: 'Disparador' })}
            subtitle={t('trigger_card_desc', { defaultValue: 'El evento que activa este workflow.' })}
          >
            <button
              onClick={onBack}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              {t('change_trigger', { defaultValue: 'Cambiar disparador' })}
            </button>
          </AutomationCard>

          {/* 2. Action cards */}
          {steps.map((step, i) => {
            const meta = STEP_META[step.kind];
            return (
              <React.Fragment key={i}>
                <FlowConnector />
                <AutomationCard
                  variant="action"
                  icon={meta.icon}
                  iconClass={meta.iconClass}
                  index={i + 1}
                  tag={meta.tag}
                  title={meta.label}
                  onRemove={steps.length > 1 ? () => removeStep(i) : undefined}
                  onMoveUp={i > 0 ? () => moveStep(i, -1) : undefined}
                  onMoveDown={i < steps.length - 1 ? () => moveStep(i, 1) : undefined}
                >
                  {step.kind === 'message' && (
                    <div className="space-y-2">
                      <textarea
                        value={step.message}
                        onChange={e => updateStep(i, { ...step, message: e.target.value })}
                        placeholder="Hola {First Name}, …"
                        rows={4}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                      />
                      {variableSelect(i)}
                    </div>
                  )}

                  {step.kind === 'wait' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Esperar</span>
                      <input type="number" min={1} value={step.amount}
                        onChange={e => updateStep(i, { ...step, amount: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                      <Select value={step.unit}
                        onChange={(v) => updateStep(i, { ...step, unit: v as any })}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-1">
                        <option value="hours">horas</option>
                        <option value="days">días</option>
                      </Select>
                      <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                        <input type="checkbox" checked={!!step.cancelIfReplied}
                          onChange={e => updateStep(i, { ...step, cancelIfReplied: e.target.checked })}
                          className="rounded text-emerald-500" />
                        cancelar si responde
                      </label>
                    </div>
                  )}

                  {step.kind === 'create_task' && (
                    <div className="space-y-2">
                      <input type="text" value={step.title}
                        onChange={e => updateStep(i, { ...step, title: e.target.value })}
                        placeholder="Llamar a {First Name} si no responde"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                      <div className="flex items-center gap-2">
                        <Select value={step.priority || 'medium'}
                          onChange={(v) => updateStep(i, { ...step, priority: v as any })}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs px-2 py-1">
                          <option value="high">Alta</option>
                          <option value="medium">Media</option>
                          <option value="low">Baja</option>
                        </Select>
                        <div className="flex-1">{variableSelect(i)}</div>
                      </div>
                    </div>
                  )}

                  {step.kind === 'set_field' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Select value={step.field}
                        onChange={(v) => updateStep(i, { ...step, field: v as any })}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-1">
                        <option value="status">status</option>
                        <option value="goal">goal</option>
                        <option value="notes">notes</option>
                      </Select>
                      <span className="text-sm text-slate-500">=</span>
                      <input type="text" value={step.value}
                        onChange={e => updateStep(i, { ...step, value: e.target.value })}
                        placeholder="Active / vacaciones / …"
                        className="flex-1 min-w-[120px] px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                    </div>
                  )}

                  {step.kind === 'stop_if' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Select value={step.conditionType}
                        onChange={(v) => updateStep(i, { ...step, conditionType: v })}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-1">
                        {(catalog?.stopConditions || [{ id: 'reply', label: 'Cliente respondió' }]).map((c: any) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </Select>
                      <Select value={step.operator}
                        onChange={(v) => updateStep(i, { ...step, operator: v })}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-1">
                        <option value="within">en</option>
                        <option value="==">=</option>
                        <option value=">">{'>'}</option>
                        <option value="<">{'<'}</option>
                      </Select>
                      <input type="text" value={step.value}
                        onChange={e => updateStep(i, { ...step, value: e.target.value })}
                        placeholder="24"
                        className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                    </div>
                  )}

                  {step.kind === 'notify_coach' && (
                    <div className="space-y-2">
                      <input type="text" value={step.title}
                        onChange={e => updateStep(i, { ...step, title: e.target.value })}
                        placeholder="Título de la notificación"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                      <input type="text" value={step.body}
                        onChange={e => updateStep(i, { ...step, body: e.target.value })}
                        placeholder="Detalle (opcional)"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                      {variableSelect(i)}
                    </div>
                  )}

                  {step.kind === 'create_event' && (
                    <div className="space-y-2">
                      <input type="text" value={step.title}
                        onChange={e => updateStep(i, { ...step, title: e.target.value })}
                        placeholder="Título del evento"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                      <div className="flex flex-wrap items-center gap-2">
                        <Select value={step.eventType || 'Call'}
                          onChange={(v) => updateStep(i, { ...step, eventType: v })}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-1">
                          <option value="Call">Llamada</option>
                          <option value="Check-in">Check-in</option>
                          <option value="Training">Entreno</option>
                          <option value="Nutrition">Nutrición</option>
                          <option value="Admin">Admin</option>
                        </Select>
                        <span className="text-sm text-slate-500">en</span>
                        <input type="number" min={0} value={step.offsetDays ?? 0}
                          onChange={e => updateStep(i, { ...step, offsetDays: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                        <span className="text-sm text-slate-500">días, a las</span>
                        <TimeSelect value={step.time || '09:00'}
                          onChange={(v) => updateStep(i, { ...step, time: v })}
                          className="w-28 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-1" />
                      </div>
                    </div>
                  )}

                  {step.kind === 'assign_checkin' && (
                    <div className="space-y-1.5">
                      <Select value={step.templateId}
                        onChange={(v) => updateStep(i, { ...step, templateId: v })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm px-3 py-2">
                        <option value="">— Elige una plantilla de check-in —</option>
                        {checkinTemplates.map(tpl => (
                          <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                        ))}
                      </Select>
                      {checkinTemplates.length === 0 && (
                        <p className="text-[11px] text-amber-600">No tienes plantillas de check-in. Crea una primero.</p>
                      )}
                    </div>
                  )}

                  {step.kind === 'assign_onboarding' && (
                    <div className="space-y-1.5">
                      <Select value={step.templateId}
                        onChange={(v) => updateStep(i, { ...step, templateId: v })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm px-3 py-2">
                        <option value="">— Elige un formulario de onboarding —</option>
                        {onboardingTemplates.map(tpl => (
                          <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                        ))}
                      </Select>
                      {onboardingTemplates.length === 0 && (
                        <p className="text-[11px] text-amber-600">No tienes formularios de onboarding. Crea uno primero.</p>
                      )}
                    </div>
                  )}
                </AutomationCard>
              </React.Fragment>
            );
          })}

          {/* + Add action */}
          <FlowConnector />
          <div className="relative">
            <button
              type="button"
              onClick={() => setAdding(v => !v)}
              disabled={atCap}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-semibold transition-all ${
                atCap
                  ? 'border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                  : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10'
              }`}
            >
              <Plus className="w-4 h-4" />
              {atCap ? `Límite del plan (${maxSteps} pasos)` : t('add_action', { defaultValue: 'Añadir acción' })}
              <ChevronDown className={`w-4 h-4 transition-transform ${adding ? 'rotate-180' : ''}`} />
            </button>
            {adding && !atCap && (
              <div className="absolute z-20 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-2 space-y-1">
                {ADDABLE.map(a => {
                  const meta = STEP_META[a.kind];
                  const Icon = meta.icon;
                  return (
                    <button key={a.kind} onClick={() => addStep(a.kind)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                      <div className={`w-8 h-8 rounded-lg ${meta.iconClass} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{meta.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{a.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. When to send */}
          <FlowConnector />
          <AutomationCard
            variant="module"
            icon={Clock}
            iconClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
            tag={t('when_module_tag', { defaultValue: 'CUÁNDO' })}
            title={t('when_to_send', { defaultValue: 'Cuándo se envía' })}
            subtitle={t('when_to_send_desc', { defaultValue: 'Frecuencia, audiencia y franja horaria del envío.' })}
          >
            <div className="space-y-4">
              {/* Frequency */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('repeat_frequency', { defaultValue: 'Frecuencia' })}</label>
                <div className="flex gap-2">
                  <Select value={rules.frequency} onChange={(v) => updateRule('frequency', v as any)}
                    className="w-28 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm px-3 py-2">
                    <option value="Once">{t('once', { defaultValue: 'Una vez' })}</option>
                    <option value="Every">{t('every', { defaultValue: 'Cada' })}</option>
                  </Select>
                  {rules.frequency === 'Every' && (
                    <div className="flex items-center gap-2">
                      <input type="number" min={1} value={rules.frequencyValue}
                        onChange={e => updateRule('frequencyValue', parseInt(e.target.value) || 1)}
                        className="w-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm px-3 py-2" />
                      <Select value={rules.frequencyUnit} onChange={(v) => updateRule('frequencyUnit', v as any)}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm px-3 py-2">
                        <option value="Days">{t('days', { defaultValue: 'Días' })}</option>
                        <option value="Weeks">{t('weeks', { defaultValue: 'Semanas' })}</option>
                        <option value="Months">{t('months', { defaultValue: 'Meses' })}</option>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Audience */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('target_audience', { defaultValue: 'Audiencia' })}</label>
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 w-fit">
                  {(['All Clients', 'Specific Clients'] as const).map(opt => (
                    <button key={opt} onClick={() => updateRule('audience', opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        rules.audience === opt ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-600' : 'text-slate-500'
                      }`}>
                      {opt === 'All Clients' ? t('all_clients', { defaultValue: 'Todos' }) : t('specific_clients', { defaultValue: 'Específicos' })}
                    </button>
                  ))}
                </div>
                {rules.audience === 'Specific Clients' && (
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {(rules.selected_client_ids || []).map(id => {
                        const c = clients.find(x => x.id === id);
                        return (
                          <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-bold">
                            {c?.name || '—'}
                            <button onClick={() => removeClient(id)}><X className="w-3 h-3" /></button>
                          </span>
                        );
                      })}
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input type="text" value={clientSearch} onChange={e => setClientSearch(e.target.value)}
                        placeholder={t('search_add_client', { defaultValue: 'Buscar cliente…' })}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none" />
                      {clientSearch && (
                        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-44 overflow-y-auto">
                          {filteredClients.length ? filteredClients.map(c => (
                            <button key={c.id} onClick={() => addClient(c.id)}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs">
                              {c.name}
                            </button>
                          )) : <div className="px-3 py-2 text-xs text-slate-400 italic">{t('no_matching_clients', { defaultValue: 'Sin resultados' })}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('preferred_delivery_time', { defaultValue: 'Franja horaria' })}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: 'Morning', time: '8–11h', icon: Sunrise, color: 'text-orange-400' },
                    { label: 'Afternoon', time: '13–16h', icon: Sun, color: 'text-yellow-500' },
                    { label: 'Evening', time: '18–21h', icon: Moon, color: 'text-indigo-400' },
                    { label: 'Custom', time: 'Personal.', icon: Clock, color: 'text-slate-400' },
                  ].map(o => (
                    <button key={o.label} type="button" onClick={() => updateRule('deliveryTime', o.label as any)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                        rules.deliveryTime === o.label
                          ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}>
                      <o.icon className={`w-4 h-4 mb-1 ${o.color}`} />
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-200">{o.label}</span>
                      <span className="text-[10px] text-slate-400">{o.time}</span>
                    </button>
                  ))}
                </div>
                {rules.deliveryTime === 'Custom' && (
                  <TimeSelect value={rules.customTime || '09:00'} onChange={(v) => updateRule('customTime', v)}
                    className="w-40 mt-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm py-2 px-3" />
                )}
              </div>
            </div>
          </AutomationCard>

          {/* 4. Audience filter — activation conditions */}
          <FlowConnector />
          <AutomationCard
            variant="module"
            icon={Filter}
            iconClass="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
            tag={t('filter_module_tag', { defaultValue: 'FILTRO' })}
            title={t('audience_filter', { defaultValue: 'Filtro de cliente' })}
            subtitle={t('audience_filter_desc', { defaultValue: 'Solo se envía a los clientes que cumplan estas condiciones (opcional).' })}
          >
            {renderConditionModule('activation_conditions', catalog?.activationConditions || [], 'teal')}
          </AutomationCard>

          {/* 5. Stop conditions */}
          <FlowConnector />
          <AutomationCard
            variant="module"
            icon={Pause}
            iconClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
            tag={t('stop_module_tag', { defaultValue: 'PARADA' })}
            title={t('stop_conditions', { defaultValue: 'Condiciones de parada' })}
            subtitle={t('stop_conditions_desc', { defaultValue: 'Cuándo el workflow deja de enviar a un cliente.' })}
          >
            {renderConditionModule('stop_conditions', catalog?.stopConditions || [], 'rose')}
          </AutomationCard>
          </div>

          {/* Footer — inside the panel */}
          <div className="flex justify-between items-center px-6 md:px-8 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
            <button onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 font-medium text-sm hover:bg-white dark:hover:bg-slate-800 transition-colors">
              {t('back', { defaultValue: 'Atrás' })}
            </button>
            <button onClick={handleContinue} disabled={!canContinue}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm transition-colors flex items-center gap-2">
              {t('continue_to_review', { defaultValue: 'Continuar a verificación' })}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
