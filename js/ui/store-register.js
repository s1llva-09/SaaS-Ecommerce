// ============================================================
// UI: REGISTRAR
// Carrega dados da loja e comum na página de registro
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Link para login se já tem conta
  const loginLink = document.querySelector('a[href="login.html"]');
  if (loginLink) {
    loginLink.href = '../index.html';
  }
});
