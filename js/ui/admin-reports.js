// ============================================================
// UI ADMIN: RELATORIOS
// Graficos mensais.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const monthly = document.querySelector('#monthlyChart');
  if (!monthly || !window.Chart) return;

  new Chart(monthly, {
    type: 'bar',
    data: {
      labels: ShopData.monthlyRevenue().map(item => item.label),
      datasets: [{ label: 'Receita', data: ShopData.monthlyRevenue().map(item => item.value), backgroundColor: '#818cf8' }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
});
