-- ####################################################################
-- # ULTIMATE NUCLEAR FIX - EJECUTAR TODO EN EL SQL EDITOR DE SUPABASE #
-- ####################################################################

-- 1. ASEGURAR COLUMNAS EN LA TABLA DE MENSAJES (FORZADO)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_type text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_name text;

-- 2. RESET TOTAL DEL BUCKET DE ALMACENAMIENTO
-- Forzamos que el bucket exista y sea público
INSERT INTO storage.buckets (id, name, public)
VALUES ('messages-media', 'messages-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. PERMISOS TOTALES (TEMPORAL PARA DESBLOQUEO)
-- Borramos cualquier política anterior para evitar conflictos
-- 3. RESET TOTAL DEL BUCKET DE ALMACENAMIENTO
-- Borramos cualquier política anterior de forma correcta (usando DROP POLICY)
DROP POLICY IF EXISTS "authenticated_upload_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_view_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to messages-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated views in messages-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from messages-media" ON storage.objects;
DROP POLICY IF EXISTS "msg_media_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "msg_media_view_policy" ON storage.objects;
DROP POLICY IF EXISTS "msg_media_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "msg_media_all_access" ON storage.objects;

-- Permitimos TODO a TODOS en este bucket (Solo para mensajes multimedia)
-- Esto garantiza que no haya errores de RLS mientras probamos
CREATE POLICY "msg_media_all_access" 
ON storage.objects FOR ALL 
TO authenticated
USING ( bucket_id = 'messages-media' )
WITH CHECK ( bucket_id = 'messages-media' );

-- 4. REFRESCAR CACHE DE LA API (CRÍTICO)
-- Notificamos al sistema que la estructura de las tablas ha cambiado
NOTIFY pgrst, 'reload schema';

-- 5. VERIFICACIÓN FINAL
-- Esta consulta te dirá si las columnas están activas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('attachment_type', 'attachment_name');
