-- ============================================
-- MYSTIC SUNLIGHT — Esquema de la tienda
-- Correr esto en Supabase → SQL Editor → New query
-- ============================================

create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  precio numeric not null,
  categoria text,
  imagen_url text,
  stock integer not null default 0,
  activo boolean not null default true,
  orden integer default 0,
  created_at timestamptz not null default now()
);

-- Seguridad: sin esto, nadie puede leer nada (correcto por defecto).
-- Esta regla abre SOLO la lectura pública de productos activos.
-- Insertar/editar/borrar seguirá bloqueado desde el navegador
-- hasta que armemos el panel de admin con su propia autenticación.
alter table productos enable row level security;

create policy "Productos activos son públicos"
  on productos for select
  using (activo = true);

-- ── Permisos del panel de administración ─────
-- Cualquier usuario logueado (vos y tu novia, una vez que
-- creen sus cuentas en Supabase → Authentication) puede
-- ver TODOS los productos y crear/editar/borrar.
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

-- ── Productos de prueba ──────────────────────
-- Fácil de identificar y borrar: buscá "PRUEBA" en el
-- Table Editor de Supabase y eliminá esas filas cuando
-- tengas el catálogo real.
insert into productos (nombre, descripcion, precio, categoria, stock, orden) values
('Sahumerio Palo Santo (caja x6)', '[PRUEBA] Producto de ejemplo — reemplazar por el catálogo real.', 3500, 'sahumerios', 20, 1),
('Cuarzo Rosa pulido', '[PRUEBA] Producto de ejemplo — reemplazar por el catálogo real.', 5200, 'cristales', 10, 2),
('Vela de soja aromática', '[PRUEBA] Producto de ejemplo — reemplazar por el catálogo real.', 4800, 'velas', 15, 3);
