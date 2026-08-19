-- ============================================
-- MYSTIC SUNLIGHT — Permisos de Storage (imágenes)
-- Correr esto en Supabase → SQL Editor → New query
-- IMPORTANTE: primero creá el bucket "productos" desde
-- Storage → New bucket → marcado como "Public bucket".
-- ============================================

create policy "Usuarios logueados suben imágenes de productos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'productos');

create policy "Usuarios logueados actualizan imágenes de productos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'productos');

create policy "Usuarios logueados borran imágenes de productos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'productos');
