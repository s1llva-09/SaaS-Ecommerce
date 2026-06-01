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

  const STORE_ADDRESS_FALLBACK = 'Rua das Flores, 1234 - Seg-Sáb 9h-20h, Dom 10h-18h';
  const HOME_DELIVERY_ENABLED = false;
  let delivery = HOME_DELIVERY_ENABLED ? 'home' : 'pickup';
  let appliedCoupon = null;

  function getStoreAddress() {
    const settings = ShopData.settings();
    const address = settings?.geral?.address?.trim();
    const hours = settings?.geral?.businessHours?.trim();
    if (address && hours) {
      return `${address} - ${hours}`;
    }
    return STORE_ADDRESS_FALLBACK;
  }

  function renderItems() {
    const items = ShopNow.cartItems();
    const totalQty = items.reduce((total, item) => total + item.qty, 0);
    if (titleEl) titleEl.textContent = `Meu carrinho (${totalQty} ${totalQty === 1 ? 'item' : 'itens'})`;

    if (!items.length) {
      page?.classList.add('is-empty');
      list.innerHTML = '';

      const empty = document.createElement('div');
      empty.className = 'cart-empty card';
      empty.innerHTML = `
        <div class="cart-empty__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <h1>Seu carrinho está vazio</h1>
        <p>Adicione produtos para continuar comprando.</p>
        <a class="btn btn-primary" href="products.html">Explorar produtos</a>
      `;

      list.appendChild(empty);
      summary.hidden = true;
      return;
    }

    page?.classList.remove('is-empty');
    summary.hidden = false;
    list.innerHTML = '';

    items.forEach(item => {
      list.appendChild(cartItem(item));
    });

    renderDelivery();
    renderSummary();
  }

  function cartItem(item) {
    const article = document.createElement('article');
    article.className = 'cart-item card';

    const img = document.createElement('img');
    img.src = item.product.image;
    img.alt = item.product.name;
    article.appendChild(img);

    const info = document.createElement('div');
    info.className = 'cart-item__info';

    const name = document.createElement('strong');
    name.className = 'cart-item__name';
    name.textContent = item.product.name;
    info.appendChild(name);

    const price = document.createElement('p');
    price.className = 'text-muted cart-item__price';
    price.textContent = ShopNow.money(item.product.price);
    info.appendChild(price);

    const qty = document.createElement('div');
    qty.className = 'qty-control';

    const decBtn = document.createElement('button');
    decBtn.type = 'button';
    decBtn.dataset.cartDec = item.id;
    decBtn.setAttribute('aria-label', 'Diminuir quantidade');
    decBtn.textContent = '−';
    if (item.qty <= 1) decBtn.disabled = true;

    const qtyValue = document.createElement('span');
    qtyValue.textContent = item.qty;

    const incBtn = document.createElement('button');
    incBtn.type = 'button';
    incBtn.dataset.cartInc = item.id;
    incBtn.setAttribute('aria-label', 'Aumentar quantidade');
    incBtn.textContent = '+';
    if (item.qty >= item.product.stock) incBtn.disabled = true;

    qty.appendChild(decBtn);
    qty.appendChild(qtyValue);
    qty.appendChild(incBtn);
    info.appendChild(qty);
    article.appendChild(info);

    const right = document.createElement('div');
    right.className = 'cart-item__right';

    const total = document.createElement('strong');
    total.className = 'cart-item__total';
    total.textContent = ShopNow.money(item.product.price * item.qty);
    right.appendChild(total);

    const remove = document.createElement('button');
    remove.className = 'cart-item__remove';
    remove.dataset.cartRemove = item.id;
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Remover item');
    remove.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`;
    right.appendChild(remove);

    article.appendChild(right);
    return article;
  }

  function renderDelivery() {
    list.querySelector('[data-delivery-section]')?.remove();

    const section = document.createElement('div');
    section.dataset.deliverySection = '';
    section.className = 'cart-delivery card';

    const title = document.createElement('h2');
    title.className = 'cart-delivery__title';
    title.textContent = 'Como deseja receber?';
    section.appendChild(title);

    const tabs = document.createElement('div');
    tabs.className = 'delivery-tabs';
    tabs.appendChild(deliveryTab({
      type: 'home',
      title: 'Receber em casa',
      subtitle: HOME_DELIVERY_ENABLED ? '2-5 dias úteis' : 'Em breve',
      icon: '<rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8Z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
      disabled: !HOME_DELIVERY_ENABLED,
    }));
    tabs.appendChild(deliveryTab({
      type: 'pickup',
      title: 'Retirar na loja',
      subtitle: 'Grátis, pronto em 2h',
      icon: '<path d="M3 9 12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
    }));
    section.appendChild(tabs);

    if (delivery === 'pickup') {
      const address = document.createElement('div');
      address.className = 'delivery-address';
      address.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
      const span = document.createElement('span');
      const storeAddress = getStoreAddress();
      if (storeAddress.includes(' - ')) {
        const [street, hours] = storeAddress.split(' - ');
        const strong = document.createElement('strong');
        strong.textContent = street;
        span.appendChild(strong);
        span.appendChild(document.createTextNode(` - ${hours}`));
      } else {
        span.textContent = storeAddress;
      }
      address.appendChild(span);
      section.appendChild(address);
    } else {
      const cepRow = document.createElement('div');
      cepRow.className = 'delivery-cep';

      const cepInput = document.createElement('input');
      cepInput.className = 'field';
      cepInput.placeholder = 'Digite seu CEP';
      cepInput.maxLength = 9;
      cepInput.dataset.cepInput = '';
      cepRow.appendChild(cepInput);

      const calc = document.createElement('button');
      calc.className = 'btn btn-primary';
      calc.type = 'button';
      calc.dataset.cepCalc = '';
      calc.textContent = 'Calcular';
      cepRow.appendChild(calc);
      section.appendChild(cepRow);

      const result = document.createElement('p');
      result.className = 'delivery-cep__result';
      result.dataset.cepResult = '';
      section.appendChild(result);
    }

    list.appendChild(section);

    section.querySelectorAll('[data-delivery]').forEach(btn => {
      btn.addEventListener('click', () => {
        delivery = btn.dataset.delivery;
        renderItems();
      });
    });

    bindCep(section);
  }

  function deliveryTab({ type, title, subtitle, icon, disabled = false }) {
    const button = document.createElement('button');
    button.className = 'delivery-tab' + (delivery === type ? ' is-active' : '') + (disabled ? ' is-disabled' : '');
    button.dataset.delivery = type;
    button.type = 'button';
    button.disabled = disabled;
    button.title = disabled ? 'Opção não disponível no momento' : '';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
      <div>
        <strong>${title}</strong>
        <span>${subtitle}</span>
      </div>
    `;
    return button;
  }

  function bindCep(section) {
    const cepCalc = section.querySelector('[data-cep-calc]');
    if (!cepCalc) return;

    const cepInput = section.querySelector('[data-cep-input]');
    const cepResult = section.querySelector('[data-cep-result]');

    cepInput?.addEventListener('input', () => {
      let value = cepInput.value.replace(/\D/g, '').slice(0, 8);
      if (value.length > 5) value = `${value.slice(0, 5)}-${value.slice(5)}`;
      cepInput.value = value;
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
          ? 'Frete grátis para esse CEP.'
          : `Frete: ${ShopNow.money(shipping, true)} (2-5 dias úteis)`;
        cepResult.style.color = shipping === 0 ? 'var(--green)' : 'var(--text)';
        renderSummary();
      }, 450);
    });
  }

  function renderSummary() {
    const subtotal = ShopNow.cartTotal();
    const shipping = delivery === 'pickup' ? 0 : (subtotal >= 299 ? 0 : 24.9);
    const discount = appliedCoupon
      ? appliedCoupon.discountType === 'fixed'
        ? Math.min(subtotal, appliedCoupon.discountValue)
        : Math.round(subtotal * (appliedCoupon.discountValue / 100))
      : 0;
    const total = subtotal - discount + shipping;

    summary.innerHTML = '';

    const totalHeader = document.createElement('div');
    totalHeader.className = 'cart-total-header';
    totalHeader.innerHTML = `<span>Total</span><strong>${ShopNow.money(total, true)}</strong>`;
    summary.appendChild(totalHeader);

    const rows = document.createElement('div');
    rows.className = 'cart-summary-rows';
    rows.appendChild(summaryRow('Subtotal', ShopNow.money(subtotal)));
    if (discount) rows.appendChild(summaryRow(`Desconto (${appliedCoupon.code})`, `−${ShopNow.money(discount)}`, 'summary-row--discount'));
    rows.appendChild(summaryRow('Frete', shipping === 0 ? 'Grátis' : ShopNow.money(shipping, true), shipping === 0 ? 'text-green' : ''));
    summary.appendChild(rows);

    const couponValue = appliedCoupon
      ? String(appliedCoupon.code).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[char]))
      : '';
    const coupon = document.createElement('div');
    coupon.className = 'coupon-section';
    coupon.innerHTML = `
      <div class="coupon-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/></svg>
        <span>Cupom de desconto</span>
      </div>
      <div class="coupon-row">
        <input class="field" placeholder="Ex: CUPOM10" data-coupon-input value="${couponValue}">
        <button class="btn btn-dark" type="button" data-coupon-apply>Aplicar</button>
      </div>
    `;

    const hint = document.createElement('p');
    hint.className = 'coupon-hint';
    const firstCoupon = ShopData.coupons()[0];
    if (firstCoupon) {
      hint.textContent = 'Cupom disponível: ';
      const code = document.createElement('strong');
      code.textContent = firstCoupon.code;
      hint.appendChild(code);
    } else {
      hint.textContent = 'Nenhum cupom disponível no momento.';
    }
    coupon.appendChild(hint);
    summary.appendChild(coupon);

    const checkout = document.createElement('a');
    checkout.className = 'btn btn-primary cart-checkout-btn';
    checkout.href = 'checkout.html';
    checkout.textContent = 'Finalizar pedido';
    summary.appendChild(checkout);

    const secure = document.createElement('p');
    secure.className = 'cart-secure-msg';
    secure.textContent = 'Pagamento 100% seguro e criptografado';
    summary.appendChild(secure);

    summary.querySelector('[data-coupon-apply]')?.addEventListener('click', () => {
      const value = summary.querySelector('[data-coupon-input]')?.value.trim().toUpperCase();
      const today = new Date().toISOString().slice(0, 10);
      const couponFound = ShopData.coupons().find(item =>
        item.code === value &&
        (!item.expiryDate || item.expiryDate >= today) &&
        (!item.maxUses || item.uses < item.maxUses)
      );

      if (couponFound) {
        appliedCoupon = couponFound;
        ShopNow.toast(`Cupom ${value} aplicado`);
        renderSummary();
      } else {
        ShopNow.toast('Cupom inválido ou expirado');
      }
    });
  }

  function summaryRow(label, value, extraClass = '') {
    const row = document.createElement('div');
    row.className = `summary-row ${extraClass}`.trim();
    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    const valueSpan = document.createElement('span');
    valueSpan.textContent = value;
    if (extraClass === 'text-green') {
      row.className = 'summary-row';
      valueSpan.className = 'text-green';
    }
    row.appendChild(labelSpan);
    row.appendChild(valueSpan);
    return row;
  }

  list.addEventListener('click', event => {
    const inc = event.target.closest('[data-cart-inc]');
    const dec = event.target.closest('[data-cart-dec]');
    const remove = event.target.closest('[data-cart-remove]');

    if (inc || dec) {
      const id = inc ? inc.dataset.cartInc : dec.dataset.cartDec;
      const item = ShopNow.cart().find(cartItem => cartItem.id === id);
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

  async function initCartPage() {
    try {
      await ShopData.ready();
    } catch (error) {
      console.warn('ShopData.ready falhou no carrinho, continuando sem dados adicionais.', error);
    }
    ShopNow.updateCartCount();
    renderItems();
  }

  if (document.readyState !== 'loading') {
    initCartPage();
  } else {
    document.addEventListener('DOMContentLoaded', initCartPage);
    window.addEventListener('load', initCartPage, { once: true });
  }
});
