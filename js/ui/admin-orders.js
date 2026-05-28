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

  // SVGs estáticos usados nos botões de ação (sem dados do usuário)
  const SVG_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>';
  const SVG_CANCEL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';

  function buildActionButton(cls, action, orderId, svgHtml, label) {
    const btn = document.createElement('button');
    btn.className = cls;
    btn.dataset.orderAction = action;
    btn.dataset.orderId = orderId;
    // svgHtml é código SVG estático definido no código, não dados do usuário
    btn.innerHTML = svgHtml;
    const labelText = document.createTextNode(` ${label}`);
    btn.appendChild(labelText);
    return btn;
  }

  function openDrawer(order) {
    const cfg = ShopData.status()[order.status] || { label: order.status, cls: 'badge-blue' };
    const sc = STATUS_COLORS[cfg.cls] || STATUS_COLORS['badge-blue'];
    const timeline = getTimeline(order);

    drawer.innerHTML = '';

    // Cabeçalho do drawer
    const head = document.createElement('div');
    head.className = 'order-drawer__head';

    const headInfo = document.createElement('div');
    const idDiv = document.createElement('div');
    idDiv.className = 'order-drawer__id';
    idDiv.textContent = order.id;
    headInfo.appendChild(idDiv);
    const dateDiv = document.createElement('div');
    dateDiv.className = 'order-drawer__date';
    dateDiv.textContent = order.date;
    headInfo.appendChild(dateDiv);
    head.appendChild(headInfo);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'order-drawer__close';
    closeBtn.dataset.drawerClose = '';
    // SVG estático de fechar — sem dados do usuário
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    head.appendChild(closeBtn);
    drawer.appendChild(head);

    // Barra de status
    const statusBar = document.createElement('div');
    statusBar.className = 'order-drawer__status-bar';
    const statusSpan = document.createElement('span');
    statusSpan.style.display = 'block';
    statusSpan.style.padding = '10px';
    statusSpan.style.borderRadius = '10px';
    statusSpan.style.textAlign = 'center';
    statusSpan.style.fontWeight = '900';
    statusSpan.style.fontSize = '13px';
    statusSpan.style.background = sc.bg;
    statusSpan.style.color = sc.text;
    statusSpan.style.letterSpacing = '.04em';
    statusSpan.textContent = cfg.label;
    statusBar.appendChild(statusSpan);
    drawer.appendChild(statusBar);

    // Body
    const body = document.createElement('div');
    body.className = 'order-drawer__body';

    // Seção Cliente
    const customerSection = document.createElement('div');
    const customerLabel = document.createElement('p');
    customerLabel.className = 'drawer-section__label';
    customerLabel.textContent = 'Cliente';
    customerSection.appendChild(customerLabel);
    const customerName = document.createElement('div');
    customerName.className = 'drawer-customer__name';
    customerName.textContent = order.customer;
    customerSection.appendChild(customerName);
    const customerInfo = document.createElement('div');
    customerInfo.className = 'drawer-customer__info';
    customerInfo.textContent = order.email;
    const infoBr = document.createElement('br');
    customerInfo.appendChild(infoBr);
    customerInfo.appendChild(document.createTextNode(order.city));
    customerSection.appendChild(customerInfo);
    body.appendChild(customerSection);

    // Seção Itens do pedido
    const itemsSection = document.createElement('div');
    const itemsLabel = document.createElement('p');
    itemsLabel.className = 'drawer-section__label';
    itemsLabel.textContent = 'Itens do pedido';
    itemsSection.appendChild(itemsLabel);

    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'drawer-items';
    order.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'drawer-item';

      const itemName = document.createElement('span');
      itemName.textContent = `${item.name} × ${item.qty}`;
      itemDiv.appendChild(itemName);

      const itemPrice = document.createElement('strong');
      itemPrice.textContent = ShopNow.money(item.price * item.qty);
      itemDiv.appendChild(itemPrice);

      itemsDiv.appendChild(itemDiv);
    });
    itemsSection.appendChild(itemsDiv);

    const totalDiv = document.createElement('div');
    totalDiv.className = 'drawer-total';
    const totalLabel = document.createElement('span');
    totalLabel.textContent = 'Total';
    totalDiv.appendChild(totalLabel);
    const totalStrong = document.createElement('strong');
    totalStrong.style.color = 'var(--admin-text)';
    totalStrong.textContent = ShopNow.money(order.total);
    totalDiv.appendChild(totalStrong);
    itemsSection.appendChild(totalDiv);
    body.appendChild(itemsSection);

    // Seção Pagamento e entrega
    const paymentSection = document.createElement('div');
    const paymentLabel = document.createElement('p');
    paymentLabel.className = 'drawer-section__label';
    paymentLabel.textContent = 'Pagamento e entrega';
    paymentSection.appendChild(paymentLabel);

    const paymentDiv = document.createElement('div');
    paymentDiv.className = 'drawer-payment';

    const paymentRow = document.createElement('div');
    paymentRow.className = 'drawer-payment__row';
    // SVG de cartão — estático, sem dados do usuário
    paymentRow.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>';
    paymentRow.appendChild(document.createTextNode(` ${order.paymentMethod}`));
    paymentDiv.appendChild(paymentRow);

    const typeRow = document.createElement('div');
    typeRow.className = 'drawer-payment__row';
    if (order.type === 'pickup') {
      // SVG de casa — estático
      typeRow.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
      typeRow.appendChild(document.createTextNode(' Retirada na loja'));
    } else {
      // SVG de caminhão — estático
      typeRow.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="19" r="1"/><circle cx="20" cy="19" r="1"/></svg>';
      typeRow.appendChild(document.createTextNode(' Entrega em domicílio'));
    }
    paymentDiv.appendChild(typeRow);

    paymentSection.appendChild(paymentDiv);
    body.appendChild(paymentSection);

    // Seção Linha do tempo
    const timelineSection = document.createElement('div');
    const timelineLabel = document.createElement('p');
    timelineLabel.className = 'drawer-section__label';
    timelineLabel.textContent = 'Linha do tempo';
    timelineSection.appendChild(timelineLabel);

    const timelineDiv = document.createElement('div');
    timelineDiv.className = 'drawer-timeline';

    timeline.forEach(step => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'timeline-step' + (step.done ? ' is-done' : '');

      const dot = document.createElement('div');
      dot.className = 'timeline-dot';
      if (step.done) {
        // SVG de check — estático
        dot.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
      }
      stepDiv.appendChild(dot);

      const stepInfo = document.createElement('div');
      const stepLabelDiv = document.createElement('div');
      stepLabelDiv.className = 'timeline-label';
      stepLabelDiv.textContent = step.label;
      stepInfo.appendChild(stepLabelDiv);

      if (step.date && step.done) {
        const stepDate = document.createElement('div');
        stepDate.className = 'timeline-date';
        stepDate.textContent = step.date;
        stepInfo.appendChild(stepDate);
      }

      stepDiv.appendChild(stepInfo);
      timelineDiv.appendChild(stepDiv);
    });

    timelineSection.appendChild(timelineDiv);
    body.appendChild(timelineSection);

    // Ações
    if (!['delivered', 'cancelled'].includes(order.status)) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'drawer-actions';

      if (order.status === 'paid') {
        const label = order.type === 'pickup' ? 'Marcar como pronto' : 'Marcar como enviado';
        const btn = buildActionButton('btn-confirm-delivery', 'advance', order.id, SVG_CHECK, label);
        btn.style.background = 'var(--brand)';
        actionsDiv.appendChild(btn);
      } else if (order.status === 'shipped') {
        actionsDiv.appendChild(buildActionButton('btn-confirm-delivery', 'advance', order.id, SVG_CHECK, 'Confirmar entrega'));
      } else if (order.status === 'ready') {
        actionsDiv.appendChild(buildActionButton('btn-confirm-delivery', 'advance', order.id, SVG_CHECK, 'Confirmar retirada'));
      }

      actionsDiv.appendChild(buildActionButton('btn-cancel-order', 'cancel', order.id, SVG_CANCEL, 'Cancelar pedido'));
      body.appendChild(actionsDiv);
    }

    drawer.appendChild(body);

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
        filter.textContent = label;
        const countSpan = document.createElement('span');
        countSpan.style.opacity = '.65';
        countSpan.style.fontSize = '12px';
        countSpan.textContent = String(count);
        filter.appendChild(document.createTextNode(' '));
        filter.appendChild(countSpan);
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

    tbody.innerHTML = '';

    orders.forEach(order => {
      const tr = document.createElement('tr');
      tr.dataset.orderId = order.id;

      // ID
      const tdId = document.createElement('td');
      const idSpan = document.createElement('span');
      idSpan.style.color = '#818cf8';
      idSpan.style.fontWeight = '700';
      idSpan.textContent = order.id;
      tdId.appendChild(idSpan);
      tr.appendChild(tdId);

      // Cliente + email
      const tdCustomer = document.createElement('td');
      tdCustomer.textContent = order.customer;
      const br = document.createElement('br');
      tdCustomer.appendChild(br);
      const emailSpan = document.createElement('span');
      emailSpan.className = 'text-muted';
      emailSpan.style.fontSize = '12px';
      emailSpan.textContent = order.email;
      tdCustomer.appendChild(emailSpan);
      tr.appendChild(tdCustomer);

      // Qtd itens
      const tdItems = document.createElement('td');
      tdItems.style.color = 'var(--admin-muted)';
      tdItems.textContent = String(order.items.length);
      tr.appendChild(tdItems);

      // Total
      const tdTotal = document.createElement('td');
      const totalStrong = document.createElement('strong');
      totalStrong.textContent = ShopNow.money(order.total);
      tdTotal.appendChild(totalStrong);
      tr.appendChild(tdTotal);

      // Pagamento
      const tdPayment = document.createElement('td');
      tdPayment.style.color = 'var(--admin-muted)';
      tdPayment.textContent = order.paymentMethod;
      tr.appendChild(tdPayment);

      // Tipo (emoji estático)
      const tdType = document.createElement('td');
      tdType.style.fontSize = '17px';
      tdType.textContent = order.type === 'pickup' ? '🏪' : '🏠';
      tr.appendChild(tdType);

      // Status — statusBadge retorna HTML estático do sistema (classes/labels controlados internamente)
      const tdStatus = document.createElement('td');
      tdStatus.innerHTML = ShopNow.statusBadge(order.status);
      tr.appendChild(tdStatus);

      // Data
      const tdDate = document.createElement('td');
      tdDate.className = 'text-muted';
      tdDate.textContent = order.date;
      tr.appendChild(tdDate);

      tbody.appendChild(tr);
    });

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
