# Nuly AI — Estudio de implementación a fondo

> Continúa `nuly-ai-architecture.md` (el estudio de PostHog). Aquí está el CÓMO exacto:
> esquema SQL, código del grafo, clase base de tools, catálogo completo de tools mapeado a
> los handlers existentes, subgrafos generadores, endpoint SSE bajo las restricciones de
> Vercel, frontend, prompts, seguridad, costes y riesgos. Anclado al código real del repo.

---

## 0. Hechos del repo que condicionan el diseño

| Hecho | Implicación |
|---|---|
| Express 4 + `@vercel/node` (vercel.json `builds`), todo `/api/*` → `server/index.ts` | El endpoint del agente es una ruta Express más; SSE funciona en Vercel (Fluid Compute: hasta 300s Hobby / 800s Pro por invocación) |
| Auth: `verifyManager` (JWT Supabase → rol desde tabla `users`, nunca metadata) | El agente hereda este middleware tal cual; `req.user.id` = `manager_id` para TODAS las tools |
| Datos vía `supabaseAdmin` (service role) con ownership manual (`.eq('manager_id', …)`) | Las tools deben pasar por helpers que fuercen el scope — nunca queries libres del LLM |
| Planes = filas con `data_json` JSONB (`nutrition_plans`, `training_programs` con `client_id`, `created_by`) | Los generadores producen `data_json` validado con zod contra el shape que ya renderiza la UI |
| Bibliotecas existentes: `foods`, ejercicios, plantillas (nutrición/entreno/planificación ES+EN) | Los generadores NO inventan ejercicios/alimentos: seleccionan de la biblioteca (RAG ligero) |
| zod v4 ya es dependencia | `args_schema` de tools y validación de artifacts sin dependencias nuevas |
| Cron diario Vercel 8:00 UTC | Sitio natural para mantenimiento del agente (compactación, TTLs) |

Dependencias nuevas: `@langchain/langgraph`, `@langchain/anthropic`, `@langchain/core`,
`@langchain/langgraph-checkpoint-postgres`, `pg`, `eventsource-parser` (frontend).

---

## 1. Decisión de ejecución: dónde corre el grafo

**Fase 1-4: el grafo corre DENTRO de la invocación SSE** (a diferencia de PostHog, que usa
Temporal). Justificación:
- Un turno del agente son 5-60s; el peor caso (generar un programa de 8 semanas) ~2-3 min.
  Cabe en los 300s de Fluid Compute (config `maxDuration` en vercel.json).
- Evita infra nueva (Temporal/Inngest) y el bus Redis. El checkpointer de Postgres ya nos da
  lo importante: si la función muere, el estado del grafo queda persistido y un
  `content: null` reanuda desde el último checkpoint.
- La reconexión multi-cliente de PostHog (Redis Streams) se aproxima con **Supabase Realtime
  broadcast**: el runner emite cada evento al canal `ai:conversation:{id}` ADEMÁS del SSE.
  Si el SSE se corta, el cliente se suscribe al canal Realtime (ya usan Supabase JS) y
  recupera el vivo; el histórico se rehidrata del checkpoint.

**Fase 6 (si hace falta):** mover la ejecución a Inngest/Trigger.dev (durable, retries,
cancelación de verdad) manteniendo el mismo contrato — el endpoint pasa de "ejecutar" a
"encolar y re-emitir", exactamente el salto que PostHog dio con Temporal.

**Cancelación (F1):** columna `ai_conversations.status = 'canceling'` + un
`AbortController` por invocación; el loop del grafo comprueba el flag entre nodos
(`interruptBefore` no hace falta: un check barato en el callback `onNodeStart`).

---

## 2. Esquema de datos (migración SQL)

```sql
-- 035_nuly_ai.sql
create table ai_conversations (
  id uuid primary key,                          -- ACUÑADO POR EL CLIENTE (patrón PostHog)
  manager_id uuid not null references users(id) on delete cascade,
  status text not null default 'idle'           -- idle | in_progress | canceling
    check (status in ('idle','in_progress','canceling')),
  title text,
  agent_mode text not null default 'general',
  pending_approval jsonb,                       -- ApprovalRequest serializado (si pausado)
  approval_decisions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz                        -- soft delete
);
create index on ai_conversations (manager_id, updated_at desc) where deleted_at is null;

-- Checkpoints: los crea PostgresSaver de LangGraph.js con saver.setup()
-- (tablas checkpoints, checkpoint_blobs, checkpoint_writes, checkpoint_migrations,
--  espejo del modelo de 3 tablas de PostHog). Se crean en un schema propio "langgraph".

create table ai_memory (                        -- ≈ CoreMemory de PostHog
  manager_id uuid primary key references users(id) on delete cascade,
  text text not null default '' check (char_length(text) <= 10000),
  updated_at timestamptz not null default now()
);

create table ai_usage (                         -- medición para límites y (futuro) billing
  id bigint generated always as identity primary key,
  manager_id uuid not null references users(id),
  conversation_id uuid,
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cache_read_tokens int not null default 0,
  created_at timestamptz not null default now()
);
create index on ai_usage (manager_id, created_at desc);
```

Nota conexión: `PostgresSaver` usa `pg` → **connection string en modo sesión** (pooler
Supavisor puerto 5432, no 6543/transaction: los prepared statements del saver lo requieren).
Nueva env: `SUPABASE_DB_URL`.

---

## 3. Contrato compartido (`server/ai/contract.ts` ⇄ `src/ai/types.ts`)

Réplica reducida de `schema-assistant-messages.ts` de PostHog:

```ts
export type AssistantMessage =
  | { type: 'human';  id: string; content: string }
  | { type: 'ai';     id: string; content: string; thinking?: string;
      tool_calls?: { id: string; name: string; args: Record<string, unknown> }[] }
  | { type: 'tool';   id: string; tool_call_id: string; content: string;
      ui_payload?: { tool: string; artifact: unknown } }       // artifact tipado por tool
  | { type: 'ai/failure'; id: string; content: string };

export type SSEEvent =
  | { event: 'conversation'; data: { id: string; title: string | null; status: string } }
  | { event: 'message';      data: AssistantMessage }           // parciales llegan id 'temp-*'
  | { event: 'update';       data: { tool_call_id: string; progress: string } }
  | { event: 'approval';     data: ApprovalRequest }
  | { event: 'status';       data: { type: 'ack' | 'error' | 'complete'; message?: string } };

export interface ApprovalRequest {
  proposal_id: string; tool_name: string;
  preview: string;                               // markdown mostrado al coach
  payload: Record<string, unknown>;              // editable antes de aprobar
  original_tool_call_id: string;
}
export type ResumePayload =
  | { action: 'approve'; proposal_id: string; edited_payload?: Record<string, unknown> }
  | { action: 'reject';  proposal_id: string; feedback?: string };

export interface AgentRequest {
  content: string | null;                        // null = reanudar (approve/reject/reconexión)
  conversation?: string;                         // uuid del cliente
  trace_id: string;
  contextual_tools?: Record<string, unknown>;    // {toolName: contexto} de la vista activa
  ui_context?: { view?: string; client_id?: string; language?: 'es' | 'en' };
  resume_payload?: ResumePayload;
}
```

---

## 4. El grafo (`server/ai/graph/graph.ts`)

Loop de 2 nodos de PostHog, literal en LangGraph.js:

```ts
const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({ reducer: messagesStateReducer, default: () => [] }),
  managerId: Annotation<string>(),
  language: Annotation<'es' | 'en'>(),
  uiContext: Annotation<AgentRequest['ui_context']>(),
  contextualTools: Annotation<Record<string, unknown>>(),
  toolCallCount: Annotation<number>({ reducer: (a, b) => a + b, default: () => 0 }),
});

async function rootNode(state) {
  const tools = toolkit.getTools(state);                    // core + contextuales activas
  const llm = new ChatAnthropic({
    model: 'claude-sonnet-4-6', streaming: true, maxTokens: 8192,
    // prompt caching: cache_control en el system estable (rol+tono+política+memoria)
  }).bindTools(tools, { parallel_tool_calls: true });
  const system = await promptBuilder.build(state);          // §9
  const response = await llm.invoke([system, ...windowed(state.messages)]);
  return { messages: [response] };
}

function rootRouter(state) {
  const last = state.messages.at(-1);
  if (!isAIMessage(last) || !last.tool_calls?.length) return END;
  if (state.toolCallCount >= 24) return END;                // límite duro (PostHog: 24)
  return last.tool_calls.map(tc =>
    new Send('tools', { ...state, currentToolCall: tc }));  // paralelo
}

async function toolsNode(state) {                            // ejecuta UNA tool (Send)
  const tool = registry.get(state.currentToolCall.name);
  const result = await tool.execute(state.currentToolCall, ctxFrom(state)); // §5: aquí
  return { messages: [result.toolMessage], toolCallCount: 1 }; //   vive interrupt()
}

export const agentGraph = new StateGraph(StateAnnotation)
  .addNode('root', rootNode)
  .addNode('tools', toolsNode)
  .addNode('memory_collector', memoryCollectorNode)          // haiku, post-turno (§8)
  .addNode('title', titleNode)                               // haiku, solo 1er turno
  .addEdge(START, 'root')
  .addConditionalEdges('root', rootRouter, ['tools', END])
  .addEdge('tools', 'root')
  .compile({ checkpointer: postgresSaver });
// thread_id del checkpointer = conversation id → content:null reanuda solo.
```

Streaming: `graph.streamEvents(input, { version: 'v2', configurable: { thread_id } })` →
se filtran `on_chat_model_stream` (tokens del root → `message` con id `temp-*`),
`on_tool_start/end` (→ `update`), y el interrupt (→ `approval`).

---

## 5. Clase base `NulyTool` (`server/ai/tool.ts`)

El corazón del sistema — todo el HITL vive aquí, ninguna tool lo reimplementa:

```ts
export interface ToolCtx { managerId: string; language: 'es'|'en';
                           context?: unknown /* de contextual_tools */ }

export abstract class NulyTool<A extends z.ZodType> {
  abstract name: string;                    // debe existir en el enum del contrato
  abstract description: string;            // para el LLM — cuándo y cómo usarla
  abstract schema: A;                       // zod: args tipados y validados
  contextPromptTemplate?: string;          // se inyecta al system si la tool está montada

  /** Devuelve (texto para el LLM, artifact para la UI) — patrón content_and_artifact */
  protected abstract run(args: z.infer<A>, ctx: ToolCtx): Promise<[string, unknown?]>;

  /** HITL declarativo */
  isDangerous(_args: z.infer<A>, _ctx: ToolCtx): boolean { return false; }
  async preview(args: z.infer<A>, _ctx: ToolCtx): Promise<string> {
    return '```json\n' + JSON.stringify(args, null, 2) + '\n```';
  }

  async execute(toolCall, ctx: ToolCtx) {
    const args = this.schema.parse(toolCall.args);           // zod → error legible al LLM
    if (this.isDangerous(args, ctx)) {
      const approval: ApprovalRequest = { proposal_id: uuid(), tool_name: this.name,
        preview: await this.preview(args, ctx), payload: args,
        original_tool_call_id: toolCall.id };
      const decision = interrupt(approval);                  // ⏸ grafo pausado + checkpoint
      if (decision.action === 'reject')
        return toolMsg(`El coach RECHAZÓ esta operación.${decision.feedback
          ? ` Motivo: "${decision.feedback}".` : ''} Reconoce y pregunta cómo proceder.`);
      Object.assign(args, this.schema.parse({ ...args, ...decision.edited_payload }));
    }
    try {
      const [content, artifact] = await this.run(args, ctx);
      return toolMsg(content, artifact && { tool: this.name, artifact });
    } catch (e) {
      if (e instanceof GraphInterrupt) throw e;              // dejar propagar SIEMPRE
      return toolMsg(`Error ejecutando ${this.name}: ${msgOf(e)}. Decide si reintentar o avisar.`);
    }
  }
}
```

Registro por convención (≈ `products/*/max_tools.py`): `server/ai/tools/*/index.ts` exporta
sus clases; `registry.ts` hace un import estático de cada dominio (Vercel no permite glob
dinámico en build — un `index` central de 8 líneas, un import por dominio).

---

## 6. Catálogo de tools (v1 completa)

Regla de oro: cada tool llama a **helpers extraídos de los handlers existentes** (o al
handler vía función), nunca SQL libre. `manager_id` viene SIEMPRE de `ctx`, jamás de args.

| Dominio | Tool | Args (zod) | Peligrosa | Reutiliza |
|---|---|---|---|---|
| clients | `list_clients` | filtros, paginación | no | manager.ts GET /clients |
| clients | `get_client` | client_id | no | GET /clients/:id (+checkins+planes resumidos) |
| clients | `update_client` | client_id, campos allow-list | no | PATCH /clients/:id |
| clients | `create_client` | nombre, email, … | **sí** (envía invitación) | POST /clients |
| clients | `archive_client` | client_id | **sí** | DELETE /clients/:id |
| checkins | `list_checkins` / `get_checkin` | client_id?, estado | no | check_ins.ts |
| checkins | `review_checkin` | checkin_id, feedback | **sí** (visible al cliente) | POST review |
| messaging | `read_thread` | client_id, limit | no | messages.ts GET |
| messaging | `send_message` | client_id, texto | **sí** SIEMPRE | messages.ts POST (dispara push/workflows) |
| training | `list_exercises` | query, grupo muscular | no | biblioteca exercises |
| training | `get_training_program` | client_id | no | training_programs |
| training | `generate_training_program` | client_id, objetivo, días/sem, semanas, material | no (genera DRAFT) | **subgrafo §7** |
| training | `assign_training_program` | draft_id/data_json, client_id | **sí** | POST assign (valida shape) |
| nutrition | `search_foods` / `get_nutrition_plan` | … | no | foods, nutrition_plans |
| nutrition | `generate_nutrition_plan` | client_id, kcal/macros u objetivo, comidas/día, restricciones | no (DRAFT) | **subgrafo §7** |
| nutrition | `assign_nutrition_plan` | draft, client_id | **sí** | POST assign |
| billing | `get_billing_overview` / `get_client_subscription` | client_id? | no | client-billing.ts |
| billing | `create_billing_plan` | nombre, precio, recurrencia | **sí** | billing_plans |
| billing | `manage_subscription` | client_id, acción (pause/cancel/change) | **sí** SIEMPRE | client-billing + Stripe |
| billing | `issue_refund` | payment_id, importe | **sí** SIEMPRE | refund handler |
| workflows | `list_workflows` / `create_workflow` | definición validada | crear=**sí** | workflows.ts (valida contra step registry) |
| analytics | `get_business_metrics` | rango | no | analytics libs (MRR, adherencia, churn) |
| analytics | `get_client_progress` | client_id, rango | no | progreso/logs (devuelve artifact chart) |
| tasks | `list_tasks` / `create_task` | … | no | tasks/calendar |
| memory | `manage_memory` | append/replace/view | no | ai_memory (§8) |
| meta | `todo_write` | lista tareas del turno | no | interno (multi-paso, patrón PostHog) |

**Contextuales** (solo si la vista está montada, vía `useAgentTool`): `edit_current_program`
(en Training editor: el artifact vuelve por `ui_payload` y el callback actualiza el editor en
vivo), `fill_checkin_review` (en CheckInReview), `prefill_client_form` (en AddClient).

Total v1: ~28 tools + 3 contextuales. `send_message`, todo billing y `assign_*` son
dangerous **sin excepción** — el coach siempre ve el preview (el mensaje redactado, el plan
completo, el cargo) antes de que salga nada hacia un cliente o hacia Stripe.

---

## 7. Subgrafos generadores (la capacidad estrella)

Patrón PostHog: el generador es un **subgrafo invocado como tool**, con su propio mini-loop,
y el resultado es un **artifact** (draft), nunca una escritura directa.

```
generate_training_program:
  context_loader   → perfil cliente + historial workout_logs + material + lesiones (notas
                     privadas NO se incluyen en el draft, solo informan al planner)
  planner          → sonnet: split semanal, progresión, volumen por grupo muscular
  exercise_matcher → determinista: resuelve cada slot contra la biblioteca `exercises`
                     (filtro material/patrón/nivel; si no hay match → alternativa del planner)
  builder          → haiku con structured output: emite data_json EXACTO del editor actual
  validator        → zod + reglas duras (días == pedidos, series/reps en rango, sin
                     ejercicios fuera de biblioteca, volumen semanal sensato)
                     → si falla, vuelve al builder con los errores (máx 2 reintentos)
```
El draft vuelve como artifact `{ kind: 'training_draft', data_json }` → el frontend lo
renderiza con los MISMOS componentes del editor de programas (preview real, no markdown) →
el coach dice "asígnaselo" → `assign_training_program` (dangerous) hace el INSERT idéntico
al handler actual, con lo cual dispara `trigger.plan_assigned` y las automations existentes.

`generate_nutrition_plan` es isomorfo: targets (Mifflin-St Jeor + objetivo, o macros
explícitos del coach) → selección de `foods`/recetas respetando restricciones → data_json
del editor de nutrición → validator (kcal/macros dentro de ±5% del target, sin alérgenos
declarados). Validación nutricional determinista, no "a ojo de LLM".

---

## 8. Memoria + contexto

- **Core memory** (`ai_memory.text`, hechos línea a línea, tope 10k chars): inyectada SIEMPRE
  en el system prompt. Tras cada turno con información nueva, `memory_collector` (haiku)
  emite operaciones `append` / `replace(fragmento_original, nuevo)` — ej.: "Prefiere planes
  de 4 días", "Sus clientes son mayormente opositores", "Cobra 120€/mes el plan premium".
- **ui_context** por mensaje: vista activa + client_id abierto + idioma → el root sabe "está
  mirando a María" sin que el coach lo diga.
- **Compactación**: si la ventana supera ~80k tokens, resumen con haiku insertado como
  mensaje de contexto y ventana desplazada (patrón `root_conversation_start_id` de PostHog).

## 9. System prompt del root (fragmentos componibles, `prompts/`)

`role` (eres Nuly AI, copiloto del coach; español/inglés según `language`) + `tone` (directo,
profesional, cero relleno) + `capabilities` (qué dominios manejas) + `tool_policy` (lee antes
de escribir; agrupa lecturas en paralelo; NUNCA inventes ejercicios/alimentos/datos: si no
está en la biblioteca dilo; para escrituras sensibles anuncia que pedirás aprobación) +
`safety` (no des consejo médico; deriva a profesional sanitario cuando toque; las notas
privadas del coach jamás se citan en textos dirigidos al cliente) + `memory` (bloque core
memory) + `context` (ui_context + fecha) + `contextual_tools` (templates de las montadas).
Los 4 primeros bloques son estables → **cache_control 1h** (≈90% de descuento en input).

## 10. Endpoint (`server/ai/routes.ts`)

```
POST /api/ai/conversations           (verifyManager + rate limit propio)
  1. valida AgentRequest (zod); rate limit burst 10/min, sustained 100/día (tabla ai_usage)
  2. upsert ai_conversations (id del cliente); si status=in_progress y content!=null → 409
  3. si resume_payload → input = new Command({ resume: payload })
     si content=null sin resume → reanudar streaming del checkpoint
     si content → input = { messages: [new HumanMessage(content)], ...ctx }
  4. res: text/event-stream; keepalive cada 15s; status in_progress
  5. for await (evento of graph.streamEvents(...)):
       - traducir a SSEEvent, escribir SSE + broadcast Realtime
       - si interrupt → event approval + pending_approval en BD + status idle + CORTAR
       - abortar si status pasó a canceling (releer cada N eventos)
  6. finally: status idle, updated_at, registrar ai_usage, event status:complete

PATCH  /api/ai/conversations/:id/cancel    → status='canceling' (204)
GET    /api/ai/conversations               → historial (id, title, updated_at)
GET    /api/ai/conversations/:id           → mensajes rehidratados del checkpoint
```
`vercel.json`: añadir `"functions": { "server/index.ts": { "maxDuration": 300 } }`.

## 11. Frontend (UI Nuly, mecánica PostHog)

- `AgentProvider` (Context): tools registradas (Map), historial, `openAgent(prompt?)`.
- `useAgentTool({ identifier, context, callback, active })`: registro en `useEffect` con
  `JSON.stringify(context)` como dep; cleanup al desmontar. En cada envío el hilo compila
  `contextual_tools` desde el Map.
- `useAgentThread(conversationId)`: reducer con la mecánica exacta de maxThreadLogic —
  fetch POST + `eventsource-parser` sobre `response.body`, mensajes `temp-*` → status
  `loading`, reemplazo por id, `AbortController`, retry con backoff, 409 → reconexión con
  `content: null` + limpiar hilo en el primer evento, y `resume_payload` para
  approve/reject.
- `AgentPanel`: panel lateral derecho (overlay como el sidebar móvil actual: motion +
  backdrop), montado en `MainLayout` junto a `Sidebar` — accesible desde cualquier vista con
  un FAB/botón en el header (icono sparkles esmeralda). Página completa `/assistant` para
  historial. Estilo: blanco/slate-900 dark, acentos emerald, tipografía actual.
- Render de artifacts: `training_draft`/`nutrition_draft` reutilizan los componentes de
  preview de los editores; `chart` usa los mismos recharts con la paleta del dashboard;
  aprobaciones = `DangerousOperationInput` en el composer (preview markdown + Aprobar
  (emerald) / Rechazar / editar payload) + `ApprovalCard` en el hilo.

## 12. Seguridad (amplía las reglas ya vigentes del repo)

1. `manager_id` solo de `req.user.id`; las tools no aceptan manager_id como arg. UUIDs de
   args validados con zod antes de tocar PostgREST.
2. `clients_profiles.notes` (nota privada) puede LEERLA el agente para razonar, pero el
   prompt prohíbe citarla en cualquier texto dirigido al cliente, y `send_message`/`review_checkin`
   pasan un filtro determinista (si el texto contiene fragmentos ≥15 chars de la nota → se
   bloquea y se pide reformular).
3. Todo lo que sale del tenant (mensajes, cobros, invitaciones, asignaciones) = dangerous.
4. Prompt-injection: los datos de clientes (check-ins, mensajes entrantes) entran al
   contexto como DATOS con delimitadores; el prompt instruye a no obedecer instrucciones
   embebidas en ellos; las escrituras siempre acaban en aprobación humana → defensa en
   profundidad.
5. Rate limit por manager + tope diario de tokens (`ai_usage`); kill-switch por env
   (`AI_ENABLED=false`).

## 13. Costes estimados (Anthropic, con prompt caching)

| Escenario | Modelo(s) | Coste aprox./interacción |
|---|---|---|
| Pregunta con 2-3 lecturas | sonnet (cache hit) | $0.03–0.08 |
| Redactar y enviar mensaje | sonnet | $0.05–0.12 |
| Generar programa 8 semanas | sonnet planner + haiku builder | $0.25–0.60 |
| Overhead título+memoria/turno | haiku | <$0.01 |

Coach activo (~30 interacciones/día, 2 generaciones): **$2–5/día** → margen claro para
plan Pro con cupo de créditos (la tabla `ai_usage` ya da la contabilidad).

## 14. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Timeout Vercel en generaciones largas | maxDuration 300s + checkpointer (reanudable) + F6 Inngest |
| SSE cortado por proxy/red | keepalive 15s + reconexión content:null + Realtime broadcast |
| Pooler transaction-mode rompe PostgresSaver | usar pooler session-mode (5432) — documentado §2 |
| LLM alucina ejercicios/alimentos | matcher determinista contra biblioteca + validator zod, reintentos acotados |
| Doble ejecución (2 pestañas) | status lock en ai_conversations + 409 |
| Coste desbocado | límite 24 tool calls/turno + rate limits + tope diario tokens |
| Fuga notas privadas | filtro determinista en tools de salida + regla de prompt |

## 15. Orden de construcción (mapea a las fases de arquitectura)

1. Migración SQL + contrato + `NulyTool` + registry + grafo mínimo (root⇄tools) + endpoint
   SSE + 6 tools read-only (list/get clients, checkins, metrics, thread, foods, exercises).
2. Panel frontend (Provider + useAgentThread + Thread + Composer) con streaming real.
3. Interrupt/aprobaciones end-to-end con `send_message` como primera dangerous.
4. Resto de tools de lectura/escritura simple + `useAgentTool` en ClientDetail.
5. Subgrafo training → artifact preview → assign. Después nutrition (isomorfo).
6. Billing tools + workflows + memoria/collector + compactación + cancelación + título.
7. Evals mínimos: dataset de 20-30 prompts reales + aserciones (tool correcta invocada,
   draft válido contra zod, ningún dangerous sin aprobación) corriendo en vitest.
