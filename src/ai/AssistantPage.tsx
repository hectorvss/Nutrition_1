/**
 * Nuly AI — página completa del agente (categoría propia del sidebar).
 * Layout: rail de historial (desktop) + columna de chat centrada.
 * Mecánica Max de PostHog: streaming SSE, drafts como tarjetas, aprobaciones.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles, Send, Square, Plus, Check, Ban, Wrench,
  ChevronDown, ChevronUp, Loader2, MessageSquareText,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAgentThread } from './useAgentThread';
import type { ConversationSummary, ThreadMessage } from './types';
import { supabase } from '../supabase';
import { getAuthToken } from '../api';

const SUGGESTIONS_ES = [
  '¿Cómo va mi negocio esta semana?',
  '¿Qué check-ins tengo pendientes de revisar?',
  '¿Qué clientes llevan más de una semana sin entrenar?',
  'Genera un programa de hipertrofia de 4 días para un cliente',
];
const SUGGESTIONS_EN = [
  'How is my business doing this week?',
  'Which check-ins are pending review?',
  'Which clients have not trained in over a week?',
  'Generate a 4-day hypertrophy program for a client',
];

function ToolChip({ name }: { name: string; key?: React.Key }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      <Wrench className="w-3 h-3" /> {name}
    </span>
  );
}

/** Tarjetas de artifacts: drafts de planes generados por el agente */
function ArtifactCard({ artifact }: { artifact: any }) {
  const [open, setOpen] = useState(false);
  if (artifact?.kind === 'training_draft') {
    return (
      <div className="max-w-[95%] rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-900/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-emerald-100 dark:border-emerald-800/40">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Borrador · Entrenamiento</p>
          <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{artifact.name}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{artifact.client_name} · {artifact.days_per_week} días/semana</p>
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
      <div className="max-w-[95%] rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-900/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-emerald-100 dark:border-emerald-800/40">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Borrador · Nutrición</p>
          <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{artifact.name}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {artifact.client_name} · target {t.kcal} kcal (P{t.protein}/C{t.carbs}/G{t.fats}) · plan {tot.kcal} kcal
          </p>
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
  if (artifact?.kind === 'assigned') {
    return (
      <div className="max-w-[85%] rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
        ✓ {artifact.plan === 'training' ? 'Programa de entrenamiento asignado' : 'Plan de nutrición asignado'}
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
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-emerald-600 text-white px-4 py-2.5 text-sm whitespace-pre-wrap">
          {msg.content}
        </div>
      </div>
    );
  }
  if (msg.type === 'tool') {
    const artifact = msg.ui_payload?.artifact as any;
    if (artifact?.kind && ['training_draft', 'nutrition_draft', 'assigned'].includes(artifact.kind)) {
      return <ArtifactCard artifact={artifact} />;
    }
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setExpanded(e => !e)}
          className="self-start flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <ToolChip name={msg.tool_name} />
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {expanded && (
          <pre className="max-w-full overflow-x-auto rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2 text-[11px] text-slate-500 dark:text-slate-400 whitespace-pre-wrap break-words">
            {msg.content.slice(0, 2000)}
          </pre>
        )}
      </div>
    );
  }
  if (msg.type === 'ai/failure') {
    return (
      <div className="max-w-[85%] rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2.5 text-sm">
        {msg.content}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      {msg.tool_calls && msg.tool_calls.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {msg.tool_calls.map(tc => (
            <ToolChip key={tc.id || tc.name} name={tc.name} />
          ))}
        </div>
      )}
      {msg.content && (
        <div className="max-w-[92%] rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
          {msg.content}
          {msg.status === 'loading' && <span className="inline-block w-1.5 h-4 ml-0.5 bg-emerald-500 animate-pulse align-text-bottom" />}
        </div>
      )}
    </div>
  );
});

export default function AssistantPage({ selectedClientId }: { selectedClientId?: string | null }) {
  const { language } = useLanguage();
  const isEs = language !== 'en';
  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const [input, setInput] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const uiContext = useMemo(
    () => ({ view: 'assistant', client_id: selectedClientId || undefined, language: (isEs ? 'es' : 'en') as 'es' | 'en' }),
    [selectedClientId, isEs],
  );
  const thread = useAgentThread(uiContext);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
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

  const suggestions = isEs ? SUGGESTIONS_ES : SUGGESTIONS_EN;

  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-950">
      {/* Rail de historial (desktop) */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="p-3">
          <button
            onClick={() => { thread.reset(); void loadHistory(); }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-900 font-bold text-sm py-2.5 hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> {isEs ? 'Nueva conversación' : 'New conversation'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3 flex flex-col gap-0.5">
          {history.length === 0 && (
            <p className="text-xs text-slate-400 text-center mt-6 px-4">
              {isEs ? 'Tus conversaciones aparecerán aquí.' : 'Your conversations will appear here.'}
            </p>
          )}
          {history.map(c => (
            <button
              key={c.id}
              onClick={() => void thread.loadConversation(c.id)}
              className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                c.id === thread.conversationId
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50'
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate flex items-center gap-1.5">
                <MessageSquareText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{c.title || '—'}</span>
              </p>
              <p className="text-[10px] text-slate-400 pl-5">{new Date(c.updated_at).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 shrink-0 flex items-center gap-2.5 px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-emerald-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-emerald-400 dark:text-slate-900" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-slate-900 dark:text-white tracking-tight leading-none">Nuly AI</p>
            <p className="text-[11px] text-slate-400 truncate">
              {isEs ? 'Tu copiloto: clientes, planes, mensajes y métricas' : 'Your copilot: clients, plans, messages and metrics'}
            </p>
          </div>
          {selectedClientId && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
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

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-3">
            {thread.messages.length === 0 && (
              <div className="mt-10 flex flex-col items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-emerald-400 dark:text-slate-900" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
                  {isEs
                    ? 'Pregúntame por tus clientes, check-ins, mensajes o métricas. Puedo generar planes de entrenamiento y nutrición, y con tu aprobación, actuar por ti.'
                    : 'Ask me about your clients, check-ins, messages or metrics. I can generate training and nutrition plans and, with your approval, act on your behalf.'}
                </p>
                <div className="grid sm:grid-cols-2 gap-2 w-full mt-1">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => void thread.ask(s)}
                      className="text-left text-sm px-3.5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {thread.messages.map(m => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {thread.streaming && thread.messages.at(-1)?.type === 'human' && (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> {isEs ? 'Pensando…' : 'Thinking…'}
              </div>
            )}
            {thread.error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3.5 py-2.5 text-sm">
                {thread.error}
              </div>
            )}
          </div>
        </div>

        {/* Composer / aprobación */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-2xl mx-auto p-3">
            {thread.pendingApproval ? (
              <div className="flex flex-col gap-2.5">
                <div className="rounded-xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/15 px-3.5 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">
                    {isEs ? 'Requiere tu aprobación' : 'Needs your approval'} · {thread.pendingApproval.tool_name}
                  </p>
                  <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap max-h-56 overflow-y-auto">
                    {thread.pendingApproval.preview.replace(/\*\*/g, '').replace(/^> /gm, '')}
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
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5"
                    >
                      <Check className="w-4 h-4" /> {isEs ? 'Aprobar y ejecutar' : 'Approve & execute'}
                    </button>
                    <button
                      onClick={() => setRejectMode(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm py-2.5"
                    >
                      <Ban className="w-4 h-4" /> {isEs ? 'Rechazar' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  rows={Math.min(4, Math.max(1, input.split('\n').length))}
                  placeholder={isEs ? 'Pregunta o pide algo…' : 'Ask or request anything…'}
                  className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-400 placeholder:text-slate-400"
                />
                {thread.streaming ? (
                  <button
                    onClick={() => void thread.cancel()}
                    title={isEs ? 'Detener' : 'Stop'}
                    className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white hover:opacity-90"
                  >
                    <Square className="w-4.5 h-4.5" />
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={!input.trim()}
                    className="p-2.5 rounded-xl bg-emerald-600 text-white disabled:opacity-40 hover:bg-emerald-700"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
