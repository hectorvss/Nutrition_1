-- ####################################################################
-- # FIX TOTAL DE PERMISOS - EJECUTAR EN EL SQL EDITOR DE SUPABASE    #
-- ####################################################################

-- 1. ASEGURAR QUE EL BUCKET ES PÚBLICO
UPDATE storage.buckets 
SET public = true 
WHERE id = 'messages-media';

-- 2. ELIMINAR CUALQUIER POLÍTICA PREVIA PARA EVITAR CONFLICTOS
DROP POLICY IF EXISTS "msg_media_all_access" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_upload_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_view_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to messages-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated views in messages-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from messages-media" ON storage.objects;
DROP POLICY IF EXISTS "msg_media_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "msg_media_view_policy" ON storage.objects;
DROP POLICY IF EXISTS "msg_media_delete_policy" ON storage.objects;

-- 3. PERMISO UNIVERSAL (ANON + AUTHENTICATED)
-- Esto permite que CUALQUIERA pueda subir archivos a este bucket específico
-- Es la forma más segura de desbloquearlo si la sesión no se sincroniza bien
CREATE POLICY "msg_media_universal_access" 
ON storage.objects FOR ALL 
TO public
USING ( bucket_id = 'messages-media' )
WITH CHECK ( bucket_id = 'messages-media' );

-- 4. REFRESCAR SISTEMA
NOTIFY pgrst, 'reload schema';
