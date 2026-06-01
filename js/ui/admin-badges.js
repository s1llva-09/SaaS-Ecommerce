// ============================================================
// ADMIN: BADGES DINÂMICOS
// Atualiza badges do menu lateral baseado em dados reais
// ============================================================

const ADMIN_BADGE_COUNTS_KEY = 'shopnow-admin-badge-counts';

document.addEventListener('DOMContentLoaded', () => {
  function getStoredCounts() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_BADGE_COUNTS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveStoredCounts(counts) {
    localStorage.setItem(ADMIN_BADGE_COUNTS_KEY, JSON.stringify(counts));
  }

  function showBadge(badge, diff) {
    if (!badge) return;
    if (diff > 0) {
      badge.textContent = String(diff);
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  function updateAllBadges() {
    if (typeof ShopData === 'undefined') return;

    const current = {
      orders: ShopData.orders().length,
      products: ShopData.products().length,
      customers: ShopData.customers().length,
      cashflow: ShopData.cashflow().length,
      reports: ShopData.orders().length,
      promotions: ShopData.promotions().length,
    };

    const previous = getStoredCounts();
    const hasPrevious = Object.keys(previous).length > 0;

    showBadge(
      document.querySelector('[data-orders-badge]'),
      hasPrevious ? Math.max(0, current.orders - (previous.orders || 0)) : 0
    );

    showBadge(
      document.querySelector('[data-products-badge]'),
      hasPrevious ? Math.max(0, current.products - (previous.products || 0)) : 0
    );

    showBadge(
      document.querySelector('[data-customers-badge]'),
      hasPrevious ? Math.max(0, current.customers - (previous.customers || 0)) : 0
    );

    showBadge(
      document.querySelector('[data-cashflow-badge]'),
      hasPrevious ? Math.max(0, current.cashflow - (previous.cashflow || 0)) : 0
    );

    showBadge(
      document.querySelector('[data-reports-badge]'),
      hasPrevious ? Math.max(0, current.reports - (previous.reports || 0)) : 0
    );

    showBadge(
      document.querySelector('[data-promotions-badge]'),
      hasPrevious ? Math.max(0, current.promotions - (previous.promotions || 0)) : 0
    );

    saveStoredCounts(current);
  }

  // Aguarda dados e atualiza badges
  if (typeof ShopData !== 'undefined') {
    ShopData.ready().then(() => {
      updateAllBadges();
    });
  }
});
