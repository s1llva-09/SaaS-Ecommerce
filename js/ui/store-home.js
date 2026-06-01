// ============================================================
// UI: HOME - Renderiza categorias, produtos em destaque e ofertas
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Countdown roda imediatamente — só precisa de Date math, sem banco
  startCountdown();

  renderLoadingSkeletons();
  ShopData.ready().then(() => {
    renderCategories();
    renderFeaturedProducts();
    renderOfferProducts();
  });

  function renderLoadingSkeletons() {
    const categoriesGrid = document.querySelector('[data-categories]');
    const featuredGrid = document.querySelector('[data-featured-products]');
    const offerGrid = document.querySelector('[data-offer-products]');

    if (categoriesGrid) {
      categoriesGrid.innerHTML = '';
      for (let i = 0; i < 4; i += 1) {
        const placeholder = document.createElement('div');
        placeholder.className = 'category-card card skeleton';
        placeholder.style.minHeight = '120px';
        categoriesGrid.appendChild(placeholder);
      }
    }

    if (featuredGrid) {
      featuredGrid.innerHTML = '';
      for (let i = 0; i < 4; i += 1) {
        const placeholder = document.createElement('div');
        placeholder.className = 'product-card card skeleton';
        placeholder.style.minHeight = '260px';
        featuredGrid.appendChild(placeholder);
      }
    }

    if (offerGrid) {
      offerGrid.innerHTML = '';
      for (let i = 0; i < 4; i += 1) {
        const placeholder = document.createElement('div');
        placeholder.className = 'product-card card skeleton';
        placeholder.style.minHeight = '260px';
        offerGrid.appendChild(placeholder);
      }
    }
  }

  function renderProductCard(product) {
    return ShopNow.productCard(product);
  }

  function renderCategories() {
    const categoriesGrid = document.querySelector('[data-categories]');
    if (!categoriesGrid) return;

    const categories = ShopData.categories();
    if (categories.length === 0) {
      categoriesGrid.innerHTML = '<p class="grid-empty-state">Nenhuma categoria cadastrada.</p>';
      return;
    }

    categoriesGrid.innerHTML = '';
    categories.forEach(category => {
      const link = document.createElement('a');
      link.href = `pages/products.html?category=${encodeURIComponent(category.name)}`;
      link.className = 'category-card card';

      const icon = document.createElement('span');
      icon.className = 'category-card__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = category.icon || '•';
      link.appendChild(icon);

      const text = document.createElement('span');
      const title = document.createElement('strong');
      title.textContent = category.name;
      const count = document.createElement('small');
      count.textContent = `${category.count || 0} produtos`;
      text.appendChild(title);
      text.appendChild(count);
      link.appendChild(text);

      categoriesGrid.appendChild(link);
    });
  }

  function renderFeaturedProducts() {
    const grid = document.querySelector('[data-featured-products]');
    if (!grid) return;

    const products = ShopData.products().slice(0, 8);
    if (products.length === 0) {
      grid.innerHTML = '<p class="grid-empty-state">Nenhum produto cadastrado.</p>';
      return;
    }

    grid.innerHTML = '';
    products.forEach(product => {
      grid.appendChild(renderProductCard(product));
    });
  }

  function getActivePromos() {
    const now = new Date();
    return ShopData.promotions().filter(p =>
      p.active && p.endDate && new Date(p.endDate) > now
    );
  }

  function renderOfferProducts() {
    const section = document.querySelector('.offers-section');
    const grid = document.querySelector('[data-offer-products]');
    if (!grid) return;

    const activePromos = getActivePromos();

    if (activePromos.length === 0) {
      if (section) section.style.display = 'none';
      return;
    }

    const allProducts = ShopData.products();
    const offerProducts = activePromos
      .map(promo => {
        const product = allProducts.find(p => p.id === promo.productId);
        if (!product) return null;
        const discounted = Math.round(product.price * (1 - promo.discountPercentage / 100) * 100) / 100;
        return { ...product, originalPrice: product.price, price: discounted };
      })
      .filter(Boolean)
      .slice(0, 8);

    if (offerProducts.length === 0) {
      if (section) section.style.display = 'none';
      return;
    }

    if (section) section.style.display = '';
    grid.innerHTML = '';
    offerProducts.forEach(product => {
      grid.appendChild(renderProductCard(product));
    });
  }

  function startCountdown() {
    const countdownH = document.querySelector('[data-countdown-h]');
    const countdownM = document.querySelector('[data-countdown-m]');
    const countdownS = document.querySelector('[data-countdown-s]');
    const subtitle = document.querySelector('.offers-heading .text-muted');

    if (!countdownH || !countdownM || !countdownS) return;

    const activePromos = getActivePromos();
    if (activePromos.length === 0) return;

    const target = activePromos.reduce((earliest, p) => {
      const d = new Date(p.endDate);
      return d < earliest ? d : earliest;
    }, new Date(activePromos[0].endDate));

    if (subtitle) {
      subtitle.textContent = `Só até ${target.toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      })}`;
    }

    let timer;

    const countdownEl = countdownH.closest('.countdown');

    function updateCountdown() {
      const diff = target - new Date();

      if (diff <= 0) {
        countdownH.innerHTML = '00<small>h</small>';
        countdownM.innerHTML = '00<small>m</small>';
        countdownS.innerHTML = '00<small>s</small>';
        clearInterval(timer);
        renderOfferProducts();
        return;
      }

      const hours   = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      countdownH.innerHTML = `${String(hours).padStart(2, '0')}<small>h</small>`;
      countdownM.innerHTML = `${String(minutes).padStart(2, '0')}<small>m</small>`;
      countdownS.innerHTML = `${String(seconds).padStart(2, '0')}<small>s</small>`;

      if (countdownEl) countdownEl.classList.add('is-visible');
    }

    updateCountdown();
    timer = setInterval(updateCountdown, 1000);
  }
});
