-- Indices para los hot paths del SaaS. Detectados con auditoria: muchas
-- tablas tenian SOLO el PK, asi que filtros por manager_id/client_id/
-- sender_id/receiver_id/stripe_subscription_id hacian full table scan.
--
-- Cada CREATE INDEX usa IF NOT EXISTS por idempotencia (la migracion se
-- puede re-aplicar sin error si parte ya existe).

-- users: filtros constantes por manager_id (manager.clients), role (multi).
CREATE INDEX IF NOT EXISTS idx_users_manager_role ON public.users (manager_id, role) WHERE manager_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role         ON public.users (role);

-- messages: chat bidireccional + unread count + sort cronologico.
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread ON public.messages (receiver_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages (sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender ON public.messages (receiver_id, sender_id, created_at DESC);

-- check_ins (legacy): listas por cliente + sort por fecha + analitica 60d.
CREATE INDEX IF NOT EXISTS idx_check_ins_client_date ON public.check_ins (client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_check_ins_date        ON public.check_ins (date DESC);

-- manager_subscriptions: webhook Stripe busca por stripe_subscription_id.
CREATE INDEX IF NOT EXISTS idx_manager_subs_stripe_sub      ON public.manager_subscriptions (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_manager_subs_stripe_customer ON public.manager_subscriptions (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- user_sessions: lookups por usuario al login + listar sesiones del manager.
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions (user_id, created_at DESC);

-- login_history: timeline de actividad del usuario (la columna se llama "timestamp", no "created_at").
CREATE INDEX IF NOT EXISTS idx_login_history_user ON public.login_history (user_id, "timestamp" DESC);

-- automation_logs: queries por automation_id (el de client ya existia). Columna real: sent_at.
CREATE INDEX IF NOT EXISTS idx_automation_logs_automation ON public.automation_logs (automation_id, sent_at DESC);

-- tasks: scope por manager + ordenadas por fecha en la UI de planning.
CREATE INDEX IF NOT EXISTS idx_tasks_manager      ON public.tasks (manager_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_client       ON public.tasks (client_id) WHERE client_id IS NOT NULL;

-- clients_profiles: orden por last_login (lista de clientes con "ultima actividad").
CREATE INDEX IF NOT EXISTS idx_clients_profiles_last_login ON public.clients_profiles (last_login DESC NULLS LAST);

-- ANALYZE para que el planner conozca las nuevas estadisticas inmediatamente.
ANALYZE public.users;
ANALYZE public.messages;
ANALYZE public.check_ins;
ANALYZE public.manager_subscriptions;
ANALYZE public.user_sessions;
ANALYZE public.login_history;
ANALYZE public.automation_logs;
ANALYZE public.tasks;
ANALYZE public.clients_profiles;
