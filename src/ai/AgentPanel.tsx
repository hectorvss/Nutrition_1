/**
 * Nuly AI — panel lateral del agente (estética Nuly, mecánica Max de PostHog).
 * Incluye: FAB de apertura, hilo con streaming, aprobaciones en el composer,
 * historial de conversaciones y cancelación.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, X, Send, Square, Plus, History, Check, Ban,
  Wrench, ChevronDown, ChevronUp, Loader2,
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
];
const SUGGESTIONS_EN = [
  'How is my business doing this week?',
  'Which check-ins are pending review?',
  'Which clients have not trained in over a week?',
];

function ToolChip({ name }: { name: string; key?: React.Key }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      <Wrench className="w-3 h-3" /> {name}
    </span>
  );
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
  // ai
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
        <div
          className={`max-w-[92%] rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap ${
            msg.status === 'loading' ? 'animate-pulse-subtle' : ''
          }`}
        >
          {msg.content}
          {msg.status === 'loading' && <span className="inline-block w-1.5 h-4 ml-0.5 bg-emerald-500 animate-pulse align-text-bottom" />}
        </div>
      )}
    </div>
  );
});

export default function AgentPanel({ currentView, selectedClientId }: { currentView?: string; selectedClientId?: string | null }) {
  const { language } = useLanguage();
  const isEs = language !== 'en';
  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const [input, setInput] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const uiContext = useMemo(
    () => ({ view: currentView, client_id: selectedClientId || undefined, language: (isEs ? 'es' : 'en') as 'es' | 'en' }),
    [currentView, selectedClientId, isEs],
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

  const submit = () => {
    const text = input.trim();
    if (!text || thread.streaming) return;
    setInput('');
    void thread.ask(text);
  };

  const suggestions = isEs ? SUGGESTIONS_ES : SUGGESTIONS_EN;

  return (
    <>
      {/* FAB — visible en cualquier vista del manager */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Nuly AI"
          className="fixed bottom-6 right-6 z-[90] w-13 h-13 p-3.5 rounded-2xl bg-slate-900 dark:bg-emerald-500 text-emerald-400 dark:text-slate-900 shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 z-[95] w-full sm:w-[420px] flex flex-col bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            {/* Header */}
            <div className="h-14 shrink-0 flex items-center gap-2 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span className="font-black text-slate-900 dark:text-white tracking-tight">Nuly AI</span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => { thread.reset(); setShowHistory(false); }}
                  title={isEs ? 'Nueva conversación' : 'New conversation'}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => { setShowHistory(s => !s); if (!showHistory) void loadHistory(); }}
                  title={isEs ? 'Historial' : 'History'}
                  className={`p-2 rounded-lg ${showHistory ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <History className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            {showHistory ? (
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
                {history.length === 0 && (
                  <p className="text-sm text-slate-400 text-center mt-8">{isEs ? 'Sin conversaciones todavía.' : 'No conversations yet.'}</p>
                )}
                {history.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { void thread.loadConversation(c.id); setShowHistory(false); }}
                    className="text-left px-3 py-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{c.title || '—'}</p>
                    <p className="text-[11px] text-slate-400">{new Date(c.updated_at).toLocaleString()}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {thread.messages.length === 0 && (
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-emerald-500 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-emerald-400 dark:text-slate-900" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-[260px]">
                      {isEs
                        ? 'Pregúntame por tus clientes, check-ins, mensajes o métricas. Puedo leer todo tu negocio y, con tu aprobación, actuar.'
                        : 'Ask me about your clients, check-ins, messages or metrics. I can read your whole business and, with your approval, act.'}
                    </p>
                    <div className="flex flex-col gap-2 w-full mt-2">
                      {suggestions.map(s => (
                        <button
                          key={s}
                          onClick={() => void thread.ask(s)}
                          className="text-left text-sm px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
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
            )}

            {/* Composer / aprobación */}
            <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
              {thread.pendingApproval ? (
                <div className="flex flex-col gap-2.5">
                  <div className="rounded-xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/15 px-3.5 py-3">
                    <p className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">
                      {isEs ? 'Requiere tu aprobación' : 'Needs your approval'} · {thread.pendingApproval.tool_name}
                    </p>
                    <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
