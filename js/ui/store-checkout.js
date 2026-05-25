// ============================================================
// UI: CHECKOUT E CONFIRMACAO
// Fecha pedido, salva confirmacao local e limpa carrinho.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const checkoutSummary = document.querySelector('[data-checkout-summary]');
  const checkoutForm = document.querySelector('[data-checkout-form]');
  const confirmation = document.querySelector('[data-confirmation]');

  if (checkoutSummary) {
    const items = ShopNow.cartItems();
    const subtotal = ShopNow.cartTotal();
    const shipping = subtotal >= 299 ? 0 : 24.9;
    const total = subtotal + shipping;
    checkoutSummary.style.padding = '22px';
    checkoutSummary.innerHTML = `
      <h2 style="margin:0 0 16px;font-size:16px;font-weight:900">Resumo do pedido</h2>
      <div style="display:grid;gap:10px;margin-bottom:16px">
        ${items.map(item => `
          <div style="display:flex;justify-content:space-between;gap:8px;font-size:13px;color:#6b7280">
            <span>${item.qty}x ${item.product.name}</span>
            <span style="font-weight:700;color:var(--text);white-space:nowrap">${ShopNow.money(item.product.price * item.qty)}</span>
          </div>`).join('')}
      </div>
      <div style="border-top:1px solid var(--line);padding-top:12px;display:grid;gap:8px">
        <div class="summary-row"><span>Subtotal</span><span style="font-weight:700">${ShopNow.money(subtotal)}</span></div>
        <div class="summary-row"><span>Frete</span><span style="font-weight:700;color:${shipping === 0 ? 'var(--green)' : 'inherit'}">${shipping === 0 ? 'Grátis' : ShopNow.money(shipping, true)}</span></div>
        <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--line)">
          <span style="font-weight:900;font-size:15px">Total</span>
          <strong style="font-size:20px;color:var(--brand)">${ShopNow.money(total, true)}</strong>
        </div>
      </div>
    `;
  }

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
  }

  if (confirmation) {
    const order = JSON.parse(localStorage.getItem('shopnow-last-order') || '{}');
    confirmation.innerHTML = `
      <h1>Pedido confirmado</h1>
      <p class="text-muted">Seu pedido ${order.id || '#12999'} foi registrado com sucesso.</p>
      <p><strong>Total:</strong> ${ShopNow.money(order.total || 0)}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:22px">
        <a class="btn btn-primary" href="../index.html">Continuar comprando</a>
        <a class="btn btn-ghost" href="account.html">Ver pedidos</a>
      </div>
    `;
  }
});
