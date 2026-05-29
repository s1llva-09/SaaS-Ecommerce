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
    categoryList.innerHTML = '';

    // Botão "Todas"
    const allBtn = document.createElement('button');
    allBtn.className = 'category-filter__item' + (!category.value ? ' is-active' : '');
    allBtn.type = 'button';
    allBtn.dataset.category = '';

    const allIconSpan = document.createElement('span');
    allIconSpan.textContent = '🏷️ Todas';
    allBtn.appendChild(allIconSpan);

    const allCountStrong = document.createElement('strong');
    allCountStrong.textContent = ShopNow.int(ShopData.products().length);
    allBtn.appendChild(allCountStrong);

    categoryList.appendChild(allBtn);

    // Botões por categoria
    ShopData.categories().forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'category-filter__item' + (category.value === item.name ? ' is-active' : '');
      btn.type = 'button';
      btn.dataset.category = item.name;

      const iconSpan = document.createElement('span');
      iconSpan.textContent = `${item.icon} ${item.name}`;
      btn.appendChild(iconSpan);

      const countStrong = document.createElement('strong');
      countStrong.textContent = ShopNow.int(item.count);
      btn.appendChild(countStrong);

      categoryList.appendChild(btn);
    });
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

    grid.innerHTML = '';

    if (!products.length) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'card grid-empty-state';
      emptyDiv.textContent = 'Nenhum produto encontrado para esse filtro.';
      grid.appendChild(emptyDiv);
      return;
    }

    // ---------------------------------------------------------
    // Renderiza os cards conforme o modo de visualização:
    //   'list' → productListItem() — layout horizontal com descrição
    //   'grid' → ShopNow.productCard() — card compacto com imagem
    // Ambas retornam elementos DOM (não strings), logo appendChild.
    // ---------------------------------------------------------
    if (viewMode === 'list') {
      products.forEach(p => {
        grid.appendChild(productListItem(p));
      });
    } else {
      products.forEach(p => {
        grid.appendChild(ShopNow.productCard(p));
      });
    }
  }

function productListItem(product) {
  const discount = ShopNow.discount(product);

  const article = document.createElement('article');
  article.className = 'product-list-item card';

  const imgLink = document.createElement('a');
  imgLink.className = 'product-list-item__image';
  imgLink.href = ShopNow.productUrl(product.id);

  const img = document.createElement('img');
  img.src = product.image;
  img.alt = product.name;
  img.loading = 'lazy';
  imgLink.appendChild(img);

  if (discount) {
    const b = document.createElement('span');
    b.className = 'badge badge-list-discount';
    b.textContent = `-${discount}%`;
    imgLink.appendChild(b);
  }
  if (product.stock === 0) {
    const b = document.createElement('span');
    b.className = 'badge badge-list-no-stock';
    b.textContent = 'Sem estoque';
    imgLink.appendChild(b);
  }
  article.appendChild(imgLink);

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'product-list-item__body';

  const catDiv = document.createElement('div');
  catDiv.className = 'product-card__category';
  catDiv.textContent = product.category;
  bodyDiv.appendChild(catDiv);

  const nameLink = document.createElement('a');
  nameLink.href = ShopNow.productUrl(product.id);
  const nameH3 = document.createElement('h3');
  nameH3.className = 'product-card__name';
  nameH3.textContent = product.name;
  nameLink.appendChild(nameH3);
  bodyDiv.appendChild(nameLink);

  const ratingP = document.createElement('p');
  ratingP.className = 'product-card__rating';
  ratingP.innerHTML = ShopNow.stars(product.rating);
  const em = document.createElement('em');
  em.textContent = ` (${ShopNow.int(product.reviews)})`;
  ratingP.appendChild(em);
  bodyDiv.appendChild(ratingP);

  const descP = document.createElement('p');
  descP.className = 'product-list-item__desc';
  descP.textContent = product.description || '';
  bodyDiv.appendChild(descP);

  article.appendChild(bodyDiv);

  const footerDiv = document.createElement('div');
  footerDiv.className = 'product-list-item__footer';

  if (product.originalPrice) {
    const oldPrice = document.createElement('div');
    oldPrice.className = 'product-card__old-price';
    oldPrice.textContent = ShopNow.money(product.originalPrice);
    footerDiv.appendChild(oldPrice);
  }

  const priceDiv = document.createElement('div');
  priceDiv.className = 'product-card__price';
  priceDiv.textContent = ShopNow.money(product.price);
  footerDiv.appendChild(priceDiv);

  if (product.stock > 0) {
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary product-card__add';
    addBtn.dataset.addCart = product.id;
    addBtn.type = 'button';
    addBtn.textContent = '+ Carrinho';
    footerDiv.appendChild(addBtn);
  } else {
    const badge = document.createElement('span');
    badge.className = 'badge badge-red';
    badge.textContent = 'Sem estoque';
    footerDiv.appendChild(badge);
  }

  article.appendChild(footerDiv);
  return article;
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
