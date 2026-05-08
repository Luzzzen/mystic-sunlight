/* ============================================
   MYSTIC SUNLIGHT — nav.js
   Inyecta navbar y footer en todas las páginas
   ============================================ */

const WHATSAPP_NUMBER = '549XXXXXXXXXX'; // ← reemplazar con el número de Male

// ── Navbar HTML ──────────────────────────────
function buildNavbar(activePage = '') {
  const pages = {
    inicio:    'index.html',
    tienda:    'tienda.html',
    sobre:     'sobre.html',
    contacto:  'contacto.html',
  };

  const navHTML = `
    <nav id="navbar">
      <div class="nav-inner">
        <a class="nav-logo" href="index.html">
          <span class="sun-icon">☀</span>
          Mystic Sunlight
        </a>

        <button class="nav-hamburger" id="hamburger" aria-label="Menú">
          <span></span><span></span><span></span>
        </button>

        <ul class="nav-links" id="nav-links">
          <li><a href="index.html" ${activePage === 'inicio' ? 'class="active"' : ''}>Inicio</a></li>

          <li class="nav-dropdown" id="dropdown-servicios">
            <button class="nav-dropdown-btn">
              Servicios <span class="arrow">▼</span>
            </button>
            <ul class="nav-dropdown-menu">
              <li><a href="servicios/lecturas.html">🃏 Lecturas de Tarot</a></li>
              <li><a href="servicios/oraculos.html">🔮 Oráculos</a></li>
              <li><a href="servicios/pendulo.html">🌙 Péndulo</a></li>
            </ul>
          </li>

          <li><a href="tienda.html" ${activePage === 'tienda' ? 'class="active"' : ''}>Tienda</a></li>
          <li><a href="sobre.html" ${activePage === 'sobre' ? 'class="active"' : ''}>Sobre mí</a></li>
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
        <div class="footer-sun">☀</div>
        <div class="footer-logo">Mystic Sunlight</div>
        <nav class="footer-links">
          <a href="index.html">Inicio</a>
          <a href="servicios/lecturas.html">Lecturas</a>
          <a href="servicios/oraculos.html">Oráculos</a>
          <a href="servicios/pendulo.html">Péndulo</a>
          <a href="tienda.html">Tienda</a>
          <a href="sobre.html">Sobre mí</a>
        </nav>
        <div class="footer-ig">
          <a href="https://instagram.com/mystic.sunlight" target="_blank" rel="noopener">
            ✦ @mystic.sunlight
          </a>
        </div>
        <p class="footer-copy">© 2025 Mystic Sunlight · Tarot & Esoterismo</p>
      </div>
    </footer>
  `;

  document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// ── Eventos de navegación ────────────────────
function initNavEvents() {
  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  hamburger?.addEventListener('click', () => navLinks.classList.toggle('open'));

  // Dropdown Servicios
  const dropdown = document.getElementById('dropdown-servicios');
  const btn = dropdown?.querySelector('.nav-dropdown-btn');

  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  // Cerrar dropdown al clickear afuera
  document.addEventListener('click', () => {
    dropdown?.classList.remove('open');
  });

  // Evitar que el click dentro del dropdown lo cierre
  dropdown?.addEventListener('click', (e) => e.stopPropagation());
}

// ── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page || '';
  buildNavbar(page);
  buildFooter();
});
