// ============================================================
// UI ADMIN: CAIXA
// Cards financeiros, tabela e grafico simples.
// ============================================================

// Envolve tudo em IIFE para não poluir o escopo global
(function () {
  let cfChart = null; // guarda a instância do Chart.js para destruir antes de recriar

  // ---------------------------------------------------------
  // Encontra a data mais recente nos dados para usar como
  // "hoje" do sistema mock (evita comparar com data real do PC)
  // ---------------------------------------------------------
  function getMockToday() {
    return ShopData.cashflow()
      .map(e => e.date.slice(0, 10)) // pega só "AAAA-MM-DD"
      .sort()
      .at(-1); // última após sort = mais recente
  }

  // ---------------------------------------------------------
  // Filtra as entradas pelo período selecionado.
  // Comparação é feita por string ISO — funciona porque
  // "2026-05-19" < "2026-05-25" alfabeticamente.
  // ---------------------------------------------------------
  function filterByPeriod(entries, period) {
    const today = getMockToday(); // ex: "2026-05-25"

    return entries.filter(e => {
      const d = e.date.slice(0, 10); // data da entrada

      if (period === 'today') return d === today;

      if (period === 'week') {
        // últimos 7 dias contando hoje
        const start = new Date(today + 'T00:00:00');
        start.setDate(start.getDate() - 6);
        return d >= start.toISOString().slice(0, 10);
      }

      if (period === 'month') return d.slice(0, 7) === today.slice(0, 7); // mesmo "AAAA-MM"
      if (period === 'year')  return d.slice(0, 4) === today.slice(0, 4); // mesmo "AAAA"

      return true;
    });
  }

  // Mapa de rótulos para exibir nos cards
  const PERIOD_LABEL = { today: 'Hoje', week: 'Semana', month: 'Mês', year: 'Ano' };

  // SVGs reutilizados nos ícones dos cards
  const ICONS = {
    balance: `<svg ...>...</svg>`, // cartão de crédito
    up:      `<svg ...>...</svg>`, // seta para cima (entradas)
    down:    `<svg ...>...</svg>`, // seta para baixo (saídas)
  };

  // ---------------------------------------------------------
  // Renderiza os 3 cards de resumo (Saldo / Entradas / Saídas)
  // ---------------------------------------------------------
  function renderSummary(entries, period) {
    const income  = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const expense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    const balance = income - expense;
    const label   = PERIOD_LABEL[period]; // ex: "Semana"

    const cards = [
      {
        label: 'Saldo', value: balance,
        valueCls:  balance >= 0 ? 'cash-positive' : 'cash-negative',
        iconBg:    balance >= 0 ? 'rgba(99,102,241,.15)' : 'rgba(239,68,68,.15)',
        iconColor: balance >= 0 ? '#818cf8' : '#ef4444',
        icon: ICONS.balance,
      },
      { label: 'Entradas', value: income,  valueCls: 'cash-positive', iconBg: 'rgba(34,197,94,.15)',  iconColor: '#22c55e', icon: ICONS.up },
      { label: 'Saídas',  value: expense, valueCls: 'cash-negative', iconBg: 'rgba(239,68,68,.15)', iconColor: '#ef4444', icon: ICONS.down },
    ];

    const summaryEl = document.querySelector('[data-cash-summary]');
    summaryEl.innerHTML = '';

    cards.forEach(c => {
      const article = document.createElement('article');
      article.className = 'admin-card';

      const iconDiv = document.createElement('div');
      iconDiv.className = 'finance-card-icon';
      iconDiv.style.background = c.iconBg;
      iconDiv.style.color = c.iconColor;
      // ICONS contém apenas SVGs estáticos definidos no código (sem dados do usuário)
      iconDiv.innerHTML = c.icon;
      article.appendChild(iconDiv);

      const labelP = document.createElement('p');
      labelP.className = 'cash-label';
      labelP.textContent = c.label;
      article.appendChild(labelP);

      const valueDiv = document.createElement('div');
      valueDiv.className = `cash-value ${c.valueCls}`;
      valueDiv.textContent = ShopNow.money(c.value);
      article.appendChild(valueDiv);

      const metaP = document.createElement('p');
      metaP.className = 'cash-meta';
      metaP.textContent = label; // ex: "Semana" embaixo do valor
      article.appendChild(metaP);

      summaryEl.appendChild(article);
    });
  }

  // ---------------------------------------------------------
  // Renderiza a tabela de movimentações, ordenada da mais
  // recente para a mais antiga
  // ---------------------------------------------------------
  function renderTable(entries) {
    const tbody  = document.querySelector('[data-admin-cashflow]');
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

    tbody.innerHTML = '';

    if (!sorted.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5;
      td.className = 'table-empty-cell';
      td.textContent = 'Nenhuma movimentação neste período';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    sorted.forEach(e => {
      const tr = document.createElement('tr');

      // Coluna ID
      const tdId = document.createElement('td');
      const idSpan = document.createElement('span');
      idSpan.className = 'text-muted text-sm';
      idSpan.textContent = e.id;
      tdId.appendChild(idSpan);
      tr.appendChild(tdId);

      // Coluna Descrição + Categoria
      const tdDesc = document.createElement('td');
      const descText = document.createTextNode(e.description);
      tdDesc.appendChild(descText);
      const br = document.createElement('br');
      tdDesc.appendChild(br);
      const catSpan = document.createElement('span');
      catSpan.className = 'text-muted text-sm';
      catSpan.textContent = e.category;
      tdDesc.appendChild(catSpan);
      tr.appendChild(tdDesc);

      // Coluna Pagamento
      const tdPayment = document.createElement('td');
      tdPayment.textContent = e.paymentMethod;
      tr.appendChild(tdPayment);

      // Coluna Data
      const tdDate = document.createElement('td');
      const dateSpan = document.createElement('span');
      dateSpan.className = 'text-muted text-sm';
      dateSpan.textContent = e.date;
      tdDate.appendChild(dateSpan);
      tr.appendChild(tdDate);

      // Coluna Valor (+ verde para entrada, − vermelho para saída)
      const tdAmount = document.createElement('td');
      tdAmount.className = e.type === 'income' ? 'cash-income' : 'cash-expense';
      tdAmount.textContent = `${e.type === 'income' ? '+' : '−'} ${ShopNow.money(e.amount)}`;
      tr.appendChild(tdAmount);

      tbody.appendChild(tr);
    });
  }

  // ---------------------------------------------------------
  // Renderiza o gráfico de barras (Entradas vs Saídas)
  // Destrói o anterior antes de criar para evitar sobreposição
  // ---------------------------------------------------------
  function renderChart(entries) {
    const canvas = document.querySelector('#cashflowChart');
    if (!canvas || !window.Chart) return;

    const income  = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const expense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

    if (cfChart) cfChart.destroy(); // importante: evita "canvas already in use"

    cfChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Entradas', 'Saídas'],
        datasets: [{
          data: [income, expense],
          backgroundColor: ['rgba(34,197,94,.2)', 'rgba(239,68,68,.2)'],
          borderColor:     ['#22c55e', '#ef4444'],
          borderWidth: 2,
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ShopNow.money(ctx.parsed.y)}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
          y: {
            grid: { color: 'rgba(255,255,255,.05)' },
            ticks: { color: '#94a3b8', callback: v => `R$${(v / 1000).toFixed(0)}k` },
          },
        },
      },
    });
  }

  // ---------------------------------------------------------
  // Função principal — chama as 3 renders com o período atual
  // ---------------------------------------------------------
  function render(period) {
    const filtered = filterByPeriod(ShopData.cashflow(), period);
    renderSummary(filtered, period);
    renderTable(filtered);
    renderChart(filtered);
  }

  // ---------------------------------------------------------
  // Inicialização — ouve o clique nas abas e roda "week" padrão
  // ---------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-cf-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-cf-period]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        render(btn.dataset.cfPeriod); // lê o atributo data-cf-period do botão clicado
      });
    });

    render('week'); // período padrão ao carregar a página
  });
})();
