// ============================================================
// UI ADMIN: PRODUTOS
// Grade com badges/estoque/SKU e modal de criar/editar produto.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('[data-admin-products]');
  const search = document.querySelector('[data-admin-product-search]');
  if (!grid) return;

  // ---------------------------------------------------------
  // Modal — data-image-section é preenchido pelo carrossel.
  // Campos têm data-field para serem lidos/preenchidos por openModal().
  // ---------------------------------------------------------
  const overlay = document.createElement('div');
  overlay.className = 'admin-modal-overlay is-hidden';
  overlay.innerHTML = `
    <div class="admin-modal">
      <div class="admin-modal__head">
        <span class="admin-modal__title" data-modal-title>Novo Produto</span>
        <button class="admin-modal__close" data-modal-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="admin-modal__body">
        <div data-image-section></div>
        <div>
          <label class="admin-field-label">Nome do produto *</label>
          <input class="admin-field" type="text" placeholder="Nome do produto" data-field="name">
        </div>
        <div>
          <label class="admin-field-label">Descrição</label>
          <textarea class="admin-textarea" placeholder="Descrição do produto" data-field="description"></textarea>
        </div>
        <div class="admin-form-grid-2">
          <div>
            <label class="admin-field-label">Categoria</label>
            <select class="admin-field" data-category-select data-field="category"></select>
          </div>
          <div>
            <label class="admin-field-label">SKU *</label>
            <input class="admin-field" type="text" placeholder="SKU-001" data-field="sku">
          </div>
        </div>
        <div class="admin-form-grid-2">
          <div>
            <label class="admin-field-label">Preço de venda (R$) *</label>
            <input class="admin-field" type="number" min="0" step="0.01" placeholder="0,00" data-field="price">
          </div>
          <div>
            <label class="admin-field-label">Preço original (R$)</label>
            <input class="admin-field" type="number" min="0" step="0.01" placeholder="0,00" data-field="originalPrice">
          </div>
        </div>
        <div class="admin-form-grid-2">
          <div>
            <label class="admin-field-label">Estoque *</label>
            <input class="admin-field" type="number" min="0" value="0" data-field="stock">
          </div>
          <div>
            <label class="admin-field-label">Status</label>
            <select class="admin-field" data-field="status">
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>
        </div>
        <div class="admin-form-grid-2">
          <div>
            <label class="admin-field-label">Cores</label>
            <input class="admin-field" type="text" placeholder="Preto, Branco, Azul" data-field="colors">
            <small class="admin-field-hint">Separadas por vírgula</small>
          </div>
          <div>
            <label class="admin-field-label">Tamanhos</label>
            <input class="admin-field" type="text" placeholder="P, M, G, GG" data-field="sizes">
            <small class="admin-field-hint">Separados por vírgula</small>
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

  // ---------------------------------------------------------
  // Carrossel de imagens — estado local do modal.
  // carouselImages: array de { src: string } (base64 ou URL).
  // carouselIndex: índice da imagem exibida no momento.
  // ---------------------------------------------------------
  let carouselImages = [];
  let carouselIndex  = 0;

  // Input de arquivo oculto — dispara seleção múltipla de imagens
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.multiple = true;
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  // Lê cada arquivo selecionado como base64 e adiciona ao carrossel
  fileInput.addEventListener('change', () => {
    Array.from(fileInput.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        carouselImages.push({ src: e.target.result });
        renderImageSection();
      };
      reader.readAsDataURL(file);
    });
    fileInput.value = '';
  });

  const imageSection = overlay.querySelector('[data-image-section]');

  // ---------------------------------------------------------
  // renderImageSection() — reconstrói a área de imagem.
  // Sem imagens: exibe o placeholder de upload.
  // Com imagens: exibe carrossel com navegação e thumbnails.
  // ---------------------------------------------------------
  function renderImageSection() {
    imageSection.innerHTML = '';

    if (!carouselImages.length) {
      // Placeholder de upload
      const area = document.createElement('div');
      area.className = 'image-upload-area';
      area.innerHTML = `
        <div class="image-upload-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <p>Clique para fazer upload de imagens</p>
        <small>PNG, JPG até 10MB cada</small>
      `;
      area.addEventListener('click', () => fileInput.click());
      imageSection.appendChild(area);
      return;
    }

    const carousel = document.createElement('div');
    carousel.className = 'product-carousel';

    // Visualização principal
    const mainDiv = document.createElement('div');
    mainDiv.className = 'product-carousel__main';

    const mainImg = document.createElement('img');
    mainImg.src = carouselImages[carouselIndex].src;
    mainImg.alt = 'Imagem do produto';
    mainDiv.appendChild(mainImg);

    // Setas de navegação (só aparecem com mais de 1 imagem)
    if (carouselImages.length > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'product-carousel__nav product-carousel__nav--prev';
      prevBtn.type = 'button';
      prevBtn.innerHTML = '&#8249;';
      prevBtn.addEventListener('click', () => {
        carouselIndex = (carouselIndex - 1 + carouselImages.length) % carouselImages.length;
        renderImageSection();
      });

      const nextBtn = document.createElement('button');
      nextBtn.className = 'product-carousel__nav product-carousel__nav--next';
      nextBtn.type = 'button';
      nextBtn.innerHTML = '&#8250;';
      nextBtn.addEventListener('click', () => {
        carouselIndex = (carouselIndex + 1) % carouselImages.length;
        renderImageSection();
      });

      mainDiv.appendChild(prevBtn);
      mainDiv.appendChild(nextBtn);
    }

    carousel.appendChild(mainDiv);

    // Faixa de thumbnails
    const thumbsDiv = document.createElement('div');
    thumbsDiv.className = 'product-carousel__thumbs';

    carouselImages.forEach((imgData, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'product-carousel__thumb' + (i === carouselIndex ? ' is-active' : '');

      const thumbImg = document.createElement('img');
      thumbImg.src = imgData.src;
      thumbImg.alt = `Imagem ${i + 1}`;
      thumb.appendChild(thumbImg);

      // Botão de remover imagem
      const delBtn = document.createElement('button');
      delBtn.className = 'product-carousel__thumb-del';
      delBtn.type = 'button';
      delBtn.textContent = '×';
      delBtn.addEventListener('click', e => {
        e.stopPropagation();
        carouselImages.splice(i, 1);
        if (carouselIndex >= carouselImages.length) carouselIndex = Math.max(0, carouselImages.length - 1);
        renderImageSection();
      });
      thumb.appendChild(delBtn);

      // Clicar no thumb seleciona a imagem
      thumb.addEventListener('click', () => {
        carouselIndex = i;
        renderImageSection();
      });

      thumbsDiv.appendChild(thumb);
    });

    // Botão de adicionar mais imagens
    const addBtn = document.createElement('button');
    addBtn.className = 'product-carousel__add';
    addBtn.type = 'button';
    addBtn.textContent = '+';
    addBtn.title = 'Adicionar imagem';
    addBtn.addEventListener('click', () => fileInput.click());
    thumbsDiv.appendChild(addBtn);

    carousel.appendChild(thumbsDiv);
    imageSection.appendChild(carousel);
  }

  // ---------------------------------------------------------
  // editingId guarda o id do produto em edição.
  // null = modo criação, string = modo edição.
  // ---------------------------------------------------------
  let editingId = null;

  const modalTitle = overlay.querySelector('[data-modal-title]');
  const submitBtn  = overlay.querySelector('[data-modal-submit]');

  // ---------------------------------------------------------
  // openModal(product) — abre o modal no modo correto.
  // Sem argumento: limpa campos e carrossel (novo produto).
  // Com produto: preenche campos e carrega imagem existente.
  // ---------------------------------------------------------
  function openModal(product = null) {
    editingId = product ? product.id : null;

    // Reinicia o carrossel — se for edição, pré-carrega a imagem atual
    carouselImages = product?.image ? [{ src: product.image }] : [];
    carouselIndex  = 0;
    renderImageSection();

    // Ajusta título e botão conforme o modo
    modalTitle.textContent = product ? 'Editar Produto'    : 'Novo Produto';
    submitBtn.textContent  = product ? 'Salvar alterações' : 'Criar produto';

    // Preenche ou limpa cada campo pelo atributo data-field
    overlay.querySelectorAll('[data-field]').forEach(field => {
      const key = field.dataset.field;
      if (!product) {
        field.value = field.tagName === 'INPUT' && field.type === 'number' ? '0' : '';
        return;
      }
      if (key === 'colors') field.value = product.colors ? product.colors.join(', ') : '';
      else if (key === 'sizes') field.value = product.sizes ? product.sizes.join(', ') : '';
      else field.value = product[key] ?? '';
    });

    overlay.classList.remove('is-hidden');
  }

  // ---------------------------------------------------------
  // Submit — cria ou atualiza o produto no array mock.
  // Em produção, trocar pelo POST/PATCH ao Supabase Storage + DB.
  // ---------------------------------------------------------
  submitBtn.addEventListener('click', () => {
    if (editingId) {
      const products = ShopData.products();
      const idx = products.findIndex(p => p.id === editingId);
      if (idx !== -1) {
        overlay.querySelectorAll('[data-field]').forEach(field => {
          const key = field.dataset.field;
          if (key === 'colors' || key === 'sizes') {
            const arr = field.value.split(',').map(v => v.trim()).filter(Boolean);
            products[idx][key] = arr.length ? arr : undefined;
          } else if (field.type === 'number') {
            products[idx][key] = Number(field.value) || 0;
          } else {
            products[idx][key] = field.value;
          }
        });
        // Persiste a primeira imagem do carrossel (se houver nova)
        if (carouselImages.length) products[idx].image = carouselImages[0].src;
      }
      ShopNow.toast('Produto atualizado com sucesso!');
      render();
    } else {
      ShopNow.toast('Produto criado com sucesso!');
    }
    overlay.classList.add('is-hidden');
  });

  overlay.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => overlay.classList.add('is-hidden'));
  });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.add('is-hidden');
  });

  // Botão "Novo Produto" abre no modo criação
  const newBtn = document.querySelector('[data-new-product]');
  newBtn?.addEventListener('click', () => openModal(null));

  // ---- Helpers de card ----
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
      const lowStock   = product.stock > 0 && product.stock <= 5;
      const color = stockColor(product.stock);
      const pct   = stockPct(product.stock);

      const article = document.createElement('article');
      article.className = 'admin-product-card admin-card';
      article.dataset.editProduct = product.id;

      const imgDiv = document.createElement('div');
      imgDiv.className = 'admin-product-card__img';

      const img = document.createElement('img');
      img.src = product.image;
      img.alt = product.name;
      img.loading = 'lazy';
      imgDiv.appendChild(img);

      if (outOfStock) {
        const badge = document.createElement('span');
        badge.className = 'admin-product-card__badge admin-product-card__badge--danger';
        badge.textContent = 'Sem estoque';
        imgDiv.appendChild(badge);
      }
      if (lowStock) {
        const badge = document.createElement('span');
        badge.className = 'admin-product-card__badge admin-product-card__badge--warning';
        badge.textContent = 'Baixo estoque';
        imgDiv.appendChild(badge);
      }
      article.appendChild(imgDiv);

      const categoryP = document.createElement('p');
      categoryP.className = 'text-muted admin-product-card__category';
      categoryP.textContent = product.category;
      article.appendChild(categoryP);

      const nameStrong = document.createElement('strong');
      nameStrong.className = 'admin-product-card__name';
      nameStrong.textContent = product.name;
      article.appendChild(nameStrong);

      const priceRow = document.createElement('div');
      priceRow.className = 'admin-product-card__price-row';

      const priceDiv = document.createElement('div');
      const priceStrong = document.createElement('strong');
      priceStrong.className = 'admin-product-card__price-value';
      priceStrong.textContent = ShopNow.money(product.price);
      priceDiv.appendChild(priceStrong);

      if (product.originalPrice) {
        const oldPriceSpan = document.createElement('span');
        oldPriceSpan.className = 'admin-product-card__old-price';
        oldPriceSpan.textContent = ShopNow.money(product.originalPrice);
        priceDiv.appendChild(oldPriceSpan);
      }
      priceRow.appendChild(priceDiv);

      const stockBadge = document.createElement('span');
      stockBadge.className = 'badge badge--sm';
      stockBadge.style.background = outOfStock ? 'rgba(220,38,38,.18)' : lowStock ? 'rgba(217,119,6,.18)' : 'rgba(22,163,74,.18)';
      stockBadge.style.color = color;
      stockBadge.textContent = `${product.stock} un.`;
      priceRow.appendChild(stockBadge);

      article.appendChild(priceRow);

      const barDiv = document.createElement('div');
      barDiv.className = 'admin-product-card__stock-bar';
      const barFill = document.createElement('div');
      barFill.className = 'admin-product-card__stock-bar-fill';
      barFill.style.width = `${pct}%`;
      barFill.style.background = color;
      barDiv.appendChild(barFill);
      article.appendChild(barDiv);

      const skuP = document.createElement('p');
      skuP.className = 'admin-product-card__sku';
      skuP.textContent = `SKU: ${product.sku || '—'}`;
      article.appendChild(skuP);

      const editBtn = document.createElement('button');
      editBtn.className = 'admin-product-card__edit-btn';
      editBtn.textContent = 'Editar';
      article.appendChild(editBtn);

      grid.appendChild(article);
    });
  }

  // ---------------------------------------------------------
  // Delegação de clique na grade — abre o modal de edição
  // ao clicar no botão "Editar" de qualquer card.
  // ---------------------------------------------------------
  grid.addEventListener('click', e => {
    const btn = e.target.closest('.admin-product-card__edit-btn');
    if (!btn) return;
    const card = btn.closest('[data-edit-product]');
    if (!card) return;
    const product = ShopData.products().find(p => p.id === card.dataset.editProduct);
    if (product) openModal(product);
  });

  search?.addEventListener('input', render);
  render();

  // ---------------------------------------------------------
  // rebuildCategorySelect() — sincroniza o select do modal de
  // produto sempre que categorias são adicionadas/alteradas.
  // ---------------------------------------------------------
  function rebuildCategorySelect() {
    const current = categorySelect.value;
    categorySelect.innerHTML = '';
    ShopData.categories().forEach(c => {
      const option = document.createElement('option');
      option.textContent = c.name;
      categorySelect.appendChild(option);
    });
    categorySelect.value = current;
  }

  // ---------------------------------------------------------
  // Tab switching — Produtos / Categorias.
  // ---------------------------------------------------------
  document.querySelectorAll('[data-products-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-products-tab]').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      document.querySelectorAll('[data-products-panel]').forEach(panel => {
        panel.classList.toggle('is-hidden', panel.dataset.productsPanel !== tab.dataset.productsTab);
      });
    });
  });

  // ---------------------------------------------------------
  // Modal de categorias — criar / editar.
  // ---------------------------------------------------------
  const catOverlay = document.createElement('div');
  catOverlay.className = 'admin-modal-overlay is-hidden';
  catOverlay.innerHTML = `
    <div class="admin-modal">
      <div class="admin-modal__head">
        <span class="admin-modal__title" data-cat-modal-title>Nova Categoria</span>
        <button class="admin-modal__close" data-cat-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="admin-modal__body">
        <div>
          <label class="admin-field-label">Imagem da categoria</label>
          <div class="cat-img-area" data-cat-img-area>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p>Clique para fazer upload</p>
            <small>PNG, JPG até 10MB</small>
          </div>
        </div>
        <div class="admin-form-grid-2">
          <div>
            <label class="admin-field-label">Ícone (emoji)</label>
            <input class="admin-field" type="text" data-cat-icon placeholder="Ex: 💻" maxlength="2">
          </div>
          <div>
            <label class="admin-field-label">Nome *</label>
            <input class="admin-field" type="text" data-cat-name placeholder="Ex: Eletrônicos" required>
          </div>
        </div>
      </div>
      <div class="admin-modal__footer">
        <button class="btn-admin-cancel" data-cat-close>Cancelar</button>
        <button class="btn-admin-create" data-cat-submit>Criar categoria</button>
      </div>
    </div>
  `;
  document.body.appendChild(catOverlay);

  // Input de arquivo dedicado para imagem de categoria
  const catFileInput = document.createElement('input');
  catFileInput.type = 'file';
  catFileInput.accept = 'image/*';
  catFileInput.style.display = 'none';
  document.body.appendChild(catFileInput);

  let catCurrentImage = null;
  const catImgArea = catOverlay.querySelector('[data-cat-img-area]');

  function renderCatImgArea() {
    catImgArea.innerHTML = '';
    if (catCurrentImage) {
      const img = document.createElement('img');
      img.src = catCurrentImage;
      img.className = 'cat-img-preview';
      catImgArea.appendChild(img);
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'cat-img-remove';
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', e => {
        e.stopPropagation();
        catCurrentImage = null;
        renderCatImgArea();
      });
      catImgArea.appendChild(removeBtn);
    } else {
      catImgArea.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <p>Clique para fazer upload</p>
        <small>PNG, JPG até 10MB</small>
      `;
    }
  }

  catImgArea.addEventListener('click', () => catFileInput.click());

  catFileInput.addEventListener('change', () => {
    const file = catFileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => { catCurrentImage = e.target.result; renderCatImgArea(); };
    reader.readAsDataURL(file);
    catFileInput.value = '';
  });

  catOverlay.querySelectorAll('[data-cat-close]').forEach(btn => {
    btn.addEventListener('click', () => catOverlay.classList.add('is-hidden'));
  });
  catOverlay.addEventListener('click', e => {
    if (e.target === catOverlay) catOverlay.classList.add('is-hidden');
  });

  let editingCatName = null;

  function openCategoryModal(cat = null) {
    editingCatName = cat ? cat.name : null;
    catCurrentImage = cat?.image || null;
    catOverlay.querySelector('[data-cat-modal-title]').textContent = cat ? 'Editar Categoria' : 'Nova Categoria';
    catOverlay.querySelector('[data-cat-submit]').textContent = cat ? 'Salvar alterações' : 'Criar categoria';
    catOverlay.querySelector('[data-cat-icon]').value = cat?.icon || '';
    catOverlay.querySelector('[data-cat-name]').value = cat?.name || '';
    renderCatImgArea();
    catOverlay.classList.remove('is-hidden');
    catOverlay.querySelector('[data-cat-name]').focus();
  }

  catOverlay.querySelector('[data-cat-submit]').addEventListener('click', () => {
    const name = catOverlay.querySelector('[data-cat-name]').value.trim();
    if (!name) { ShopNow.toast('Informe o nome da categoria', 'error'); return; }
    const icon = catOverlay.querySelector('[data-cat-icon]').value.trim();
    const updates = { name, icon, image: catCurrentImage || undefined };

    if (editingCatName) {
      ShopData.updateCategory(editingCatName, updates);
      ShopNow.toast('Categoria atualizada com sucesso', 'success');
    } else {
      ShopData.addCategory({ ...updates, count: 0 });
      ShopNow.toast('Categoria criada com sucesso', 'success');
    }
    catOverlay.classList.add('is-hidden');
    renderCategories();
    rebuildCategorySelect();
  });

  document.querySelector('[data-new-category]')?.addEventListener('click', () => openCategoryModal(null));

  // ---------------------------------------------------------
  // renderCategories() — tabela de categorias com editar/excluir.
  // ---------------------------------------------------------
  const catTbody = document.querySelector('[data-categories-list]');

  function renderCategories() {
    catTbody.innerHTML = '';
    ShopData.categories().forEach(cat => {
      const card = document.createElement('article');
      card.className = 'cat-card';

      // Área de imagem / emoji / placeholder vazio
      const imgArea = document.createElement('div');
      imgArea.className = 'cat-card__img-area';
      if (cat.image) {
        const img = document.createElement('img');
        img.src = cat.image;
        img.className = 'cat-card__img';
        img.alt = cat.name;
        imgArea.appendChild(img);
      } else if (cat.icon) {
        const emoji = document.createElement('span');
        emoji.className = 'cat-card__emoji';
        emoji.textContent = cat.icon;
        imgArea.appendChild(emoji);
      } else {
        imgArea.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:.25"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
      }
      card.appendChild(imgArea);

      // Corpo: nome + contagem
      const body = document.createElement('div');
      body.className = 'cat-card__body';

      const nameEl = document.createElement('p');
      nameEl.className = 'cat-card__name';
      nameEl.textContent = cat.name;

      const countEl = document.createElement('p');
      countEl.className = 'cat-card__count';
      countEl.textContent = `${cat.count} produto${cat.count !== 1 ? 's' : ''}`;

      body.appendChild(nameEl);
      body.appendChild(countEl);
      card.appendChild(body);

      // Ações
      const actions = document.createElement('div');
      actions.className = 'cat-card__actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'cat-edit-btn';
      editBtn.textContent = 'Editar';
      editBtn.addEventListener('click', () => openCategoryModal(cat));

      const delBtn = document.createElement('button');
      delBtn.className = 'cat-del-btn';
      delBtn.textContent = 'Excluir';
      delBtn.addEventListener('click', () => {
        ShopData.deleteCategory(cat.name);
        renderCategories();
        rebuildCategorySelect();
        ShopNow.toast(`Categoria "${cat.name}" excluída`, 'success');
      });

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      card.appendChild(actions);

      catTbody.appendChild(card);
    });
  }

  renderCategories();
});
