// ============================================================
// AUTENTICAÇÃO COM SUPABASE AUTH
// Envia link de confirmação automático por email
// ============================================================

const SUPABASE_URL = 'https://nnkokgtplnuhmhlqarba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua29rZ3RwbG51aG1obHFhcmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjk3MjUsImV4cCI6MjA5NDgwNTcyNX0.2nf1eytsNVNAAi4FymsmTSQEnwpzokGRXV6Lbp7k0pU';

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function supabaseAuth(action, email, password, name = null) {
  let url = `${SUPABASE_URL}/auth/v1/${action}`;

  // Corrige endpoint de login
  if (action === 'signin') {
    url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  }

  const body = {
    email,
    password,
  };

  if (action === 'signup' && name) {
    body.data = { name };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    let data;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', {
        status: response.status,
        responseText: responseText,
        parseError: parseError.message
      });
      throw new Error(`Erro ${response.status}: Resposta inválida do servidor`);
    }

    if (!response.ok) {
      console.error('Erro Supabase:', {
        status: response.status,
        error_description: data.error_description,
        message: data.message,
        full_response: data
      });
      throw new Error(data.error_description || data.message || `Erro ${response.status}: Autenticação falhou`);
    }

    return data;
  } catch (error) {
    console.error('Erro na função supabaseAuth:', error);
    throw error;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ===== MÁSCARA DE TELEFONE =====
  const phoneInput = document.querySelector('[data-phone-mask]');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (value.length <= 2) e.target.value = value;
      else if (value.length <= 7) e.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      else e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    });
  }

  // ===== TOGGLE SENHA =====
  document.querySelectorAll('[data-toggle-password]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const input = btn.closest('.password-field')?.querySelector('.password-input');
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  // ===== REGISTRO COM SUPABASE AUTH =====
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = registerForm.querySelector('[name="name"]').value.trim();
      const email = registerForm.querySelector('[name="email"]').value.trim();
      const phone = registerForm.querySelector('[name="phone"]').value.trim();
      const password = registerForm.querySelector('[name="password"]').value;
      const confirmPassword = registerForm.querySelector('[name="confirm-password"]').value;
      const terms = registerForm.querySelector('[name="terms"]').checked;

      if (!name || !email || !phone || !password || !confirmPassword) {
        showNotification('Preencha todos os campos', 'error');
        return;
      }

      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length !== 11) {
        showNotification('Telefone deve ter 11 dígitos', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showNotification('Email inválido', 'error');
        return;
      }

      if (password.length < 8) {
        showNotification('Senha mínimo 8 caracteres', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showNotification('Senhas não correspondem', 'error');
        return;
      }

      if (!terms) {
        showNotification('Aceite os termos', 'error');
        return;
      }

      try {
        showNotification('Criando conta...', 'info');

        // Registra com Supabase Auth
        const result = await supabaseAuth('signup', email, password, name);

        showNotification('✓ Verifique seu email para confirmar a conta!', 'success');

        // Limpa formulário
        registerForm.reset();

        // Redireciona após 2 segundos
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } catch (error) {
        console.error('Erro registro:', error);
        showNotification(`Erro: ${error.message}`, 'error');
      }
    });
  }

  // ===== LOGIN COM SUPABASE AUTH =====
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = loginForm.querySelector('[name="email"]').value.trim();
      const password = loginForm.querySelector('[name="password"]').value;

      if (!email || !password) {
        showNotification('Preencha todos os campos', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showNotification('Email inválido', 'error');
        return;
      }

      try {
        showNotification('Entrando...', 'info');

        // Login com Supabase Auth
        const result = await supabaseAuth('signin', email, password);

        // Salva token (compatível com /token endpoint)
        const token = result.access_token || result.session?.access_token;
        localStorage.setItem('supabase_token', token);
        localStorage.setItem('user', JSON.stringify({
          id: result.user?.id || email,
          email: result.user?.email || email,
          name: result.user?.user_metadata?.name || 'Usuário',
        }));

        showNotification('Bem-vindo!', 'success');

        setTimeout(() => {
          window.location.href = 'account.html';
        }, 1500);
      } catch (error) {
        console.error('Erro login:', error);
        showNotification(`Erro: ${error.message}`, 'error');
      }
    });
  }

  // ===== RECUPERAÇÃO DE SENHA =====
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = forgotForm.querySelector('[name="email"]').value.trim();

      if (!email || !isValidEmail(email)) {
        showNotification('Email inválido', 'error');
        return;
      }

      try {
        showNotification('Enviando link...', 'info');

        const response = await fetch(
          `${SUPABASE_URL}/auth/v1/recover`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ email }),
          }
        );

        if (!response.ok) {
          throw new Error('Erro ao enviar link');
        }

        showNotification('✓ Link enviado para seu email!', 'success');
        forgotForm.reset();
      } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao enviar link', 'error');
      }
    });
  }

  // ===== RESET PASSWORD =====
  const resetForm = document.getElementById('resetPasswordForm');
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const password = resetForm.querySelector('[name="password"]').value;
      const confirmPassword = resetForm.querySelector('[name="confirm-password"]').value;

      if (!password || !confirmPassword) {
        showNotification('Preencha todos os campos', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showNotification('Senhas não correspondem', 'error');
        return;
      }

      try {
        showNotification('Atualizando senha...', 'info');

        const token = localStorage.getItem('supabase_token');
        const response = await fetch(
          `${SUPABASE_URL}/auth/v1/user`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'apikey': SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ password }),
          }
        );

        if (!response.ok) {
          throw new Error('Erro ao atualizar senha');
        }

        showNotification('✓ Senha atualizada!', 'success');

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao atualizar senha', 'error');
      }
    });
  }
});
