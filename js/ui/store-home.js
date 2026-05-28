// ============================================================
// UI: HOME DA LOJA
// Preenche categorias, produtos em destaque, ofertas e countdown.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const categories = document.querySelector('[data-categories]');
  const featured = document.querySelector('[data-featured-products]');
  const offers = document.querySelector('[data-offer-products]');

  // ---------------------------------------------------------
  // Categorias — gera um link por categoria.
  // Usa createElement + textContent para evitar XSS:
  // category.name e category.icon vêm do catálogo interno,
  // mas em produção podem ser editados pelo admin — tratar como dado.
  // href usa encodeURIComponent para escapar caracteres especiais na URL.
  // ---------------------------------------------------------
  if (categories) {
    categories.innerHTML = '';
    ShopData.categories().forEach(category => {
      const a = document.createElement('a');
      a.className = 'category-card card';
      a.href = `pages/products.html?category=${encodeURIComponent(category.name)}`;

      const iconSpan = document.createElement('span');
      iconSpan.className = 'category-card__icon';
      iconSpan.textContent = category.icon;
      a.appendChild(iconSpan);

      const nameStrong = document.createElement('strong');
      nameStrong.textContent = category.name;
      a.appendChild(nameStrong);

      categories.appendChild(a);
    });
  }

  // ---------------------------------------------------------
  // Produtos em destaque — até 8 produtos com estoque.
  // ShopNow.productCard() retorna um elemento DOM (não string),
  // por isso usamos appendChild em vez de insertAdjacentHTML.
  // ---------------------------------------------------------
  if (featured) {
    featured.innerHTML = '';
    ShopData.products()
      .filter(product => product.stock > 0)
      .slice(0, 8)
      .forEach(product => {
        featured.appendChild(ShopNow.productCard(product));
      });
  }

  // ---------------------------------------------------------
  // Ofertas — até 4 produtos com preço original cadastrado
  // (produto.originalPrice indica que tem desconto aplicado).
  // ---------------------------------------------------------
  if (offers) {
    offers.innerHTML = '';
    ShopData.products()
      .filter(product => product.originalPrice)
      .slice(0, 4)
      .forEach(product => {
        offers.appendChild(ShopNow.productCard(product));
      });
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
