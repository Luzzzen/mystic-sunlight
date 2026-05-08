/* ============================================
   MYSTIC SUNLIGHT — carrito.js
   Solo para la tienda (productos físicos)
   ============================================ */

const WHATSAPP_NUMBER = '5493644450449'; // ← mismo número que en nav.js
const WHATSAPP_GREETING = 'Hola Male! Vi la tienda de Mystic Sunlight y me gustaría hacer un pedido:\n\n';

let cart = JSON.parse(localStorage.getItem('ms_cart') || '[]');

// ── Render del carrito ───────────────────────
function renderCart() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const countEl = document.getElementById('cart-count');
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');

  if (countEl) countEl.textContent = count;

  if (itemsEl) {
    if (cart.length === 0) {
      itemsEl.innerHTML = '<p style="font-size:0.82rem;color:var(--text-mid);text-align:center;padding:0.5rem 0">Tu pedido está vacío</p>';
    } else {
      itemsEl.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">$${(item.price * item.qty).toLocaleString('es-AR')}</span>
          <button class="cart-item-remove" onclick="removeItem(${idx})" title="Quitar">✕</button>
        </div>
      `).join('');
    }
  }

  if (totalEl) totalEl.textContent = `Total: $${total.toLocaleString('es-AR')}`;

  localStorage.setItem('ms_cart', JSON.stringify(cart));
}

// ── Agregar producto ─────────────────────────
function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  renderCart();
  openCart();

  // Feedback visual en el botón
  const btns = document.querySelectorAll('[data-product]');
  btns.forEach(btn => {
    if (btn.dataset.product === name) {
      btn.textContent = '✓ Agregado';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Agregar al pedido';
        btn.disabled = false;
      }, 1500);
    }
  });
}

// ── Quitar producto ──────────────────────────
function removeItem(idx) {
  cart.splice(idx, 1);
  renderCart();
}

// ── Vaciar carrito ───────────────────────────
function clearCart() {
  cart = [];
  renderCart();
}

// ── Abrir/cerrar panel ───────────────────────
function openCart() {
  document.getElementById('cart-panel')?.classList.add('open');
}

function toggleCart() {
  document.getElementById('cart-panel')?.classList.toggle('open');
}

// ── Enviar por WhatsApp ──────────────────────
function sendWhatsApp() {
  if (cart.length === 0) return;

  const items = cart.map(i =>
    `• ${i.name} (x${i.qty}) — $${(i.price * i.qty).toLocaleString('es-AR')}`
  ).join('\n');

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const msg = WHATSAPP_GREETING + items + `\n\nTotal: $${total.toLocaleString('es-AR')}`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ── Inyectar HTML del carrito ────────────────
function buildCartUI() {
  const cartHTML = `
    <button id="cart-btn" onclick="toggleCart()">
      🛒 <span id="cart-count">0</span>
    </button>

    <div id="cart-panel">
      <h3>✨ Tu pedido</h3>
      <div id="cart-items"></div>
      <div id="cart-total">Total: $0</div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button id="cart-clear" onclick="clearCart()">Vaciar</button>
        <button id="cart-whatsapp" onclick="sendWhatsApp()">
          📲 Enviar por WhatsApp
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', cartHTML);

  // Cerrar al clickear afuera
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('cart-panel');
    const btn   = document.getElementById('cart-btn');
    if (panel && !panel.contains(e.target) && !btn.contains(e.target)) {
      panel.classList.remove('open');
    }
  });

  renderCart();
}

// ── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', buildCartUI);
