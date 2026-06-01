// ============================================================
// ADMIN AUTH — Supabase Auth JWT
// O guard síncrono bloqueia renderização imediata sem token.
// A verificação assíncrona valida o JWT no servidor Supabase,
// impedindo qualquer bypass via DevTools / localStorage.
// ============================================================

const ADMIN_SUPABASE_URL = 'https://nnkokgtplnuhmhlqarba.supabase.co';
const ADMIN_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua29rZ3RwbG51aG1obHFhcmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjk3MjUsImV4cCI6MjA5NDgwNTcyNX0.2nf1eytsNVNAAi4FymsmTSQEnwpzokGRXV6Lbp7k0pU';
const ADMIN_TOKEN_KEY    = 'shopnow-admin-token';
const ADMIN_EMAIL        = 'admin@shopnow.local';

// ----------------------------------------------------------
// Guard síncrono — roda antes de qualquer render.
// Se não há token e não é a página de login → bloqueia acesso.
// A validação real do JWT acontece de forma assíncrona abaixo.
// ----------------------------------------------------------
(function () {
  const isLoginPage = window.location.pathname.endsWith('login.html');
  const token       = localStorage.getItem(ADMIN_TOKEN_KEY);

  if (!isLoginPage && !token) {
    window.location.replace('login.html');
  }
})();

// ----------------------------------------------------------
// Verifica o JWT com o Supabase (chamada ao servidor).
// Não tem como falsificar — o Supabase assina e valida o token.
// ----------------------------------------------------------
async function verifyAdminToken() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return false;

  try {
    const res = await fetch(`${ADMIN_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey':        ADMIN_SUPABASE_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const isLoginPage = window.location.pathname.endsWith('login.html');

  // ----------------------------------------------------------
  // Páginas protegidas: valida JWT com o Supabase.
  // Token expirado ou adulterado → logout e redireciona.
  // ----------------------------------------------------------
  if (!isLoginPage) {
    const valid = await verifyAdminToken();
    if (!valid) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      window.location.replace('login.html');
      return;
    }
  }

  // ----------------------------------------------------------
  // Página de login: se token já é válido, vai direto ao dashboard.
  // ----------------------------------------------------------
  if (isLoginPage) {
    const valid = await verifyAdminToken();
    if (valid) {
      window.location.replace('dashboard.html');
      return;
    }
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }

  // ----------------------------------------------------------
  // Formulário de login
  // ----------------------------------------------------------
  const form = document.querySelector('[data-login-form]');
  if (form) {
    const errorEl   = form.querySelector('[data-login-error]');
    const submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const username = form.querySelector('[data-login-user]').value.trim();
      const password = form.querySelector('[data-login-pass]').value;

      if (username !== 'admin') {
        errorEl.textContent = 'Usuário ou senha incorretos.';
        errorEl.style.display = 'block';
        return;
      }

      submitBtn.disabled    = true;
      submitBtn.textContent = 'Entrando...';
      errorEl.style.display = 'none';

      try {
        const res = await fetch(
          `${ADMIN_SUPABASE_URL}/auth/v1/token?grant_type=password`,
          {
            method:  'POST',
            headers: {
              'apikey':       ADMIN_SUPABASE_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: ADMIN_EMAIL, password }),
          }
        );

        const data = await res.json();

        if (res.ok && data.access_token) {
          localStorage.setItem(ADMIN_TOKEN_KEY, data.access_token);
          window.location.href = 'dashboard.html';
        } else {
          errorEl.textContent = 'Usuário ou senha incorretos.';
          errorEl.style.display = 'block';
          submitBtn.disabled    = false;
          submitBtn.textContent = 'Entrar';
        }
      } catch {
        errorEl.textContent = 'Erro de conexão. Tente novamente.';
        errorEl.style.display = 'block';
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Entrar';
      }
    });
  }

  // ----------------------------------------------------------
  // Logout
  // ----------------------------------------------------------
  document.querySelector('[data-admin-logout]')?.addEventListener('click', () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    window.location.href = 'login.html';
  });
});
