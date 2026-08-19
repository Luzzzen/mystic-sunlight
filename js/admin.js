/* ============================================
   MYSTIC SUNLIGHT — admin.js
   Login (Supabase Auth) + CRUD de productos.
   La seguridad real vive en las políticas RLS de
   la base, no en este archivo — aunque alguien
   leyera este código, no puede saltarse los
   permisos sin estar logueado de verdad.
   ============================================ */

const loginView   = document.getElementById('login-view');
const adminView   = document.getElementById('admin-view');
const loginForm   = document.getElementById('login-form');
const loginError  = document.getElementById('login-error');
const userEmailEl = document.getElementById('user-email');
const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const formTitle    = document.getElementById('form-title');
const cancelEditBtn = document.getElementById('cancel-edit');

let editingId = null; // null = creando uno nuevo

// ── Sesión ────────────────────────────────────
async function checkSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    showAdmin(session.user.email);
  } else {
    showLogin();
  }
}

function showLogin() {
  loginView.style.display = 'flex';
  adminView.style.display = 'none';
  document.getElementById('admin-view-header').style.display = 'none';
}

function showAdmin(email) {
  loginView.style.display = 'none';
  adminView.style.display = 'block';
  document.getElementById('admin-view-header').style.display = 'flex';
  userEmailEl.textContent = email;
  loadProducts();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.style.display = 'none';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const submitBtn = loginForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Entrando...';

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  submitBtn.disabled = false;
  submitBtn.textContent = 'Entrar';

  if (error) {
    loginError.textContent = 'Email o contraseña incorrectos.';
    loginError.style.display = 'block';
    return;
  }
  showAdmin(data.user.email);
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  showLogin();
});

// ── Listado de productos ──────────────────────
async function loadProducts() {
  productList.innerHTML = '<p style="text-align:center;color:var(--text-mid);padding:2rem 0">Cargando...</p>';

  const { data, error } = await supabaseClient
    .from('productos')
    .select('*')
    .order('orden', { ascending: true });

  if (error) {
    productList.innerHTML = `<p style="text-align:center;color:#a33;padding:2rem 0">Error al cargar: ${escapeHTML(error.message)}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    productList.innerHTML = '<p style="text-align:center;color:var(--text-mid);padding:2rem 0">Todavía no hay productos cargados.</p>';
    return;
  }

  productList.innerHTML = data.map(p => `
    <div class="admin-item ${p.activo ? '' : 'inactivo'}">
      <div class="admin-item-info">
        <strong>${escapeHTML(p.nombre)}</strong>
        <span class="admin-item-meta">$${Number(p.precio).toLocaleString('es-AR')} · stock: ${p.stock} · ${p.categoria || 'sin categoría'} ${p.activo ? '' : '· <em>oculto</em>'}</span>
      </div>
      <div class="admin-item-actions">
        <button class="btn-mini" onclick="toggleActivo('${p.id}', ${p.activo})">${p.activo ? 'Ocultar' : 'Mostrar'}</button>
        <button class="btn-mini" onclick="editProduct('${p.id}')">Editar</button>
        <button class="btn-mini btn-mini-danger" onclick="deleteProduct('${p.id}', '${escapeJS(p.nombre)}')">Borrar</button>
      </div>
    </div>
  `).join('');
}

// ── Crear / editar ─────────────────────────────
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    nombre: document.getElementById('f-nombre').value.trim(),
    descripcion: document.getElementById('f-descripcion').value.trim() || null,
    precio: Number(document.getElementById('f-precio').value),
    categoria: document.getElementById('f-categoria').value.trim() || null,
    imagen_url: document.getElementById('f-imagen').value.trim() || null,
    stock: Number(document.getElementById('f-stock').value) || 0,
    orden: Number(document.getElementById('f-orden').value) || 0,
  };

  const submitBtn = productForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  let error;
  if (editingId) {
    ({ error } = await supabaseClient.from('productos').update(payload).eq('id', editingId));
  } else {
    payload.activo = true;
    ({ error } = await supabaseClient.from('productos').insert(payload));
  }

  submitBtn.disabled = false;

  if (error) {
    alert('Error al guardar: ' + error.message);
    return;
  }

  resetForm();
  loadProducts();
});

async function editProduct(id) {
  const { data, error } = await supabaseClient.from('productos').select('*').eq('id', id).single();
  if (error || !data) { alert('No se pudo cargar el producto.'); return; }

  editingId = id;
  formTitle.textContent = 'Editar producto';
  document.getElementById('f-nombre').value = data.nombre || '';
  document.getElementById('f-descripcion').value = data.descripcion || '';
  document.getElementById('f-precio').value = data.precio || '';
  document.getElementById('f-categoria').value = data.categoria || '';
  document.getElementById('f-imagen').value = data.imagen_url || '';
  document.getElementById('f-stock').value = data.stock ?? 0;
  document.getElementById('f-orden').value = data.orden ?? 0;
  cancelEditBtn.style.display = 'inline-block';
  productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  editingId = null;
  formTitle.textContent = 'Nuevo producto';
  productForm.reset();
  cancelEditBtn.style.display = 'none';
}

cancelEditBtn.addEventListener('click', resetForm);

// ── Ocultar / mostrar ──────────────────────────
async function toggleActivo(id, current) {
  const { error } = await supabaseClient.from('productos').update({ activo: !current }).eq('id', id);
  if (error) { alert('Error: ' + error.message); return; }
  loadProducts();
}

// ── Borrar ──────────────────────────────────────
async function deleteProduct(id, nombre) {
  if (!confirm(`¿Borrar "${nombre}"? Esta acción no se puede deshacer.`)) return;
  const { error } = await supabaseClient.from('productos').delete().eq('id', id);
  if (error) { alert('Error: ' + error.message); return; }
  loadProducts();
}

// ── Helpers ─────────────────────────────────────
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function escapeJS(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

document.addEventListener('DOMContentLoaded', checkSession);
