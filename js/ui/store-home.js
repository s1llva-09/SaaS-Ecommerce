// ============================================================
// UI: HOME DA LOJA
// Preenche categorias, produtos em destaque, ofertas e countdown.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const categories = document.querySelector('[data-categories]');
  const featured = document.querySelector('[data-featured-products]');
  const offers = document.querySelector('[data-offer-products]');

  if (categories) {
    categories.innerHTML = ShopData.categories().map(category => `
      <a class="category-card card" href="pages/products.html?category=${encodeURIComponent(category.name)}">
        <span class="category-card__icon">${category.icon}</span>
        <strong>${category.name}</strong>
      </a>
    `).join('');
  }

  if (featured) {
    featured.innerHTML = ShopData.products()
      .filter(product => product.stock > 0)
      .slice(0, 8)
      .map(product => ShopNow.productCard(product))
      .join('');
  }

  if (offers) {
    offers.innerHTML = ShopData.products()
      .filter(product => product.originalPrice)
      .slice(0, 4)
      .map(product => ShopNow.productCard(product))
      .join('');
  }

  const hEl = document.querySelector('[data-countdown-h]');
  const mEl = document.querySelector('[data-countdown-m]');
  const sEl = document.querySelector('[data-countdown-s]');
  if (!hEl || !mEl || !sEl) return;

  function tick() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    let diff = Math.max(0, Math.floor((midnight - now) / 1000));
    const h = Math.floor(diff / 3600);
    diff -= h * 3600;
    const m = Math.floor(diff / 60);
    const s = diff - m * 60;
    hEl.firstChild.textContent = String(h).padStart(2, '0');
    mEl.firstChild.textContent = String(m).padStart(2, '0');
    sEl.firstChild.textContent = String(s).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
});
