// ============================================================
// UI ADMIN: PEDIDOS
// Tabela com ITENS/PAGAMENTO/TIPO, filtros com contagem e drawer.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('[data-admin-orders]');
  const filters = document.querySelectorAll('[data-order-filter]');
  const searchInput = document.querySelector('[data-orders-search]');
  if (!tbody) return;

  // ---- Drawer ----
  const drawer = document.createElement('div');
  drawer.className = 'order-drawer';
  document.body.appendChild(drawer);

  function closeDrawer() {
    drawer.classList.remove('is-open');
    tbody.querySelectorAll('tr.is-selected').forEach(r => r.classList.remove('is-selected'));
  }

  const STATUS_COLORS = {
    'badge-green':  { bg: 'rgba(22,163,74,.2)',   text: '#4ade80' },
    'badge-indigo': { bg: 'rgba(99,102,241,.2)',   text: '#818cf8' },
    'badge-blue':   { bg: 'rgba(37,99,235,.2)',    text: '#60a5fa' },
    'badge-amber':  { bg: 'rgba(217,119,6,.2)',    text: '#fbbf24' },
    'badge-red':    { bg: 'rgba(220,38,38,.2)',    text: '#f87171' },
  };

  function getTimeline(order) {
    if (order.type === 'pickup') {
      const steps = [
        { label: 'Pedido criado', date: order.date },
        { label: 'Pagamento confirmado', date: null },
        { label: 'Pronto para retirada', date: null },
        { label: 'Retirado', date: null },
      ];
      const done = { pending: 0, paid: 1, ready: 2, delivered: 3, cancelled: 0 };
      const n = done[order.status] ?? 0;
      return steps.map((s, i) => ({ ...s, done: i <= n }));
    }
    const steps = [
      { label: 'Pedido criado', date: order.date },
      { label: 'Pagamento confirmado', date: order.status !== 'pending' ? order.date : null },
      { label: 'Enviado', date: null },
      { label: 'Entregue', date: null },
    ];
    const done = { pending: 0, paid: 1, shipped: 2, delivered: 3, cancelled: 0 };
    const n = done[order.status] ?? 0;
    return steps.map((s, i) => ({ ...s, done: i <= n }));
  }

  function getActions(order) {
    if (['delivered', 'cancelled'].includes(order.status)) return '';
    const btns = [];
    if (order.status === 'paid') {
      const label = order.type === 'pickup' ? 'Marcar como pronto' : 'Marcar como enviado';
      btns.push(`<button class="btn-confirm-delivery" style="background:var(--brand)" data-order-action="advance" data-order-id="${order.id}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>
        ${label}
      </button>`);
    } else if (order.status === 'shipped') {
      btns.push(`<button class="btn-confirm-delivery" data-order-action="advance" data-order-id="${order.id}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>
        Confirmar entrega
      </button>`);
    } else if (order.status === 'ready') {
      btns.push(`<button class="btn-confirm-delivery" data-order-action="advance" data-order-id="${order.id}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>
        Confirmar retirada
      </button>`);
    }
    btns.push(`<button class="btn-cancel-order" data-order-action="cancel" data-order-id="${order.id}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
      Cancelar pedido
    </button>`);
    return `<div class="drawer-actions">${btns.join('')}</div>`;
  }

  function openDrawer(order) {
    const cfg = ShopData.status()[order.status] || { label: order.status, cls: 'badge-blue' };
    const sc = STATUS_COLORS[cfg.cls] || STATUS_COLORS['badge-blue'];
    const timeline = getTimeline(order);

    drawer.innerHTML = `
      <div class="order-drawer__head">
        <div>
          <div class="order-drawer__id">${order.id}</div>
          <div class="order-drawer__date">${order.date}</div>
        </div>
        <button class="order-drawer__close" data-drawer-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="order-drawer__status-bar">
        <span style="display:block;padding:10px;border-radius:10px;text-align:center;font-weight:900;font-size:13px;background:${sc.bg};color:${sc.text};letter-spacing:.04em">${cfg.label}</span>
      </div>
      <div class="order-drawer__body">
        <div>
          <p class="drawer-section__label">Cliente</p>
          <div class="drawer-customer__name">${order.customer}</div>
          <div class="drawer-customer__info">${order.email}<br>${order.city}</div>
        </div>
        <div>
          <p class="drawer-section__label">Itens do pedido</p>
          <div class="drawer-items">
            ${order.items.map(item => `
              <div class="drawer-item">
                <span>${item.name} × ${item.qty}</span>
                <strong>${ShopNow.money(item.price * item.qty)}</strong>
              </div>`).join('')}
          </div>
          <div class="drawer-total">
            <span>Total</span>
            <strong style="color:var(--admin-text)">${ShopNow.money(order.total)}</strong>
          </div>
        </div>
        <div>
          <p class="drawer-section__label">Pagamento e entrega</p>
          <div class="drawer-payment">
            <div class="drawer-payment__row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              ${order.paymentMethod}
            </div>
            <div class="drawer-payment__row">
              ${order.type === 'pickup'
                ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
                : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="19" r="1"/><circle cx="20" cy="19" r="1"/></svg>'}
              ${order.type === 'pickup' ? 'Retirada na loja' : 'Entrega em domicílio'}
            </div>
          </div>
        </div>
        <div>
          <p class="drawer-section__label">Linha do tempo</p>
          <div class="drawer-timeline">
            ${timeline.map(step => `
              <div class="timeline-step ${step.done ? 'is-done' : ''}">
                <div class="timeline-dot">
                  ${step.done ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
                </div>
                <div>
                  <div class="timeline-label">${step.label}</div>
                  ${step.date && step.done ? `<div class="timeline-date">${step.date}</div>` : ''}
                </div>
              </div>`).join('')}
          </div>
        </div>
        ${getActions(order)}
      </div>
    `;

    drawer.querySelector('[data-drawer-close]').addEventListener('click', closeDrawer);
    drawer.querySelectorAll('[data-order-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.orderAction;
        if (action === 'advance') ShopNow.toast('Status atualizado com sucesso!');
        else if (action === 'cancel') ShopNow.toast('Pedido cancelado.');
        closeDrawer();
      });
    });

    drawer.classList.add('is-open');
  }

  // ---- Counts ----
  function getStatusCounts() {
    const orders = ShopData.orders();
    return {
      all:       orders.length,
      paid:      orders.filter(o => o.status === 'paid').length,
      shipped:   orders.filter(o => o.status === 'shipped').length,
      ready:     orders.filter(o => o.status === 'ready').length,
      pending:   orders.filter(o => o.status === 'pending').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  }

  function initFilterCounts() {
    const counts = getStatusCounts();
    filters.forEach(filter => {
      const key = filter.dataset.orderFilter;
      const count = counts[key];
      if (count !== undefined) {
        const label = filter.textContent.trim();
        filter.innerHTML = `${label} <span style="opacity:.65;font-size:12px">${count}</span>`;
      }
    });
  }

  // ---- Render ----
  let currentStatus = 'all';

  function render() {
    const query = (searchInput?.value || '').toLowerCase();
    let orders = ShopData.orders();

    if (currentStatus !== 'all') {
      orders = orders.filter(o => o.status === currentStatus);
    }
    if (query) {
      orders = orders.filter(o =>
        o.id.toLowerCase().includes(query) ||
        o.customer.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query)
      );
    }

    tbody.innerHTML = orders.map(order => `
      <tr data-order-id="${order.id}">
        <td><span style="color:#818cf8;font-weight:700">${order.id}</span></td>
        <td>${order.customer}<br><span class="text-muted" style="font-size:12px">${order.email}</span></td>
        <td style="color:var(--admin-muted)">${order.items.length}</td>
        <td><strong>${ShopNow.money(order.total)}</strong></td>
        <td style="color:var(--admin-muted)">${order.paymentMethod}</td>
        <td style="font-size:17px">${order.type === 'pickup' ? '🏪' : '🏠'}</td>
        <td>${ShopNow.statusBadge(order.status)}</td>
        <td class="text-muted">${order.date}</td>
      </tr>
    `).join('');

    tbody.querySelectorAll('tr').forEach(row => {
      row.addEventListener('click', () => {
        tbody.querySelectorAll('tr').forEach(r => r.classList.remove('is-selected'));
        row.classList.add('is-selected');
        const order = ShopData.orders().find(o => o.id === row.dataset.orderId);
        if (order) openDrawer(order);
      });
    });
  }

  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('is-active'));
      filter.classList.add('is-active');
      currentStatus = filter.dataset.orderFilter;
      render();
    });
  });

  searchInput?.addEventListener('input', render);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });

  initFilterCounts();
  render();
});
