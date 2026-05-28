-- Feature: Progreso / Acompañamiento — feed de actividad del cliente.
-- NOTA: ya aplicada en producción vía Supabase (migraciones
-- `create_activity_feed_tables` + `client_meal_logs_dedupe`). Este fichero
-- existe para que el repo refleje el esquema y otros entornos puedan replicarlo.

-- 1. client_meal_logs: el cliente marca/registra una comida cumplida.
create table if not exists client_meal_logs (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references users(id) on delete cascade not null,
  plan_id     uuid references nutrition_plans(id) on delete set null,
  day_key     text,
  meal_name   text,
  items       jsonb not null default '[]',
  calories    numeric,
  protein     numeric,
  carbs       numeric,
  fats        numeric,
  logged_at   timestamp with time zone not null default now()
);
create index if not exists client_meal_logs_client_id_idx on client_meal_logs(client_id);
create index if not exists client_meal_logs_logged_at_idx on client_meal_logs(logged_at desc);

-- Anti-duplicado: una comida (por día calendario UTC) sólo una vez por cliente.
create unique index if not exists client_meal_logs_dedupe_idx
  on client_meal_logs (client_id, coalesce(day_key, ''), coalesce(meal_name, ''), ((logged_at at time zone 'UTC')::date));

alter table client_meal_logs enable row level security;
create policy "client_own_meal_logs" on client_meal_logs
  for all using (client_id = auth.uid());
create policy "manager_read_client_meal_logs" on client_meal_logs
  for select using (client_id in (select id from users where manager_id = auth.uid()));

-- 2. coach_activity_highlights: el coach destaca (estrella) una actividad.
create table if not exists coach_activity_highlights (
  id            uuid primary key default gen_random_uuid(),
  manager_id    uuid references users(id) on delete cascade not null,
  activity_type text not null,
  activity_id   text not null,
  created_at    timestamp with time zone not null default now(),
  unique (manager_id, activity_type, activity_id)
);
create index if not exists coach_activity_highlights_mgr_idx on coach_activity_highlights(manager_id);
alter table coach_activity_highlights enable row level security;
create policy "manager_own_highlights" on coach_activity_highlights
  for all using (manager_id = auth.uid());

-- 3. coach_activity_notes: nota del coach sobre una actividad concreta.
--    El UNIQUE compuesto debe coincidir EXACTAMENTE con el onConflict del
--    endpoint PUT /manager/activity/note.
create table if not exists coach_activity_notes (
  id            uuid primary key default gen_random_uuid(),
  manager_id    uuid references users(id) on delete cascade not null,
  activity_type text not null,
  activity_id   text not null,
  note          text not null,
  created_at    timestamp with time zone not null default now(),
  updated_at    timestamp with time zone not null default now(),
  unique (manager_id, activity_type, activity_id)
);
create index if not exists coach_activity_notes_mgr_idx on coach_activity_notes(manager_id);
alter table coach_activity_notes enable row level security;
create policy "manager_own_notes" on coach_activity_notes
  for all using (manager_id = auth.uid());
