// ============================================================
// UI ADMIN: CLIENTES
// Busca e tabela de clientes.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('[data-admin-customers]');
  const search = document.querySelector('[data-admin-customer-search]');
  if (!tbody) return;

  // ---------------------------------------------------------
  // Filtra clientes por nome/email e renderiza as linhas da tabela.
  // ---------------------------------------------------------
  function render() {
    const query = (search?.value || '').toLowerCase();
    const customers = ShopData.customers().filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query)
    );

    tbody.innerHTML = '';

    customers.forEach(customer => {
      const tr = document.createElement('tr');
      tr.dataset.customerId = customer.id;

      // ID
      const tdId = document.createElement('td');
      tdId.textContent = customer.id;
      tr.appendChild(tdId);

      // Nome + email
      const tdName = document.createElement('td');
      tdName.textContent = customer.name;
      const br = document.createElement('br');
      tdName.appendChild(br);
      const emailSpan = document.createElement('span');
      emailSpan.className = 'text-muted';
      emailSpan.textContent = customer.email;
      tdName.appendChild(emailSpan);
      tr.appendChild(tdName);

      // Cidade
      const tdCity = document.createElement('td');
      tdCity.textContent = customer.city;
      tr.appendChild(tdCity);

      // Total de pedidos
      const tdOrders = document.createElement('td');
      tdOrders.textContent = String(customer.totalOrders);
      tr.appendChild(tdOrders);

      // Total gasto
      const tdSpent = document.createElement('td');
      tdSpent.textContent = ShopNow.money(customer.totalSpent);
      tr.appendChild(tdSpent);

      // Status — statusBadge retorna HTML estático do sistema (classes/labels controlados internamente)
      const tdStatus = document.createElement('td');
      tdStatus.innerHTML = ShopNow.statusBadge(customer.status);
      tr.appendChild(tdStatus);

      tbody.appendChild(tr);
    });
  }

  // ---------------------------------------------------------
  // Drawer de cliente — injeta painel lateral e overlay no body.
  // Abre ao clicar numa linha da tabela, fecha pelo X, overlay ou Escape.
  // ---------------------------------------------------------
  const drawerOverlay = document.createElement('div');
  drawerOverlay.className = 'admin-modal-overlay is-hidden';
  document.body.appendChild(drawerOverlay);

  const drawer = document.createElement('aside');
  drawer.className = 'customer-drawer';
  drawer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(drawer);

  function openCustomerDrawer(customer) {
    const orders = ShopData.orders().filter(o => o.email === customer.email);

    drawer.innerHTML = '';

    // Cabeçalho com nome, email e botão fechar
    const head = document.createElement('div');
    head.className = 'customer-drawer__head';

    const info = document.createElement('div');
    const nameDiv = document.createElement('div');
    nameDiv.className = 'customer-drawer__name';
    nameDiv.textContent = customer.name;
    info.appendChild(nameDiv);
    const emailDiv = document.createElement('div');
    emailDiv.className = 'text-muted text-sm';
    emailDiv.textContent = customer.email;
    info.appendChild(emailDiv);
    head.appendChild(info);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'order-drawer__close';
    closeBtn.dataset.drawerClose = '';
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    head.appendChild(closeBtn);
    drawer.appendChild(head);

    // Cards de estatísticas
    const stats = document.createElement('div');
    stats.className = 'customer-drawer__stats';
    [
      { label: 'Pedidos',     value: ShopNow.int(customer.totalOrders) },
      { label: 'Total gasto', value: ShopNow.money(customer.totalSpent) },
      { label: 'Cidade',      value: customer.city },
    ].forEach(({ label, value }) => {
      const stat = document.createElement('div');
      stat.className = 'customer-drawer__stat';
      const lbl = document.createElement('span');
      lbl.className = 'text-muted';
      lbl.textContent = label;
      stat.appendChild(lbl);
      const val = document.createElement('strong');
      val.textContent = value;
      stat.appendChild(val);
      stats.appendChild(stat);
    });
    drawer.appendChild(stats);

    // Histórico de pedidos
    const body = document.createElement('div');
    body.className = 'customer-drawer__body';

    const ordersLabel = document.createElement('p');
    ordersLabel.className = 'drawer-section__label';
    ordersLabel.textContent = 'Histórico de pedidos';
    body.appendChild(ordersLabel);

    if (!orders.length) {
      const empty = document.createElement('p');
      empty.className = 'text-muted text-sm';
      empty.textContent = 'Nenhum pedido encontrado.';
      body.appendChild(empty);
    } else {
      orders.forEach(order => {
        const row = document.createElement('div');
        row.className = 'drawer-item';
        const left = document.createElement('div');
        const idSpan = document.createElement('span');
        idSpan.className = 'order-id';
        idSpan.textContent = order.id;
        left.appendChild(idSpan);
        const dateDiv = document.createElement('div');
        dateDiv.className = 'text-muted text-sm';
        dateDiv.textContent = order.date;
        left.appendChild(dateDiv);
        row.appendChild(left);
        const total = document.createElement('strong');
        total.textContent = ShopNow.money(order.total);
        row.appendChild(total);
        body.appendChild(row);
      });
    }

    drawer.appendChild(body);

    // Abre o painel
    drawerOverlay.classList.remove('is-hidden');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');

    drawer.querySelector('[data-drawer-close]').addEventListener('click', closeCustomerDrawer);
  }

  function closeCustomerDrawer() {
    drawerOverlay.classList.add('is-hidden');
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  drawerOverlay.addEventListener('click', closeCustomerDrawer);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCustomerDrawer();
  });

  // Delega clique nas linhas da tabela
  tbody.addEventListener('click', e => {
    const tr = e.target.closest('[data-customer-id]');
    if (!tr) return;
    const customer = ShopData.customers().find(c => c.id === tr.dataset.customerId);
    if (customer) openCustomerDrawer(customer);
  });

  search?.addEventListener('input', render);
  render();
});
