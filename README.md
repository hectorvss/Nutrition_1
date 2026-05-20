# Nutrition_1

SaaS para entrenadores y nutricionistas: gestiona clientes, asigna planes de
nutrición y entrenamiento, registra check-ins semanales, chatea con clientes,
automatiza mensajería y construye workflows visuales sin código.

**Demo en producción:** [nutrition-1-zeta.vercel.app](https://nutrition-1-zeta.vercel.app)

---

## Qué es Nutrition_1

Una plataforma todo-en-uno para coaches que quieren operar online. Pensada
para que un nutricionista o entrenador pueda atender muchos clientes sin
ahogarse en hojas de cálculo y mensajes sueltos.

**Funcionalidades principales:**

- **Gestión de clientes** — alta, perfil con objetivo/peso/notas, estado
  (Activo / Pendiente / Archivado), riesgo de abandono y última actividad.
- **Planes de nutrición** — biblioteca de plantillas reutilizables (con
  comidas y alimentos reales) que se asignan a cada cliente; editor visual
  con biblioteca de alimentos y arrastrar-soltar; vista semanal y mensual.
- **Programas de entrenamiento** — plantillas por objetivo (fuerza, hipertrofia,
  pérdida de grasa, rendimiento…), editor por día con biblioteca de ejercicios,
  series/reps/descanso y calendario semanal.
- **Check-ins semanales** — formularios configurables (peso, body fat,
  adherencia, estado de ánimo, fotos) con KPIs que alimentan la analítica.
- **Mensajes** — chat 1-a-1 cliente↔manager con adjuntos (imagen, archivo,
  audio), bandeja con filtros (todos / no leídos / requieren respuesta) y
  envío masivo a varios destinatarios.
- **Automatizaciones simples** — asistente de 3 pasos para enviar mensajes
  en respuesta a eventos (nuevo cliente, check-in enviado, inactividad,
  cumpleaños, etc.).
- **Workflow builder avanzado** — canvas visual (React Flow) para construir
  automatizaciones multi-paso con triggers, condiciones, esperas, acciones y
  ramificaciones; motor de ejecución BFS con esperas durables, idempotencia
  y reintentos.
- **Suscripciones** — Stripe (planes Professional / Scale / Unlimited) con
  webhook de billing y portal del cliente.
- **Multi-idioma** — ES / EN.

---

## Stack técnico

**Frontend**
- React 19 + TypeScript
- Vite 6 (dev server + build)
- Tailwind CSS
- [@xyflow/react](https://reactflow.dev/) — canvas del workflow builder
- Framer Motion — transiciones de vista
- lucide-react — iconos

**Backend**
- Node.js + Express + TypeScript
- `tsx watch` en desarrollo, `@vercel/node` en producción
- [@supabase/supabase-js](https://supabase.com/) — DB + Auth + Storage
- Stripe SDK — pagos y webhooks
- `web-push` — notificaciones push
- `express-rate-limit` — rate limiting

**Base de datos / infraestructura**
- Supabase PostgreSQL (Auth, Storage, RLS)
- Vercel (frontend estático + serverless functions para `/api/*`)
- Vercel Cron (`/api/automations/cron` cada día) — dispara workflows
  programados, reanuda esperas durables y procesa automatizaciones recurrentes

**IA**
- Google Gemini API (generación de contenido de plan, sugerencias)

---

## Cómo correr en local

### Prerrequisitos
- Node.js ≥ 20
- npm ≥ 10
- Una cuenta Supabase con un proyecto creado (o las credenciales de uno
  existente)

### 1. Clonar e instalar

```bash
git clone https://github.com/hectorvss/Nutrition_1.git
cd Nutrition_1
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env` y rellena los valores reales:

```bash
cp .env.example .env
```

| Variable | Para qué sirve | Dónde la obtienes |
|---|---|---|
| `APP_URL` | URL del frontend (`http://localhost:3000` en local). | Constante. |
| `PORT` | Puerto del backend Express. Por defecto `3006`. | Constante. |
| `SUPABASE_URL` | URL del proyecto Supabase (backend). | Supabase → Project Settings → API. |
| `SUPABASE_ANON_KEY` | Anon key (backend). | Supabase → Project Settings → API. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key. **Solo backend, nunca prefijo VITE_**. | Supabase → Project Settings → API. |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase para el bundle del cliente. | Igual que `SUPABASE_URL`. |
| `VITE_SUPABASE_ANON_KEY` | Anon key para el bundle del cliente. | Igual que `SUPABASE_ANON_KEY`. |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (modo test en local). | Stripe Dashboard → Developers → API keys. |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook de Stripe. | Stripe Dashboard → Webhooks → Signing secret. |
| `CRON_SECRET` | Secreto que protege `/api/automations/cron`. Vercel Cron lo envía como `Authorization: Bearer`. | Genera uno aleatorio. |
| `SETUP_SECRET` | Token del onboarding inicial (`/api/auth/setup`). | Genera uno aleatorio. |
| `FRONTEND_URL` | Origen permitido por CORS en producción. | URL del deploy. |
| `VAPID_PUBLIC_KEY` | Clave pública VAPID para Web Push. | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID. | Igual ↑ |
| `VAPID_SUBJECT` | Contacto del emisor (`mailto:tú@example.com`). | El que prefieras. |

> ⚠️ **Nunca añadas `VITE_SUPABASE_SERVICE_ROLE_KEY`**. El prefijo `VITE_`
> incrusta la variable en el bundle del navegador y filtraría una clave
> con privilegios de admin.

### 3. Migraciones de Supabase

Ejecuta las migraciones de `server/db/migrations/` (en orden cronológico)
contra tu proyecto Supabase. Se pueden aplicar desde la consola SQL del
dashboard o vía la CLI de Supabase.

### 4. Arrancar dev (frontend + backend)

```bash
npm run dev:all
```

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:3006>

Scripts disponibles:

| Script | Acción |
|---|---|
| `npm run dev` | Solo el frontend (Vite). |
| `npm run dev:server` | Solo el backend (`tsx watch`). |
| `npm run dev:all` | Ambos en paralelo. |
| `npm run build` | Build de producción del frontend. |
| `npm run preview` | Servir el build con `vite preview`. |
| `npm run lint` | `tsc --noEmit` (typecheck). |

### 5. Tests

Suites end-to-end en `scripts/`, ejecutables con `tsx`:

```bash
npx tsx scripts/test-automations.ts   # 21 checks
npx tsx scripts/test-workflows.ts     # 23 checks (requiere backend en :3006)
npx tsx scripts/test-plan-flows.ts    # 16 checks
```

---

## Estructura del proyecto

```
.
├── src/                          # Frontend (React + Vite)
│   ├── App.tsx                   # Shell del manager
│   ├── ClientApp.tsx             # Shell del cliente
│   ├── main.tsx                  # Providers root
│   ├── api.ts                    # fetchWithAuth + token helpers
│   ├── components/               # UI compartida
│   │   └── ui/                   # Primitivos (Select, …)
│   ├── context/                  # AuthContext, ClientContext,
│   │                             # AutomationContext, ThemeContext, etc.
│   ├── views/                    # Una vista por pantalla
│   ├── constants/                # Datos estáticos (presets, traducciones)
│   ├── types/                    # Tipos compartidos
│   └── push.ts                   # Suscripción Web Push del cliente
│
├── server/                       # Backend (Node + Express)
│   ├── index.ts                  # Bootstrap + CORS + rate limit + rutas
│   ├── db/
│   │   ├── index.ts              # Cliente Supabase (anon + service role)
│   │   └── migrations/           # SQL versionado de cambios de esquema
│   ├── lib/                      # push.ts, helpers
│   ├── middleware/auth.ts        # verifyManager / verifyClient / authenticate
│   ├── routes/                   # Endpoints (auth, manager, client, messages,
│   │                             # check_ins, stripe, automations, workflows,
│   │                             # onboarding)
│   └── scripts/                  # Scripts operativos (seeds, syncs) y
│       └── _debug/               # depuración puntual
│
├── scripts/                      # Tests de integración (tsx)
├── supabase/migrations/          # Migraciones legadas
├── public/                       # Estáticos
├── vercel.json                   # Build, rewrites, cron diario
└── .env.example                  # Plantilla de variables de entorno
```

### Convenciones

- **Una vista = un fichero** en `src/views/NombreVista.tsx`. Las vistas
  con sub-flujos (Automations, Nutrition, Training) son orquestadoras que
  alternan entre `views/...` hijas según `currentView`.
- **Contextos** en `src/context/` centralizan datos compartidos (clientes,
  automatizaciones, alimentos…). Cargan al montarse pero suelen depender de
  `useAuth()` para no disparar peticiones sin token.
- **Endpoints** en `server/routes/{recurso}.ts`, montados bajo `/api/...`
  desde `server/index.ts`. Todos pasan por `verifyManager` / `verifyClient`
  / `authenticate`.
- **RLS activo** en todas las tablas (`public.*`). El backend usa la
  service role key, que bypasea RLS; el bundle del cliente solo tiene la
  anon key.
- **Migraciones** en `server/db/migrations/YYYYMMDD_descripcion.sql`. Se
  aplican manualmente al proyecto Supabase.

---

## Deploy

El proyecto se despliega en Vercel desde `main`:

```bash
npx vercel --prod
```

`vercel.json` define el build (estático en `dist/`) más la función
serverless de Node (`server/index.ts` → `/api/*`) y la entrada del cron
diario en `/api/automations/cron`.

---

## Licencia

Privado / propietario.
