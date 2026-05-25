// ============================================================
// UI ADMIN: CAIXA
// Cards financeiros, tabela e grafico simples.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const summary = document.querySelector('[data-cash-summary]');
  const tbody = document.querySelector('[data-admin-cashflow]');
  const canvas = document.querySelector('#cashflowChart');
  if (!summary || !tbody) return;

  const entries = ShopData.cashflow();
  const income = entries.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expense = entries.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expense;

  summary.innerHTML = [
    ['Saldo', balance, balance >= 0 ? 'badge-green' : 'badge-red'],
    ['Entradas', income, 'badge-green'],
    ['Saidas', expense, 'badge-red'],
  ].map(item => `
    <article class="admin-card">
      <p class="text-muted" style="margin:0">${item[0]}</p>
      <div class="cash-value">${ShopNow.money(item[1])}</div>
      <span class="badge ${item[2]}">Maio</span>
    </article>
  `).join('');

  tbody.innerHTML = entries.map(entry => `
    <tr>
      <td>${entry.id}</td>
      <td>${entry.description}<br><span class="text-muted">${entry.category}</span></td>
      <td>${entry.paymentMethod}</td>
      <td>${entry.date}</td>
      <td>${entry.type === 'income' ? '+' : '-'} ${ShopNow.money(entry.amount)}</td>
    </tr>
  `).join('');

  if (canvas && window.Chart) {
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Entradas', 'Saidas'],
        datasets: [{ data: [income, expense], backgroundColor: ['#22c55e', '#ef4444'] }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }
});
