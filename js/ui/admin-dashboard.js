// ============================================================
// UI ADMIN: DASHBOARD
// KPIs com ícones, abas de período, gráfico de linha + donut.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const kpisEl = document.querySelector('[data-admin-kpis]');
  const recentEl = document.querySelector('[data-admin-recent-orders]');
  const revenueCanvas = document.querySelector('#revenueChart');
  const channelsCanvas = document.querySelector('#channelsChart');
  const periodTabs = document.querySelectorAll('[data-period]');

  const WEEKLY = ShopData.weeklyRevenue();
  const MONTHLY = ShopData.monthlyRevenue();

  const KPI_ICONS = {
    revenue: { bg: 'rgba(99,102,241,.18)', color: '#818cf8', svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' },
    orders:  { bg: 'rgba(52,211,153,.18)', color: '#34d399', svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' },
    clients: { bg: 'rgba(99,102,241,.18)', color: '#818cf8', svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    cancels: { bg: 'rgba(239,68,68,.18)',  color: '#f87171', svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' },
  };

  function buildKpis(period) {
    const orders = ShopData.orders();
    const revenue = period === 'week'
      ? WEEKLY.reduce((s, d) => s + d.value, 0)
      : MONTHLY.reduce((s, d) => s + d.value, 0);

    const cancelled = orders.filter(o => o.status === 'cancelled').length;

    const cards = [
      { key: 'revenue', value: ShopNow.money(revenue), label: 'Receita total', trend: '+8.7%', up: true },
      { key: 'orders',  value: ShopNow.int(34),         label: 'Total de pedidos', trend: '+14.3%', up: true },
      { key: 'clients', value: ShopNow.int(18),         label: 'Clientes ativos', trend: '+22.1%', up: true },
      { key: 'cancels', value: ShopNow.int(cancelled),  label: 'Cancelamentos', trend: '−5.9%', up: false },
    ];

    return cards.map(card => {
      const icon = KPI_ICONS[card.key];
      return `
        <article class="admin-kpi-card">
          <div class="kpi-header">
            <div class="kpi-icon" style="background:${icon.bg};color:${icon.color}">${icon.svg}</div>
            <span class="kpi-trend ${card.up ? 'up' : 'down'}">${card.trend}</span>
          </div>
          <div class="kpi-value">${card.value}</div>
          <p class="kpi-label">${card.label}</p>
        </article>
      `;
    }).join('');
  }

  let revenueChart = null;

  function buildRevenueChart(period) {
    if (!revenueCanvas || !window.Chart) return;
    const data = period === 'week' ? WEEKLY : MONTHLY;

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(revenueCanvas, {
      type: 'line',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.value),
          borderColor: '#818cf8',
          backgroundColor: 'rgba(129,140,248,.12)',
          fill: true,
          tension: .4,
          pointRadius: 4,
          pointBackgroundColor: '#818cf8',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: '#9896b8' } },
          y: {
            grid: { color: 'rgba(255,255,255,.06)' },
            ticks: { color: '#9896b8', callback: v => `R$${(v / 1000).toFixed(0)}k` },
          },
        },
      },
    });
  }

  let channelsChart = null;

  function buildChannelsChart() {
    if (!channelsCanvas || !window.Chart) return;
    const channels = ShopData.channels();
    if (channelsChart) channelsChart.destroy();

    channelsChart = new Chart(channelsCanvas, {
      type: 'doughnut',
      data: {
        labels: channels.map(c => c.label),
        datasets: [{
          data: channels.map(c => c.value),
          backgroundColor: channels.map(c => c.color),
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` },
          },
        },
      },
    });

    const legendEl = document.querySelector('[data-channels-legend]');
    if (legendEl) {
      legendEl.innerHTML = channels.map(c => `
        <div class="chart-legend__item">
          <span class="chart-legend__label">
            <span class="chart-legend__dot" style="background:${c.color}"></span>
            ${c.label}
          </span>
          <span class="chart-legend__pct">${c.value}%</span>
        </div>
      `).join('');
    }
  }

  if (recentEl) {
    recentEl.innerHTML = ShopData.orders().slice(0, 5).map(order => `
      <tr>
        <td><span style="color:#818cf8;font-weight:700">${order.id}</span></td>
        <td>${order.customer}</td>
        <td><strong>${ShopNow.money(order.total)}</strong></td>
        <td>${ShopNow.statusBadge(order.status)}</td>
      </tr>
    `).join('');
  }

  function setChartTitle(period) {
    const titleEl = document.querySelector('[data-revenue-title]');
    if (titleEl) {
      titleEl.textContent = period === 'week'
        ? 'Receita — últimos 7 dias'
        : 'Receita — últimos 5 meses';
    }
    const subEl = document.querySelector('[data-revenue-sub]');
    if (subEl) {
      const data = period === 'week' ? WEEKLY : MONTHLY;
      const total = data.reduce((s, d) => s + d.value, 0);
      subEl.textContent = `Total: ${ShopNow.money(total)}`;
    }
  }

  let currentPeriod = 'week';

  function update(period) {
    currentPeriod = period;
    if (kpisEl) kpisEl.innerHTML = buildKpis(period);
    buildRevenueChart(period);
    setChartTitle(period);
  }

  periodTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      periodTabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      update(tab.dataset.period);
    });
  });

  update(currentPeriod);
  buildChannelsChart();
});
