// ============================================================
// UI: PRODUTO
// Monta o detalhe a partir do id da URL.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const mount = document.querySelector('[data-product-detail]');
  if (!mount) return;

  const productId = new URLSearchParams(window.location.search).get('id') || '1';
  const product = ShopData.products().find(item => item.id === productId);

  if (!product) {
    mount.innerHTML = '';
    const notFound = document.createElement('div');
    notFound.className = 'card';
    notFound.style.padding = '32px';
    notFound.textContent = 'Produto nao encontrado.';
    mount.appendChild(notFound);
    return;
  }

  document.title = `${product.name} - ShopNow`;

  // Monta a página: galeria à esquerda, buybox com detalhes à direita.
  mount.innerHTML = '';

  // Galeria
  const gallery = document.createElement('div');
  gallery.className = 'product-gallery card';
  const img = document.createElement('img');
  img.src = product.image;
  img.alt = product.name;
  gallery.appendChild(img);
  mount.appendChild(gallery);

  // Buybox
  // Buybox — informações, preço, variações e ações de compra.
  const aside = document.createElement('aside');
  aside.className = 'product-buybox card';

  // Badge categoria
  const categoryBadge = document.createElement('span');
  categoryBadge.className = 'badge badge-indigo';
  categoryBadge.textContent = product.category;
  aside.appendChild(categoryBadge);

  // Nome
  const h1 = document.createElement('h1');
  h1.textContent = product.name;
  aside.appendChild(h1);

  // Descrição
  const descP = document.createElement('p');
  descP.className = 'text-muted';
  descP.textContent = product.description;
  aside.appendChild(descP);

  // Preço
  const priceDiv = document.createElement('div');
  priceDiv.className = 'price-xl';
  priceDiv.textContent = ShopNow.money(product.price);
  aside.appendChild(priceDiv);

  // Preço original e desconto
  if (product.originalPrice) {
    const origP = document.createElement('p');
    origP.className = 'text-muted';
    origP.textContent = `De ${ShopNow.money(product.originalPrice)} por ${ShopNow.discount(product)}% OFF`;
    aside.appendChild(origP);
  }

  // SKU
  const skuP = document.createElement('p');
  const skuStrong = document.createElement('strong');
  skuStrong.textContent = 'SKU:';
  skuP.appendChild(skuStrong);
  skuP.appendChild(document.createTextNode(` ${product.sku}`));
  aside.appendChild(skuP);

  // Estoque
  const stockP = document.createElement('p');
  const stockStrong = document.createElement('strong');
  stockStrong.textContent = 'Estoque:';
  stockP.appendChild(stockStrong);
  stockP.appendChild(document.createTextNode(` ${product.stock} unidades`));
  aside.appendChild(stockP);

  // Variações opcionais — só renderiza se o produto tiver cores/tamanhos cadastrados.
  // Variações de cor
  if (product.colors) {
    const colorsH3 = document.createElement('h3');
    colorsH3.textContent = 'Cores';
    aside.appendChild(colorsH3);
    const colorsRow = document.createElement('div');
    colorsRow.className = 'variant-row';
    product.colors.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'variant-pill';
      btn.textContent = color;
      colorsRow.appendChild(btn);
    });
    aside.appendChild(colorsRow);
  }

  // Variações de tamanho
  if (product.sizes) {
    const sizesH3 = document.createElement('h3');
    sizesH3.textContent = 'Tamanhos';
    aside.appendChild(sizesH3);
    const sizesRow = document.createElement('div');
    sizesRow.className = 'variant-row';
    product.sizes.forEach(size => {
      const btn = document.createElement('button');
      btn.className = 'variant-pill';
      btn.textContent = size;
      sizesRow.appendChild(btn);
    });
    aside.appendChild(sizesRow);
  }

  // Botão adicionar ao carrinho
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-primary';
  addBtn.dataset.addCart = product.id;
  addBtn.style.width = '100%';
  addBtn.style.marginTop = '14px';
  addBtn.textContent = 'Adicionar ao carrinho';
  aside.appendChild(addBtn);

  // Botão comprar agora
  const buyBtn = document.createElement('button');
  buyBtn.className = 'btn btn-ghost';
  buyBtn.dataset.buyNow = product.id;
  buyBtn.style.width = '100%';
  buyBtn.style.marginTop = '10px';
  buyBtn.textContent = 'Comprar agora';
  aside.appendChild(buyBtn);

  mount.appendChild(aside);
});
