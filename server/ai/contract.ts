/**
 * Contrato compartido agente ⇄ UI (réplica reducida del schema-assistant-messages
 * de PostHog). El espejo frontend vive en src/ai/types.ts — mantener en sync.
 */

export type AgentLanguage = 'es' | 'en';

export interface AgentToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export type AssistantChatMessage =
  | { type: 'human'; id: string; content: string }
  | {
      type: 'ai';
      id: string;
      content: string;
      thinking?: string;
      tool_calls?: AgentToolCall[];
    }
  | {
      type: 'tool';
      id: string;
      tool_call_id: string;
      tool_name: string;
      content: string;
      ui_payload?: { tool: string; artifact: unknown };
    }
  | { type: 'ai/failure'; id: string; content: string };

export interface ApprovalRequest {
  proposal_id: string;
  tool_name: string;
  /** Markdown mostrado al coach antes de aprobar */
  preview: string;
  /** Args de la tool — el coach puede editarlos antes de aprobar */
  payload: Record<string, unknown>;
  original_tool_call_id: string;
}

export type ResumePayload =
  | { action: 'approve'; proposal_id: string; edited_payload?: Record<string, unknown> }
  | { action: 'reject'; proposal_id: string; feedback?: string };

export interface AgentRequestBody {
  /** null = reanudar (aprobación/reconexión) */
  content: string | null;
  /** UUID acuñado por el cliente (patrón PostHog) */
  conversation?: string;
  trace_id?: string;
  /** { toolName: contexto } de las tools contextuales montadas en la vista activa */
  contextual_tools?: Record<string, unknown>;
  ui_context?: { view?: string; client_id?: string; language?: AgentLanguage };
  resume_payload?: ResumePayload;
}

/** Eventos SSE — `event:` + `data:` JSON, igual que PostHog */
export type AgentSSEEvent =
  | { event: 'conversation'; data: { id: string; title: string | null; status: string } }
  | { event: 'message'; data: AssistantChatMessage }
  | { event: 'update'; data: { tool_call_id: string; tool_name: string; progress: string } }
  | { event: 'approval'; data: ApprovalRequest }
  | { event: 'status'; data: { type: 'ack' | 'error' | 'complete'; message?: string } };

export interface ConversationSummary {
  id: string;
  title: string | null;
  status: string;
  updated_at: string;
}
