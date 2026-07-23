/**
 * API del agente (≈ ee/api/conversation.py de PostHog, versión in-function):
 *   POST   /api/ai/conversations          — crear/continuar/reanudar + stream SSE
 *   PATCH  /api/ai/conversations/:id/cancel
 *   GET    /api/ai/conversations          — historial
 *   GET    /api/ai/conversations/:id      — mensajes rehidratados del checkpoint
 */
import { Router, type Response } from 'express';
import { z } from 'zod';
import { Command } from '@langchain/langgraph';
import { AIMessage, HumanMessage, ToolMessage, type BaseMessage } from '@langchain/core/messages';
import { verifyManager, type AuthedRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../db/index.js';
import { buildAgentGraph, AI_MODEL } from './graph.js';
import type { AgentSSEEvent, AssistantChatMessage, ApprovalRequest } from './contract.js';

const router = Router();
router.use(verifyManager as any);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const requestSchema = z.object({
  content: z.string().max(20000).nullable(),
  conversation: z.string().regex(UUID_RE).optional(),
  trace_id: z.string().max(100).optional(),
  contextual_tools: z.record(z.string(), z.unknown()).optional(),
  ui_context: z
    .object({
      view: z.string().max(80).optional(),
      client_id: z.string().regex(UUID_RE).optional(),
      language: z.enum(['es', 'en']).optional(),
    })
    .optional(),
  resume_payload: z
    .union([
      z.object({
        action: z.literal('approve'),
        proposal_id: z.string(),
        edited_payload: z.record(z.string(), z.unknown()).optional(),
      }),
      z.object({ action: z.literal('reject'), proposal_id: z.string(), feedback: z.string().max(2000).optional() }),
    ])
    .optional(),
});

/** Convierte mensajes LangChain al contrato de la UI */
function toChatMessage(msg: BaseMessage, idx: number): AssistantChatMessage | null {
  const id = (msg.id as string) || `msg-${idx}`;
  if (msg instanceof HumanMessage) {
    return { type: 'human', id, content: textOf(msg.content) };
  }
  if (msg instanceof AIMessage) {
    const text = textOf(msg.content);
    const toolCalls = (msg.tool_calls || []).map(tc => ({
      id: tc.id ?? '',
      name: tc.name,
      args: (tc.args ?? {}) as Record<string, unknown>,
    }));
    if (!text && toolCalls.length === 0) return null;
    return { type: 'ai', id, content: text, ...(toolCalls.length ? { tool_calls: toolCalls } : {}) };
  }
  if (msg instanceof ToolMessage) {
    const uiPayload = (msg.additional_kwargs as any)?.ui_payload;
    return {
      type: 'tool',
      id,
      tool_call_id: msg.tool_call_id,
      tool_name: (msg.name as string) || 'tool',
      content: textOf(msg.content),
      ...(uiPayload ? { ui_payload: uiPayload } : {}),
    };
  }
  return null;
}

function textOf(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((b: any) => (typeof b === 'string' ? b : b?.type === 'text' ? b.text : ''))
      .join('');
  }
  return '';
}

function sseWrite(res: Response, ev: AgentSSEEvent): void {
  res.write(`event: ${ev.event}\ndata: ${JSON.stringify(ev.data)}\n\n`);
}

async function checkRateLimit(managerId: string): Promise<string | null> {
  const minuteAgo = new Date(Date.now() - 60_000).toISOString();
  const dayAgo = new Date(Date.now() - 24 * 3600_000).toISOString();
  const [burst, sustained] = await Promise.all([
    supabaseAdmin
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('manager_id', managerId)
      .gte('created_at', minuteAgo),
    supabaseAdmin
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('manager_id', managerId)
      .gte('created_at', dayAgo),
  ]);
  if ((burst.count || 0) >= Number(process.env.AI_RATE_BURST || 15)) {
    return 'Has alcanzado el límite de mensajes por minuto. Espera un momento.';
  }
  if ((sustained.count || 0) >= Number(process.env.AI_RATE_SUSTAINED || 500)) {
    return 'Has alcanzado el límite diario del asistente. Vuelve mañana.';
  }
  return null;
}

router.post('/conversations', async (req: AuthedRequest, res) => {
  const managerId = req.user!.id;
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const body = parsed.data;

  if (!String(process.env.ANTHROPIC_API_KEY || '').trim()) {
    return res.status(503).json({ error: 'El asistente no está configurado todavía (falta la clave del modelo).' });
  }
  if (!body.content && !body.resume_payload) {
    // reanudación pura de streaming no soportada en modo in-function
    return res.status(400).json({ error: 'content o resume_payload requerido' });
  }

  const rateMsg = await checkRateLimit(managerId);
  if (rateMsg) return res.status(429).json({ error: rateMsg });

  const conversationId = body.conversation || crypto.randomUUID();

  // Cargar/crear conversación (lock por status, patrón PostHog)
  const { data: existing } = await supabaseAdmin
    .from('ai_conversations')
    .select('id, manager_id, status, title, pending_approval')
    .eq('id', conversationId)
    .maybeSingle();

  if (existing && existing.manager_id !== managerId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (existing && existing.status === 'in_progress') {
    return res.status(409).json({ error: 'Ya hay una generación en curso en esta conversación.' });
  }
  if (body.resume_payload && !existing?.pending_approval) {
    return res.status(422).json({ error: 'No hay ninguna aprobación pendiente en esta conversación.' });
  }

  const title = existing?.title || (body.content ? body.content.slice(0, 80) : null);
  const { error: upsertErr } = await supabaseAdmin.from('ai_conversations').upsert({
    id: conversationId,
    manager_id: managerId,
    status: 'in_progress',
    title,
    pending_approval: body.resume_payload ? null : (existing?.pending_approval ?? null),
    updated_at: new Date().toISOString(),
  });
  if (upsertErr) return res.status(500).json({ error: 'No se pudo iniciar la conversación' });

  // SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  const keepalive = setInterval(() => res.write(': keepalive\n\n'), 15_000);
  let clientGone = false;
  req.on('close', () => {
    clientGone = true;
  });

  sseWrite(res, { event: 'conversation', data: { id: conversationId, title, status: 'in_progress' } });
  sseWrite(res, { event: 'status', data: { type: 'ack' } });

  const language = body.ui_context?.language || 'es';
  let finishedWithApproval = false;

  try {
    const graph = buildAgentGraph();
    const config = { configurable: { thread_id: conversationId }, recursionLimit: 60 };

    const input = body.resume_payload
      ? new Command({ resume: body.resume_payload })
      : {
          messages: [new HumanMessage({ content: body.content!, id: `human-${Date.now()}` })],
          managerId,
          language,
          uiContext: body.ui_context,
          contextualTools: body.contextual_tools ?? {},
        };

    if (body.content) {
      sseWrite(res, {
        event: 'message',
        data: { type: 'human', id: `human-${Date.now()}`, content: body.content },
      });
    }

    const stream = await graph.stream(input as any, {
      ...config,
      streamMode: ['messages', 'updates'],
    } as any);

    let partial = '';
    let partialId = `temp-${Date.now()}`;
    let lastCancelCheck = Date.now();

    for await (const chunk of stream as AsyncIterable<[string, any]>) {
      if (clientGone) break;

      // Cancelación cooperativa (throttled)
      if (Date.now() - lastCancelCheck > 2000) {
        lastCancelCheck = Date.now();
        const { data: row } = await supabaseAdmin
          .from('ai_conversations')
          .select('status')
          .eq('id', conversationId)
          .single();
        if (row?.status === 'canceling') break;
      }

      const [mode, payload] = chunk;

      if (mode === 'messages') {
        const [msgChunk] = payload as [any, any];
        const text = textOf(msgChunk?.content);
        if (text && msgChunk?.constructor?.name?.includes('AIMessage')) {
          partial += text;
          sseWrite(res, { event: 'message', data: { type: 'ai', id: partialId, content: partial } });
        }
        continue;
      }

      if (mode === 'updates') {
        const update = payload as Record<string, any>;

        if (update.__interrupt__) {
          const approval = (update.__interrupt__[0]?.value ?? update.__interrupt__[0]) as ApprovalRequest;
          await supabaseAdmin
            .from('ai_conversations')
            .update({ pending_approval: approval, status: 'idle', updated_at: new Date().toISOString() })
            .eq('id', conversationId);
          sseWrite(res, { event: 'approval', data: approval });
          finishedWithApproval = true;
          break;
        }

        for (const nodeUpdate of Object.values(update)) {
          const msgs: BaseMessage[] = nodeUpdate?.messages || [];
          for (const m of msgs) {
            const mapped = toChatMessage(m, 0);
            if (!mapped) continue;
            if (mapped.type === 'ai') {
              // Mensaje final del root: sustituye al parcial
              sseWrite(res, { event: 'message', data: { ...mapped, id: mapped.id || partialId } });
              partial = '';
              partialId = `temp-${Date.now()}`;
            } else if (mapped.type === 'tool') {
              sseWrite(res, { event: 'message', data: mapped });
            }
          }
        }
      }
    }

    if (!finishedWithApproval) {
      sseWrite(res, { event: 'status', data: { type: 'complete' } });
    }
  } catch (e) {
    console.error('[ai] stream error:', e);
    sseWrite(res, {
      event: 'status',
      data: { type: 'error', message: 'El asistente ha fallado a mitad de respuesta. Reintenta.' },
    });
  } finally {
    clearInterval(keepalive);
    if (!finishedWithApproval) {
      await supabaseAdmin
        .from('ai_conversations')
        .update({ status: 'idle', updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .neq('status', 'idle');
    }
    res.end();
  }
});

router.patch('/conversations/:id/cancel', async (req: AuthedRequest, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ error: 'Invalid id' });
  const { data } = await supabaseAdmin
    .from('ai_conversations')
    .select('id, manager_id, status')
    .eq('id', id)
    .maybeSingle();
  if (!data || data.manager_id !== req.user!.id) return res.status(404).json({ error: 'Not found' });
  if (data.status !== 'in_progress') return res.status(204).end();
  await supabaseAdmin.from('ai_conversations').update({ status: 'canceling' }).eq('id', id);
  res.status(204).end();
});

router.get('/conversations', async (req: AuthedRequest, res) => {
  const { data, error } = await supabaseAdmin
    .from('ai_conversations')
    .select('id, title, status, updated_at')
    .eq('manager_id', req.user!.id)
    .is('deleted_at', null)
    .not('title', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: 'Server error' });
  res.json({ conversations: data || [] });
});

router.get('/conversations/:id', async (req: AuthedRequest, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ error: 'Invalid id' });
  const { data: conv } = await supabaseAdmin
    .from('ai_conversations')
    .select('id, manager_id, title, status, pending_approval')
    .eq('id', id)
    .maybeSingle();
  if (!conv || conv.manager_id !== req.user!.id) return res.status(404).json({ error: 'Not found' });

  let messages: AssistantChatMessage[] = [];
  try {
    const graph = buildAgentGraph();
    const state = await graph.getState({ configurable: { thread_id: id } });
    const raw: BaseMessage[] = (state?.values as any)?.messages || [];
    messages = raw.map((m, i) => toChatMessage(m, i)).filter(Boolean) as AssistantChatMessage[];
  } catch (e) {
    console.error('[ai] getState failed:', e);
  }

  res.json({
    id: conv.id,
    title: conv.title,
    status: conv.status,
    pending_approval: conv.pending_approval,
    messages,
    model: AI_MODEL,
  });
});

export default router;
