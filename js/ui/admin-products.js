// ============================================================
// UI ADMIN: PRODUTOS
// Grade com badges/estoque/SKU e modal de novo produto.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('[data-admin-products]');
  const search = document.querySelector('[data-admin-product-search]');
  if (!grid) return;

  // ---------------------------------------------------------
  // Modal "Novo Produto" — estrutura estática injetada via innerHTML.
  // Não contém dados do usuário: todos os campos são inputs vazios.
  // O select de categorias é preenchido depois via createElement.
  // ---------------------------------------------------------
  const overlay = document.createElement('div');
  overlay.className = 'admin-modal-overlay is-hidden';
  overlay.innerHTML = `
    <div class="admin-modal">
      <div class="admin-modal__head">
        <span class="admin-modal__title">Novo Produto</span>
        <button class="admin-modal__close" data-modal-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="admin-modal__body">
        <div class="image-upload-area">
          <div class="image-upload-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <p>Clique para fazer upload de imagens</p>
          <small>PNG, JPG até 10MB cada</small>
        </div>
        <div>
          <label class="admin-field-label">Nome do produto *</label>
          <input class="admin-field" type="text" placeholder="Nome do produto">
        </div>
        <div>
          <label class="admin-field-label">Descrição</label>
          <textarea class="admin-textarea" placeholder="Descrição do produto"></textarea>
        </div>
        <div class="admin-form-grid-2">
          <div>
            <label class="admin-field-label">Categoria</label>
            <select class="admin-field" data-category-select></select>
          </div>
          <div>
            <label class="admin-field-label">SKU *</label>
            <input class="admin-field" type="text" placeholder="SKU-001">
          </div>
        </div>
        <div class="admin-form-grid-2">
          <div>
            <label class="admin-field-label">Preço de venda (R$) *</label>
            <input class="admin-field" type="number" min="0" step="0.01" placeholder="0,00">
          </div>
          <div>
            <label class="admin-field-label">Preço original (R$)</label>
            <input class="admin-field" type="number" min="0" step="0.01" placeholder="0,00">
          </div>
        </div>
        <div class="admin-form-grid-2">
          <div>
            <label class="admin-field-label">Estoque inicial *</label>
            <input class="admin-field" type="number" min="0" value="0">
          </div>
          <div>
            <label class="admin-field-label">Status</label>
            <select class="admin-field">
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>
        </div>
      </div>
      <div class="admin-modal__footer">
        <button class="btn-admin-cancel" data-modal-close>Cancelar</button>
        <button class="btn-admin-create" data-modal-submit>Criar produto</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Preenche o select de categorias via createElement (dados do sistema)
  const categorySelect = overlay.querySelector('[data-category-select]');
  ShopData.categories().forEach(c => {
    const option = document.createElement('option');
    option.textContent = c.name;
    categorySelect.appendChild(option);
  });

  overlay.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => overlay.classList.add('is-hidden'));
  });
  overlay.querySelector('[data-modal-submit]').addEventListener('click', () => {
    ShopNow.toast('Produto criado com sucesso!');
    overlay.classList.add('is-hidden');
  });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.add('is-hidden');
  });

  const newBtn = document.querySelector('[data-new-product]');
  newBtn?.addEventListener('click', () => overlay.classList.remove('is-hidden'));

  // ---- Product card ----
  // Retorna cor CSS conforme nível de estoque: vermelho (0), amarelo (≤5), verde (>5).
  function stockColor(stock) {
    if (stock === 0) return '#dc2626';
    if (stock <= 5) return '#d97706';
    return '#16a34a';
  }

  // Converte unidades em % para a barra de estoque visual (cap: 50 un = 100%).
  function stockPct(stock) {
    return Math.min(100, Math.round((stock / 50) * 100));
  }

  // ---------------------------------------------------------
  // Filtra produtos por nome/SKU e renderiza os cards na grade.
  // ---------------------------------------------------------
  function render() {
    const query = (search?.value || '').toLowerCase();
    const products = ShopData.products().filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query))
    );

    grid.innerHTML = '';

    products.forEach(product => {
      const outOfStock = product.stock === 0;
      const lowStock = product.stock > 0 && product.stock <= 5;
      const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;
      const color = stockColor(product.stock);
      const pct = stockPct(product.stock);

      const article = document.createElement('article');
      article.className = 'admin-product-card admin-card';

      // Imagem + badges de estoque
      const imgDiv = document.createElement('div');
      imgDiv.className = 'admin-product-card__img';

      const img = document.createElement('img');
      img.src = product.image;
      img.alt = product.name;
      img.loading = 'lazy';
      imgDiv.appendChild(img);

      if (outOfStock) {
        const badge = document.createElement('span');
        badge.className = 'admin-product-card__badge';
        badge.style.background = '#dc2626';
        badge.style.color = '#fff';
        badge.textContent = 'Sem estoque';
        imgDiv.appendChild(badge);
      }
      if (lowStock) {
        const badge = document.createElement('span');
        badge.className = 'admin-product-card__badge';
        badge.style.background = '#d97706';
        badge.style.color = '#fff';
        badge.textContent = 'Baixo estoque';
        imgDiv.appendChild(badge);
      }
      article.appendChild(imgDiv);

      // Categoria
      const categoryP = document.createElement('p');
      categoryP.className = 'text-muted';
      categoryP.style.margin = '0 0 4px';
      categoryP.style.fontSize = '12px';
      categoryP.textContent = product.category;
      article.appendChild(categoryP);

      // Nome
      const nameStrong = document.createElement('strong');
      nameStrong.style.fontSize = '14px';
      nameStrong.style.lineHeight = '1.3';
      nameStrong.textContent = product.name;
      article.appendChild(nameStrong);

      // Preço + badge de quantidade
      const priceRow = document.createElement('div');
      priceRow.style.display = 'flex';
      priceRow.style.alignItems = 'center';
      priceRow.style.justifyContent = 'space-between';
      priceRow.style.marginTop = '8px';

      const priceDiv = document.createElement('div');
      const priceStrong = document.createElement('strong');
      priceStrong.style.fontSize = '15px';
      priceStrong.textContent = ShopNow.money(product.price);
      priceDiv.appendChild(priceStrong);

      if (product.originalPrice) {
        const oldPriceSpan = document.createElement('span');
        oldPriceSpan.style.fontSize = '11px';
        oldPriceSpan.style.textDecoration = 'line-through';
        oldPriceSpan.style.color = 'var(--admin-muted)';
        oldPriceSpan.style.marginLeft = '4px';
        oldPriceSpan.textContent = ShopNow.money(product.originalPrice);
        priceDiv.appendChild(oldPriceSpan);
      }
      priceRow.appendChild(priceDiv);

      const stockBadge = document.createElement('span');
      stockBadge.className = 'badge';
      stockBadge.style.background = outOfStock
        ? 'rgba(220,38,38,.18)'
        : lowStock
          ? 'rgba(217,119,6,.18)'
          : 'rgba(22,163,74,.18)';
      stockBadge.style.color = color;
      stockBadge.style.fontSize = '11px';
      stockBadge.textContent = `${product.stock} un.`;
      priceRow.appendChild(stockBadge);

      article.appendChild(priceRow);

      // Barra de estoque
      const barDiv = document.createElement('div');
      barDiv.className = 'admin-product-card__stock-bar';
      const barFill = document.createElement('div');
      barFill.className = 'admin-product-card__stock-bar-fill';
      barFill.style.width = `${pct}%`;
      barFill.style.background = color;
      barDiv.appendChild(barFill);
      article.appendChild(barDiv);

      // SKU
      const skuP = document.createElement('p');
      skuP.className = 'admin-product-card__sku';
      skuP.textContent = `SKU: ${product.sku || '—'}`;
      article.appendChild(skuP);

      grid.appendChild(article);
    });
  }

  search?.addEventListener('input', render);
  render();
});
