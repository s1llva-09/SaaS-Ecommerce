// ============================================================
// UI ADMIN: RELATORIOS
// KPIs, gráfico de linha, top produtos, donut por categoria
// e exportação CSV — tudo reage ao filtro de período.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (!window.Chart) return;

  let revenueChart  = null;
  let categoryChart = null;

  const PERIOD_TRENDS = {};

  // ---------------------------------------------------------
  // revenueData(period) — retorna os pontos do gráfico de linha
  // conforme o período selecionado.
  // week    → 7 dias (ShopData.weeklyRevenue)
  // month   → 5 meses (ShopData.monthlyRevenue)
  // quarter → agrupa os meses em trimestres
  // year    → mesmo que month (só temos 1 ano de dados mock)
  // ---------------------------------------------------------
  function revenueData(period) {
    if (period === 'week')  return ShopData.weeklyRevenue();
    if (period === 'month' || period === 'year') return ShopData.monthlyRevenue();

    if (period === 'quarter') {
      const monthly = ShopData.monthlyRevenue();
      // Agrupa de 3 em 3 meses — gera "Jan–Mar", "Abr–Jun", etc.
      const quarters = [];
      for (let i = 0; i < monthly.length; i += 3) {
        const slice = monthly.slice(i, i + 3);
        quarters.push({
          label: `${slice[0].label}–${slice[slice.length - 1].label}`,
          value: slice.reduce((s, d) => s + d.value, 0),
        });
      }
      return quarters;
    }

    return ShopData.weeklyRevenue();
  }

  function reportOrders() {
    return ShopData.orders().filter(order => ['paid', 'ready', 'shipped', 'delivered'].includes(order.status));
  }

  // ---------------------------------------------------------
  // topProducts(n) — calcula os N produtos mais rentáveis
  // agregando os itens de todos os pedidos do mock.
  // Retorna array de { name, qty, revenue } ordenado por receita.
  // ---------------------------------------------------------
  function topProducts(n = 5) {
    const map = {};
    reportOrders().forEach(order => {
      order.items.forEach(item => {
        if (!map[item.name]) map[item.name] = { name: item.name, qty: 0, revenue: 0 };
        map[item.name].qty     += item.qty;
        map[item.name].revenue += item.price * item.qty;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, n);
  }

  // ---------------------------------------------------------
  // buildKpis(period) — renderiza os 4 cards de KPI:
  // Receita total, Pedidos, Ticket médio e Clientes únicos.
  // Receita varia conforme o período; os demais usam dados globais.
  // ---------------------------------------------------------
  function buildKpis(period) {
    const kpisEl = document.querySelector('[data-reports-kpis]');
    if (!kpisEl) return;

    const data    = revenueData(period);
    const orders  = reportOrders();
    const revenue = data.reduce((s, d) => s + d.value, 0);
    const avgTicket = orders.length ? revenue / orders.length : 0;
    const uniqueCustomers = new Set(orders.map(o => o.email)).size;

    // SVGs estáticos — sem dados do usuário
    const ICONS = {
      revenue:   { bg: 'rgba(99,102,241,.18)',  color: '#818cf8', svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
      orders:    { bg: 'rgba(52,211,153,.18)',  color: '#34d399', svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' },
      ticket:    { bg: 'rgba(251,191,36,.18)',  color: '#fbbf24', svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>' },
      customers: { bg: 'rgba(99,102,241,.18)',  color: '#818cf8', svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    };

    const cards = [
      { key: 'revenue',   label: 'Receita total',  value: ShopNow.money(revenue) },
      { key: 'orders',    label: 'Pedidos',         value: ShopNow.int(orders.length) },
      { key: 'ticket',    label: 'Ticket médio',    value: ShopNow.money(avgTicket) },
      { key: 'customers', label: 'Clientes únicos', value: ShopNow.int(uniqueCustomers) },
    ];

    kpisEl.innerHTML = '';
    const trends = PERIOD_TRENDS[period] || [];

    cards.forEach((card, i) => {
      const icon  = ICONS[card.key];
      const trend = trends[i];
      const isUp  = trend && !trend.startsWith('-');

      const article = document.createElement('article');
      article.className = 'admin-kpi-card';

      const headerDiv = document.createElement('div');
      headerDiv.className = 'kpi-header';

      const iconDiv = document.createElement('div');
      iconDiv.className = 'kpi-icon';
      iconDiv.style.background = icon.bg;
      iconDiv.style.color = icon.color;
      iconDiv.innerHTML = icon.svg;
      headerDiv.appendChild(iconDiv);

      if (trend) {
        const trendSpan = document.createElement('span');
        trendSpan.className = `kpi-trend ${isUp ? 'up' : 'down'}`;
        trendSpan.textContent = `${isUp ? '↑' : '↓'} ${trend}`;
        headerDiv.appendChild(trendSpan);
      }
      article.appendChild(headerDiv);

      const valueDiv = document.createElement('div');
      valueDiv.className = 'kpi-value';
      valueDiv.textContent = card.value;
      article.appendChild(valueDiv);

      const labelP = document.createElement('p');
      labelP.className = 'kpi-label';
      labelP.textContent = card.label;
      article.appendChild(labelP);

      kpisEl.appendChild(article);
    });
  }

  // ---------------------------------------------------------
  // buildRevenueChart(period) — renderiza o gráfico de linha.
  // Destrói a instância anterior antes de criar para evitar
  // sobreposição de instâncias do Chart.js ("canvas in use").
  // ---------------------------------------------------------
  function buildRevenueChart(period) {
    const canvas = document.querySelector('#reportsRevenueChart');
    if (!canvas) return;

    const data = revenueData(period);

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(canvas, {
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

    // Atualiza o título e o subtotal do card
    const LABELS = { week: 'últimos 7 dias', month: 'últimos 5 meses', quarter: 'por trimestre', year: 'anual' };
    const titleEl = document.querySelector('[data-reports-chart-title]');
    const subEl   = document.querySelector('[data-reports-chart-sub]');
    if (titleEl) titleEl.textContent = `Receita — ${LABELS[period] || period}`;
    if (subEl)   subEl.textContent   = `Total: ${ShopNow.money(data.reduce((s, d) => s + d.value, 0))}`;
  }

  // ---------------------------------------------------------
  // buildCategoryChart() — donut de receita por categoria.
  // Deriva as categorias cruzando os itens dos pedidos com
  // os produtos do catálogo (busca por nome).
  // ---------------------------------------------------------
  function buildCategoryChart() {
    const canvas = document.querySelector('#reportsCategoryChart');
    if (!canvas) return;

    // Agrega receita por categoria
    const map = {};
    reportOrders().forEach(order => {
      order.items.forEach(item => {
        const product = ShopData.products().find(p => p.id === String(item.productId));
        const cat = product?.category || 'Outros';
        map[cat] = (map[cat] || 0) + item.price * item.qty;
      });
    });

    const COLORS  = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#60a5fa'];
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const labels  = entries.map(([k]) => k);
    const values  = entries.map(([, v]) => v);
    const total   = values.reduce((s, v) => s + v, 0);

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: COLORS,
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
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ShopNow.money(ctx.parsed)}` } },
        },
      },
    });

    // Legenda manual abaixo do donut
    const legendEl = document.querySelector('[data-reports-category-legend]');
    if (!legendEl) return;
    legendEl.innerHTML = '';
    entries.forEach(([label, value], i) => {
      const item = document.createElement('div');
      item.className = 'chart-legend__item';

      const labelSpan = document.createElement('span');
      labelSpan.className = 'chart-legend__label';

      const dot = document.createElement('span');
      dot.className = 'chart-legend__dot';
      dot.style.background = COLORS[i] || '#818cf8'; // dinâmico: cor da fatia
      labelSpan.appendChild(dot);
      labelSpan.appendChild(document.createTextNode(label));
      item.appendChild(labelSpan);

      const rightDiv = document.createElement('div');
      rightDiv.className = 'chart-legend__right';

      const pctSpan = document.createElement('span');
      pctSpan.className = 'chart-legend__pct';
      pctSpan.textContent = `${Math.round((value / total) * 100)}%`;

      const valSpan = document.createElement('span');
      valSpan.className = 'chart-legend__val';
      valSpan.textContent = ShopNow.money(value);

      rightDiv.appendChild(pctSpan);
      rightDiv.appendChild(valSpan);
      item.appendChild(rightDiv);

      legendEl.appendChild(item);
    });
  }

  // ---------------------------------------------------------
  // buildTopProducts() — tabela com os 5 produtos mais
  // rentáveis, calculados a partir dos itens de todos os pedidos.
  // ---------------------------------------------------------
  function buildTopProducts() {
    const tableEl = document.querySelector('[data-top-products]');
    if (!tableEl) return;

    tableEl.innerHTML = '';

    // Cabeçalho da tabela
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Produto', 'Qtd', 'Receita'].forEach(label => {
      const th = document.createElement('th');
      th.textContent = label;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    tableEl.appendChild(thead);

    const tops = topProducts(5);
    const maxRevenue = tops[0]?.revenue || 1;

    const tbody = document.createElement('tbody');
    tops.forEach((p, idx) => {
      const tr = document.createElement('tr');

      // Rank
      const tdRank = document.createElement('td');
      tdRank.className = 'top-rank';
      tdRank.textContent = `#${idx + 1}`;
      tr.appendChild(tdRank);

      // Nome + barra de progresso
      const tdName = document.createElement('td');
      const nameSpan = document.createElement('span');
      nameSpan.textContent = p.name;
      tdName.appendChild(nameSpan);
      const bar = document.createElement('div');
      bar.className = 'top-bar';
      const fill = document.createElement('div');
      fill.className = 'top-bar__fill';
      fill.style.width = `${Math.round((p.revenue / maxRevenue) * 100)}%`;
      bar.appendChild(fill);
      tdName.appendChild(bar);
      tr.appendChild(tdName);

      // Qtd
      const tdQty = document.createElement('td');
      tdQty.className = 'text-muted';
      tdQty.textContent = `${ShopNow.int(p.qty)} un.`;
      tr.appendChild(tdQty);

      // Receita
      const tdRev = document.createElement('td');
      const strong = document.createElement('strong');
      strong.textContent = ShopNow.money(p.revenue);
      tdRev.appendChild(strong);
      tr.appendChild(tdRev);

      tbody.appendChild(tr);
    });
    tableEl.appendChild(tbody);
  }

  // ---------------------------------------------------------
  // exportCSV() — gera um .csv com todos os produtos e
  // dispara o download no browser via Blob + createObjectURL.
  // Não precisa de backend; o BOM (﻿) garante acentos no Excel.
  // ---------------------------------------------------------
  function exportCSV() {
    const rows = [['Produto', 'Qtd vendida', 'Receita (R$)']];
    topProducts(999).forEach(p => {
      rows.push([`"${p.name}"`, p.qty, p.revenue.toFixed(2).replace('.', ',')]);
    });

    const csv  = rows.map(row => row.join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-produtos.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---------------------------------------------------------
  // buildPaymentMethods() — barras horizontais por método de
  // pagamento, contando a frequência nos pedidos mock.
  // ---------------------------------------------------------
  function buildPaymentMethods() {
    const container = document.querySelector('[data-payment-methods]');
    if (!container) return;

    const map = {};
    reportOrders().forEach(o => { map[o.paymentMethod] = (map[o.paymentMethod] || 0) + 1; });
    const total   = Object.values(map).reduce((s, v) => s + v, 0);
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const COLORS  = { Cartão: '#818cf8', PIX: '#34d399', Boleto: '#fbbf24', TED: '#f87171', Dinheiro: '#60a5fa' };

    container.innerHTML = '';
    entries.forEach(([method, count]) => {
      const pct   = Math.round((count / total) * 100);
      const color = COLORS[method] || '#818cf8';
      const row   = document.createElement('div');
      row.className = 'report-bar-row';

      const meta = document.createElement('div');
      meta.className = 'report-bar-meta';
      const dot = document.createElement('span');
      dot.className = 'report-bar-dot';
      dot.style.background = color;
      const name = document.createElement('span');
      name.textContent = method;
      const badge = document.createElement('span');
      badge.className = 'badge badge-blue';
      badge.textContent = `${count} pedido${count !== 1 ? 's' : ''}`;
      meta.appendChild(dot);
      meta.appendChild(name);
      meta.appendChild(badge);

      const barWrap = document.createElement('div');
      barWrap.className = 'report-bar-track';
      const fill = document.createElement('div');
      fill.className = 'report-bar-fill';
      fill.style.cssText = `width:${pct}%; background:${color}`;
      barWrap.appendChild(fill);

      const pctLabel = document.createElement('span');
      pctLabel.className = 'report-bar-pct';
      pctLabel.textContent = `${pct}%`;

      row.appendChild(meta);
      row.appendChild(barWrap);
      row.appendChild(pctLabel);
      container.appendChild(row);
    });
  }

  // ---------------------------------------------------------
  // buildOrdersStatus() — barras horizontais por status dos pedidos.
  // ---------------------------------------------------------
  function buildOrdersStatus() {
    const container = document.querySelector('[data-orders-status]');
    if (!container) return;

    const STATUS_LABELS = {
      pending:   { label: 'Pendente',  color: '#f59e0b' },
      paid:      { label: 'Pago',      color: '#60a5fa' },
      shipped:   { label: 'Enviado',   color: '#818cf8' },
      ready:     { label: 'Retirada',  color: '#818cf8' },
      delivered: { label: 'Entregue',  color: '#34d399' },
      cancelled: { label: 'Cancelado', color: '#f87171' },
    };

    const map = {};
    ShopData.orders().forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    const total   = Object.values(map).reduce((s, v) => s + v, 0);
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);

    container.innerHTML = '';
    entries.forEach(([status, count]) => {
      const cfg   = STATUS_LABELS[status] || { label: status, color: '#818cf8' };
      const pct   = Math.round((count / total) * 100);
      const row   = document.createElement('div');
      row.className = 'report-bar-row';

      const meta = document.createElement('div');
      meta.className = 'report-bar-meta';
      const dot = document.createElement('span');
      dot.className = 'report-bar-dot';
      dot.style.background = cfg.color;
      const name = document.createElement('span');
      name.textContent = cfg.label;
      const badge = document.createElement('span');
      badge.className = 'badge badge-blue';
      badge.textContent = `${count}`;
      meta.appendChild(dot);
      meta.appendChild(name);
      meta.appendChild(badge);

      const barWrap = document.createElement('div');
      barWrap.className = 'report-bar-track';
      const fill = document.createElement('div');
      fill.className = 'report-bar-fill';
      fill.style.cssText = `width:${pct}%; background:${cfg.color}`;
      barWrap.appendChild(fill);

      const pctLabel = document.createElement('span');
      pctLabel.className = 'report-bar-pct';
      pctLabel.textContent = `${pct}%`;

      row.appendChild(meta);
      row.appendChild(barWrap);
      row.appendChild(pctLabel);
      container.appendChild(row);
    });
  }

  // ---------------------------------------------------------
  // update(period) — orquestra todos os componentes da página.
  // Chamado na carga inicial e sempre que o período muda.
  // ---------------------------------------------------------
  function update(period) {
    buildKpis(period);
    buildRevenueChart(period);
    buildTopProducts();
    buildCategoryChart();
    buildPaymentMethods();
    buildOrdersStatus();
  }

  // Ouve o clique nos botões de período
  const periodBtns = document.querySelectorAll('[data-report-period]');
  periodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      periodBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      update(btn.dataset.reportPeriod);
    });
  });

  // Botão exportar CSV
  document.querySelector('[data-export-csv]')?.addEventListener('click', exportCSV);

  // Inicializa com período padrão: semana
  update('week');
});
