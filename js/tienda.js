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
    const { data, error } = await supabaseClient
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      vacio.style.display = 'block';
      return;
    }

    grid.innerHTML = data.map(p => `
      <div class="card">
        ${p.imagen_url
          ? `<img src="${p.imagen_url}" alt="${escapeHTML(p.nombre)}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;margin-bottom:0.25rem" />`
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
    // Si algo falla (sin conexión, tabla no creada todavía, etc.)
    // se queda el bloque "Próximamente" que ya estaba en el HTML.
    console.warn('No se pudieron cargar los productos:', err.message);
  }
}

// Evita que nombres/descripciones con caracteres especiales rompan el HTML
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Evita que un nombre con comillas rompa el onclick
function escapeJS(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

document.addEventListener('DOMContentLoaded', cargarProductos);
