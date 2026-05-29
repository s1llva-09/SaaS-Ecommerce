// ============================================================
// UI ADMIN: CAIXA
// Cards financeiros, tabela e gráfico temporal de fluxo.
// ============================================================

// Envolve tudo em IIFE para não poluir o escopo global
(function () {
  let cfChart = null;
  let activePeriod = 'week';

  // ---------------------------------------------------------
  // getMockToday() — encontra a data mais recente nos dados
  // para usar como "hoje" do sistema mock, evitando comparar
  // com a data real do PC (que seria posterior aos dados).
  // ---------------------------------------------------------
  function getMockToday() {
    return ShopData.cashflow()
      .map(e => e.date.slice(0, 10))
      .sort()
      .at(-1);
  }

  // ---------------------------------------------------------
  // filterByPeriod() — filtra entradas pelo período selecionado.
  // Comparação por string ISO funciona porque datas no formato
  // "AAAA-MM-DD" ordenam corretamente de forma lexicográfica.
  // ---------------------------------------------------------
  function filterByPeriod(entries, period) {
    const today = getMockToday();

    return entries.filter(e => {
      const d = e.date.slice(0, 10);

      if (period === 'today') return d === today;

      if (period === 'week') {
        // Últimos 7 dias contando hoje
        const start = new Date(today + 'T00:00:00');
        start.setDate(start.getDate() - 6);
        return d >= start.toISOString().slice(0, 10);
      }

      if (period === 'month') return d.slice(0, 7) === today.slice(0, 7);
      if (period === 'year')  return d.slice(0, 4) === today.slice(0, 4);

      return true;
    });
  }

  // ---------------------------------------------------------
  // groupByTime() — agrupa as entradas por unidade de tempo.
  // week/month/today → por dia (YYYY-MM-DD).
  // year            → por mês (YYYY-MM) para não ter muitos pontos.
  // ---------------------------------------------------------
  function groupByTime(entries, period) {
    const map = {};
    entries.forEach(e => {
      const key = period === 'year' ? e.date.slice(0, 7) : e.date.slice(0, 10);
      if (!map[key]) map[key] = { income: 0, expense: 0 };
      if (e.type === 'income') map[key].income  += e.amount;
      else                     map[key].expense += e.amount;
    });
    return map;
  }

  // ---------------------------------------------------------
  // fmtLabel() — formata a chave de tempo para o label do eixo X.
  // year → "Mai", "Jun" etc.
  // outros → "19/05", "20/05" etc.
  // ---------------------------------------------------------
  function fmtLabel(key, period) {
    if (period === 'year') {
      const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      return months[parseInt(key.slice(5, 7)) - 1];
    }
    return `${key.slice(8, 10)}/${key.slice(5, 7)}`;
  }

  const PERIOD_LABEL = { today: 'Hoje', week: 'Semana', month: 'Mês', year: 'Ano' };

  // SVGs estáticos dos ícones dos cards de resumo
  const ICONS = {
    balance: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    up:      `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    down:    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
  };

  // ---------------------------------------------------------
  // renderSummary() — renderiza os 3 cards (Saldo/Entradas/Saídas).
  // O metadado mostra o label do período + contagem de transações.
  // ---------------------------------------------------------
  function renderSummary(entries, period) {
    const income  = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const expense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    const balance = income - expense;
    const label   = PERIOD_LABEL[period];

    const cards = [
      {
        label: 'Saldo', value: balance,
        valueCls:  balance >= 0 ? 'cash-positive' : 'cash-negative',
        iconBg:    balance >= 0 ? 'rgba(99,102,241,.15)' : 'rgba(239,68,68,.15)',
        iconColor: balance >= 0 ? '#818cf8' : '#ef4444',
        icon: ICONS.balance,
        count: entries.length,
      },
      {
        label: 'Entradas', value: income,
        valueCls: 'cash-positive', iconBg: 'rgba(34,197,94,.15)', iconColor: '#22c55e',
        icon: ICONS.up,
        count: entries.filter(e => e.type === 'income').length,
      },
      {
        label: 'Saídas', value: expense,
        valueCls: 'cash-negative', iconBg: 'rgba(239,68,68,.15)', iconColor: '#ef4444',
        icon: ICONS.down,
        count: entries.filter(e => e.type === 'expense').length,
      },
    ];

    const summaryEl = document.querySelector('[data-cash-summary]');
    summaryEl.innerHTML = '';

    cards.forEach(c => {
      const article = document.createElement('article');
      article.className = 'admin-card';

      const iconDiv = document.createElement('div');
      iconDiv.className = 'finance-card-icon';
      iconDiv.style.background = c.iconBg;   // dinâmico: varia conforme saldo positivo/negativo
      iconDiv.style.color = c.iconColor;
      iconDiv.innerHTML = c.icon;            // SVG estático definido acima
      article.appendChild(iconDiv);

      const labelP = document.createElement('p');
      labelP.className = 'cash-label';
      labelP.textContent = c.label;
      article.appendChild(labelP);

      const valueDiv = document.createElement('div');
      valueDiv.className = `cash-value ${c.valueCls}`;
      valueDiv.textContent = ShopNow.money(c.value);
      article.appendChild(valueDiv);

      // Metadado: período + contagem de transações
      const metaP = document.createElement('p');
      metaP.className = 'cash-meta';
      metaP.textContent = `${label} · ${c.count} transaç${c.count === 1 ? 'ão' : 'ões'}`;
      article.appendChild(metaP);

      summaryEl.appendChild(article);
    });
  }

  // ---------------------------------------------------------
  // renderTable() — tabela de movimentações ordenada da mais
  // recente para a mais antiga, com badge de tipo na 1ª coluna.
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

      // Coluna Tipo — badge colorido Entrada/Saída
      const tdType = document.createElement('td');
      const typeBadge = document.createElement('span');
      typeBadge.className = e.type === 'income' ? 'badge badge-green' : 'badge badge-red';
      typeBadge.textContent = e.type === 'income' ? 'Entrada' : 'Saída';
      tdType.appendChild(typeBadge);
      tr.appendChild(tdType);

      // Coluna Descrição + Categoria
      const tdDesc = document.createElement('td');
      tdDesc.appendChild(document.createTextNode(e.description));
      tdDesc.appendChild(document.createElement('br'));
      const catSpan = document.createElement('span');
      catSpan.className = 'text-muted text-sm';
      catSpan.textContent = e.category;
      tdDesc.appendChild(catSpan);
      tr.appendChild(tdDesc);

      // Coluna Método de pagamento
      const tdPayment = document.createElement('td');
      tdPayment.textContent = e.paymentMethod;
      tr.appendChild(tdPayment);

      // Coluna Data
      const tdDate = document.createElement('td');
      const dateSpan = document.createElement('span');
      dateSpan.className = 'text-muted text-sm';
      dateSpan.textContent = e.date.slice(0, 10); // só a parte AAAA-MM-DD
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
  // renderChart() — gráfico de barras agrupadas por data/mês.
  // Mostra entradas (verde) vs saídas (vermelho) ao longo do
  // período, muito mais informativo que 2 barras totais.
  // Recebe o period para saber como agrupar as datas.
  // ---------------------------------------------------------
  function renderChart(entries, period) {
    const canvas = document.querySelector('#cashflowChart');
    if (!canvas || !window.Chart) return;

    const grouped = groupByTime(entries, period);
    const keys    = Object.keys(grouped).sort();

    if (cfChart) cfChart.destroy(); // evita "canvas already in use"

    cfChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: keys.map(k => fmtLabel(k, period)),
        datasets: [
          {
            label: 'Entradas',
            data: keys.map(k => grouped[k].income),
            backgroundColor: 'rgba(34,197,94,.25)',
            borderColor: '#22c55e',
            borderWidth: 2,
            borderRadius: 6,
          },
          {
            label: 'Saídas',
            data: keys.map(k => grouped[k].expense),
            backgroundColor: 'rgba(239,68,68,.25)',
            borderColor: '#ef4444',
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 12 } } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ShopNow.money(ctx.parsed.y)}` } },
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
  // render(period) — orquestra os 3 componentes da página.
  // ---------------------------------------------------------
  function render(period) {
    activePeriod = period;
    const filtered = filterByPeriod(ShopData.cashflow(), period);
    renderSummary(filtered, period);
    renderTable(filtered);
    renderChart(filtered, period);
  }

  // ---------------------------------------------------------
  // Modal de nova movimentação.
  // ---------------------------------------------------------
  function openCfModal() {
    document.querySelector('[name="cfDate"]').value = getMockToday();
    document.querySelector('[data-cf-modal-overlay]').classList.remove('is-hidden');
  }

  function closeCfModal() {
    document.querySelector('[data-cf-modal-overlay]').classList.add('is-hidden');
    document.getElementById('cfForm').reset();
  }

  // ---------------------------------------------------------
  // Inicialização — ouve as abas de período e carrega "week".
  // ---------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-cf-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-cf-period]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        render(btn.dataset.cfPeriod);
      });
    });

    document.querySelector('[data-cf-new]').addEventListener('click', openCfModal);
    document.querySelector('[data-cf-modal-close]').addEventListener('click', closeCfModal);
    document.querySelector('[data-cf-modal-cancel]').addEventListener('click', closeCfModal);
    document.querySelector('[data-cf-modal-overlay]').addEventListener('click', e => {
      if (e.target === e.currentTarget) closeCfModal();
    });

    document.getElementById('cfForm').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const amount = parseFloat(fd.get('cfAmount'));
      if (!amount || amount <= 0) return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      ShopData.addCashflow({
        id: `CF_${Date.now()}`,
        type: fd.get('cfType'),
        description: fd.get('cfDesc').trim(),
        category: fd.get('cfCategory'),
        amount,
        date: `${fd.get('cfDate')} ${hh}:${mm}`,
        paymentMethod: fd.get('cfPayment'),
      });
      closeCfModal();
      render(activePeriod);
      ShopNow.toast('Movimentação registrada com sucesso', 'success');
    });

    render('week');
  });
})();
