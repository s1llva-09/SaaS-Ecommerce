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

  search?.addEventListener('input', render);
  render();
});
