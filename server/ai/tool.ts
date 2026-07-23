/**
 * NulyTool — clase base de todas las tools del agente (réplica del MaxTool de
 * PostHog). Todo el human-in-the-loop vive AQUÍ: una tool marca isDangerous()
 * y la aprobación (interrupt → resume) ocurre sin que la tool lo reimplemente.
 */
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { interrupt, GraphInterrupt } from '@langchain/langgraph';
import { ToolMessage } from '@langchain/core/messages';
import type { ApprovalRequest, ResumePayload, AgentLanguage } from './contract.js';

export interface ToolCtx {
  /** SIEMPRE del JWT (req.user.id) — nunca de los args del LLM */
  managerId: string;
  language: AgentLanguage;
  /** Contexto enviado por el frontend si la tool es contextual y está montada */
  context?: unknown;
}

export interface ToolResult {
  message: ToolMessage;
  /** Artifact tipado para la UI (viaja como ui_payload) */
  artifact?: { tool: string; artifact: unknown };
}

export abstract class NulyTool<A extends z.ZodType = z.ZodType> {
  abstract readonly name: string;
  /** Descripción para el LLM: cuándo usarla y qué devuelve */
  abstract readonly description: string;
  abstract readonly schema: A;
  /** Si es contextual: template inyectado al system prompt cuando está montada */
  readonly contextPromptTemplate?: string;

  /**
   * Implementación. Devuelve [texto para el LLM, artifact opcional para la UI]
   * — el patrón content_and_artifact de PostHog.
   */
  protected abstract run(args: z.infer<A>, ctx: ToolCtx): Promise<[string, unknown?]>;

  /** Operación sensible → requiere aprobación humana antes de ejecutar */
  isDangerous(_args: z.infer<A>, _ctx: ToolCtx): boolean {
    return false;
  }

  /** Preview en markdown que ve el coach antes de aprobar */
  async preview(args: z.infer<A>, _ctx: ToolCtx): Promise<string> {
    return '```json\n' + JSON.stringify(args, null, 2) + '\n```';
  }

  async execute(
    toolCall: { id: string; name: string; args: Record<string, unknown> },
    ctx: ToolCtx,
  ): Promise<ToolResult> {
    let args: z.infer<A>;
    try {
      args = this.schema.parse(toolCall.args);
    } catch (e) {
      return {
        message: new ToolMessage({
          tool_call_id: toolCall.id,
          name: this.name,
          content: `Argumentos inválidos para ${this.name}: ${e instanceof Error ? e.message : String(e)}. Corrige y reintenta.`,
        }),
      };
    }

    if (this.isDangerous(args, ctx)) {
      const request: ApprovalRequest = {
        proposal_id: randomUUID(),
        tool_name: this.name,
        preview: await this.preview(args, ctx),
        payload: args as Record<string, unknown>,
        original_tool_call_id: toolCall.id,
      };
      // ⏸ El grafo se pausa aquí; el checkpoint queda persistido y el frontend
      // recibe el ApprovalRequest. Se reanuda con Command({ resume: ResumePayload }).
      const decision = interrupt(request) as ResumePayload;
      if (decision.action === 'reject') {
        return {
          message: new ToolMessage({
            tool_call_id: toolCall.id,
            name: this.name,
            content:
              `El coach RECHAZÓ esta operación.` +
              (decision.feedback ? ` Motivo: "${decision.feedback}".` : '') +
              ` Reconócelo brevemente y pregunta cómo proceder. NO reintentes la misma operación sin cambios.`,
          }),
        };
      }
      if (decision.edited_payload) {
        args = this.schema.parse({ ...(args as object), ...decision.edited_payload });
      }
    }

    try {
      const [content, artifact] = await this.run(args, ctx);
      return {
        message: new ToolMessage({ tool_call_id: toolCall.id, name: this.name, content }),
        artifact: artifact !== undefined ? { tool: this.name, artifact } : undefined,
      };
    } catch (e) {
      if (e instanceof GraphInterrupt) throw e; // dejar propagar SIEMPRE
      console.error(`[ai] tool ${this.name} failed:`, e);
      return {
        message: new ToolMessage({
          tool_call_id: toolCall.id,
          name: this.name,
          content: `Error ejecutando ${this.name}: ${e instanceof Error ? e.message : String(e)}. Decide si reintentar con otros argumentos o informar al coach.`,
        }),
      };
    }
  }

  /** Definición para bindTools() del modelo */
  toModelTool(): { name: string; description: string; schema: A } {
    return { name: this.name, description: this.description, schema: this.schema };
  }
}
