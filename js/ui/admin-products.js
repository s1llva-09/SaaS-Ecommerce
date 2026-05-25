// ============================================================
// UI ADMIN: PRODUTOS
// Grade com badges/estoque/SKU e modal de novo produto.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('[data-admin-products]');
  const search = document.querySelector('[data-admin-product-search]');
  if (!grid) return;

  // ---- Modal ----
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
            <select class="admin-field">
              ${ShopData.categories().map(c => `<option>${c.name}</option>`).join('')}
            </select>
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
  function stockColor(stock) {
    if (stock === 0) return '#dc2626';
    if (stock <= 5) return '#d97706';
    return '#16a34a';
  }

  function stockPct(stock) {
    return Math.min(100, Math.round((stock / 50) * 100));
  }

  function render() {
    const query = (search?.value || '').toLowerCase();
    const products = ShopData.products().filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query))
    );

    grid.innerHTML = products.map(product => {
      const outOfStock = product.stock === 0;
      const lowStock = product.stock > 0 && product.stock <= 5;
      const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;
      const color = stockColor(product.stock);
      const pct = stockPct(product.stock);

      return `
        <article class="admin-product-card admin-card">
          <div class="admin-product-card__img">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            ${outOfStock ? '<span class="admin-product-card__badge" style="background:#dc2626;color:#fff">Sem estoque</span>' : ''}
            ${lowStock ? '<span class="admin-product-card__badge" style="background:#d97706;color:#fff">Baixo estoque</span>' : ''}
          </div>
          <p class="text-muted" style="margin:0 0 4px;font-size:12px">${product.category}</p>
          <strong style="font-size:14px;line-height:1.3">${product.name}</strong>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
            <div>
              <strong style="font-size:15px">${ShopNow.money(product.price)}</strong>
              ${product.originalPrice ? `<span style="font-size:11px;text-decoration:line-through;color:var(--admin-muted);margin-left:4px">${ShopNow.money(product.originalPrice)}</span>` : ''}
            </div>
            <span class="badge" style="background:${outOfStock ? 'rgba(220,38,38,.18)' : lowStock ? 'rgba(217,119,6,.18)' : 'rgba(22,163,74,.18)'};color:${color};font-size:11px">${product.stock} un.</span>
          </div>
          <div class="admin-product-card__stock-bar">
            <div class="admin-product-card__stock-bar-fill" style="width:${pct}%;background:${color}"></div>
          </div>
          <p class="admin-product-card__sku">SKU: ${product.sku || '—'}</p>
        </article>
      `;
    }).join('');
  }

  search?.addEventListener('input', render);
  render();
});
