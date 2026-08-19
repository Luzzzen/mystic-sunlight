-- ============================================
-- MYSTIC SUNLIGHT — Permisos para el panel de admin
-- Correr esto en Supabase → SQL Editor → New query
-- (Este es ADICIONAL a schema.sql, que ya corriste)
-- ============================================

create policy "Usuarios logueados ven todos los productos"
  on productos for select
  to authenticated
  using (true);

create policy "Usuarios logueados crean productos"
  on productos for insert
  to authenticated
  with check (true);

create policy "Usuarios logueados editan productos"
  on productos for update
  to authenticated
  using (true)
  with check (true);

create policy "Usuarios logueados borran productos"
  on productos for delete
  to authenticated
  using (true);
