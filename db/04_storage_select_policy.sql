-- ============================================
-- MYSTIC SUNLIGHT — Permiso faltante de Storage
-- Correr esto en Supabase → SQL Editor → New query
-- (Adicional a 03_storage_policies.sql)
-- ============================================

-- Sin esto, operaciones que necesitan "revisar antes de escribir"
-- (como upsert) fallan con "row-level security policy" aunque el
-- permiso de insertar ya esté dado.
create policy "Usuarios logueados leen imágenes de productos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'productos');
