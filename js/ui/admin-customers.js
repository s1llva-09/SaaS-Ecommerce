// ============================================================
// UI ADMIN: CLIENTES
// Busca e tabela de clientes.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('[data-admin-customers]');
  const search = document.querySelector('[data-admin-customer-search]');
  if (!tbody) return;

  function render() {
    const query = (search?.value || '').toLowerCase();
    const customers = ShopData.customers().filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query)
    );

    tbody.innerHTML = customers.map(customer => `
      <tr>
        <td>${customer.id}</td>
        <td>${customer.name}<br><span class="text-muted">${customer.email}</span></td>
        <td>${customer.city}</td>
        <td>${customer.totalOrders}</td>
        <td>${ShopNow.money(customer.totalSpent)}</td>
        <td>${ShopNow.statusBadge(customer.status)}</td>
      </tr>
    `).join('');
  }

  search?.addEventListener('input', render);
  render();
});
