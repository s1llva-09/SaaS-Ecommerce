// ============================================================
// UI ADMIN: CONFIGURACOES
// Feedback visual para formularios estaticos.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-settings-form]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      ShopNow.toast('Configuracoes salvas');
    });
  });
});
