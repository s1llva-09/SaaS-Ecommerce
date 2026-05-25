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
    mount.innerHTML = '<div class="card" style="padding:32px">Produto nao encontrado.</div>';
    return;
  }

  document.title = `${product.name} - ShopNow`;
  mount.innerHTML = `
    <div class="product-gallery card">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <aside class="product-buybox card">
      <span class="badge badge-indigo">${product.category}</span>
      <h1>${product.name}</h1>
      <p class="text-muted">${product.description}</p>
      <div class="price-xl">${ShopNow.money(product.price)}</div>
      ${product.originalPrice ? `<p class="text-muted">De ${ShopNow.money(product.originalPrice)} por ${ShopNow.discount(product)}% OFF</p>` : ''}
      <p><strong>SKU:</strong> ${product.sku}</p>
      <p><strong>Estoque:</strong> ${product.stock} unidades</p>
      ${product.colors ? `<h3>Cores</h3><div class="variant-row">${product.colors.map(color => `<button class="variant-pill">${color}</button>`).join('')}</div>` : ''}
      ${product.sizes ? `<h3>Tamanhos</h3><div class="variant-row">${product.sizes.map(size => `<button class="variant-pill">${size}</button>`).join('')}</div>` : ''}
      <button class="btn btn-primary" data-add-cart="${product.id}" style="width:100%;margin-top:14px">Adicionar ao carrinho</button>
      <button class="btn btn-ghost" data-buy-now="${product.id}" style="width:100%;margin-top:10px">Comprar agora</button>
    </aside>
  `;
});
