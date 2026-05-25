// ============================================================
// UI: CARRINHO
// Renderiza itens, resumo, entrega e cupom.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('[data-cart-list]');
  const summary = document.querySelector('[data-cart-summary]');
  const page = document.querySelector('[data-cart-page]');
  const titleEl = document.querySelector('[data-cart-title]');
  if (!list || !summary) return;

  const COUPON = { SHOP10: 10 };
  const STORE_ADDRESS = 'Rua das Flores, 1234 — Seg-Sáb 9h-20h, Dom 10h-18h';
  let delivery = 'home';
  let appliedCoupon = null;

  function renderItems() {
    const items = ShopNow.cartItems();
    const count = items.reduce((n, i) => n + i.qty, 0);
    if (titleEl) titleEl.textContent = `Meu Carrinho (${count} ${count === 1 ? 'item' : 'itens'})`;

    if (!items.length) {
      page?.classList.add('is-empty');
      list.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <h1>Seu carrinho está vazio</h1>
          <p>Adicione produtos para continuar comprando</p>
          <a class="btn btn-primary" href="products.html">Explorar Produtos</a>
        </div>`;
      summary.hidden = true;
      return;
    }

    page?.classList.remove('is-empty');
    summary.hidden = false;

    list.innerHTML = items.map(item => `
      <article class="cart-item card">
        <img src="${item.product.image}" alt="${item.product.name}">
        <div class="cart-item__info">
          <strong class="cart-item__name">${item.product.name}</strong>
          <p class="text-muted cart-item__price">${ShopNow.money(item.product.price)}</p>
          <div class="qty-control">
            <button data-cart-dec="${item.id}" aria-label="Diminuir">−</button>
            <span>${item.qty}</span>
            <button data-cart-inc="${item.id}" aria-label="Aumentar">+</button>
          </div>
        </div>
        <div class="cart-item__right">
          <strong class="cart-item__total">${ShopNow.money(item.product.price * item.qty)}</strong>
          <button class="cart-item__remove" data-cart-remove="${item.id}" aria-label="Remover item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </article>
    `).join('');

    renderDelivery();
    renderSummary();
  }

  function renderDelivery() {
    const existing = list.querySelector('[data-delivery-section]');
    if (existing) existing.remove();

    const section = document.createElement('div');
    section.dataset.deliverySection = '';
    section.className = 'cart-delivery card';
    section.innerHTML = `
      <h2 class="cart-delivery__title">Como deseja receber?</h2>
      <div class="delivery-tabs">
        <button class="delivery-tab ${delivery === 'home' ? 'is-active' : ''}" data-delivery="home" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <div>
            <strong>Receber em casa</strong>
            <span>2-5 dias úteis</span>
          </div>
        </button>
        <button class="delivery-tab ${delivery === 'pickup' ? 'is-active' : ''}" data-delivery="pickup" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <div>
            <strong>Retirar na loja</strong>
            <span>Grátis — pronto em 2h</span>
          </div>
        </button>
      </div>
      ${delivery === 'pickup'
        ? `<div class="delivery-address">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
             <span><strong>${STORE_ADDRESS.split(' — ')[0]}</strong> — ${STORE_ADDRESS.split(' — ')[1]}</span>
           </div>`
        : `<div class="delivery-cep">
             <input class="field" id="cep-input" placeholder="Digite seu CEP" maxlength="9" data-cep-input>
             <button class="btn btn-primary" type="button" data-cep-calc>Calcular</button>
           </div>
           <p class="delivery-cep__result" data-cep-result></p>`
      }
    `;
    list.appendChild(section);

    section.querySelectorAll('[data-delivery]').forEach(btn => {
      btn.addEventListener('click', () => {
        delivery = btn.dataset.delivery;
        renderItems();
      });
    });

    const cepCalc = section.querySelector('[data-cep-calc]');
    if (cepCalc) {
      const cepInput = section.querySelector('[data-cep-input]');
      const cepResult = section.querySelector('[data-cep-result]');
      cepInput?.addEventListener('input', () => {
        let v = cepInput.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
        cepInput.value = v;
      });
      cepCalc.addEventListener('click', () => {
        const cep = cepInput?.value.replace(/\D/g, '') || '';
        if (cep.length < 8) {
          cepResult.textContent = 'Informe um CEP válido.';
          cepResult.style.color = 'var(--red)';
          return;
        }
        cepResult.textContent = 'Calculando...';
        cepResult.style.color = 'var(--muted)';
        setTimeout(() => {
          const subtotal = ShopNow.cartTotal();
          const shipping = subtotal >= 299 ? 0 : 24.9;
          cepResult.textContent = shipping === 0
            ? '✓ Frete grátis para esse CEP!'
            : `Frete: ${ShopNow.money(shipping, true)} (2-5 dias úteis)`;
          cepResult.style.color = shipping === 0 ? 'var(--green)' : 'var(--text)';
          renderSummary();
        }, 600);
      });
    }
  }

  function renderSummary() {
    const subtotal = ShopNow.cartTotal();
    const shipping = delivery === 'pickup' ? 0 : (subtotal >= 299 ? 0 : 24.9);
    const discount = appliedCoupon ? Math.round(subtotal * (appliedCoupon / 100)) : 0;
    const total = subtotal - discount + shipping;

    summary.innerHTML = `
      <div class="cart-total-header">
        <span>Total</span>
        <strong>${ShopNow.money(total, true)}</strong>
      </div>
      <div class="cart-summary-rows">
        <div class="summary-row"><span>Subtotal</span><span>${ShopNow.money(subtotal)}</span></div>
        ${discount ? `<div class="summary-row summary-row--discount"><span>Desconto (${appliedCoupon}%)</span><span>−${ShopNow.money(discount)}</span></div>` : ''}
        <div class="summary-row"><span>Frete</span><span class="${shipping === 0 ? 'text-green' : ''}">${shipping === 0 ? 'Grátis' : ShopNow.money(shipping, true)}</span></div>
      </div>
      <div class="coupon-section">
        <div class="coupon-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          <span>Cupom de desconto</span>
        </div>
        <div class="coupon-row">
          <input class="field" placeholder="Ex: SHOP10" data-coupon-input value="${appliedCoupon ? 'SHOP10' : ''}">
          <button class="btn btn-dark" type="button" data-coupon-apply>Aplicar</button>
        </div>
        <p class="coupon-hint">Use o cupom <strong>SHOP10</strong> para 10% de desconto!</p>
      </div>
      <a class="btn btn-primary cart-checkout-btn" href="checkout.html">Finalizar Pedido →</a>
      <p class="cart-secure-msg">🔒 Pagamento 100% seguro e criptografado</p>
    `;

    summary.querySelector('[data-coupon-apply]')?.addEventListener('click', () => {
      const val = summary.querySelector('[data-coupon-input]')?.value.trim().toUpperCase();
      if (COUPON[val]) {
        appliedCoupon = COUPON[val];
        ShopNow.toast(`Cupom ${val} aplicado! ${COUPON[val]}% de desconto`);
        renderSummary();
      } else {
        ShopNow.toast('Cupom inválido ou expirado');
      }
    });
  }

  list.addEventListener('click', event => {
    const inc = event.target.closest('[data-cart-inc]');
    const dec = event.target.closest('[data-cart-dec]');
    const remove = event.target.closest('[data-cart-remove]');

    if (inc || dec) {
      const id = inc ? inc.dataset.cartInc : dec.dataset.cartDec;
      const item = ShopNow.cart().find(c => c.id === id);
      if (item) {
        ShopNow.updateQty(id, item.qty + (inc ? 1 : -1));
        renderItems();
      }
    }

    if (remove) {
      ShopNow.updateQty(remove.dataset.cartRemove, 0);
      renderItems();
    }
  });

  renderItems();
});
