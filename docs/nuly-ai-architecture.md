# Nuly AI — Arquitectura del agente (réplica del patrón PostHog Max)

> Investigación sobre PostHog/posthog@master (julio 2026): `ee/hogai/` (backend del agente),
> `frontend/src/scenes/max/` (UI) y su infraestructura (Temporal + Redis Streams + SSE).
> Este documento traduce esa arquitectura a Nuly (Node/Express + React 19 + Supabase + Vercel).

---

## 1. Cómo funciona Max (PostHog) — resumen ejecutivo

### Backend (`ee/hogai/`)
- **LangGraph** con un patrón nuclear de **loop de 2 nodos**: `ROOT` (LLM con tools) ⇄ `ROOT_TOOLS`
  (ejecuta tool calls, en paralelo vía `Send()`). Los subsistemas complejos (generar insights, SQL)
  son **subgrafos invocados como tools**, no edges del grafo principal.
- **Sistema de modos**: el nodo ROOT delega en un `AgentModeManager` que según `state.agent_mode`
  selecciona (prompt del root, executable de tools, toolkit). Presets por producto + tool
  `switch_mode` para que el propio LLM cambie de modo.
- **MaxTool** (clase base sobre LangChain BaseTool):
  - `_arun_impl() -> (texto_para_LLM, artifact)` — el artifact viaja como `ui_payload` al frontend.
  - Registro **por convención de archivos**: `products/*/backend/max_tools.py` se auto-importan;
    `__init_subclass__` valida contra un enum compartido con el frontend.
  - **Tools contextuales**: solo existen si su componente de UI está montado; el frontend envía
    `contextual_tools: {nombre: contexto}` en cada request.
  - RBAC declarativo por tool (`get_required_resource_access`).
- **Human-in-the-loop en la clase base**: `is_dangerous_operation()` + `format_dangerous_operation_preview()`
  → `interrupt(ApprovalRequest)` de LangGraph → el grafo se pausa con checkpoint persistido →
  el usuario aprueba/rechaza (payload editable) → `Command(resume=...)`.
- **Estado**: checkpointer custom de LangGraph sobre Postgres (tablas `conversation`,
  `checkpoint`, `checkpoint_blob`, `checkpoint_write`; `conversation.status` actúa de lock).
  Compactación por resumen cuando se agota la ventana; límite duro de 24 tool calls por turno.
- **Core memory**: un TextField por tenant (máx 10k chars, hechos línea a línea), inyectado
  siempre en el system prompt, actualizado por un nodo colector post-turno con dos operaciones
  (`append` / `replace`). Onboarding inicial con preguntas al usuario.
- **Modelos**: root = `claude-sonnet-4-6` con extended thinking + prompt caching; nodos
  utilitarios (títulos, memoria, planners) = modelos baratos (gpt-4.1/mini, gpt-5-mini).
- **Prompts como fragmentos componibles** (ROLE, TONE, PROACTIVENESS, TOOL_USAGE_POLICY…)
  ensamblados por un PromptBuilder.

### Infraestructura
- El request HTTP **no ejecuta el grafo**: lanza un workflow **Temporal** ("chat-agent",
  timeout 30 min) y se queda leyendo un **Redis Stream** (`conversation-stream:{id}`) que el
  worker escribe. El endpoint re-emite como **SSE** con keepalives cada 15 s.
  → Reconexión gratis: cualquier cliente puede re-leer el stream (`content: null` reanuda).
- Cola de máx. 2 mensajes encolables mientras el agente corre; `PATCH /cancel` cancela el workflow.
- Rate limiting: burst 10/min + sustained 100/día; cuota de créditos de IA precalculada; consumo
  medido con eventos `$ai_generation` (LLM analytics propio).
- Evals con Braintrust + pytest (CI y datasets offline).

### Frontend (`frontend/src/scenes/max/`)
- Una sola instancia de UI con dos hosts: **side panel global** (sobre cualquier página) y
  página completa. Keyed por `panelId`; nunca dos vistas vivas del mismo hilo.
- **No usan EventSource**: POST con `fetch` + parseo SSE del body (`eventsource-parser`),
  `AbortController` para cancelar, retry con backoff, y reconexión tras 409 con `content: null`.
- Contrato en un solo archivo compartido (`schema-assistant-messages.ts`): unión discriminada de
  mensajes por `type` (`human`, `ai` con thinking/tool_calls, `ai/viz`, `ai/failure`, `tool`…),
  5-6 tipos de evento SSE, `resume_payload` como único canal de vuelta (aprobar/rechazar/
  formularios/resultados de tools de cliente).
- **`useMaxTool` hook**: cualquier página registra una tool contextual mientras está montada
  (store global; cleanup al desmontar). Cuando el agente la invoca, el resultado llega como
  `ui_payload` y ejecuta el `callback` registrado → el agente "toca" la página del usuario.
- Aprobaciones: el composer se reemplaza por el preview en markdown con Approve/Reject;
  un mensaje nuevo con aprobación pendiente la auto-rechaza usando el mensaje como feedback.
- Mensajes parciales con `id: temp-*` y `status: loading|completed|error`; identidad de objetos
  preservada para que `React.memo` no re-renderice por token.

---

## 2. Diseño para Nuly ("Nuly AI")

Un agente que orquesta TODO el SaaS del coach: generar entrenamientos y planes de nutrición,
gestionar clientes, responder mensajes, gestionar cobros/suscripciones, check-ins, workflows.
Lectura y escritura totales, con aprobación humana para operaciones sensibles.

### 2.1 Stack elegido (equivalencias)

| PostHog | Nuly | Nota |
|---|---|---|
| LangGraph (Python) | **LangGraph.js** (`@langchain/langgraph`) | Mismo modelo mental; corre en Node |
| Temporal worker | **Ejecución in-function en Vercel** (Fluid, hasta 800s) → fase 2: Inngest/Trigger.dev | Sin workers persistentes |
| Redis Streams | **Supabase Realtime broadcast** (canal `conversation:{id}`) o Upstash Redis | Reconexión multi-cliente |
| Django checkpointer | **PostgresSaver oficial de LangGraph.js** sobre Supabase | Esquema casi idéntico |
| `ee_conversation` | tabla `ai_conversations` (status idle/in_progress/canceling como lock) | Id acuñado por el cliente |
| `CoreMemory` por team | tabla `ai_memory` por manager (texto, hechos por línea, tope 10k) | |
| `$ai_generation` billing | tabla `ai_usage` (tokens por conversación/manager) + límites | PostHog LLM analytics opcional |
| Kea logics | Context + hooks (`useAgentThread`, `useAgentTool`, `AgentProvider`) | |
| claude-sonnet root | `claude-sonnet-4-6` root; `claude-haiku-4-5` para títulos/memoria | ANTHROPIC_API_KEY |

### 2.2 Estructura de directorios propuesta

```
server/ai/
├── graph/
│   ├── graph.ts            # AgentLoopGraph: root ⇄ tools + memory collector + title
│   ├── state.ts            # AssistantState (mensajes, modo, tool_call_id, memoria)
│   ├── prompts/            # fragmentos: role, tone, proactiveness, tool-policy, safety
│   └── promptBuilder.ts
├── tool.ts                 # Clase base NulyTool: run() -> {content, artifact},
│                           #   isDangerous(), preview(), requiredAccess
├── registry.ts             # Auto-registro: glob de tools/**/index.ts
├── tools/                  # UNA CARPETA POR DOMINIO (≈ products/*/max_tools.py)
│   ├── clients/            # list/search/get/create/update/archive cliente, notas privadas
│   ├── training/           # generar programa (subgrafo), asignar, editar sesiones, logs
│   ├── nutrition/          # generar plan (subgrafo), macros, recetas, asignar
│   ├── messaging/          # leer hilos, RESPONDER (draft → aprobación), broadcast
│   ├── billing/            # suscripciones cliente, cobros, refunds (SIEMPRE aprobación)
│   ├── checkins/           # revisar, resumir, responder check-ins
│   ├── workflows/          # crear/editar automations y workflows
│   └── analytics/          # métricas de adherencia, progreso, ingresos
├── memory/                 # core memory por manager: collector post-turno + inyección
├── stream/                 # writer → Supabase Realtime; serializador de eventos SSE
├── checkpointer.ts         # PostgresSaver configurado sobre Supabase
└── routes.ts               # POST /api/ai/conversations (SSE), /cancel, historial

src/ai/
├── AgentProvider.tsx        # ≈ maxGlobalLogic: registro de tools, historial, apertura
├── useAgentThread.ts        # ≈ maxThreadLogic: fetch+SSE parser, reconciliación temp-*,
│                            #   retry/backoff, 409→reconexión content:null, AbortController
├── useAgentTool.ts          # ≈ useMaxTool: registro contextual mientras el componente vive
├── types.ts                 # CONTRATO compartido (copiar shape de schema-assistant-messages)
├── components/
│   ├── AgentPanel.tsx       # panel lateral estilo Nuly (Tailwind, dark mode, verde esmeralda)
│   ├── Thread.tsx           # render por tipo de mensaje, React.memo por mensaje
│   ├── Composer.tsx         # input + DangerousOperationInput (aprobar/rechazar/editar)
│   ├── ApprovalCard.tsx     # estado de aprobación en el hilo
│   └── artifacts/           # render de artifacts: PlanPreview, WorkoutPreview, ChartCard
```

### 2.3 El contrato (idéntico en espíritu al de PostHog)

```ts
// Request
POST /api/ai/conversations
{ content: string | null,        // null = reanudar/continuar
  conversation?: string,          // UUID acuñado por el cliente
  trace_id: string,
  contextual_tools?: Record<string, unknown>,   // tools montadas en la página actual
  ui_context?: { clientId?, view?, selection? },
  resume_payload?: { action: 'approve'|'reject'|'form'|'client_tool_result', ... } }

// Eventos SSE: conversation | message | update | status | approval
// Mensajes: human | ai (content, thinking?, tool_calls?) | tool (ui_payload?) | ai/failure
// + status por mensaje en cliente: loading | completed | error
```

### 2.4 Seguridad (no negociable)

- Todas las tools ejecutan **con el manager_id del usuario autenticado** — mismas comprobaciones
  de ownership que las rutas actuales (reutilizar los handlers/helpers existentes, no saltárselos).
- **Aprobación obligatoria** (`isDangerous = true`): enviar mensajes a clientes, cualquier
  operación de Stripe (cobros, refunds, cancelaciones), borrar datos, modificar precios.
- Las notas privadas del coach nunca salen hacia el cliente; el agente del lado cliente (si
  algún día existe) tendría un toolkit read-only distinto.
- Rate limit burst+sustained por manager + contador `ai_usage`.

### 2.5 Fases de implementación

1. **F1 — Núcleo conversacional (leer)**: tablas + checkpointer + grafo root⇄tools con 8-10
   tools read-only (clientes, check-ins, analytics, mensajes) + endpoint SSE + panel lateral
   con streaming. El agente responde preguntas sobre el negocio con datos reales.
2. **F2 — Escritura con aprobaciones**: NulyTool.isDangerous + interrupt/resume + ApprovalCard;
   tools de escritura: crear/editar cliente, responder mensajes (draft), gestionar check-ins.
3. **F3 — Generadores (subgrafos)**: subgrafo de programas de entrenamiento y de planes de
   nutrición (planner → generator → validator), devueltos como artifacts renderizados con la
   UI existente de Nuly; asignación al cliente tras aprobación.
4. **F4 — Billing + workflows**: tools de Stripe (todas dangerous), crear automations/workflows
   desde lenguaje natural.
5. **F5 — Memoria + contexto ubicuo**: core memory por manager con collector post-turno;
   `useAgentTool` en las páginas principales (ClientDetail, Training, Nutrition, Billing)
   con callbacks que actualizan la página en vivo; sugerencias contextuales por vista.
6. **F6 — Robustez**: cola de mensajes, cancelación, compactación de conversaciones largas,
   límite de iteraciones, evals básicos.

### 2.6 Variables de entorno nuevas

```
ANTHROPIC_API_KEY=        # root del agente (claude-sonnet-4-6) y utilitarios (haiku)
AI_RATE_BURST=10          # msgs/min por manager
AI_RATE_SUSTAINED=100     # msgs/día por manager
```
