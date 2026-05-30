// ============================================================
// UI COMUM
// Helpers de moeda, carrinho, links e componentes pequenos.
// ============================================================

const ShopNow = {
  cartKey: 'shopnow-cart',

  root() {
    return document.body.dataset.root || '';
  },

  escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  },

  money(value, cents = false) {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    });
  },

  int(value) {
    return Number(value || 0).toLocaleString('pt-BR');
  },

  discount(product) {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  },

  stars(value) {
    return Array.from({ length: 5 }, (_, index) =>
      `<span class="${index < Math.round(value || 0) ? 'is-filled' : ''}">★</span>`
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

    const article = document.createElement('article');
    article.className = 'product-card card';

    const imageLink = document.createElement('a');
    imageLink.className = 'product-card__image';
    imageLink.href = this.productUrl(product.id);

    const img = document.createElement('img');
    img.src = product.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23eef3f7" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="15" fill="%2398a2b3"%3ESem imagem%3C/text%3E%3C/svg%3E';
    img.alt = product.name;
    img.loading = 'lazy';
    imageLink.appendChild(img);

    if (discount) {
      const badge = document.createElement('span');
      badge.className = 'badge badge-product-discount';
      badge.textContent = `-${discount}%`;
      imageLink.appendChild(badge);
    }

    if (lowStock) {
      const badge = document.createElement('span');
      badge.className = 'badge badge-product-low-stock';
      badge.textContent = `Últimas ${product.stock} un.`;
      imageLink.appendChild(badge);
    }

    if (product.stock === 0) {
      const badge = document.createElement('span');
      badge.className = 'badge badge-product-no-stock';
      badge.textContent = 'Sem estoque';
      imageLink.appendChild(badge);
    }

    article.appendChild(imageLink);

    const body = document.createElement('div');
    body.className = 'product-card__body';

    const bodyLink = document.createElement('a');
    bodyLink.href = this.productUrl(product.id);

    const category = document.createElement('div');
    category.className = 'product-card__category';
    category.textContent = product.category;
    bodyLink.appendChild(category);

    const name = document.createElement('h3');
    name.className = 'product-card__name';
    name.textContent = product.name;
    bodyLink.appendChild(name);

    const rating = document.createElement('p');
    rating.className = 'product-card__rating';
    rating.innerHTML = this.stars(product.rating);
    const reviews = document.createElement('em');
    reviews.textContent = ` (${this.int(product.reviews)})`;
    rating.appendChild(reviews);
    bodyLink.appendChild(rating);
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
    const price = document.createElement('div');
    price.className = 'product-card__price';
    price.textContent = this.money(product.price);
    priceCol.appendChild(price);

    const install = document.createElement('p');
    install.className = 'product-card__installments';
    install.textContent = `ou ${installments}x de ${this.money(product.price / installments, true)}`;
    priceCol.appendChild(install);

    if (product.badge === 'Retirada disponível') {
      const pickup = document.createElement('p');
      pickup.className = 'product-card__pickup';
      pickup.textContent = 'Retirada disponível';
      priceCol.appendChild(pickup);
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

  statusBadge(status) {
    const config = ShopData.status()[status] || { label: status, cls: 'badge-blue' };
    return `<span class="badge ${this.escapeHTML(config.cls)}">${this.escapeHTML(config.label)}</span>`;
  },

  toast(message) {
    let toast = document.querySelector('[data-toast]');
    if (!toast) {
      toast = document.createElement('div');
      toast.dataset.toast = '';
      toast.style.cssText = 'position:fixed;left:50%;bottom:24px;z-index:1000;transform:translateX(-50%);background:#111827;color:#fff;padding:12px 18px;border-radius:8px;font-size:13px;font-weight:800;box-shadow:0 12px 30px rgba(0,0,0,.18);opacity:0;transition:.2s ease';
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

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getInitials() {
    const user = this.getUser();
    if (!user || !user.name) return null;

    const parts = user.name.split(' ').filter(Boolean);
    return parts.slice(0, 2).map(part => part[0]?.toUpperCase()).join('');
  },

  logout() {
    localStorage.removeItem('user');
    window.location.href = `${this.root()}index.html`;
  },

  renderCategoriesNav() {
    const nav = document.querySelector('[data-categories-nav]');
    if (!nav) return;

    const categories = ShopData.categories();
    const isProductsPage = window.location.pathname.includes('/products.html');
    const currentCategory = new URLSearchParams(window.location.search).get('category');

    nav.innerHTML = '';

    const allLink = document.createElement('a');
    allLink.href = `${this.root()}pages/products.html`;
    allLink.textContent = 'Produtos';
    if (isProductsPage && !currentCategory) allLink.className = 'is-active';
    nav.appendChild(allLink);

    categories.forEach(cat => {
      const link = document.createElement('a');
      link.href = `${this.root()}pages/products.html?category=${encodeURIComponent(cat.name)}`;
      link.textContent = cat.name;
      if (isProductsPage && currentCategory === cat.name) link.className = 'is-active';
      nav.appendChild(link);
    });
  },

  injectModeSwitch() {
    if (document.querySelector('[data-mode-switch]')) return;
    if (document.body.classList.contains('auth-page')) return;
    const isAdmin = document.body.classList.contains('admin-page');
    const root = this.root();
    const switcher = document.createElement('nav');
    switcher.className = 'mode-switch';
    switcher.dataset.modeSwitch = '';

    const storeLink = document.createElement('a');
    storeLink.className = isAdmin ? '' : 'is-active';
    storeLink.href = `${root}index.html`;
    storeLink.textContent = 'Loja';
    switcher.appendChild(storeLink);

    const adminLink = document.createElement('a');
    adminLink.className = isAdmin ? 'is-active' : '';
    adminLink.href = `${root}pages/admin/dashboard.html`;
    adminLink.textContent = 'Admin';
    switcher.appendChild(adminLink);

    document.body.appendChild(switcher);
  },

  injectStoreFooter() {
    if (document.querySelector('.store-footer')) return;
    if (document.body.classList.contains('admin-page') || document.body.classList.contains('auth-page')) return;

    const root = this.root();
    const storeName = ShopData.settings()?.geral?.storeName || 'ShopNow';
    const safeStoreName = this.escapeHTML(storeName);
    const footer = document.createElement('footer');
    footer.className = 'store-footer';
    footer.innerHTML = `
      <div class="container">
        <div class="store-footer__grid">
          <div>
            <h3><span class="store-brand__mark">S</span><span>${safeStoreName}</span></h3>
            <p>Sua loja online com bons produtos, preços claros e uma experiência de compra simples do começo ao fim.</p>
            <p>Suporte 24/7, compra segura e frete grátis acima de R$ 299.</p>
          </div>
          <div>
            <h4>Loja</h4>
            <a href="${root}index.html">Home</a>
            <a href="${root}pages/products.html">Produtos</a>
            <a href="${root}pages/cart.html">Carrinho</a>
            <a href="${root}pages/register.html">Criar conta</a>
          </div>
          <div>
            <h4>Atendimento</h4>
            <a href="${root}pages/account.html">Minha conta</a>
            <a href="${root}pages/account.html">Meus pedidos</a>
            <a href="#">Fale conosco</a>
            <a href="#">Rastrear pedido</a>
          </div>
          <div>
            <h4>Informações</h4>
            <a href="#">Política de privacidade</a>
            <a href="#">Termos de uso</a>
            <a href="#">Política de trocas</a>
            <a href="#">FAQ</a>
          </div>
        </div>
        <div class="store-footer__bottom">
          <div>
            <span>© 2026 ${safeStoreName}. Todos os direitos reservados.</span>
            <span>CNPJ: 00.000.000/0000-00</span>
            <span style="color: #34d399;">Loja segura e certificada</span>
          </div>
          <div class="store-footer__social">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
            <a href="#">WhatsApp</a>
            <a href="${root}pages/login.html" style="color: #93c5fd; font-weight: 700;">Admin</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(footer);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  ShopNow.updateCartCount();
  ShopNow.bindCommonActions();
  ShopNow.bindSearchOverlay();
  ShopNow.injectModeSwitch();
  ShopNow.injectStoreFooter();
  ShopNow.renderCategoriesNav();

  const user = ShopNow.getUser();
  const loginButton = document.querySelector('[data-login-btn]');

  if (user && loginButton) {
    const initials = ShopNow.getInitials();
    loginButton.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span style="font-size: 12px; font-weight: 800;">${ShopNow.escapeHTML(initials || 'US')}</span>
    `;
    loginButton.href = `${ShopNow.root()}pages/account.html`;
    loginButton.dataset.userProfile = 'true';
  }
});
