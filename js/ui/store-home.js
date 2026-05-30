// ============================================================
// UI: HOME DA LOJA
// Preenche categorias, produtos em destaque, ofertas e countdown.
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  await ShopData.ready();

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
  // Ofertas — produtos com promoções ativas.
  // Carrega promoções do banco de dados e renderiza produtos com desconto.
  // ---------------------------------------------------------
  if (offers) {
    offers.innerHTML = '';
    const promotions = ShopData.promotions().filter(p => p.active && new Date(p.endDate) > new Date());
    const products = ShopData.products();
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    promotions.slice(0, 4).forEach(promo => {
      const product = productMap[promo.productId];
      if (!product) return;

      const discountedProduct = {
        ...product,
        originalPrice: product.price,
        price: Math.round(product.price * (1 - promo.discountPercentage / 100) * 100) / 100,
        badge: `${promo.discountPercentage}% OFF`,
      };

      offers.appendChild(ShopNow.productCard(discountedProduct));
    });
  }

  const hEl = document.querySelector('[data-countdown-h]');
  const mEl = document.querySelector('[data-countdown-m]');
  const sEl = document.querySelector('[data-countdown-s]');
  if (!hEl || !mEl || !sEl) return;

  function tick() {
    const promotions = ShopData.promotions().filter(p => p.active);
    if (promotions.length === 0) {
      hEl.firstChild.textContent = '00';
      mEl.firstChild.textContent = '00';
      sEl.firstChild.textContent = '00';
      return;
    }

    const nextExpiry = promotions
      .map(p => new Date(p.endDate))
      .reduce((earliest, current) => (current < earliest ? current : earliest));

    const now = new Date();
    let diff = Math.max(0, Math.floor((nextExpiry - now) / 1000));
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
