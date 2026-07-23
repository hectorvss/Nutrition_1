/** Espejo frontend del contrato del agente — mantener en sync con server/ai/contract.ts */

export interface AgentToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export type AssistantChatMessage =
  | { type: 'human'; id: string; content: string }
  | { type: 'ai'; id: string; content: string; thinking?: string; tool_calls?: AgentToolCall[] }
  | {
      type: 'tool';
      id: string;
      tool_call_id: string;
      tool_name: string;
      content: string;
      ui_payload?: { tool: string; artifact: unknown };
    }
  | { type: 'ai/failure'; id: string; content: string };

export type ThreadMessage = AssistantChatMessage & { status: 'loading' | 'completed' | 'error' };

export interface ApprovalRequest {
  proposal_id: string;
  tool_name: string;
  preview: string;
  payload: Record<string, unknown>;
  original_tool_call_id: string;
}

export type ResumePayload =
  | { action: 'approve'; proposal_id: string; edited_payload?: Record<string, unknown> }
  | { action: 'reject'; proposal_id: string; feedback?: string };

export interface ConversationSummary {
  id: string;
  title: string | null;
  status: string;
  updated_at: string;
}
