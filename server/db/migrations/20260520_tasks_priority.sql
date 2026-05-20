-- Añade la columna `priority` a tasks para que las tareas manuales del
-- coach se rendericen en la columna correcta en la pantalla Tareas.
--
-- Antes la prioridad del form llegaba al frontend pero se descartaba en
-- el POST (CalendarContext no la enviaba, /manager/tasks no la guardaba,
-- la columna no existia). Resultado: todas las tareas manuales acababan
-- como 'medium' por el fallback del filter de Tasks.tsx.
--
-- DEFAULT 'medium' garantiza compatibilidad con filas existentes y con
-- consumers que no envien el campo.

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS priority TEXT
  CHECK (priority IN ('low','medium','high'))
  DEFAULT 'medium';

-- Indice opcional: el filtro en Tasks.tsx se hace en cliente, pero si en
-- el futuro queremos "GET /tasks?priority=high" desde la pagina de
-- prioridad ya tendremos el index listo. Solo manager+priority importa.
CREATE INDEX IF NOT EXISTS idx_tasks_manager_priority
  ON public.tasks (manager_id, priority);
