// ============================================================
// UI: CHECKOUT E CONFIRMACAO
// Fecha pedido, salva confirmacao local e limpa carrinho.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const checkoutSummary = document.querySelector('[data-checkout-summary]');
  const checkoutForm = document.querySelector('[data-checkout-form]');
  const confirmation = document.querySelector('[data-confirmation]');

  // ---------------------------------------------------------
  // Resumo do pedido — lista itens com qtd e preço + subtotal/frete/total.
  // Frete grátis para compras acima de R$ 299.
  // ---------------------------------------------------------
  if (checkoutSummary) {
    const items = ShopNow.cartItems();
    const subtotal = ShopNow.cartTotal();
    const shipping = subtotal >= 299 ? 0 : 24.9;
    const total = subtotal + shipping;
    checkoutSummary.innerHTML = '';

    const title = document.createElement('h2');
    title.className = 'checkout-summary__title';
    title.textContent = 'Resumo do pedido';
    checkoutSummary.appendChild(title);

    const itemsGrid = document.createElement('div');
    itemsGrid.className = 'checkout-summary__items';

    items.forEach(item => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'checkout-summary__item';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = `${item.qty}x ${item.product.name}`;
      rowDiv.appendChild(nameSpan);

      const priceSpan = document.createElement('span');
      priceSpan.className = 'checkout-summary__item-price';
      priceSpan.textContent = ShopNow.money(item.product.price * item.qty);
      rowDiv.appendChild(priceSpan);

      itemsGrid.appendChild(rowDiv);
    });
    checkoutSummary.appendChild(itemsGrid);

    const totalsDiv = document.createElement('div');
    totalsDiv.className = 'checkout-summary__totals';

    // Subtotal
    const subtotalRow = document.createElement('div');
    subtotalRow.className = 'summary-row';
    const subtotalLabel = document.createElement('span');
    subtotalLabel.textContent = 'Subtotal';
    subtotalRow.appendChild(subtotalLabel);
    const subtotalValue = document.createElement('span');
    subtotalValue.className = 'checkout-summary__row-value';
    subtotalValue.textContent = ShopNow.money(subtotal);
    subtotalRow.appendChild(subtotalValue);
    totalsDiv.appendChild(subtotalRow);

    // Frete
    const shippingRow = document.createElement('div');
    shippingRow.className = 'summary-row';
    const shippingLabel = document.createElement('span');
    shippingLabel.textContent = 'Frete';
    shippingRow.appendChild(shippingLabel);
    const shippingValue = document.createElement('span');
    shippingValue.className = 'checkout-summary__row-value';
    if (shipping === 0) {
      shippingValue.style.color = 'var(--green)';
      shippingValue.textContent = 'Grátis';
    } else {
      shippingValue.textContent = ShopNow.money(shipping, true);
    }
    shippingRow.appendChild(shippingValue);
    totalsDiv.appendChild(shippingRow);

    // Total
    const totalRow = document.createElement('div');
    totalRow.className = 'checkout-summary__total-row';
    const totalLabel = document.createElement('span');
    totalLabel.className = 'checkout-summary__total-label';
    totalLabel.textContent = 'Total';
    totalRow.appendChild(totalLabel);
    const totalValue = document.createElement('strong');
    totalValue.className = 'checkout-summary__total-value';
    totalValue.textContent = ShopNow.money(total, true);
    totalRow.appendChild(totalValue);
    totalsDiv.appendChild(totalRow);

    checkoutSummary.appendChild(totalsDiv);
  }

  // ---------------------------------------------------------
  // Formulário de checkout — ao submeter, salva o pedido no
  // localStorage, limpa o carrinho e redireciona à confirmação.
  // ---------------------------------------------------------
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', event => {
      event.preventDefault();
      const order = {
        id: `#${Math.floor(13000 + Math.random() * 900)}`,
        total: ShopNow.cartTotal(),
        date: new Date().toISOString(),
      };
      localStorage.setItem('shopnow-last-order', JSON.stringify(order));
      ShopNow.clearCart();
      window.location.href = 'confirmation.html';
    });

    document.querySelectorAll('[data-payment-option]').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('[data-payment-option]').forEach(item => item.classList.remove('is-active'));
        option.classList.add('is-active');
      });
    });

    // ---------------------------------------------------------
    // Validação de CEP via ViaCEP — formata o input enquanto o
    // usuário digita e consulta a API ao completar os 8 dígitos.
    // Preenche logradouro, bairro, cidade e UF automaticamente.
    // Os campos de endereço ficam disabled até um CEP válido.
    // ---------------------------------------------------------
    const cepInput    = checkoutForm.querySelector('[data-cep-input]');
    const cepStatus   = checkoutForm.querySelector('[data-cep-status]');
    const cepStreet   = checkoutForm.querySelector('[data-cep-street]');
    const cepDistrict = checkoutForm.querySelector('[data-cep-district]');
    const cepCity     = checkoutForm.querySelector('[data-cep-city]');
    const cepState    = checkoutForm.querySelector('[data-cep-state]');

    // Limpa e desabilita os campos de endereço
    function clearAddress() {
      [cepStreet, cepDistrict, cepCity, cepState].forEach(el => {
        el.value = '';
        el.disabled = true;
      });
    }

    // Preenche os campos com os dados retornados pela ViaCEP e habilita edição
    function fillAddress(data) {
      cepStreet.value   = data.logradouro || '';
      cepDistrict.value = data.bairro     || '';
      cepCity.value     = data.localidade || '';
      cepState.value    = data.uf         || '';
      [cepStreet, cepDistrict, cepCity, cepState].forEach(el => el.disabled = false);
      cepStatus.textContent = '✓ Endereço encontrado';
      cepStatus.style.color = 'var(--green)';
    }

    cepInput?.addEventListener('input', () => {
      // Formata enquanto digita: 12345-678
      let v = cepInput.value.replace(/\D/g, '').slice(0, 8);
      if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
      cepInput.value = v;

      const digits = v.replace(/\D/g, '');

      // Menos de 8 dígitos: limpa tudo sem chamar a API
      if (digits.length < 8) {
        clearAddress();
        cepStatus.textContent = '';
        return;
      }

      // 8 dígitos completos: consulta a API
      cepStatus.textContent = 'Buscando...';
      cepStatus.style.color = 'var(--muted)';
      clearAddress();

      fetch(`https://viacep.com.br/ws/${digits}/json/`)
        .then(res => res.json())
        .then(data => {
          if (data.erro) {
            cepStatus.textContent = 'CEP não encontrado';
            cepStatus.style.color = 'var(--red)';
          } else {
            fillAddress(data);
          }
        })
        .catch(() => {
          cepStatus.textContent = 'Erro ao buscar CEP';
          cepStatus.style.color = 'var(--red)';
        });
    });
  }

  // ---------------------------------------------------------
  // Página de confirmação — lê o pedido salvo no localStorage
  // e exibe ID, total e botões de ação.
  // ---------------------------------------------------------
  if (confirmation) {
    const order = JSON.parse(localStorage.getItem('shopnow-last-order') || '{}');

    confirmation.innerHTML = '';

    const h1 = document.createElement('h1');
    h1.textContent = 'Pedido confirmado';
    confirmation.appendChild(h1);

    const descP = document.createElement('p');
    descP.className = 'text-muted';
    descP.textContent = `Seu pedido ${order.id || '#12999'} foi registrado com sucesso.`;
    confirmation.appendChild(descP);

    const totalP = document.createElement('p');
    const totalStrong = document.createElement('strong');
    totalStrong.textContent = 'Total:';
    totalP.appendChild(totalStrong);
    totalP.appendChild(document.createTextNode(` ${ShopNow.money(order.total || 0)}`));
    confirmation.appendChild(totalP);

    const actionsDiv = document.createElement('div');
    actionsDiv.style.display = 'flex';
    actionsDiv.style.gap = '10px';
    actionsDiv.style.justifyContent = 'center';
    actionsDiv.style.flexWrap = 'wrap';
    actionsDiv.style.marginTop = '22px';

    const continueLink = document.createElement('a');
    continueLink.className = 'btn btn-primary';
    continueLink.href = '../index.html';
    continueLink.textContent = 'Continuar comprando';
    actionsDiv.appendChild(continueLink);

    const ordersLink = document.createElement('a');
    ordersLink.className = 'btn btn-ghost';
    ordersLink.href = 'account.html';
    ordersLink.textContent = 'Ver pedidos';
    actionsDiv.appendChild(ordersLink);

    confirmation.appendChild(actionsDiv);
  }
});
