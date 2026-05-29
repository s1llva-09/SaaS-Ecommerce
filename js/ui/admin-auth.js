// ============================================================
// UI ADMIN: AUTENTICAÇÃO
// Proteção de rota e login. Credenciais mock: admin / admin123.
// ============================================================

// ---------------------------------------------------------
// Guard imediato (IIFE síncrona) — roda antes de qualquer
// renderização para evitar flash de conteúdo não autorizado.
// Se não autenticado em página admin, redireciona para login.
// Se já autenticado e na login page, vai direto ao dashboard.
// ---------------------------------------------------------
(function () {
  const isLoginPage    = window.location.pathname.endsWith('login.html');
  const authenticated  = localStorage.getItem('shopnow-admin-auth') === 'true';

  if (!isLoginPage && !authenticated) {
    window.location.replace('login.html');
  }
  if (isLoginPage && authenticated) {
    window.location.replace('dashboard.html');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------
  // Formulário de login — valida as credenciais e salva sessão.
  // Credenciais são verificadas client-side (mock). Em produção
  // substituir por chamada autenticada ao backend/Supabase.
  // ---------------------------------------------------------
  const form = document.querySelector('[data-login-form]');
  if (form) {
    const errorEl = form.querySelector('[data-login-error]');

    form.addEventListener('submit', e => {
      e.preventDefault();
      const user = form.querySelector('[data-login-user]').value.trim();
      const pass = form.querySelector('[data-login-pass]').value;

      if (user === 'admin' && pass === 'admin123') {
        localStorage.setItem('shopnow-admin-auth', 'true');
        window.location.href = 'dashboard.html';
      } else {
        errorEl.textContent = 'Usuário ou senha incorretos.';
        errorEl.style.display = 'block';
      }
    });
  }

  // ---------------------------------------------------------
  // Botão de logout ([data-admin-logout]) — limpa a sessão
  // do localStorage e redireciona para a tela de login.
  // ---------------------------------------------------------
  document.querySelector('[data-admin-logout]')?.addEventListener('click', () => {
    localStorage.removeItem('shopnow-admin-auth');
    window.location.href = 'login.html';
  });
});
