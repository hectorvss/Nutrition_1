-- El código del servidor inserta link_url en tasks desde tres rutas
-- (POST /manager/tasks, pasos create_task de automations, action.create_task
-- de workflows), pero la columna nunca se migró: PostgREST rechaza columnas
-- desconocidas, rompiendo la creación de tareas y los workflows que crean
-- tareas (run "Churn Radar" fallido del 15-jun-2026 con PGRST204).
-- Aplicada en Supabase el 23-jul-2026 como add_tasks_link_url.
alter table public.tasks add column if not exists link_url text;
