// ============================================================
// ADMIN: BADGES DINÂMICOS
// Atualiza badges do menu lateral baseado em dados reais
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  function updateAllBadges() {
    if (typeof ShopData === 'undefined') return;

    // Badge de Pedidos
    const ordersBadge = document.querySelector('[data-orders-badge]');
    if (ordersBadge) {
      const ordersCount = ShopData.orders().length;
      if (ordersCount > 0) {
        ordersBadge.textContent = String(ordersCount);
        ordersBadge.style.display = '';
      } else {
        ordersBadge.style.display = 'none';
      }
    }

    // Badge de Produtos
    const productsBadge = document.querySelector('[data-products-badge]');
    if (productsBadge) {
      const productsCount = ShopData.products().length;
      if (productsCount > 0) {
        productsBadge.textContent = String(productsCount);
        productsBadge.style.display = '';
      } else {
        productsBadge.style.display = 'none';
      }
    }

    // Badge de Clientes
    const customersBadge = document.querySelector('[data-customers-badge]');
    if (customersBadge) {
      const customersCount = ShopData.customers().length;
      if (customersCount > 0) {
        customersBadge.textContent = String(customersCount);
        customersBadge.style.display = '';
      } else {
        customersBadge.style.display = 'none';
      }
    }

    // Badge de Caixa
    const cashflowBadge = document.querySelector('[data-cashflow-badge]');
    if (cashflowBadge) {
      const cashflowCount = ShopData.cashflow().length;
      if (cashflowCount > 0) {
        cashflowBadge.textContent = String(cashflowCount);
        cashflowBadge.style.display = '';
      } else {
        cashflowBadge.style.display = 'none';
      }
    }

    // Badge de Relatórios (baseado em pedidos/vendas)
    const reportsBadge = document.querySelector('[data-reports-badge]');
    if (reportsBadge) {
      const ordersCount = ShopData.orders().length;
      if (ordersCount > 0) {
        reportsBadge.textContent = String(ordersCount);
        reportsBadge.style.display = '';
      } else {
        reportsBadge.style.display = 'none';
      }
    }

    // Badge de Promoções
    const promotionsBadge = document.querySelector('[data-promotions-badge]');
    if (promotionsBadge) {
      const promotionsCount = ShopData.promotions().length;
      if (promotionsCount > 0) {
        promotionsBadge.textContent = String(promotionsCount);
        promotionsBadge.style.display = '';
      } else {
        promotionsBadge.style.display = 'none';
      }
    }
  }

  // Aguarda dados e atualiza badges
  if (typeof ShopData !== 'undefined') {
    ShopData.ready().then(() => {
      updateAllBadges();
    });
  }
});
