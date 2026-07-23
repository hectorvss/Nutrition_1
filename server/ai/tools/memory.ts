import { z } from 'zod';
import { NulyTool, type ToolCtx } from '../tool.js';
import { supabaseAdmin } from '../../db/index.js';

const MAX_MEMORY_CHARS = 10000;

/**
 * Core memory por coach (patrón CoreMemory de PostHog): hechos línea a línea,
 * inyectados siempre en el system prompt. El propio agente la mantiene:
 * guarda preferencias y datos estables del coach cuando aparezcan.
 */
export class ManageMemoryTool extends NulyTool<z.ZodType> {
  readonly name = 'manage_memory';
  readonly description =
    'Gestiona tu memoria de largo plazo sobre este coach. Usa "append" cuando aprendas un hecho ESTABLE y útil (preferencias, cómo trabaja, precios, tipo de clientes), "replace" para corregir uno obsoleto, "view" para consultarla. NO guardes datos puntuales ni sensibles de clientes.';
  readonly schema = z.object({
    action: z.enum(['view', 'append', 'replace']),
    text: z.string().max(500).optional().describe('append: el hecho nuevo (una línea). replace: el texto nuevo'),
    original_fragment: z.string().max(500).optional().describe('replace: fragmento exacto a sustituir'),
  });

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    const { data } = await supabaseAdmin
      .from('ai_memory')
      .select('text')
      .eq('manager_id', ctx.managerId)
      .maybeSingle();
    const current = data?.text || '';

    if (args.action === 'view') {
      return [current.trim() ? `Memoria actual:\n${current}` : 'La memoria está vacía todavía.'];
    }

    let next = current;
    if (args.action === 'append') {
      if (!args.text?.trim()) return ['append requiere `text`.'];
      const line = args.text.trim().replace(/\n+/g, ' ');
      if (current.toLowerCase().includes(line.toLowerCase())) return ['Ese hecho ya estaba en la memoria.'];
      next = current ? `${current.trim()}\n${line}` : line;
    } else {
      if (!args.original_fragment || args.text === undefined) return ['replace requiere `original_fragment` y `text`.'];
      if (!current.includes(args.original_fragment)) {
        return [`No encuentro ese fragmento en la memoria. Memoria actual:\n${current}`];
      }
      next = current.replace(args.original_fragment, args.text.trim());
    }

    if (next.length > MAX_MEMORY_CHARS) {
      return ['La memoria está llena (10k caracteres). Usa replace para condensar hechos antes de añadir más.'];
    }

    const { error } = await supabaseAdmin
      .from('ai_memory')
      .upsert({ manager_id: ctx.managerId, text: next, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return [args.action === 'append' ? 'Hecho guardado en memoria.' : 'Memoria actualizada.'];
  }
}
