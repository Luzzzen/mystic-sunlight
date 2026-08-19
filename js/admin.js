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
const fileInput      = document.getElementById('f-imagen-file');
const previewWrap    = document.getElementById('imagen-preview-wrap');
const previewImg      = document.getElementById('imagen-preview');
const quitarImagenBtn = document.getElementById('quitar-imagen');

let editingId = null;       // null = creando uno nuevo
let pendingImageBlob = null; // imagen nueva comprimida, lista para subir
let currentImageUrl = null;  // imagen ya guardada (al editar)
let imagenEliminada = false; // el usuario tocó "Quitar imagen"

// ── Compresión de imagen ──────────────────────
// Redimensiona a un máximo de 1000px de ancho y la
// convierte a JPEG calidad 82% — pesa poco sin notarse
// la pérdida de calidad en pantalla.
function compressImage(file, maxWidth = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('El archivo no es una imagen válida'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen')),
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function showPreview(url) {
  previewImg.src = url;
  previewWrap.style.display = 'flex';
}
function hidePreview() {
  previewWrap.style.display = 'none';
  previewImg.src = '';
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;
  imagenEliminada = false;
  try {
    pendingImageBlob = await compressImage(file);
    showPreview(URL.createObjectURL(pendingImageBlob));
  } catch (err) {
    alert('No se pudo procesar la imagen: ' + err.message);
    fileInput.value = '';
  }
});

quitarImagenBtn.addEventListener('click', () => {
  pendingImageBlob = null;
  currentImageUrl = null;
  imagenEliminada = true;
  fileInput.value = '';
  hidePreview();
});

// Sube la imagen pendiente a Storage y devuelve la URL pública
async function subirImagenPendiente() {
  const path = `productos/${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;
  const { error } = await supabaseClient.storage
    .from('productos')
    .upload(path, pendingImageBlob, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  const { data } = supabaseClient.storage.from('productos').getPublicUrl(path);
  return data.publicUrl;
}

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
    stock: Number(document.getElementById('f-stock').value) || 0,
    orden: Number(document.getElementById('f-orden').value) || 0,
  };

  const submitBtn = productForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';

  try {
    // Imagen: subir la nueva si hay, mantener la actual si no se tocó,
    // o guardar null si se apretó "Quitar imagen".
    if (pendingImageBlob) {
      payload.imagen_url = await subirImagenPendiente();
    } else if (imagenEliminada) {
      payload.imagen_url = null;
    } else if (editingId) {
      payload.imagen_url = currentImageUrl;
    } else {
      payload.imagen_url = null;
    }

    let error;
    if (editingId) {
      ({ error } = await supabaseClient.from('productos').update(payload).eq('id', editingId));
    } else {
      payload.activo = true;
      ({ error } = await supabaseClient.from('productos').insert(payload));
    }
    if (error) throw error;

    resetForm();
    loadProducts();
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar';
  }
});

async function editProduct(id) {
  const { data, error } = await supabaseClient.from('productos').select('*').eq('id', id).single();
  if (error || !data) { alert('No se pudo cargar el producto.'); return; }

  editingId = id;
  pendingImageBlob = null;
  imagenEliminada = false;
  currentImageUrl = data.imagen_url || null;
  formTitle.textContent = 'Editar producto';
  document.getElementById('f-nombre').value = data.nombre || '';
  document.getElementById('f-descripcion').value = data.descripcion || '';
  document.getElementById('f-precio').value = data.precio || '';
  document.getElementById('f-categoria').value = data.categoria || '';
  document.getElementById('f-stock').value = data.stock ?? 0;
  document.getElementById('f-orden').value = data.orden ?? 0;
  fileInput.value = '';
  if (currentImageUrl) { showPreview(currentImageUrl); } else { hidePreview(); }
  cancelEditBtn.style.display = 'inline-block';
  productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  editingId = null;
  pendingImageBlob = null;
  currentImageUrl = null;
  imagenEliminada = false;
  formTitle.textContent = 'Nuevo producto';
  productForm.reset();
  hidePreview();
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
