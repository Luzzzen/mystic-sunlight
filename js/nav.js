/* ============================================
   MYSTIC SUNLIGHT — nav.js
   Inyecta navbar y footer en todas las páginas
   ============================================ */

// Detecta si estamos dentro de /servicios/
const BASE = location.pathname.includes('/servicios/') ? '../' : '';

// ── Navbar HTML ──────────────────────────────
function buildNavbar(activePage = '') {
  const navHTML = `
    <nav id="navbar">
      <div class="nav-inner">
        <a class="nav-logo" href="${BASE}index.html">
          <img src="${BASE}assets/logo.png" alt="Mystic Sunlight" class="nav-logo-img" />
          Mystic Sunlight
        </a>

        <button class="nav-hamburger" id="hamburger" aria-label="Menú" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>

        <ul class="nav-links" id="nav-links">
          <li><a href="${BASE}index.html" ${activePage === 'inicio' ? 'class="active"' : ''}>Inicio</a></li>

          <li class="nav-dropdown" id="dropdown-servicios">
            <button class="nav-dropdown-btn ${activePage === 'servicios' ? 'active' : ''}" aria-expanded="false">
              Servicios <span class="arrow">▼</span>
            </button>
            <ul class="nav-dropdown-menu">
              <li><a href="${BASE}servicios/lecturas.html">🃏 Lecturas de Tarot</a></li>
              <li><a href="${BASE}servicios/rituales.html">🕯️ Rituales con Velas</a></li>
            </ul>
          </li>

          <li><a href="${BASE}tienda.html" ${activePage === 'tienda' ? 'class="active"' : ''}>Tienda</a></li>
          <li><a href="${BASE}sobre.html" ${activePage === 'sobre' ? 'class="active"' : ''}>Sobre mí</a></li>
        </ul>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', navHTML);
  initNavEvents();
}

// ── Footer HTML ──────────────────────────────
function buildFooter() {
  const footerHTML = `
    <footer id="footer">
      <div class="footer-inner">
        <img src="${BASE}assets/logo.png" alt="Mystic Sunlight" class="footer-logo-img" />
        <div class="footer-logo">Mystic Sunlight</div>
        <nav class="footer-links">
          <a href="${BASE}index.html">Inicio</a>
          <a href="${BASE}servicios/lecturas.html">Lecturas</a>
          <a href="${BASE}servicios/rituales.html">Rituales</a>
          <a href="${BASE}servicios/oraculos.html">Oráculos</a>
          <a href="${BASE}tienda.html">Tienda</a>
          <a href="${BASE}sobre.html">Sobre mí</a>
        </nav>
        <div class="footer-ig">
          <a href="https://instagram.com/mystic.sunlight" target="_blank" rel="noopener">
            ✦ @mystic.sunlight
          </a>
        </div>
        <p class="footer-copy">© 2026 Mystic Sunlight · Tarot & Esoterismo</p>
      </div>
    </footer>
  `;

  document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// ── Eventos de navegación ────────────────────
function initNavEvents() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  hamburger?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  const dropdown = document.getElementById('dropdown-servicios');
  const btn = dropdown?.querySelector('.nav-dropdown-btn');

  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', () => {
    dropdown?.classList.remove('open');
    btn?.setAttribute('aria-expanded', 'false');
  });
  dropdown?.addEventListener('click', (e) => e.stopPropagation());
}

// ── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page || '';
  buildNavbar(page);
  buildFooter();
});
