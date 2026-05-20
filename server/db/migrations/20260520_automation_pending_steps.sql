-- Tabla para persistir el progreso de una automation multi-step mientras
-- esta dormida en un step `wait`. El cron diario despierta las filas cuyo
-- `resume_at` ya paso y continua la ejecucion desde `step_index`.
--
-- Modelo (simple, sin recurrencia ni ramas):
--   1. processTrigger se ejecuta y empieza a iterar steps.
--   2. Si encuentra { kind: 'wait', amount, unit }, INSERTA una fila aqui
--      con step_index = posicion_siguiente, resume_at = now + delay.
--   3. El cron llama `resumePendingAutomationSteps()` que busca filas con
--      resume_at <= now() y reanuda desde step_index.
--   4. Al terminar la cadena, la fila se borra.
--
-- ON DELETE CASCADE en automation_id: si el coach borra la automation,
-- las cadenas pendientes desaparecen sin huerfanos.

CREATE TABLE IF NOT EXISTS automation_pending_steps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  client_id     UUID NOT NULL,
  step_index    INT  NOT NULL,
  resume_at     TIMESTAMPTZ NOT NULL,
  -- Snapshot de payload del trigger + variables ya resueltas, por si la
  -- automation se edita entre dos steps (queremos preservar el contexto
  -- con el que se disparo).
  context       JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- El cron consulta WHERE resume_at <= now() — indexamos esa busqueda.
CREATE INDEX IF NOT EXISTS idx_aps_resume_at
  ON automation_pending_steps (resume_at);

-- Bloquea concurrencia: no quiero dos workers desperdtando la misma cadena.
-- Indice unico por (automation_id, client_id) para que solo haya UNA fila
-- activa por cadena pendiente — el segundo INSERT da unique-violation.
CREATE UNIQUE INDEX IF NOT EXISTS idx_aps_one_per_chain
  ON automation_pending_steps (automation_id, client_id);

-- Solo backend (service role) escribe aqui. RLS sin policies = denegacion
-- total para anon/authenticated (igual que stripe_processed_events).
ALTER TABLE automation_pending_steps ENABLE ROW LEVEL SECURITY;
