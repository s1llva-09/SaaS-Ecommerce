// ============================================================
// UI: PRODUTO
// Monta o detalhe a partir do id da URL.
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  const mount = document.querySelector('[data-product-detail]');
  if (!mount) return;

  renderProductSkeleton(mount);
  await ShopData.ready();

  const productId = new URLSearchParams(window.location.search).get('id') || '1';
  const product = ShopData.products().find(item => item.id === productId);

  if (!product) {
    mount.innerHTML = '';
    const notFound = document.createElement('div');
    notFound.className = 'card card-empty';
    notFound.textContent = 'Produto não encontrado.';
    mount.appendChild(notFound);
    return;
  }

  updateProductMeta(product);
  document.title = `${product.name} - ShopNow`;
  mount.innerHTML = '';

  const gallery = document.createElement('div');
  gallery.className = 'product-gallery card';
  const img = document.createElement('img');
  img.src = product.image;
  img.alt = product.name;
  gallery.appendChild(img);
  mount.appendChild(gallery);

  const aside = document.createElement('aside');
  aside.className = 'product-buybox card';

  const categoryBadge = document.createElement('span');
  categoryBadge.className = 'badge badge-indigo';
  categoryBadge.textContent = product.category;
  aside.appendChild(categoryBadge);

  const h1 = document.createElement('h1');
  h1.textContent = product.name;
  aside.appendChild(h1);

  const desc = document.createElement('p');
  desc.className = 'text-muted';
  desc.textContent = product.description;
  aside.appendChild(desc);

  const price = document.createElement('div');
  price.className = 'price-xl';
  price.textContent = ShopNow.money(product.price, true);
  aside.appendChild(price);

  if (product.originalPrice) {
    const original = document.createElement('p');
    original.className = 'text-muted';
    const savings = product.originalPrice - product.price;
    original.textContent = `De ${ShopNow.money(product.originalPrice, true)} — Economize ${ShopNow.money(savings, true)} (${ShopNow.discount(product)}% OFF)`;
    aside.appendChild(original);
  }

  const sku = document.createElement('p');
  const skuStrong = document.createElement('strong');
  skuStrong.textContent = 'SKU:';
  sku.appendChild(skuStrong);
  sku.appendChild(document.createTextNode(` ${product.sku || '-'}`));
  aside.appendChild(sku);

  const stock = document.createElement('p');
  const stockStrong = document.createElement('strong');
  stockStrong.textContent = 'Estoque:';
  stock.appendChild(stockStrong);
  stock.appendChild(document.createTextNode(` ${product.stock} unidades`));
  aside.appendChild(stock);

  if (product.colors?.length) {
    appendVariantGroup(aside, 'Cores', product.colors);
  }

  if (product.sizes?.length) {
    appendVariantGroup(aside, 'Tamanhos', product.sizes);
  }

  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-primary buybox-btn';
  addBtn.dataset.addCart = product.id;
  addBtn.textContent = 'Adicionar ao carrinho';
  aside.appendChild(addBtn);

  const buyBtn = document.createElement('button');
  buyBtn.className = 'btn btn-ghost buybox-btn-ghost';
  buyBtn.dataset.buyNow = product.id;
  buyBtn.textContent = 'Comprar agora';
  aside.appendChild(buyBtn);

  const variantHint = document.createElement('p');
  variantHint.className = 'variant-hint';
  variantHint.textContent = 'Selecione as opções acima para continuar';
  aside.appendChild(variantHint);

  const variantRows = aside.querySelectorAll('.variant-row');

  function checkVariants() {
    const allSelected = [...variantRows].every(row => row.querySelector('.is-selected'));
    addBtn.disabled = !allSelected;
    buyBtn.disabled = !allSelected;
    variantHint.style.display = allSelected ? 'none' : '';
  }

  variantRows.forEach(row => {
    const pills = row.querySelectorAll('.variant-pill');
    if (pills.length > 0 && !row.querySelector('.is-selected')) {
      pills[0].classList.add('is-selected');
    }

    row.addEventListener('click', event => {
      const pill = event.target.closest('.variant-pill');
      if (!pill) return;
      row.querySelectorAll('.variant-pill').forEach(button => button.classList.remove('is-selected'));
      pill.classList.add('is-selected');
      checkVariants();
    });
  });

  if (variantRows.length) {
    checkVariants();
  }

  if (product.stock === 0) {
    addBtn.disabled = true;
    buyBtn.disabled = true;
    addBtn.textContent = 'Produto esgotado';
    buyBtn.style.display = 'none';
    variantHint.style.display = 'none';
  }

  mount.appendChild(aside);
});

function appendVariantGroup(container, title, values) {
  const heading = document.createElement('h3');
  heading.textContent = title;
  container.appendChild(heading);

  const row = document.createElement('div');
  row.className = 'variant-row';
  values.forEach(value => {
    const button = document.createElement('button');
    button.className = 'variant-pill';
    button.type = 'button';
    button.textContent = value;
    row.appendChild(button);
  });
  container.appendChild(row);
}

function renderProductSkeleton(mount) {
  mount.innerHTML = `
    <div class="product-detail product-detail--loading">
      <div class="product-gallery card skeleton"></div>
      <aside class="product-buybox card">
        <span class="skeleton nav-skeleton" style="width: 120px; height: 24px;"></span>
        <div class="skeleton" style="width: 65%; height: 40px; margin: 18px 0; border-radius: 16px;"></div>
        <div class="skeleton" style="width: 100%; height: 20px; margin-bottom: 10px;"></div>
        <div class="skeleton" style="width: 100%; height: 20px; margin-bottom: 10px;"></div>
        <div class="skeleton" style="width: 48%; height: 60px; margin: 20px 0; border-radius: 16px;"></div>
        <div class="skeleton" style="width: 100%; height: 46px; margin-bottom: 12px; border-radius: 12px;"></div>
        <div class="skeleton" style="width: 100%; height: 46px; border-radius: 12px;"></div>
      </aside>
    </div>
  `;
}

function updateProductMeta(product) {
  const url = window.location.href;
  setMetaTag('description', 'name', product.description || `Confira ${product.name} na ShopNow.`);
  setMetaTag('og:title', 'property', `${product.name} | ShopNow`);
  setMetaTag('og:description', 'property', product.description || `Compre ${product.name} na ShopNow.`);
  setMetaTag('og:image', 'property', product.image || '');
  setMetaTag('og:url', 'property', url);
  setMetaTag('og:type', 'property', 'product');
  setMetaTag('twitter:card', 'name', 'summary_large_image');

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: [product.image],
    description: product.description || '',
    sku: product.sku || undefined,
    brand: {
      '@type': 'Brand',
      name: 'ShopNow',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'BRL',
      price: product.price.toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  let jsonLdScript = document.getElementById('product-jsonld');
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.id = 'product-jsonld';
    document.head.appendChild(jsonLdScript);
  }
  jsonLdScript.textContent = JSON.stringify(jsonLd, null, 2);
}

function setMetaTag(name, attr, content) {
  if (!content) return;
  let element = document.querySelector(`meta[${attr}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.content = content;
}
