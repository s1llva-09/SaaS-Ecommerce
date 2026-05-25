// ============================================================
// UI COMUM
// Helpers de moeda, carrinho, links e componentes pequenos.
// ============================================================

const ShopNow = {
  cartKey: 'shopnow-cart',

  root() {
    return document.body.dataset.root || '';
  },

  money(value, cents = false) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    });
  },

  int(value) {
    return value.toLocaleString('pt-BR');
  },

  discount(product) {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  },

  stars(value) {
    return Array.from({ length: 5 }, (_, index) =>
      `<span class="${index < Math.round(value) ? 'is-filled' : ''}">★</span>`
    ).join('');
  },

  cart() {
    return JSON.parse(localStorage.getItem(this.cartKey) || '[]');
  },

  saveCart(cart) {
    localStorage.setItem(this.cartKey, JSON.stringify(cart));
    this.updateCartCount();
  },

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

  updateQty(productId, qty) {
    const nextQty = Number(qty);
    const cart = this.cart()
      .map(item => item.id === String(productId) ? { ...item, qty: nextQty } : item)
      .filter(item => item.qty > 0);
    this.saveCart(cart);
  },

  clearCart() {
    this.saveCart([]);
  },

  cartItems() {
    return this.cart()
      .map(item => ({ ...item, product: ShopData.products().find(product => product.id === item.id) }))
      .filter(item => item.product);
  },

  cartTotal() {
    return this.cartItems().reduce((sum, item) => sum + item.product.price * item.qty, 0);
  },

  updateCartCount() {
    const count = this.cart().reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('[data-cart-count]').forEach(node => {
      node.textContent = count > 9 ? '9+' : String(count);
      node.style.display = count > 0 ? 'inline-grid' : 'none';
    });
  },

  productUrl(productId) {
    return `${this.root()}pages/product.html?id=${productId}`;
  },

  productCard(product) {
    const discount = this.discount(product);
    const installments = product.installments || 1;
    const lowStock = product.stock > 0 && product.stock <= 3;

    return `
      <article class="product-card card">
        <a class="product-card__image" href="${this.productUrl(product.id)}">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${discount ? `<span class="badge badge-red" style="position:absolute;top:12px;left:12px;background:#ff5a00;color:#fff">-${discount}%</span>` : ''}
          ${lowStock ? `<span class="badge" style="position:absolute;top:12px;right:12px;background:#ff8a00;color:#fff">Últimas ${product.stock} un.</span>` : ''}
          ${product.stock === 0 ? '<span class="badge" style="position:absolute;top:12px;right:12px;background:#334155;color:#fff">Sem estoque</span>' : ''}
        </a>
        <div class="product-card__body">
          <a href="${this.productUrl(product.id)}">
            <div class="product-card__category">${product.category}</div>
            <h3 class="product-card__name">${product.name}</h3>
            <p class="product-card__rating">${this.stars(product.rating)} <em>(${this.int(product.reviews)})</em></p>
          </a>
          ${product.originalPrice ? `<div class="product-card__old-price">${this.money(product.originalPrice)}</div>` : ''}
          <div class="product-card__footer">
            <div>
              <div class="product-card__price">${this.money(product.price)}</div>
              <p class="product-card__installments">ou ${installments}x de ${this.money(product.price / installments, true)}</p>
              ${product.badge === 'Retirada disponível' ? '<p class="product-card__pickup">🏪 Retirada disponível</p>' : ''}
            </div>
            ${product.stock > 0 ? `<button class="btn btn-primary product-card__add" data-add-cart="${product.id}" type="button">+ Carrinho</button>` : ''}
          </div>
        </div>
      </article>`;
  },

  statusBadge(status) {
    const config = ShopData.status()[status] || { label: status, cls: 'badge-blue' };
    return `<span class="badge ${config.cls}">${config.label}</span>`;
  },

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

  closeSearch() {},

  injectModeSwitch() {
    if (document.querySelector('[data-mode-switch]')) return;
    const isAdmin = document.body.classList.contains('admin-page');
    const root = this.root();
    const switcher = document.createElement('nav');
    switcher.className = 'mode-switch';
    switcher.dataset.modeSwitch = '';
    switcher.innerHTML = `
      <a class="${isAdmin ? '' : 'is-active'}" href="${root}index.html">🛒 Loja</a>
      <a class="${isAdmin ? 'is-active' : ''}" href="${root}pages/admin/dashboard.html">⚙️ Admin</a>
    `;
    document.body.appendChild(switcher);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  ShopNow.updateCartCount();
  ShopNow.bindCommonActions();
  ShopNow.bindSearchOverlay();
  ShopNow.injectModeSwitch();
});
