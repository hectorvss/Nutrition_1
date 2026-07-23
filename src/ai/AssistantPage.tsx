/**
 * Nuly AI — página completa del agente (categoría propia del sidebar).
 * Layout: rail de historial (desktop) + columna de chat centrada.
 * Mecánica Max de PostHog: streaming SSE, drafts como tarjetas, aprobaciones.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Send, Square, Plus, Check, Ban, Wrench,
  ChevronDown, ChevronUp, MessageSquareText, TrendingUp,
  ClipboardCheck, Dumbbell, UtensilsCrossed, ShieldCheck, Clock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProfile } from '../context/ProfileContext';
import { useAgentThread } from './useAgentThread';
import type { ConversationSummary, ThreadMessage } from './types';
import { supabase } from '../supabase';
import { getAuthToken } from '../api';

/* ─────────────────────── markdown-lite (sin dependencias) ─────────────────────── */

function inlineMd(text: string, keyBase: string): React.ReactNode[] {
  // **bold** y `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={`${keyBase}-${i}`} className="font-bold text-slate-900 dark:text-white">{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith('`') && p.endsWith('`')) {
      return <code key={`${keyBase}-${i}`} className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-[0.85em] font-mono text-emerald-700 dark:text-emerald-400">{p.slice(1, -1)}</code>;
    }
    return <React.Fragment key={`${keyBase}-${i}`}>{p}</React.Fragment>;
  });
}

function MarkdownLite({ text }: { text: string }) {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flushBullets = (k: string) => {
    if (!bullets.length) return;
    out.push(
      <ul key={k} className="my-1 flex flex-col gap-1">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>{inlineMd(b, `${k}-${i}`)}</span>
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (/^[-•] /.test(trimmed)) {
      bullets.push(trimmed.replace(/^[-•] /, ''));
      return;
    }
    flushBullets(`ul-${i}`);
    if (/^#{1,3} /.test(trimmed)) {
      out.push(
        <p key={i} className="font-black text-slate-900 dark:text-white mt-2 mb-0.5">
          {inlineMd(trimmed.replace(/^#{1,3} /, ''), `h-${i}`)}
        </p>,
      );
    } else if (trimmed === '') {
      out.push(<div key={i} className="h-1.5" />);
    } else {
      out.push(<p key={i}>{inlineMd(line, `p-${i}`)}</p>);
    }
  });
  flushBullets('ul-end');
  return <div className="flex flex-col gap-0.5">{out}</div>;
}

/* ─────────────────────────────── piezas de UI ─────────────────────────────── */

function AiAvatar({ pulsing }: { pulsing?: boolean }) {
  return (
    <div className={`w-7 h-7 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-emerald-400 dark:to-emerald-600 flex items-center justify-center shrink-0 shadow-sm ${pulsing ? 'animate-pulse' : ''}`}>
      <Sparkles className="w-3.5 h-3.5 text-emerald-400 dark:text-slate-900" />
    </div>
  );
}

function ToolChip({ name }: { name: string; key?: React.Key }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      <Wrench className="w-3 h-3 text-emerald-500" /> {name}
    </span>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '900ms' }}
        />
      ))}
    </span>
  );
}

/** Tarjetas de artifacts: drafts de planes generados por el agente */
function ArtifactCard({ artifact }: { artifact: any }) {
  const [open, setOpen] = useState(false);
  const shell = 'max-w-[95%] rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 bg-gradient-to-b from-emerald-50/80 to-white dark:from-emerald-900/15 dark:to-slate-900 overflow-hidden shadow-sm';
  if (artifact?.kind === 'training_draft') {
    return (
      <div className={shell}>
        <div className="px-4 py-3 border-b border-emerald-100 dark:border-emerald-800/40 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Dumbbell className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Borrador · Entrenamiento</p>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate">{artifact.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{artifact.client_name} · {artifact.days_per_week} días/semana</p>
          </div>
        </div>
        <div className="px-4 py-2.5 flex flex-col gap-1.5">
          {(artifact.workouts || []).slice(0, open ? 99 : 3).map((w: any, i: number) => (
            <div key={i}>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{w.name}</p>
              {open && (w.blocks || []).map((b: any, j: number) => (
                <p key={j} className="text-[11px] text-slate-500 dark:text-slate-400 pl-2">
                  {b.name}: {(b.exercises || []).map((e: any) => `${e.name} ${e.sets}×${e.reps}`).join(' · ')}
                </p>
              ))}
            </div>
          ))}
          <button onClick={() => setOpen(o => !o)} className="self-start text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            {open ? 'Ver menos' : 'Ver detalle completo'}
          </button>
          {artifact.warnings?.length > 0 && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400">⚠ {artifact.warnings.join('; ')}</p>
          )}
        </div>
      </div>
    );
  }
  if (artifact?.kind === 'nutrition_draft') {
    const t = artifact.targets || {};
    const tot = artifact.totals || {};
    return (
      <div className={shell}>
        <div className="px-4 py-3 border-b border-emerald-100 dark:border-emerald-800/40 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Borrador · Nutrición</p>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate">{artifact.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {artifact.client_name} · target {t.kcal} kcal (P{t.protein}/C{t.carbs}/G{t.fats}) · plan {tot.kcal} kcal
            </p>
          </div>
        </div>
        <div className="px-4 py-2.5 flex flex-col gap-1.5">
          {(artifact.meals || []).slice(0, open ? 99 : 3).map((m: any, i: number) => (
            <div key={i}>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{m.name} <span className="font-normal text-slate-400">{m.time}</span></p>
              {open && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-2">
                  {(m.items || []).map((it: any) => `${it.name} ×${it.quantity} (${it.calories}kcal)`).join(' · ')}
                </p>
              )}
            </div>
          ))}
          <button onClick={() => setOpen(o => !o)} className="self-start text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            {open ? 'Ver menos' : 'Ver detalle completo'}
          </button>
          {artifact.warnings?.length > 0 && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400">⚠ {artifact.warnings.join('; ')}</p>
          )}
        </div>
      </div>
    );
  }
  if (artifact?.kind === 'assigned' || artifact?.kind === 'billing_action' || artifact?.kind === 'reminder_sent') {
    const label =
      artifact.kind === 'assigned'
        ? artifact.plan === 'training' ? 'Programa de entrenamiento asignado' : 'Plan de nutrición asignado'
        : artifact.kind === 'reminder_sent'
          ? 'Recordatorio de pago enviado'
          : artifact.action === 'cancel'
            ? artifact.scheduled ? 'Cancelación programada a fin de ciclo' : 'Suscripción cancelada'
            : artifact.action === 'pause' ? 'Suscripción pausada' : 'Suscripción reanudada';
    return (
      <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
        <ShieldCheck className="w-3.5 h-3.5" /> {label}
      </div>
    );
  }
  return null;
}

const MessageBubble = React.memo(function MessageBubble({ msg }: { msg: ThreadMessage }) {
  const [expanded, setExpanded] = useState(false);
  if (msg.type === 'human') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-4.5 py-3 text-sm whitespace-pre-wrap shadow-md shadow-emerald-500/20">
          {msg.content}
        </div>
      </div>
    );
  }
  if (msg.type === 'tool') {
    const artifact = msg.ui_payload?.artifact as any;
    if (artifact?.kind) {
      const card = <ArtifactCard artifact={artifact} />;
      if (card) return <div className="pl-9">{card}</div>;
    }
    return (
      <div className="pl-9 flex flex-col gap-1">
        <button
          onClick={() => setExpanded(e => !e)}
          className="self-start flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <ToolChip name={msg.tool_name} />
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {expanded && (
          <pre className="max-w-full overflow-x-auto rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-pre-wrap break-words border border-slate-100 dark:border-slate-800">
            {msg.content.slice(0, 2000)}
          </pre>
        )}
      </div>
    );
  }
  if (msg.type === 'ai/failure') {
    return (
      <div className="pl-9 max-w-[85%] rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2.5 text-sm border border-red-100 dark:border-red-900/40">
        {msg.content}
      </div>
    );
  }
  return (
    <div className="flex gap-2.5 items-start">
      <AiAvatar pulsing={msg.status === 'loading'} />
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {msg.tool_calls && msg.tool_calls.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {msg.tool_calls.map(tc => (
              <ToolChip key={tc.id || tc.name} name={tc.name} />
            ))}
          </div>
        )}
        {msg.content && (
          <div className="max-w-full rounded-3xl rounded-tl-lg bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/50 px-4.5 py-3 text-sm text-slate-700 dark:text-slate-200 shadow-sm">
            <MarkdownLite text={msg.content} />
            {msg.status === 'loading' && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-emerald-500 animate-pulse align-text-bottom rounded-full" />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

/* ─────────────────────────────── página ─────────────────────────────── */

const SUGGESTIONS = (isEs: boolean) => [
  {
    icon: TrendingUp,
    label: isEs ? 'Negocio' : 'Business',
    text: isEs ? '¿Cómo va mi negocio esta semana?' : 'How is my business doing this week?',
  },
  {
    icon: ClipboardCheck,
    label: isEs ? 'Check-ins' : 'Check-ins',
    text: isEs ? '¿Qué check-ins tengo pendientes de revisar?' : 'Which check-ins are pending review?',
  },
  {
    icon: Clock,
    label: isEs ? 'Clientes' : 'Clients',
    text: isEs ? '¿Qué clientes llevan más de una semana sin entrenar?' : 'Which clients have not trained in over a week?',
  },
  {
    icon: Dumbbell,
    label: isEs ? 'Entrenamiento' : 'Training',
    text: isEs ? 'Genera un programa de hipertrofia de 4 días para un cliente' : 'Generate a 4-day hypertrophy program for a client',
  },
];

function relativeDate(iso: string, isEs: boolean): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return isEs ? `hace ${Math.max(1, mins)} min` : `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return isEs ? `hace ${hours} h` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return isEs ? `hace ${days} d` : `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AssistantPage({ selectedClientId }: { selectedClientId?: string | null }) {
  const { language } = useLanguage();
  const { profile } = useProfile();
  const isEs = language !== 'en';
  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const [input, setInput] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const uiContext = useMemo(
    () => ({ view: 'assistant', client_id: selectedClientId || undefined, language: (isEs ? 'es' : 'en') as 'es' | 'en' }),
    [selectedClientId, isEs],
  );
  const thread = useAgentThread(uiContext);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [thread.messages, thread.pendingApproval]);

  const loadHistory = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token || getAuthToken();
      const res = await fetch('/api/ai/conversations', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setHistory(json.conversations || []);
      }
    } catch {
      /* best-effort */
    }
  };
  useEffect(() => {
    void loadHistory();
  }, []);

  const submit = () => {
    const text = input.trim();
    if (!text || thread.streaming) return;
    setInput('');
    void thread.ask(text);
  };

  const firstName = (profile?.full_name || '').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = isEs
    ? hour < 7 || hour >= 21 ? 'Buenas noches' : hour < 14 ? 'Buenos días' : 'Buenas tardes'
    : hour < 12 ? 'Good morning' : hour < 19 ? 'Good afternoon' : 'Good evening';

  const suggestions = SUGGESTIONS(isEs);
  const emptyThread = thread.messages.length === 0;

  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-950">
      {/* Rail de historial (desktop) */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="p-3">
          <button
            onClick={() => { thread.reset(); void loadHistory(); }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-900 font-bold text-sm py-2.5 hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" /> {isEs ? 'Nueva conversación' : 'New conversation'}
          </button>
        </div>
        <p className="px-4 pb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
          {isEs ? 'Recientes' : 'Recent'}
        </p>
        <div className="flex-1 overflow-y-auto px-2 pb-3 flex flex-col gap-0.5">
          {history.length === 0 && (
            <div className="mt-8 flex flex-col items-center gap-2 px-4 text-center">
              <MessageSquareText className="w-7 h-7 text-slate-300 dark:text-slate-700" />
              <p className="text-xs text-slate-400">
                {isEs ? 'Tus conversaciones aparecerán aquí.' : 'Your conversations will appear here.'}
              </p>
            </div>
          )}
          {history.map(c => {
            const active = c.id === thread.conversationId;
            return (
              <button
                key={c.id}
                onClick={() => void thread.loadConversation(c.id)}
                className={`relative text-left pl-4 pr-3 py-2.5 rounded-xl transition-colors ${
                  active
                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'
                }`}
              >
                {active && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-emerald-500" />}
                <p className={`text-[13px] font-semibold truncate ${active ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {c.title || '—'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{relativeDate(c.updated_at, isEs)}</p>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Glow decorativo del fondo */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(16,185,129,0.08),transparent)] dark:bg-[radial-gradient(60%_100%_at_50%_0%,rgba(16,185,129,0.06),transparent)]" />

        <div className="h-14 shrink-0 flex items-center gap-2.5 px-5 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur relative z-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-emerald-400 dark:to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-4.5 h-4.5 text-emerald-400 dark:text-slate-900" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-slate-900 dark:text-white tracking-tight leading-none">Nuly AI</p>
            <p className="text-[11px] text-slate-400 truncate">
              {isEs ? 'Tu copiloto: clientes, planes, mensajes y métricas' : 'Your copilot: clients, plans, messages and metrics'}
            </p>
          </div>
          {selectedClientId && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
              {isEs ? 'Con contexto del cliente abierto' : 'With open client context'}
            </span>
          )}
          <button
            onClick={() => { thread.reset(); void loadHistory(); }}
            className="md:hidden ml-auto p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isEs ? 'Nueva conversación' : 'New conversation'}
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto relative z-0">
          <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
            {emptyThread && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="mt-[8vh] flex flex-col items-center gap-6"
              >
                <motion.div
                  initial={{ scale: 0.8, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/10"
                >
                  <Sparkles className="w-8 h-8 text-emerald-400 dark:text-slate-900" />
                </motion.div>
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    {greeting}{firstName ? `, ${firstName}` : ''}
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    {isEs
                      ? 'Pregúntame por tus clientes, check-ins o métricas. Genero planes de entrenamiento y nutrición, y con tu aprobación actúo por ti: mensajes, cobros, asignaciones.'
                      : 'Ask me about your clients, check-ins or metrics. I generate training and nutrition plans and, with your approval, act for you: messages, billing, assignments.'}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5 w-full">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={s.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * i, duration: 0.3 }}
                      onClick={() => void thread.ask(s.text)}
                      className="group text-left px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5 transition-all"
                    >
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-500 transition-colors">
                        <s.icon className="w-3.5 h-3.5" /> {s.label}
                      </span>
                      <span className="block mt-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                        {s.text}
                      </span>
                    </motion.button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {isEs
                    ? 'Toda acción sensible requiere tu aprobación antes de ejecutarse.'
                    : 'Every sensitive action requires your approval before it runs.'}
                </p>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {thread.messages.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <MessageBubble msg={m} />
                </motion.div>
              ))}
            </AnimatePresence>

            {thread.streaming && thread.messages.at(-1)?.type === 'human' && (
              <div className="flex gap-2.5 items-center">
                <AiAvatar pulsing />
                <div className="rounded-3xl rounded-tl-lg bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/50 px-4 py-3 shadow-sm">
                  <ThinkingDots />
                </div>
              </div>
            )}
            {thread.error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3.5 py-2.5 text-sm border border-red-100 dark:border-red-900/40">
                {thread.error}
              </div>
            )}
            <div className="h-2" />
          </div>
        </div>

        {/* Composer / aprobación */}
        <div className="shrink-0 relative z-10 bg-gradient-to-t from-slate-50 via-slate-50 dark:from-slate-950 dark:via-slate-950 to-transparent pt-2">
          <div className="max-w-2xl mx-auto px-4 pb-4">
            {thread.pendingApproval ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2.5 rounded-2xl border border-amber-200 dark:border-amber-700/50 bg-white dark:bg-slate-900 shadow-xl shadow-amber-500/5 p-3.5">
                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/15 px-3.5 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isEs ? 'Requiere tu aprobación' : 'Needs your approval'} · {thread.pendingApproval.tool_name}
                  </p>
                  <div className="text-sm text-slate-700 dark:text-slate-200 max-h-56 overflow-y-auto">
                    <MarkdownLite text={thread.pendingApproval.preview} />
                  </div>
                </div>
                {rejectMode ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={rejectFeedback}
                      onChange={e => setRejectFeedback(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          void thread.resume({ action: 'reject', proposal_id: thread.pendingApproval!.proposal_id, feedback: rejectFeedback || undefined });
                          setRejectMode(false); setRejectFeedback('');
                        }
                      }}
                      placeholder={isEs ? 'Motivo (opcional) + Enter' : 'Reason (optional) + Enter'}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-400"
                    />
                    <button
                      onClick={() => { setRejectMode(false); setRejectFeedback(''); }}
                      className="px-3 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
                    >
                      {isEs ? 'Atrás' : 'Back'}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => void thread.resume({ action: 'approve', proposal_id: thread.pendingApproval!.proposal_id })}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 shadow-md shadow-emerald-500/20 transition-colors"
                    >
                      <Check className="w-4 h-4" /> {isEs ? 'Aprobar y ejecutar' : 'Approve & execute'}
                    </button>
                    <button
                      onClick={() => setRejectMode(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm py-2.5 transition-colors"
                    >
                      <Ban className="w-4 h-4" /> {isEs ? 'Rechazar' : 'Reject'}
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-end gap-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 shadow-xl shadow-slate-900/5 dark:shadow-black/20 p-2 focus-within:border-emerald-400 dark:focus-within:border-emerald-600 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  rows={Math.min(5, Math.max(1, input.split('\n').length))}
                  placeholder={isEs ? 'Pregunta o pide algo a Nuly AI…' : 'Ask Nuly AI anything…'}
                  className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
                />
                {thread.streaming ? (
                  <button
                    onClick={() => void thread.cancel()}
                    title={isEs ? 'Detener' : 'Stop'}
                    className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white hover:opacity-90 transition-opacity"
                  >
                    <Square className="w-4.5 h-4.5" />
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={!input.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white disabled:opacity-30 hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            )}
            <p className="mt-1.5 text-center text-[10px] text-slate-400 dark:text-slate-600">
              {isEs ? 'Enter para enviar · Shift+Enter para nueva línea' : 'Enter to send · Shift+Enter for a new line'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
