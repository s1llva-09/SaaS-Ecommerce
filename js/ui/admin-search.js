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
      panel.innerHTML = `<div class="search-empty">Nenhum resultado para "${query}"</div>`;
      panel.classList.add('is-open');
      return;
    }

    let html = '';

    if (orders.length) {
      html += `<p class="search-group-label">Pedidos</p>`;
      html += orders.map(o => `
        <a class="search-item" href="orders.html">
          <span class="search-item__title">${o.id} — ${o.customer}</span>
          <span class="search-item__meta">${ShopNow.money(o.total)} · ${o.date}</span>
        </a>
      `).join('');
    }

    if (products.length) {
      html += `<p class="search-group-label">Produtos</p>`;
      html += products.map(p => `
        <a class="search-item" href="products.html">
          <span class="search-item__title">${p.name}</span>
          <span class="search-item__meta">${p.category} · ${ShopNow.money(p.price)}</span>
        </a>
      `).join('');
    }

    panel.innerHTML = html;
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
