/* ============================================
   MYSTIC SUNLIGHT — tienda.js
   Trae los productos desde Supabase y los pinta
   en la grilla. Si no hay productos (o falla la
   conexión), se muestra el bloque "Próximamente".
   ============================================ */

async function cargarProductos() {
  const grid = document.getElementById('productos-grid');
  const vacio = document.getElementById('productos-vacio');
  if (!grid) return;

  try {
    // Si Supabase no responde en 10 segundos, se corta y se avisa
    const { data, error } = await supabaseClient
      .from('productos')
      .select('id, nombre, descripcion, precio, imagen_url, orden')
      .eq('activo', true)
      .order('orden', { ascending: true })
      .abortSignal(AbortSignal.timeout(10000));

    if (error) throw error;

    if (!data || data.length === 0) {
      vacio.style.display = 'block';
      return;
    }

    grid.innerHTML = data.map(p => `
      <div class="card">
        ${p.imagen_url
          ? `<img src="${escapeHTML(p.imagen_url)}" alt="${escapeHTML(p.nombre)}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;margin-bottom:0.25rem" />`
          : `<div class="card-icon">🪔</div>`
        }
        <div class="card-title">${escapeHTML(p.nombre)}</div>
        ${p.descripcion ? `<p class="card-desc">${escapeHTML(p.descripcion)}</p>` : ''}
        <div class="card-price">$${Number(p.precio).toLocaleString('es-AR')}</div>
        <button class="btn btn-primary" data-product="${escapeHTML(p.nombre)}" onclick="addToCart('${escapeJS(p.nombre)}', ${Number(p.precio)})">
          Agregar al pedido
        </button>
      </div>
    `).join('');

    grid.style.display = 'flex';
    vacio.style.display = 'none';
  } catch (err) {
    // Si algo falla (sin conexión, Supabase caído, etc.)
    console.warn('No se pudieron cargar los productos:', err.message);
    // Avisar en vez de mostrar "Próximamente" (que da a entender que no hay productos)
    vacio.innerHTML = '<p>No pudimos cargar los productos. Revisá tu conexión y recargá la página.</p>';
    vacio.style.display = 'block';
  }
}

// Evita que nombres/descripciones con caracteres especiales rompan el HTML
function escapeHTML(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Para meter texto dentro de un onclick="fn('...')": primero se escapa para JS y después para HTML
function escapeJS(str) {
  return escapeHTML(String(str ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' '));
}

document.addEventListener('DOMContentLoaded', cargarProductos);
