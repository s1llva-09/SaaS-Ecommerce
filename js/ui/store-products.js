// ============================================================
// UI: PRODUTOS
// Controla filtros, busca, ordenacao e modo de visualizacao.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('[data-products-grid]');
  const count = document.querySelector('[data-products-count]');
  const titleEl = document.querySelector('[data-products-title]');
  const breadcrumb = document.querySelector('[data-breadcrumb-current]');
  const category = document.querySelector('[data-filter-category]');
  const categoryList = document.querySelector('[data-category-list]');
  const price = document.querySelector('[data-filter-price]');
  const priceMax = document.querySelector('[data-price-max]');
  const ratingButtons = document.querySelectorAll('[data-filter-rating]');
  const inStock = document.querySelector('[data-filter-stock]');
  const sortSelect = document.querySelector('[data-products-sort]');
  const viewButtons = document.querySelectorAll('[data-view]');

  if (!grid) return;

  let minRating = 0;
  let searchQuery = '';
  let viewMode = 'grid';

  const params = new URLSearchParams(window.location.search);
  category.value = params.get('category') || '';
  searchQuery = params.get('search') || '';

  if (category.value && titleEl) {
    titleEl.textContent = category.value;
    if (breadcrumb) breadcrumb.textContent = category.value;
  }

  if (searchQuery && titleEl) {
    titleEl.textContent = `Resultados para "${searchQuery}"`;
    if (breadcrumb) breadcrumb.textContent = `"${searchQuery}"`;
  }

  if (categoryList) {
    const allBtn = `<button class="category-filter__item ${!category.value ? 'is-active' : ''}" type="button" data-category="">
      <span>🏷️ Todas</span><strong>${ShopNow.int(ShopData.products().length)}</strong>
    </button>`;
    categoryList.innerHTML = allBtn + ShopData.categories().map(item => `
      <button class="category-filter__item ${category.value === item.name ? 'is-active' : ''}" type="button" data-category="${item.name}">
        <span>${item.icon} ${item.name}</span>
        <strong>${ShopNow.int(item.count)}</strong>
      </button>
    `).join('');
  }

  function sortProducts(products) {
    const val = sortSelect?.value || 'relevance';
    const sorted = [...products];
    if (val === 'price-asc') return sorted.sort((a, b) => a.price - b.price);
    if (val === 'price-desc') return sorted.sort((a, b) => b.price - a.price);
    if (val === 'rating') return sorted.sort((a, b) => b.rating - a.rating);
    if (val === 'name') return sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }

  function render() {
    let products = [...ShopData.products()];

    if (category.value) products = products.filter(p => p.category === category.value);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    if (price) products = products.filter(p => p.price <= Number(price.value));
    if (minRating > 0) products = products.filter(p => p.rating >= minRating);
    if (inStock?.checked) products = products.filter(p => p.stock > 0);

    products = sortProducts(products);

    if (count) {
      count.textContent = `${products.length} produto${products.length === 1 ? '' : 's'} encontrado${products.length === 1 ? '' : 's'}`;
    }
    if (priceMax) priceMax.textContent = ShopNow.money(Number(price.value));

    grid.className = viewMode === 'list' ? 'product-list' : 'product-grid';

    if (!products.length) {
      grid.innerHTML = '<div class="card" style="padding:32px;text-align:center;grid-column:1/-1">Nenhum produto encontrado para esse filtro.</div>';
      return;
    }

    grid.innerHTML = viewMode === 'list'
      ? products.map(p => productListItem(p)).join('')
      : products.map(p => ShopNow.productCard(p)).join('');
  }

  function productListItem(product) {
    const discount = ShopNow.discount(product);
    return `
      <article class="product-list-item card">
        <a class="product-list-item__image" href="${ShopNow.productUrl(product.id)}">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${discount ? `<span class="badge badge-red" style="position:absolute;top:8px;left:8px;background:#ff5a00;color:#fff">-${discount}%</span>` : ''}
          ${product.stock === 0 ? '<span class="badge" style="position:absolute;top:8px;right:8px;background:#334155;color:#fff">Sem estoque</span>' : ''}
        </a>
        <div class="product-list-item__body">
          <div class="product-card__category">${product.category}</div>
          <a href="${ShopNow.productUrl(product.id)}"><h3 class="product-card__name">${product.name}</h3></a>
          <p class="product-card__rating">${ShopNow.stars(product.rating)} <em>(${ShopNow.int(product.reviews)})</em></p>
          <p class="product-list-item__desc">${product.description || ''}</p>
        </div>
        <div class="product-list-item__footer">
          ${product.originalPrice ? `<div class="product-card__old-price">${ShopNow.money(product.originalPrice)}</div>` : ''}
          <div class="product-card__price">${ShopNow.money(product.price)}</div>
          ${product.stock > 0
            ? `<button class="btn btn-primary product-card__add" data-add-cart="${product.id}" type="button">+ Carrinho</button>`
            : '<span class="badge badge-red">Sem estoque</span>'}
        </div>
      </article>`;
  }

  categoryList?.addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    const selected = button.dataset.category;
    category.value = selected;
    categoryList.querySelectorAll('[data-category]').forEach(item => {
      item.classList.toggle('is-active', item.dataset.category === category.value);
    });
    if (titleEl) titleEl.textContent = selected || 'Todos os Produtos';
    if (breadcrumb) breadcrumb.textContent = selected || 'Produtos';
    render();
  });

  ratingButtons.forEach(button => {
    button.addEventListener('click', () => {
      minRating = Number(button.dataset.filterRating);
      ratingButtons.forEach(item => item.classList.remove('is-active'));
      button.classList.add('is-active');
      render();
    });
  });

  sortSelect?.addEventListener('change', render);

  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      viewMode = btn.dataset.view;
      viewButtons.forEach(b => b.classList.toggle('is-active', b.dataset.view === viewMode));
      render();
    });
  });

  [price, inStock].forEach(control => {
    if (!control) return;
    control.addEventListener('input', render);
    control.addEventListener('change', render);
  });

  render();
});
