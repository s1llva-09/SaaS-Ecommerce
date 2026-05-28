// ============================================================
// UI ADMIN: CONFIGURACOES
// Feedback visual para formularios estaticos.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Intercepta o submit dos formulários e exibe toast de confirmação.
  // Persistência real de configurações ainda não implementada.
  document.querySelectorAll('[data-settings-form]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      ShopNow.toast('Configuracoes salvas');
    });
  });
});
