// Editor visual de la cadena multi-step de una automation.
//
// Cada paso es un AutomationStep tipado (message | wait | create_task |
// set_field | stop_if). Renderizamos una lista vertical donde cada step
// se ve como una tarjeta con el icono del tipo y los campos editables.
//
// Disenado para ser FACIL: el primer step siempre es "Enviar mensaje" (por
// el objetivo del workflow) y los siguientes se anaden con el boton
// "Anadir paso" que muestra un menu con los tipos disponibles. Al pulsar
// Trash se elimina ese paso. No hay drag-handle (overkill aqui — el
// usuario rara vez va a tener mas de 5 pasos).

import React, { useState } from 'react';
import {
  Send, Clock, ClipboardList, Edit2, AlertCircle, Plus, Trash2,
  ChevronDown,
} from 'lucide-react';

export type AutomationStep =
  | { kind: 'message'; message: string }
  | { kind: 'wait'; amount: number; unit: 'hours' | 'days'; cancelIfReplied?: boolean }
  | { kind: 'create_task'; title: string; type?: string; priority?: 'low'|'medium'|'high'; date?: string }
  | { kind: 'set_field'; field: 'status' | 'goal' | 'notes'; value: string }
  | { kind: 'stop_if'; conditionType: string; operator: string; value: string }
  | { kind: 'notify_coach'; title: string; body: string }
  | { kind: 'create_event'; title: string; eventType?: string; offsetDays?: number; time?: string }
  | { kind: 'assign_checkin'; templateId: string }
  | { kind: 'assign_onboarding'; templateId: string };

const STEP_TYPES: Array<{
  kind: AutomationStep['kind'];
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}> = [
  { kind: 'message',     label: 'Enviar mensaje',        desc: 'Envia un mensaje al chat del cliente.',                 icon: Send,          color: 'text-emerald-500' },
  { kind: 'wait',        label: 'Esperar',                desc: 'Pausa la cadena X horas o dias antes del siguiente paso.', icon: Clock,         color: 'text-blue-500' },
  { kind: 'create_task', label: 'Crear tarea para mi',    desc: 'Crea una tarea en tu panel (escalada al coach).',       icon: ClipboardList, color: 'text-purple-500' },
  { kind: 'set_field',   label: 'Etiquetar al cliente',   desc: 'Cambia un campo del cliente (status/goal/notas).',     icon: Edit2,         color: 'text-amber-500' },
  { kind: 'stop_if',     label: 'Parar si...',            desc: 'Aborta la cadena cuando una condicion se cumple.',     icon: AlertCircle,   color: 'text-rose-500' },
];

function defaultStepFor(kind: AutomationStep['kind']): AutomationStep {
  switch (kind) {
    case 'message':     return { kind, message: '' };
    case 'wait':        return { kind, amount: 1, unit: 'days', cancelIfReplied: true };
    case 'create_task': return { kind, title: '', type: 'Admin', priority: 'medium' };
    case 'set_field':   return { kind, field: 'status', value: 'Active' };
    case 'stop_if':     return { kind, conditionType: 'reply', operator: 'within', value: '24' };
  }
}

interface StepSequenceProps {
  steps: AutomationStep[];
  onChange: (next: AutomationStep[]) => void;
  /** Maximo permitido por el plan del manager. null = ilimitado. */
  maxSteps: number | null;
  /**
   * Catalogo de condition types (para el dropdown del step `stop_if`).
   * Si vacio, el step usa un input libre.
   */
  conditionCatalog?: Array<{ id: string; label: string }>;
  /** Variables disponibles para insertar en mensajes/titulos. */
  variables?: Array<{ label: string; desc?: string }>;
}

export default function StepSequence({ steps, onChange, maxSteps, conditionCatalog = [], variables = [] }: StepSequenceProps) {
  const [adding, setAdding] = useState(false);

  const updateStep = (i: number, next: AutomationStep) => {
    onChange(steps.map((s, idx) => idx === i ? next : s));
  };
  const removeStep = (i: number) => onChange(steps.filter((_, idx) => idx !== i));
  const addStep = (kind: AutomationStep['kind']) => {
    onChange([...steps, defaultStepFor(kind)]);
    setAdding(false);
  };

  const atCap = maxSteps != null && steps.length >= maxSteps;

  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const meta = STEP_TYPES.find(t => t.kind === step.kind)!;
        const Icon = meta.icon;
        return (
          <div
            key={i}
            className="group bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 transition-all hover:border-slate-300 dark:hover:border-slate-600"
          >
            <div className="flex items-start gap-3">
              {/* Numero + icono */}
              <div className="shrink-0 flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                  {i + 1}
                </div>
                <Icon className={`w-5 h-5 ${meta.color}`} />
              </div>

              {/* Cuerpo editable por kind */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">{meta.label}</span>
                  {steps.length > 1 && (
                    <button
                      onClick={() => removeStep(i)}
                      className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar paso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {step.kind === 'message' && (
                  <div className="space-y-2">
                    <textarea
                      value={step.message}
                      onChange={e => updateStep(i, { ...step, message: e.target.value })}
                      placeholder="Hola {First Name}, ..."
                      rows={3}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                    />
                    {variables.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {variables.slice(0, 6).map(v => (
                          <button
                            key={v.label}
                            type="button"
                            onClick={() => updateStep(i, { ...step, message: step.message + v.label })}
                            className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-2 py-0.5 rounded transition-colors"
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {step.kind === 'wait' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Esperar</span>
                    <input
                      type="number"
                      min={1}
                      value={step.amount}
                      onChange={e => updateStep(i, { ...step, amount: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                    <select
                      value={step.unit}
                      onChange={e => updateStep(i, { ...step, unit: e.target.value as any })}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                    >
                      <option value="hours">horas</option>
                      <option value="days">dias</option>
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!step.cancelIfReplied}
                        onChange={e => updateStep(i, { ...step, cancelIfReplied: e.target.checked })}
                        className="rounded text-emerald-500"
                      />
                      cancelar si responde
                    </label>
                  </div>
                )}

                {step.kind === 'create_task' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => updateStep(i, { ...step, title: e.target.value })}
                      placeholder="Llamar a {First Name} si no responde"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={step.priority || 'medium'}
                        onChange={e => updateStep(i, { ...step, priority: e.target.value as any })}
                        className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Baja</option>
                      </select>
                      <select
                        value={step.type || 'Admin'}
                        onChange={e => updateStep(i, { ...step, type: e.target.value })}
                        className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        <option>Admin</option>
                        <option>Check-in</option>
                        <option>Call</option>
                        <option>Training</option>
                        <option>Nutrition</option>
                      </select>
                    </div>
                  </div>
                )}

                {step.kind === 'set_field' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={step.field}
                      onChange={e => updateStep(i, { ...step, field: e.target.value as any })}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                    >
                      <option value="status">status</option>
                      <option value="goal">goal</option>
                      <option value="notes">notes</option>
                    </select>
                    <span className="text-sm text-slate-500 dark:text-slate-400">=</span>
                    <input
                      type="text"
                      value={step.value}
                      onChange={e => updateStep(i, { ...step, value: e.target.value })}
                      placeholder="Active / vacaciones / ..."
                      className="flex-1 min-w-[120px] px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}

                {step.kind === 'stop_if' && (
                  <div className="flex flex-wrap items-center gap-2">
                    {conditionCatalog.length > 0 ? (
                      <select
                        value={step.conditionType}
                        onChange={e => updateStep(i, { ...step, conditionType: e.target.value })}
                        className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        {conditionCatalog.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={step.conditionType}
                        onChange={e => updateStep(i, { ...step, conditionType: e.target.value })}
                        placeholder="condition_type"
                        className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-40 focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    )}
                    <select
                      value={step.operator}
                      onChange={e => updateStep(i, { ...step, operator: e.target.value })}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                    >
                      <option value=">">{'>'}</option>
                      <option value="<">{'<'}</option>
                      <option value=">=">{'>='}</option>
                      <option value="<=">{'<='}</option>
                      <option value="==">{'='}</option>
                      <option value="within">en</option>
                    </select>
                    <input
                      type="text"
                      value={step.value}
                      onChange={e => updateStep(i, { ...step, value: e.target.value })}
                      placeholder="24"
                      className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Boton anadir paso */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setAdding(v => !v)}
          disabled={atCap}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-semibold transition-all
            ${atCap
              ? 'border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10'}`}
        >
          <Plus className="w-4 h-4" />
          {atCap
            ? `Limite alcanzado (${maxSteps} pasos en tu plan)`
            : 'Anadir paso'}
          <ChevronDown className={`w-4 h-4 transition-transform ${adding ? 'rotate-180' : ''}`} />
        </button>

        {adding && !atCap && (
          <div className="absolute z-20 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-2 space-y-1">
            {STEP_TYPES.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.kind}
                  onClick={() => addStep(t.kind)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <Icon className={`w-5 h-5 mt-0.5 ${t.color}`} />
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{t.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
