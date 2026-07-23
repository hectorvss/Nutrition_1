/**
 * Hook del hilo del agente — mecánica del maxThreadLogic de PostHog:
 * POST con fetch parseado como SSE, mensajes parciales id 'temp-*',
 * reemplazo por id, AbortController, y resume_payload para aprobaciones.
 */
import { useCallback, useRef, useState } from 'react';
import { createParser, type EventSourceMessage } from 'eventsource-parser';
import { supabase } from '../supabase';
import { getAuthToken } from '../api';
import type { ApprovalRequest, AssistantChatMessage, ResumePayload, ThreadMessage } from './types';

async function getToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) return data.session.access_token;
  } catch {
    /* fall through */
  }
  return getAuthToken();
}

export interface UseAgentThread {
  messages: ThreadMessage[];
  streaming: boolean;
  pendingApproval: ApprovalRequest | null;
  error: string | null;
  conversationId: string;
  ask: (content: string) => Promise<void>;
  resume: (payload: ResumePayload) => Promise<void>;
  cancel: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  reset: () => void;
}

export function useAgentThread(uiContext?: { view?: string; client_id?: string }): UseAgentThread {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<ApprovalRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>(() => crypto.randomUUID());
  const abortRef = useRef<AbortController | null>(null);
  const conversationRef = useRef(conversationId);
  conversationRef.current = conversationId;

  const upsertMessage = useCallback((msg: AssistantChatMessage, status: ThreadMessage['status']) => {
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === msg.id);
      const next: ThreadMessage = { ...msg, status } as ThreadMessage;
      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = next;
        return copy;
      }
      // Un mensaje 'ai' final sustituye al parcial temp-* más reciente
      if (msg.type === 'ai' && !msg.id.startsWith('temp-')) {
        const tempIdx = prev.findLastIndex(m => m.type === 'ai' && m.id.startsWith('temp-'));
        if (tempIdx >= 0) {
          const copy = prev.slice();
          copy[tempIdx] = next;
          return copy;
        }
      }
      return [...prev, next];
    });
  }, []);

  const stream = useCallback(
    async (body: Record<string, unknown>) => {
      setStreaming(true);
      setError(null);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const token = await getToken();
        const response = await fetch('/api/ai/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            conversation: conversationRef.current,
            trace_id: crypto.randomUUID(),
            ui_context: uiContext,
            ...body,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `Error ${response.status}`);
        }
        if (!response.body) throw new Error('Sin stream');

        const onEvent = (ev: EventSourceMessage) => {
          const type = ev.event || 'message';
          let data: any;
          try {
            data = JSON.parse(ev.data);
          } catch {
            return;
          }
          if (type === 'message') {
            const msg = data as AssistantChatMessage;
            const isPartial = msg.type === 'ai' && msg.id.startsWith('temp-');
            upsertMessage(msg, isPartial ? 'loading' : 'completed');
          } else if (type === 'approval') {
            setPendingApproval(data as ApprovalRequest);
          } else if (type === 'status' && data.type === 'error') {
            setError(data.message || 'Error del asistente');
          }
        };

        const parser = createParser({ onEvent });
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (value) parser.feed(decoder.decode(value, { stream: true }));
          if (done) break;
        }
        // Marcar cualquier parcial restante como completado
        setMessages(prev => prev.map(m => (m.status === 'loading' ? { ...m, status: 'completed' } : m)));
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError(e?.message || 'Error de conexión con el asistente');
          setMessages(prev => prev.map(m => (m.status === 'loading' ? { ...m, status: 'error' } : m)));
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [upsertMessage, uiContext],
  );

  const ask = useCallback(
    async (content: string) => {
      if (!content.trim() || streaming) return;
      // Mensaje nuevo con aprobación pendiente → auto-rechazo con feedback (patrón PostHog)
      if (pendingApproval) {
        const approval = pendingApproval;
        setPendingApproval(null);
        await stream({
          content: null,
          resume_payload: { action: 'reject', proposal_id: approval.proposal_id, feedback: content },
        });
      }
      await stream({ content });
    },
    [stream, streaming, pendingApproval],
  );

  const resume = useCallback(
    async (payload: ResumePayload) => {
      setPendingApproval(null);
      await stream({ content: null, resume_payload: payload });
    },
    [stream],
  );

  const cancel = useCallback(async () => {
    abortRef.current?.abort();
    const token = await getToken();
    await fetch(`/api/ai/conversations/${conversationRef.current}/cancel`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => undefined);
    setStreaming(false);
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    abortRef.current?.abort();
    setConversationId(id);
    conversationRef.current = id;
    setMessages([]);
    setPendingApproval(null);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/ai/conversations/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(((data.messages || []) as AssistantChatMessage[]).map(m => ({ ...m, status: 'completed' as const })));
      if (data.pending_approval) setPendingApproval(data.pending_approval);
    } catch {
      /* historial best-effort */
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    const fresh = crypto.randomUUID();
    setConversationId(fresh);
    conversationRef.current = fresh;
    setMessages([]);
    setPendingApproval(null);
    setError(null);
    setStreaming(false);
  }, []);

  return { messages, streaming, pendingApproval, error, conversationId, ask, resume, cancel, loadConversation, reset };
}
