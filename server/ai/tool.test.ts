import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { NulyTool, type ToolCtx } from './tool';

class EchoTool extends NulyTool<z.ZodType> {
  readonly name = 'echo';
  readonly description = 'test tool';
  readonly schema = z.object({ text: z.string().min(1) });
  protected async run(args: { text: string }, _ctx: ToolCtx): Promise<[string, unknown?]> {
    return [`echo: ${args.text}`, { artifact: true }];
  }
}

class BoomTool extends NulyTool<z.ZodType> {
  readonly name = 'boom';
  readonly description = 'always throws';
  readonly schema = z.object({});
  protected async run(): Promise<[string, unknown?]> {
    throw new Error('kaputt');
  }
}

const ctx: ToolCtx = { managerId: '00000000-0000-0000-0000-000000000000', language: 'es' };

describe('NulyTool.execute', () => {
  it('valida args con zod y devuelve error legible al LLM si no cuadran', async () => {
    const tool = new EchoTool();
    const result = await tool.execute({ id: 'tc1', name: 'echo', args: { text: 123 } as any }, ctx);
    expect(String(result.message.content)).toContain('Argumentos inválidos');
    expect(result.artifact).toBeUndefined();
  });

  it('ejecuta y devuelve content + artifact (patrón content_and_artifact)', async () => {
    const tool = new EchoTool();
    const result = await tool.execute({ id: 'tc2', name: 'echo', args: { text: 'hola' } }, ctx);
    expect(String(result.message.content)).toBe('echo: hola');
    expect(result.message.tool_call_id).toBe('tc2');
    expect(result.artifact).toEqual({ tool: 'echo', artifact: { artifact: true } });
  });

  it('convierte excepciones de la tool en mensaje de error para el LLM (no revienta el grafo)', async () => {
    const tool = new BoomTool();
    const result = await tool.execute({ id: 'tc3', name: 'boom', args: {} }, ctx);
    expect(String(result.message.content)).toContain('kaputt');
  });
});
