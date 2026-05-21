// Unified card shell for the simple-automation flow builder.
//
// Every block in the builder — the trigger, each action, the "when to send"
// module and the "stop conditions" module — renders inside this same card so
// the whole flow reads as one consistent vertical sequence.
//
// It's purely presentational: the parent owns all state and passes the body
// as children plus optional header affordances (remove, reorder).

import React from 'react';
import { ChevronUp, ChevronDown, Trash2, GripVertical } from 'lucide-react';

export interface AutomationCardProps {
  /** Lucide icon component for the card type. */
  icon: React.ElementType;
  /** Tailwind classes for the icon chip, e.g. "bg-emerald-100 text-emerald-600". */
  iconClass?: string;
  /** Step number shown in the corner. Omit for fixed modules (trigger/when/stop). */
  index?: number;
  title: string;
  subtitle?: string;
  /** Small uppercase tag, e.g. "TRIGGER", "ACCIÓN", "CUÁNDO". */
  tag?: string;
  children?: React.ReactNode;
  /** Header action callbacks — only rendered when provided. */
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  /** Visually mark the card as the trigger / a fixed module. */
  variant?: 'trigger' | 'action' | 'module';
}

export default function AutomationCard({
  icon: Icon, iconClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  index, title, subtitle, tag, children,
  onRemove, onMoveUp, onMoveDown, variant = 'action',
}: AutomationCardProps) {
  const ring = variant === 'trigger'
    ? 'border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200/60 dark:ring-emerald-800/40'
    : variant === 'module'
      ? 'border-slate-300 dark:border-slate-700'
      : 'border-slate-200 dark:border-slate-800';

  return (
    <div className={`group bg-white dark:bg-slate-900 rounded-2xl border ${ring} shadow-sm transition-all`}>
      <div className="flex items-start gap-3 p-4">
        {/* Icon + step number */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div className={`w-10 h-10 rounded-xl ${iconClass} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          {typeof index === 'number' && (
            <span className="text-[10px] font-bold text-slate-400">{index}</span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="min-w-0">
              {tag && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{tag}</span>
              )}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{title}</h3>
            </div>
            {/* Header affordances */}
            <div className="flex items-center gap-0.5 shrink-0">
              {onMoveUp && (
                <button onClick={onMoveUp} title="Subir" className="p-1 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 rounded">
                  <ChevronUp className="w-4 h-4" />
                </button>
              )}
              {onMoveDown && (
                <button onClick={onMoveDown} title="Bajar" className="p-1 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 rounded">
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
              {onRemove && (
                <button onClick={onRemove} title="Eliminar" className="p-1 text-slate-300 hover:text-red-500 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

// Connector arrow drawn between cards so the flow reads top-to-bottom.
export function FlowConnector() {
  return (
    <div className="flex justify-center py-1">
      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}
