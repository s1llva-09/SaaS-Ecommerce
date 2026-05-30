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

  const STORE_ADDRESS = 'Rua das Flores, 1234 — Seg-Sáb 9h-20h, Dom 10h-18h';
  let delivery = 'home';
  let appliedCoupon = null;

  // ---------------------------------------------------------
  // Renderiza os itens do carrinho ou o estado vazio.
  // Atualiza o título com a contagem total de itens.
  // Chama renderDelivery() e renderSummary() ao final.
  // ---------------------------------------------------------
  function renderItems() {
    const items = ShopNow.cartItems();
    const count = items.reduce((n, i) => n + i.qty, 0);
    if (titleEl) titleEl.textContent = `Meu Carrinho (${count} ${count === 1 ? 'item' : 'itens'})`;

    if (!items.length) {
      page?.classList.add('is-empty');

      list.innerHTML = '';
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'cart-empty';

      const iconDiv = document.createElement('div');
      iconDiv.className = 'cart-empty__icon';
      iconDiv.setAttribute('aria-hidden', 'true');
      // SVG de carrinho vazio — estático, sem dados do usuário
      iconDiv.innerHTML = `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>`;
      emptyDiv.appendChild(iconDiv);

      const emptyTitle = document.createElement('h1');
      emptyTitle.textContent = 'Seu carrinho está vazio';
      emptyDiv.appendChild(emptyTitle);

      const emptyText = document.createElement('p');
      emptyText.textContent = 'Adicione produtos para continuar comprando';
      emptyDiv.appendChild(emptyText);

      const exploreLink = document.createElement('a');
      exploreLink.className = 'btn btn-primary';
      exploreLink.href = 'products.html';
      exploreLink.textContent = 'Explorar Produtos';
      emptyDiv.appendChild(exploreLink);

      list.appendChild(emptyDiv);
      summary.hidden = true;
      return;
    }

    page?.classList.remove('is-empty');
    summary.hidden = false;

    list.innerHTML = '';

    items.forEach(item => {
      const article = document.createElement('article');
      article.className = 'cart-item card';

      const img = document.createElement('img');
      img.src = item.product.image;
      img.alt = item.product.name;
      article.appendChild(img);

      const infoDiv = document.createElement('div');
      infoDiv.className = 'cart-item__info';

      const nameStrong = document.createElement('strong');
      nameStrong.className = 'cart-item__name';
      nameStrong.textContent = item.product.name;
      infoDiv.appendChild(nameStrong);

      const priceP = document.createElement('p');
      priceP.className = 'text-muted cart-item__price';
      priceP.textContent = ShopNow.money(item.product.price);
      infoDiv.appendChild(priceP);

      const qtyDiv = document.createElement('div');
      qtyDiv.className = 'qty-control';

      const decBtn = document.createElement('button');
      decBtn.dataset.cartDec = item.id;
      decBtn.setAttribute('aria-label', 'Diminuir');
      decBtn.textContent = '−';
      qtyDiv.appendChild(decBtn);

      const qtySpan = document.createElement('span');
      qtySpan.textContent = String(item.qty);
      qtyDiv.appendChild(qtySpan);

      const incBtn = document.createElement('button');
      incBtn.dataset.cartInc = item.id;
      incBtn.setAttribute('aria-label', 'Aumentar');
      incBtn.textContent = '+';
      qtyDiv.appendChild(incBtn);

      infoDiv.appendChild(qtyDiv);
      article.appendChild(infoDiv);

      const rightDiv = document.createElement('div');
      rightDiv.className = 'cart-item__right';

      const totalStrong = document.createElement('strong');
      totalStrong.className = 'cart-item__total';
      totalStrong.textContent = ShopNow.money(item.product.price * item.qty);
      rightDiv.appendChild(totalStrong);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'cart-item__remove';
      removeBtn.dataset.cartRemove = item.id;
      removeBtn.setAttribute('aria-label', 'Remover item');
      // SVG de lixeira — estático, sem dados do usuário
      removeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>`;
      rightDiv.appendChild(removeBtn);

      article.appendChild(rightDiv);
      list.appendChild(article);
    });

    renderDelivery();
    renderSummary();
  }

  // ---------------------------------------------------------
  // Renderiza a seção de entrega: tabs (casa/retirada) + formulário de CEP.
  // Remove e recria a seção a cada chamada para refletir o modo atual.
  // ---------------------------------------------------------
  function renderDelivery() {
    const existing = list.querySelector('[data-delivery-section]');
    if (existing) existing.remove();

    const section = document.createElement('div');
    section.dataset.deliverySection = '';
    section.className = 'cart-delivery card';

    const deliveryTitle = document.createElement('h2');
    deliveryTitle.className = 'cart-delivery__title';
    deliveryTitle.textContent = 'Como deseja receber?';
    section.appendChild(deliveryTitle);

    const tabsDiv = document.createElement('div');
    tabsDiv.className = 'delivery-tabs';

    // Botão Receber em casa — SVG e textos estáticos
    const homeBtn = document.createElement('button');
    homeBtn.className = 'delivery-tab' + (delivery === 'home' ? ' is-active' : '');
    homeBtn.dataset.delivery = 'home';
    homeBtn.type = 'button';
    homeBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      <div>
        <strong>Receber em casa</strong>
        <span>2-5 dias úteis</span>
      </div>`;
    tabsDiv.appendChild(homeBtn);

    // Botão Retirar na loja — SVG e textos estáticos
    const pickupBtn = document.createElement('button');
    pickupBtn.className = 'delivery-tab' + (delivery === 'pickup' ? ' is-active' : '');
    pickupBtn.dataset.delivery = 'pickup';
    pickupBtn.type = 'button';
    pickupBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <div>
        <strong>Retirar na loja</strong>
        <span>Grátis — pronto em 2h</span>
      </div>`;
    tabsDiv.appendChild(pickupBtn);

    section.appendChild(tabsDiv);

    if (delivery === 'pickup') {
      const addressDiv = document.createElement('div');
      addressDiv.className = 'delivery-address';
      // SVG de pin — estático
      addressDiv.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';

      const addressSpan = document.createElement('span');
      const parts = STORE_ADDRESS.split(' — ');
      const addrStrong = document.createElement('strong');
      addrStrong.textContent = parts[0];
      addressSpan.appendChild(addrStrong);
      addressSpan.appendChild(document.createTextNode(` — ${parts[1]}`));
      addressDiv.appendChild(addressSpan);

      section.appendChild(addressDiv);
    } else {
      const cepDiv = document.createElement('div');
      cepDiv.className = 'delivery-cep';

      const cepInput = document.createElement('input');
      cepInput.className = 'field';
      cepInput.id = 'cep-input';
      cepInput.placeholder = 'Digite seu CEP';
      cepInput.maxLength = 9;
      cepInput.dataset.cepInput = '';
      cepDiv.appendChild(cepInput);

      const cepCalcBtn = document.createElement('button');
      cepCalcBtn.className = 'btn btn-primary';
      cepCalcBtn.type = 'button';
      cepCalcBtn.dataset.cepCalc = '';
      cepCalcBtn.textContent = 'Calcular';
      cepDiv.appendChild(cepCalcBtn);

      section.appendChild(cepDiv);

      const cepResult = document.createElement('p');
      cepResult.className = 'delivery-cep__result';
      cepResult.dataset.cepResult = '';
      section.appendChild(cepResult);
    }

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

  // ---------------------------------------------------------
  // Renderiza o painel lateral: subtotal, desconto, frete, cupom e checkout.
  // Recalcula tudo com base no modo de entrega e cupom aplicado.
  // ---------------------------------------------------------
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

    // Cabeçalho Total
    const totalHeader = document.createElement('div');
    totalHeader.className = 'cart-total-header';
    const totalHeaderLabel = document.createElement('span');
    totalHeaderLabel.textContent = 'Total';
    totalHeader.appendChild(totalHeaderLabel);
    const totalHeaderValue = document.createElement('strong');
    totalHeaderValue.textContent = ShopNow.money(total, true);
    totalHeader.appendChild(totalHeaderValue);
    summary.appendChild(totalHeader);

    // Linhas de subtotal/desconto/frete
    const rowsDiv = document.createElement('div');
    rowsDiv.className = 'cart-summary-rows';

    const subtotalRow = document.createElement('div');
    subtotalRow.className = 'summary-row';
    const subtotalLabel = document.createElement('span');
    subtotalLabel.textContent = 'Subtotal';
    subtotalRow.appendChild(subtotalLabel);
    const subtotalValue = document.createElement('span');
    subtotalValue.textContent = ShopNow.money(subtotal);
    subtotalRow.appendChild(subtotalValue);
    rowsDiv.appendChild(subtotalRow);

    if (discount) {
      const discountRow = document.createElement('div');
      discountRow.className = 'summary-row summary-row--discount';
      const discountLabel = document.createElement('span');
      discountLabel.textContent = `Desconto (${appliedCoupon.code})`;
      discountRow.appendChild(discountLabel);
      const discountValue = document.createElement('span');
      discountValue.textContent = `−${ShopNow.money(discount)}`;
      discountRow.appendChild(discountValue);
      rowsDiv.appendChild(discountRow);
    }

    const shippingRow = document.createElement('div');
    shippingRow.className = 'summary-row';
    const shippingLabel = document.createElement('span');
    shippingLabel.textContent = 'Frete';
    shippingRow.appendChild(shippingLabel);
    const shippingValue = document.createElement('span');
    if (shipping === 0) shippingValue.className = 'text-green';
    shippingValue.textContent = shipping === 0 ? 'Grátis' : ShopNow.money(shipping, true);
    shippingRow.appendChild(shippingValue);
    rowsDiv.appendChild(shippingRow);

    summary.appendChild(rowsDiv);

    // Seção cupom
    const couponSection = document.createElement('div');
    couponSection.className = 'coupon-section';

    const couponLabelDiv = document.createElement('div');
    couponLabelDiv.className = 'coupon-label';
    // SVG de tag — estático
    couponLabelDiv.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
    const couponLabelSpan = document.createElement('span');
    couponLabelSpan.textContent = 'Cupom de desconto';
    couponLabelDiv.appendChild(couponLabelSpan);
    couponSection.appendChild(couponLabelDiv);

    const couponRow = document.createElement('div');
    couponRow.className = 'coupon-row';

    const couponInput = document.createElement('input');
    couponInput.className = 'field';
    couponInput.placeholder = 'Ex: CUPOM10';
    couponInput.dataset.couponInput = '';
    couponInput.value = appliedCoupon ? appliedCoupon.code : '';
    couponRow.appendChild(couponInput);

    const applyBtn = document.createElement('button');
    applyBtn.className = 'btn btn-dark';
    applyBtn.type = 'button';
    applyBtn.dataset.couponApply = '';
    applyBtn.textContent = 'Aplicar';
    couponRow.appendChild(applyBtn);

    couponSection.appendChild(couponRow);

    const couponHint = document.createElement('p');
    couponHint.className = 'coupon-hint';
    const firstCoupon = ShopData.coupons()[0];
    if (firstCoupon) {
      couponHint.textContent = 'Cupom disponivel: ';
      const couponCode = document.createElement('strong');
      couponCode.textContent = firstCoupon.code;
      couponHint.appendChild(couponCode);
    } else {
      couponHint.textContent = 'Nenhum cupom disponivel no momento.';
    }
    couponSection.appendChild(couponHint);

    summary.appendChild(couponSection);

    // Botão finalizar
    const checkoutLink = document.createElement('a');
    checkoutLink.className = 'btn btn-primary cart-checkout-btn';
    checkoutLink.href = 'checkout.html';
    checkoutLink.textContent = 'Finalizar Pedido →';
    summary.appendChild(checkoutLink);

    // Mensagem segurança
    const secureMsg = document.createElement('p');
    secureMsg.className = 'cart-secure-msg';
    secureMsg.textContent = '🔒 Pagamento 100% seguro e criptografado';
    summary.appendChild(secureMsg);

    summary.querySelector('[data-coupon-apply]')?.addEventListener('click', () => {
      const val = summary.querySelector('[data-coupon-input]')?.value.trim().toUpperCase();
      const today = new Date().toISOString().slice(0, 10);
      const coupon = ShopData.coupons().find(item =>
        item.code === val &&
        (!item.expiryDate || item.expiryDate >= today) &&
        (!item.maxUses || item.uses < item.maxUses)
      );

      if (coupon) {
        appliedCoupon = coupon;
        ShopNow.toast(`Cupom ${val} aplicado!`);
        renderSummary();
      } else {
        ShopNow.toast('Cupom inválido ou expirado');
      }
    });
  }

  // Delegação de cliques para + / − (quantidade) e lixeira (remover item).
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
