// ============================================================
// UI: CONTA
// Lista pedidos recentes do cliente.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('[data-order-list]');
  if (!list) return;

  list.innerHTML = ShopData.orders().map(order => `
    <article class="order-card card">
      <strong class="text-brand">${order.id}</strong>
      <div>
        <strong>${order.items.map(item => item.name).join(', ')}</strong>
        <p class="text-muted" style="margin:4px 0">${order.date} - ${order.paymentMethod}</p>
      </div>
      <div style="text-align:right">
        ${ShopNow.statusBadge(order.status)}
        <p style="margin:8px 0 0"><strong>${ShopNow.money(order.total)}</strong></p>
      </div>
    </article>
  `).join('');
});
