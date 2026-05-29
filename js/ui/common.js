// ============================================================
// UI COMUM
// Helpers de moeda, carrinho, links e componentes pequenos.
// ============================================================

const ShopNow = {
  cartKey: 'shopnow-cart',

  // Prefixo de caminho relativo — lê data-root do <body>.
  // Ex: "" na raiz, "../../" em pages/admin/. Garante que links
  // funcionem independente do nível de diretório da página.
  root() {
    return document.body.dataset.root || '';
  },

  // Formata número como moeda BRL (ex: R$ 1.290).
  // cents: true → exibe casas decimais (ex: R$ 24,90).
  money(value, cents = false) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    });
  },

  // Formata inteiro com separador de milhar PT-BR (ex: 1.290).
  int(value) {
    return value.toLocaleString('pt-BR');
  },

  // Calcula percentual de desconto entre originalPrice e price.
  // Retorna 0 se o produto não tiver preço original cadastrado.
  discount(product) {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  },

  // Gera 5 estrelas como HTML — apenas ★ e classes do sistema.
  // Seguro como innerHTML: nenhum dado do usuário é interpolado.
  stars(value) {
    return Array.from({ length: 5 }, (_, index) =>
      `<span class="${index < Math.round(value) ? 'is-filled' : ''}">★</span>`
    ).join('');
  },

  // Lê o carrinho do localStorage. Retorna array vazio se não existir.
  cart() {
    return JSON.parse(localStorage.getItem(this.cartKey) || '[]');
  },

  // Persiste o carrinho e dispara a atualização dos badges de contagem.
  saveCart(cart) {
    localStorage.setItem(this.cartKey, JSON.stringify(cart));
    this.updateCartCount();
  },

  // Adiciona qty unidades ao carrinho. Se o produto já está,
  // incrementa a quantidade em vez de criar nova entrada.
  // Ignora silenciosamente se o produto não existe ou está sem estoque.
  addToCart(productId, qty = 1) {
    const product = ShopData.products().find(item => item.id === String(productId));
    if (!product || product.stock <= 0) return;

    const cart = this.cart();
    const current = cart.find(item => item.id === product.id);
    if (current) current.qty += qty;
    else cart.push({ id: product.id, qty });

    this.saveCart(cart);
    this.toast('Produto adicionado ao carrinho');
  },

  // Atualiza a quantidade de um item no carrinho.
  // O filter(qty > 0) remove o item automaticamente se qty chegar a 0.
  updateQty(productId, qty) {
    const nextQty = Number(qty);
    const cart = this.cart()
      .map(item => item.id === String(productId) ? { ...item, qty: nextQty } : item)
      .filter(item => item.qty > 0);
    this.saveCart(cart);
  },

  // Esvazia o carrinho completamente.
  clearCart() {
    this.saveCart([]);
  },

  // Junta os itens do carrinho com os dados completos do produto.
  // Filtra itens cujo produto não existe mais no catálogo.
  cartItems() {
    return this.cart()
      .map(item => ({ ...item, product: ShopData.products().find(product => product.id === item.id) }))
      .filter(item => item.product);
  },

  // Soma price × qty de todos os itens do carrinho.
  cartTotal() {
    return this.cartItems().reduce((sum, item) => sum + item.product.price * item.qty, 0);
  },

  // Atualiza todos os badges [data-cart-count] na página.
  // Exibe "9+" se o total ultrapassar 9; oculta o badge se carrinho vazio.
  updateCartCount() {
    const count = this.cart().reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('[data-cart-count]').forEach(node => {
      node.textContent = count > 9 ? '9+' : String(count);
      node.style.display = count > 0 ? 'inline-grid' : 'none';
    });
  },

  // Monta a URL da página de produto a partir do root e do id.
  productUrl(productId) {
    return `${this.root()}pages/product.html?id=${productId}`;
  },

  // ---------------------------------------------------------
  // productCard(product) — retorna um <article> DOM completo.
  // Usa createElement + textContent em todos os dados do produto
  // para evitar XSS. stars() usa innerHTML internamente mas só
  // com ★ e classes do sistema — sem dados do usuário.
  // Retorna um elemento DOM, não uma string.
  // ---------------------------------------------------------
productCard(product) {
  const discount = this.discount(product);
  const installments = product.installments || 1;
  const lowStock = product.stock > 0 && product.stock <= 3;

  const article = document.createElement('article');
  article.className = 'product-card card';

  const imageLink = document.createElement('a');
  imageLink.className = 'product-card__image';
  imageLink.href = this.productUrl(product.id);

  const img = document.createElement('img');
  img.src = product.image;
  img.alt = product.name;
  img.loading = 'lazy';
  imageLink.appendChild(img);

  if (discount) {
    const b = document.createElement('span');
    b.className = 'badge badge-product-discount';
    b.textContent = `-${discount}%`;
    imageLink.appendChild(b);
  }
  if (lowStock) {
    const b = document.createElement('span');
    b.className = 'badge badge-product-low-stock';
    b.textContent = `Últimas ${product.stock} un.`;
    imageLink.appendChild(b);
  }
  if (product.stock === 0) {
    const b = document.createElement('span');
    b.className = 'badge badge-product-no-stock';
    b.textContent = 'Sem estoque';
    imageLink.appendChild(b);
  }
  article.appendChild(imageLink);

  const body = document.createElement('div');
  body.className = 'product-card__body';

  const bodyLink = document.createElement('a');
  bodyLink.href = this.productUrl(product.id);

  const catDiv = document.createElement('div');
  catDiv.className = 'product-card__category';
  catDiv.textContent = product.category;
  bodyLink.appendChild(catDiv);

  const nameH3 = document.createElement('h3');
  nameH3.className = 'product-card__name';
  nameH3.textContent = product.name;
  bodyLink.appendChild(nameH3);

  // stars() usa apenas ★ e classes do sistema — seguro como innerHTML
  const ratingP = document.createElement('p');
  ratingP.className = 'product-card__rating';
  ratingP.innerHTML = this.stars(product.rating);
  const em = document.createElement('em');
  em.textContent = ` (${this.int(product.reviews)})`;
  ratingP.appendChild(em);
  bodyLink.appendChild(ratingP);

  body.appendChild(bodyLink);

  if (product.originalPrice) {
    const oldPrice = document.createElement('div');
    oldPrice.className = 'product-card__old-price';
    oldPrice.textContent = this.money(product.originalPrice);
    body.appendChild(oldPrice);
  }

  const footer = document.createElement('div');
  footer.className = 'product-card__footer';

  const priceCol = document.createElement('div');

  const priceEl = document.createElement('div');
  priceEl.className = 'product-card__price';
  priceEl.textContent = this.money(product.price);
  priceCol.appendChild(priceEl);

  const installP = document.createElement('p');
  installP.className = 'product-card__installments';
  installP.textContent = `ou ${installments}x de ${this.money(product.price / installments, true)}`;
  priceCol.appendChild(installP);

  if (product.badge === 'Retirada disponível') {
    const pickupP = document.createElement('p');
    pickupP.className = 'product-card__pickup';
    pickupP.textContent = '🏪 Retirada disponível';
    priceCol.appendChild(pickupP);
  }

  footer.appendChild(priceCol);

  if (product.stock > 0) {
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary product-card__add';
    addBtn.dataset.addCart = product.id;
    addBtn.type = 'button';
    addBtn.textContent = '+ Carrinho';
    footer.appendChild(addBtn);
  }

  body.appendChild(footer);
  article.appendChild(body);

  return article;
},

  // Retorna um <span class="badge ..."> como string HTML.
  // Seguro como innerHTML: usa apenas labels e classes do ShopData.status()
  // — valores controlados internamente, nunca vindos do usuário.
  statusBadge(status) {
    const config = ShopData.status()[status] || { label: status, cls: 'badge-blue' };
    return `<span class="badge ${config.cls}">${config.label}</span>`;
  },

  // Exibe uma notificação flutuante por 1,8s.
  // Cria o elemento na primeira chamada e reutiliza nas demais (lazy-init).
  toast(message) {
    let toast = document.querySelector('[data-toast]');
    if (!toast) {
      toast = document.createElement('div');
      toast.dataset.toast = '';
      toast.style.cssText = 'position:fixed;left:50%;bottom:24px;z-index:1000;transform:translateX(-50%);background:#111827;color:#fff;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:800;box-shadow:0 12px 30px rgba(0,0,0,.18);opacity:0;transition:.2s ease';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { toast.style.opacity = '0'; }, 1800);
  },

  // Delegação global de cliques para [data-add-cart] e [data-buy-now].
  // Também ouve submit de todos os formulários [data-store-search].
  bindCommonActions() {
    document.addEventListener('click', event => {
      const addButton = event.target.closest('[data-add-cart]');
      if (addButton) this.addToCart(addButton.dataset.addCart);

      const buyButton = event.target.closest('[data-buy-now]');
      if (buyButton) {
        this.addToCart(buyButton.dataset.buyNow);
        window.location.href = `${this.root()}pages/checkout.html`;
      }
    });

    document.querySelectorAll('[data-store-search]').forEach(form => {
      form.addEventListener('submit', event => {
        event.preventDefault();
        const input = form.querySelector('input');
        const query = encodeURIComponent(input.value.trim());
        this.closeSearch();
        window.location.href = `${this.root()}pages/products.html${query ? `?search=${query}` : ''}`;
      });
    });
  },

  // Controla o overlay de busca: abre, fecha, foco automático e teclas.
  // Define this.closeSearch() como função real após inicialização
  // (o stub abaixo evita erros se chamado antes do bind).
  bindSearchOverlay() {
    const overlay = document.querySelector('[data-search-overlay]');
    const toggleBtn = document.querySelector('[data-search-toggle]');
    const closeBtn = document.querySelector('[data-search-close]');
    if (!overlay) return;

    const open = () => {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      const input = overlay.querySelector('input');
      setTimeout(() => input?.focus(), 50);
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    this.closeSearch = close;

    toggleBtn?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);

    overlay.addEventListener('click', event => {
      if (event.target === overlay) close();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') close();
    });
  },

  // Stub substituído por bindSearchOverlay() em runtime.
  closeSearch() {},

  // Injeta o switcher Loja / Admin no <body> se ainda não existir.
  // Detecta a página atual pela classe admin-page no <body>.
  injectModeSwitch() {
    if (document.querySelector('[data-mode-switch]')) return;
    const isAdmin = document.body.classList.contains('admin-page');
    const root = this.root();
    const switcher = document.createElement('nav');
    switcher.className = 'mode-switch';
    switcher.dataset.modeSwitch = '';

    const storeLink = document.createElement('a');
    storeLink.className = isAdmin ? '' : 'is-active';
    storeLink.href = `${root}index.html`;
    storeLink.textContent = '🛒 Loja';
    switcher.appendChild(storeLink);

    const adminLink = document.createElement('a');
    adminLink.className = isAdmin ? 'is-active' : '';
    adminLink.href = `${root}pages/admin/dashboard.html`;
    adminLink.textContent = '⚙️ Admin';
    switcher.appendChild(adminLink);

    document.body.appendChild(switcher);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  ShopNow.updateCartCount();
  ShopNow.bindCommonActions();
  ShopNow.bindSearchOverlay();
  ShopNow.injectModeSwitch();
});
