// ============================================================
// UI ADMIN: BUSCA GLOBAL
// Pesquisa pedidos e produtos ao digitar na searchbar do topbar.
// Ativo em todas as páginas admin com [data-admin-search].
// Clientes foi excluído pois já tem busca dedicada na tabela.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('[data-admin-search]');
  const panel = document.querySelector('[data-search-results]');
  if (!input || !panel) return;

  // ---------------------------------------------------------
  // Busca e renderiza os resultados no painel
  // ---------------------------------------------------------
  function search(query) {
    const q = query.trim().toLowerCase();

    // Menos de 2 caracteres: fecha sem mostrar nada
    if (q.length < 2) {
      panel.classList.remove('is-open');
      return;
    }

    // Filtra pedidos por ID ou nome do cliente
    const orders = ShopData.orders().filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q)
    ).slice(0, 4);

    // Filtra produtos por nome, categoria ou SKU
    const products = ShopData.products().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    ).slice(0, 4);

    // Sem resultados: mostra mensagem
    if (!orders.length && !products.length) {
      panel.innerHTML = '';
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'search-empty';
      emptyDiv.textContent = `Nenhum resultado para "${query}"`;
      panel.appendChild(emptyDiv);
      panel.classList.add('is-open');
      return;
    }

    panel.innerHTML = '';

    if (orders.length) {
      const groupLabel = document.createElement('p');
      groupLabel.className = 'search-group-label';
      groupLabel.textContent = 'Pedidos';
      panel.appendChild(groupLabel);

      orders.forEach(o => {
        const a = document.createElement('a');
        a.className = 'search-item';
        a.href = 'orders.html';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'search-item__title';
        titleSpan.textContent = `${o.id} — ${o.customer}`;
        a.appendChild(titleSpan);

        const metaSpan = document.createElement('span');
        metaSpan.className = 'search-item__meta';
        metaSpan.textContent = `${ShopNow.money(o.total)} · ${o.date}`;
        a.appendChild(metaSpan);

        panel.appendChild(a);
      });
    }

    if (products.length) {
      const groupLabel = document.createElement('p');
      groupLabel.className = 'search-group-label';
      groupLabel.textContent = 'Produtos';
      panel.appendChild(groupLabel);

      products.forEach(p => {
        const a = document.createElement('a');
        a.className = 'search-item';
        a.href = 'products.html';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'search-item__title';
        titleSpan.textContent = p.name;
        a.appendChild(titleSpan);

        const metaSpan = document.createElement('span');
        metaSpan.className = 'search-item__meta';
        metaSpan.textContent = `${p.category} · ${ShopNow.money(p.price)}`;
        a.appendChild(metaSpan);

        panel.appendChild(a);
      });
    }

    panel.classList.add('is-open');
  }

  // Debounce: espera 200ms após o usuário parar de digitar
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => search(input.value), 200);
  });

  // Fecha ao clicar fora do wrapper
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrapper')) {
      panel.classList.remove('is-open');
    }
  });

  // Escape fecha e limpa o campo
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      panel.classList.remove('is-open');
      input.value = '';
    }
  });
});
