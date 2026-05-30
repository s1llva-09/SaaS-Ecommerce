// ============================================================
// UI: CHECKOUT E CONFIRMACAO
// Fecha pedido, salva confirmacao local e limpa carrinho.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const checkoutSummary = document.querySelector('[data-checkout-summary]');
  const checkoutForm = document.querySelector('[data-checkout-form]');
  const confirmation = document.querySelector('[data-confirmation]');

  if (checkoutSummary) renderCheckoutSummary(checkoutSummary);
  if (checkoutForm) bindCheckoutForm(checkoutForm);
  if (confirmation) renderConfirmation(confirmation);
});

function renderCheckoutSummary(container) {
  const items = ShopNow.cartItems();
  const subtotal = ShopNow.cartTotal();
  const shipping = subtotal >= 299 ? 0 : 24.9;
  const total = subtotal + shipping;
  container.innerHTML = '';

  const title = document.createElement('h2');
  title.className = 'checkout-summary__title';
  title.textContent = 'Resumo do pedido';
  container.appendChild(title);

  const itemsGrid = document.createElement('div');
  itemsGrid.className = 'checkout-summary__items';
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'checkout-summary__item';

    const name = document.createElement('span');
    name.textContent = `${item.qty}x ${item.product.name}`;
    row.appendChild(name);

    const price = document.createElement('span');
    price.className = 'checkout-summary__item-price';
    price.textContent = ShopNow.money(item.product.price * item.qty);
    row.appendChild(price);

    itemsGrid.appendChild(row);
  });
  container.appendChild(itemsGrid);

  const totals = document.createElement('div');
  totals.className = 'checkout-summary__totals';
  totals.appendChild(summaryRow('Subtotal', ShopNow.money(subtotal)));
  totals.appendChild(summaryRow('Frete', shipping === 0 ? 'Grátis' : ShopNow.money(shipping, true), shipping === 0));

  const totalRow = document.createElement('div');
  totalRow.className = 'checkout-summary__total-row';
  totalRow.innerHTML = `<span class="checkout-summary__total-label">Total</span><strong class="checkout-summary__total-value">${ShopNow.money(total, true)}</strong>`;
  totals.appendChild(totalRow);
  container.appendChild(totals);
}

function summaryRow(label, value, isFree = false) {
  const row = document.createElement('div');
  row.className = 'summary-row';
  const labelSpan = document.createElement('span');
  labelSpan.textContent = label;
  const valueSpan = document.createElement('span');
  valueSpan.className = 'checkout-summary__row-value';
  if (isFree) valueSpan.style.color = 'var(--green)';
  valueSpan.textContent = value;
  row.appendChild(labelSpan);
  row.appendChild(valueSpan);
  return row;
}

function bindCheckoutForm(checkoutForm) {
  checkoutForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(checkoutForm);
    const items = ShopNow.cartItems();
    const subtotal = ShopNow.cartTotal();
    const shipping = subtotal >= 299 ? 0 : 24.9;
    const paymentOptions = [...document.querySelectorAll('[data-payment-option]')];
    const activePaymentIndex = Math.max(0, paymentOptions.findIndex(option => option.classList.contains('is-active')));
    const paymentMethod = ['Cartão', 'PIX', 'Boleto'][activePaymentIndex] || 'Cartão';

    const order = {
      id: `#${Math.floor(13000 + Math.random() * 900)}`,
      customer: formData.get('customerName') || '',
      email: formData.get('email') || '',
      items: items.map(item => ({
        name: item.product.name,
        qty: item.qty,
        price: item.product.price,
      })),
      total: subtotal + shipping,
      paymentMethod,
      type: 'delivery',
      status: 'pending',
      date: new Date().toISOString().slice(0, 10),
      city: checkoutForm.querySelector('[data-cep-city]')?.value || '',
    };

    ShopData.addOrder(order);
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

  bindCepLookup(checkoutForm);
}

function bindCepLookup(checkoutForm) {
  const cepInput = checkoutForm.querySelector('[data-cep-input]');
  const cepStatus = checkoutForm.querySelector('[data-cep-status]');
  const cepStreet = checkoutForm.querySelector('[data-cep-street]');
  const cepDistrict = checkoutForm.querySelector('[data-cep-district]');
  const cepCity = checkoutForm.querySelector('[data-cep-city]');
  const cepState = checkoutForm.querySelector('[data-cep-state]');

  function clearAddress() {
    [cepStreet, cepDistrict, cepCity, cepState].forEach(el => {
      if (!el) return;
      el.value = '';
      el.disabled = true;
    });
  }

  function fillAddress(data) {
    cepStreet.value = data.logradouro || '';
    cepDistrict.value = data.bairro || '';
    cepCity.value = data.localidade || '';
    cepState.value = data.uf || '';
    [cepStreet, cepDistrict, cepCity, cepState].forEach(el => { el.disabled = false; });
    cepStatus.textContent = 'Endereço encontrado';
    cepStatus.style.color = 'var(--green)';
  }

  cepInput?.addEventListener('input', () => {
    let value = cepInput.value.replace(/\D/g, '').slice(0, 8);
    if (value.length > 5) value = `${value.slice(0, 5)}-${value.slice(5)}`;
    cepInput.value = value;

    const digits = value.replace(/\D/g, '');
    if (digits.length < 8) {
      clearAddress();
      cepStatus.textContent = '';
      return;
    }

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

function renderConfirmation(container) {
  const order = JSON.parse(localStorage.getItem('shopnow-last-order') || '{}');
  container.innerHTML = '';

  const title = document.createElement('h1');
  title.textContent = 'Pedido confirmado';
  container.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'text-muted';
  desc.textContent = `Seu pedido ${order.id || '#12999'} foi registrado com sucesso.`;
  container.appendChild(desc);

  const total = document.createElement('p');
  const label = document.createElement('strong');
  label.textContent = 'Total:';
  total.appendChild(label);
  total.appendChild(document.createTextNode(` ${ShopNow.money(order.total || 0)}`));
  container.appendChild(total);

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:22px';

  const continueLink = document.createElement('a');
  continueLink.className = 'btn btn-primary';
  continueLink.href = '../index.html';
  continueLink.textContent = 'Continuar comprando';
  actions.appendChild(continueLink);

  const ordersLink = document.createElement('a');
  ordersLink.className = 'btn btn-ghost';
  ordersLink.href = 'account.html';
  ordersLink.textContent = 'Ver pedidos';
  actions.appendChild(ordersLink);

  container.appendChild(actions);
}
