// ============================================================
// UI: PRODUTOS
// Controla filtros, busca, ordenacao e modo de visualizacao.
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
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

  if (!grid || !category) return;

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

  renderLoadingSkeletons();
  await ShopData.ready();
  renderCategoryFilter();
  render();

  function renderCategoryFilter() {
    if (!categoryList) return;
    categoryList.innerHTML = '';

    const allBtn = createCategoryButton({
      name: 'Todas',
      count: ShopData.products().length,
      active: !category.value,
      value: '',
    });
    categoryList.appendChild(allBtn);

    ShopData.categories().forEach(item => {
      categoryList.appendChild(createCategoryButton({
        name: item.name,
        icon: item.icon,
        count: item.count,
        active: category.value === item.name,
        value: item.name,
      }));
    });
  }

  function createCategoryButton(item) {
    const btn = document.createElement('button');
    btn.className = 'category-filter__item' + (item.active ? ' is-active' : '');
    btn.type = 'button';
    btn.dataset.category = item.value;

    const label = document.createElement('span');
    label.textContent = item.icon ? `${item.icon} ${item.name}` : item.name;
    btn.appendChild(label);

    const number = document.createElement('strong');
    number.textContent = ShopNow.int(item.count || 0);
    btn.appendChild(number);

    return btn;
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

    if (titleEl) {
      if (category.value) {
        titleEl.textContent = category.value;
      } else if (searchQuery) {
        titleEl.textContent = `Resultados para "${searchQuery}"`;
      } else {
        titleEl.textContent = 'Todos os produtos';
      }
    }

    if (breadcrumb) {
      if (category.value) {
        breadcrumb.textContent = category.value;
      } else if (searchQuery) {
        breadcrumb.textContent = `"${searchQuery}"`;
      } else {
        breadcrumb.textContent = 'Produtos';
      }
    }

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

    products.forEach(product => {
      grid.appendChild(viewMode === 'list' ? productListItem(product) : ShopNow.productCard(product));
    });
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
      const badge = document.createElement('span');
      badge.className = 'badge badge-list-discount';
      badge.textContent = `-${discount}%`;
      imgLink.appendChild(badge);
    }
    if (product.stock === 0) {
      const badge = document.createElement('span');
      badge.className = 'badge badge-list-no-stock';
      badge.textContent = 'Sem estoque';
      imgLink.appendChild(badge);
    }
    article.appendChild(imgLink);

    const body = document.createElement('div');
    body.className = 'product-list-item__body';

    const cat = document.createElement('div');
    cat.className = 'product-card__category';
    cat.textContent = product.category;
    body.appendChild(cat);

    const nameLink = document.createElement('a');
    nameLink.href = ShopNow.productUrl(product.id);
    const name = document.createElement('h3');
    name.className = 'product-card__name';
    name.textContent = product.name;
    nameLink.appendChild(name);
    body.appendChild(nameLink);

    const rating = document.createElement('p');
    rating.className = 'product-card__rating';
    rating.innerHTML = ShopNow.stars(product.rating);
    const reviews = document.createElement('em');
    reviews.textContent = ` (${ShopNow.int(product.reviews)})`;
    rating.appendChild(reviews);
    body.appendChild(rating);

    const desc = document.createElement('p');
    desc.className = 'product-list-item__desc';
    desc.textContent = product.description || '';
    body.appendChild(desc);
    article.appendChild(body);

    const footer = document.createElement('div');
    footer.className = 'product-list-item__footer';

    if (product.originalPrice) {
      const oldPrice = document.createElement('div');
      oldPrice.className = 'product-card__old-price';
      oldPrice.textContent = ShopNow.money(product.originalPrice);
      footer.appendChild(oldPrice);
    }

    const currentPrice = document.createElement('div');
    currentPrice.className = 'product-card__price';
    currentPrice.textContent = ShopNow.money(product.price);
    footer.appendChild(currentPrice);

    if (product.stock > 0) {
      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-primary product-card__add';
      addBtn.dataset.addCart = product.id;
      addBtn.type = 'button';
      addBtn.textContent = '+ Carrinho';
      footer.appendChild(addBtn);
    } else {
      const badge = document.createElement('span');
      badge.className = 'badge badge-red';
      badge.textContent = 'Sem estoque';
      footer.appendChild(badge);
    }

    article.appendChild(footer);
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
    if (titleEl) titleEl.textContent = selected || 'Todos os produtos';
    if (breadcrumb) breadcrumb.textContent = selected || 'Produtos';
    render();
  });

  function renderLoadingSkeletons() {
    if (titleEl) {
      titleEl.textContent = 'Carregando...';
    }
    if (breadcrumb) {
      breadcrumb.textContent = 'Carregando';
    }
    if (count) {
      count.textContent = 'Carregando produtos...';
    }
    if (categoryList) {
      categoryList.innerHTML = '';
      for (let i = 0; i < 5; i += 1) {
        const button = document.createElement('span');
        button.className = 'category-filter__item skeleton';
        button.style.minWidth = '90px';
        button.style.height = '38px';
        categoryList.appendChild(button);
      }
    }
    grid.innerHTML = '';
    for (let i = 0; i < 8; i += 1) {
      const card = document.createElement('div');
      card.className = 'product-card skeleton';
      card.style.minHeight = '320px';
      grid.appendChild(card);
    }
  }

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
      viewButtons.forEach(button => button.classList.toggle('is-active', button.dataset.view === viewMode));
      render();
    });
  });

  [price, inStock].forEach(control => {
    if (!control) return;
    control.addEventListener('input', render);
    control.addEventListener('change', render);
  });
});
