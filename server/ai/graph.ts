/**
 * Grafo del agente — el loop de 2 nodos de PostHog (ROOT ⇄ TOOLS) en LangGraph.js.
 * Los subsistemas complejos (generadores de planes) se añadirán como subgrafos
 * invocados desde tools, nunca como edges de este grafo.
 */
import {
  StateGraph,
  Annotation,
  START,
  END,
  Send,
  messagesStateReducer,
} from '@langchain/langgraph';
import { ChatAnthropic } from '@langchain/anthropic';
import { AIMessage, type BaseMessage, SystemMessage } from '@langchain/core/messages';
import { registry } from './registry.js';
import { buildSystemPrompt } from './prompts.js';
import { SupabaseCheckpointer } from './checkpointer.js';
import { supabaseAdmin } from '../db/index.js';
import type { AgentLanguage } from './contract.js';

export const AI_MODEL = process.env.AI_MODEL || 'claude-sonnet-5';
const MAX_TOOL_CALLS_PER_TURN = 24; // límite duro, patrón PostHog
const MESSAGE_WINDOW = 40;

export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({ reducer: messagesStateReducer, default: () => [] }),
  managerId: Annotation<string>({ reducer: (_a, b) => b, default: () => '' }),
  language: Annotation<AgentLanguage>({ reducer: (_a, b) => b, default: () => 'es' }),
  uiContext: Annotation<{ view?: string; client_id?: string } | undefined>({
    reducer: (_a, b) => b,
    default: () => undefined,
  }),
  contextualTools: Annotation<Record<string, unknown>>({
    reducer: (_a, b) => b ?? {},
    default: () => ({}),
  }),
  toolCallCount: Annotation<number>({ reducer: (a, b) => a + b, default: () => 0 }),
});

type State = typeof AgentState.State;

function anthropicConfigured(): boolean {
  return Boolean(String(process.env.ANTHROPIC_API_KEY || '').trim());
}

async function recordUsage(managerId: string, response: AIMessage): Promise<void> {
  try {
    const usage: any = response.usage_metadata || (response.response_metadata as any)?.usage;
    if (!usage) return;
    await supabaseAdmin.from('ai_usage').insert({
      manager_id: managerId,
      model: AI_MODEL,
      input_tokens: usage.input_tokens ?? 0,
      output_tokens: usage.output_tokens ?? 0,
      cache_read_tokens: usage.input_token_details?.cache_read ?? 0,
    });
  } catch {
    /* la contabilidad no debe romper el turno */
  }
}

async function rootNode(state: State): Promise<Partial<State>> {
  const tools = registry.all();
  const llm = new ChatAnthropic({
    model: AI_MODEL,
    streaming: true,
    maxTokens: 4096,
    temperature: 0.4,
  }).bindTools(
    tools.map(t => t.toModelTool()),
  );

  const contextualPrompts = tools
    .filter(t => t.contextPromptTemplate && state.contextualTools[t.name] !== undefined)
    .map(t => `- ${t.name}: ${t.contextPromptTemplate}`);

  const system = await buildSystemPrompt({
    managerId: state.managerId,
    language: state.language,
    uiContext: state.uiContext,
    contextualToolPrompts: contextualPrompts,
  });

  const windowed = state.messages.slice(-MESSAGE_WINDOW);
  const response = (await llm.invoke([new SystemMessage(system), ...windowed])) as AIMessage;
  void recordUsage(state.managerId, response);
  return { messages: [response] };
}

function rootRouter(state: State): typeof END | Send[] {
  const last = state.messages.at(-1);
  if (!(last instanceof AIMessage) || !last.tool_calls?.length) return END;
  if (state.toolCallCount >= MAX_TOOL_CALLS_PER_TURN) return END;
  return last.tool_calls.map(
    tc =>
      new Send('tools', {
        toolCall: { id: tc.id ?? '', name: tc.name, args: tc.args },
        managerId: state.managerId,
        language: state.language,
        contextualTools: state.contextualTools,
      }),
  );
}

interface ToolNodeInput {
  toolCall: { id: string; name: string; args: Record<string, unknown> };
  managerId: string;
  language: AgentLanguage;
  contextualTools: Record<string, unknown>;
}

async function toolsNode(input: ToolNodeInput): Promise<Partial<State>> {
  const tool = registry.get(input.toolCall.name);
  if (!tool) {
    const { ToolMessage } = await import('@langchain/core/messages');
    return {
      messages: [
        new ToolMessage({
          tool_call_id: input.toolCall.id,
          name: input.toolCall.name,
          content: `La tool "${input.toolCall.name}" no existe. Tools disponibles: ${registry.all().map(t => t.name).join(', ')}.`,
        }),
      ],
      toolCallCount: 1,
    };
  }
  const result = await tool.execute(input.toolCall, {
    managerId: input.managerId,
    language: input.language,
    context: input.contextualTools[input.toolCall.name],
  });
  if (result.artifact) {
    // El artifact viaja con el mensaje → la ruta lo emite como ui_payload
    (result.message.additional_kwargs as any).ui_payload = result.artifact;
  }
  return { messages: [result.message], toolCallCount: 1 };
}

export function buildAgentGraph() {
  if (!anthropicConfigured()) {
    throw new Error('ANTHROPIC_API_KEY no está configurada — Nuly AI está desactivado.');
  }
  const checkpointer = new SupabaseCheckpointer();
  return new StateGraph(AgentState)
    .addNode('root', rootNode)
    .addNode('tools', toolsNode)
    .addEdge(START, 'root')
    .addConditionalEdges('root', rootRouter, ['tools', END])
    .addEdge('tools', 'root')
    .compile({ checkpointer });
}
