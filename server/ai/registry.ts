/**
 * Registro de tools (≈ registry.py de PostHog). Un import por dominio —
 * Vercel no soporta glob dinámico en build, así que el "auto-registro por
 * convención" es este índice de una línea por dominio.
 */
import type { NulyTool } from './tool.js';
import { ListClientsTool, GetClientTool } from './tools/clients.js';
import { ReadThreadTool, SendMessageTool } from './tools/messaging.js';
import { ListCheckinsTool, GetCheckinTool, GetBusinessMetricsTool } from './tools/insights.js';
import { ListExercisesTool, SearchFoodsTool } from './tools/library.js';

const ALL: NulyTool[] = [
  new ListClientsTool(),
  new GetClientTool(),
  new ReadThreadTool(),
  new SendMessageTool(),
  new ListCheckinsTool(),
  new GetCheckinTool(),
  new GetBusinessMetricsTool(),
  new ListExercisesTool(),
  new SearchFoodsTool(),
];

const byName = new Map<string, NulyTool>(ALL.map(t => [t.name, t]));

export const registry = {
  all(): NulyTool[] {
    return ALL;
  },
  get(name: string): NulyTool | undefined {
    return byName.get(name);
  },
};
