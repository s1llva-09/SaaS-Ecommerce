// ============================================================
// UI: AUTENTICAÇÃO
// ============================================================

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
  }
  return Math.abs(hash).toString(16);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return /\d/.test(password) && /[a-zA-Z]/.test(password);
}

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 400px;
    padding: 16px 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    z-index: 1000;
  `;

  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Aguarda ShopData estar pronto
  let shopDataReady = false;
  if (typeof ShopData !== 'undefined' && ShopData.ready) {
    try {
      await ShopData.ready();
      shopDataReady = true;
    } catch (err) {
      console.warn('ShopData erro:', err);
    }
  }

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

  // ===== LOGIN =====
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    // Pré-preenche email se vindo da verificação
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      const emailInput = loginForm.querySelector('[name="email"]');
      if (emailInput) {
        emailInput.value = decodeURIComponent(emailParam);
        emailInput.focus();
      }
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('[name="email"]').value;
      const password = loginForm.querySelector('[name="password"]').value;

      if (!email || !password) {
        showNotification('Preencha todos os campos', 'error');
        return;
      }

      if (!shopDataReady || typeof ShopData === 'undefined') {
        showNotification('Sistema não está pronto. Recarregue a página.', 'error');
        return;
      }

      try {
        const user = await ShopData.getUserByEmail(email);
        if (!user || user.password_hash !== simpleHash(password)) {
          showNotification('Email ou senha incorretos', 'error');
          return;
        }

        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        }));

        showNotification('Bem-vindo! Redirecionando...', 'success');
        setTimeout(() => {
          window.location.href = 'account.html';
        }, 1500);
      } catch (error) {
        console.error('Erro login:', error);
        showNotification('Erro ao fazer login', 'error');
      }
    });
  }

  // ===== REGISTRO =====
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const emailInput = registerForm.querySelector('[name="email"]');

    // Validação email em tempo real
    if (emailInput && shopDataReady) {
      let timeout;
      emailInput.addEventListener('input', async (e) => {
        clearTimeout(timeout);
        const email = e.target.value.trim();

        if (!email || !isValidEmail(email)) {
          e.target.style.borderColor = '';
          return;
        }

        timeout = setTimeout(async () => {
          try {
            const existing = await ShopData.getUserByEmail(email);
            e.target.style.borderColor = existing ? '#ef4444' : '#10b981';
            if (existing) showNotification('Email já cadastrado', 'error');
          } catch (err) {
            console.warn('Erro validar email:', err);
          }
        }, 500);
      });
    }

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = registerForm.querySelector('[name="name"]').value;
      const email = registerForm.querySelector('[name="email"]').value;
      const phone = registerForm.querySelector('[name="phone"]').value;
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

      if (!isStrongPassword(password)) {
        showNotification('Senha precisa de números e letras', 'error');
        return;
      }

      if (!terms) {
        showNotification('Aceite os termos', 'error');
        return;
      }

      if (!shopDataReady || typeof ShopData === 'undefined') {
        showNotification('Sistema não está pronto. Recarregue a página.', 'error');
        return;
      }

      try {
        await ShopData.registerUser(email, name, phoneDigits, simpleHash(password));

        // Gera código de verificação no Supabase
        const verificationCode = await ShopData.createEmailVerification(email);

        if (!verificationCode) {
          showNotification('Erro ao gerar código de verificação', 'error');
          return;
        }

        // Salva na sessão apenas o email
        sessionStorage.setItem('pending-verification', JSON.stringify({
          email,
          name,
          phone: phoneDigits,
        }));

        console.log(`✓ Código gerado: ${verificationCode}`);
        showNotification(`✓ Conta criada! Verifique seu email`, 'success');
        setTimeout(() => {
          window.location.href = 'verify-email.html';
        }, 1500);
      } catch (error) {
        console.error('Erro registro:', error);
        showNotification('Erro ao criar conta', 'error');
      }
    });
  }

  // ===== RECUPERAÇÃO SENHA =====
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = forgotForm.querySelector('[name="email"]').value;

      if (!email || !isValidEmail(email)) {
        showNotification('Email inválido', 'error');
        return;
      }

      if (!shopDataReady || typeof ShopData === 'undefined') {
        showNotification('Sistema não está pronto. Recarregue a página.', 'error');
        return;
      }

      try {
        const user = await ShopData.getUserByEmail(email);
        if (!user) {
          showNotification('Email não encontrado', 'error');
          return;
        }

        const token = await ShopData.requestPasswordReset(email);
        if (!token) {
          showNotification('Erro ao solicitar reset', 'error');
          return;
        }

        console.log(`[Demo] Reset link: ?reset=${token}&email=${encodeURIComponent(email)}`);
        showNotification('Link enviado! (verifique console)', 'success');
        forgotForm.reset();
      } catch (error) {
        console.error('Erro forgot:', error);
        showNotification('Erro ao processar', 'error');
      }
    });
  }

  // ===== RESET SENHA =====
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

      if (password.length < 8) {
        showNotification('Senha mínimo 8 caracteres', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showNotification('Senhas não correspondem', 'error');
        return;
      }

      if (!isStrongPassword(password)) {
        showNotification('Senha precisa de números e letras', 'error');
        return;
      }

      if (!shopDataReady || typeof ShopData === 'undefined') {
        showNotification('Sistema não está pronto. Recarregue a página.', 'error');
        return;
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('reset');
        const email = params.get('email');

        if (!token || !email) {
          showNotification('Link inválido', 'error');
          return;
        }

        const resetRecord = await ShopData.verifyPasswordResetToken(email, token);
        if (!resetRecord) {
          showNotification('Link expirado', 'error');
          return;
        }

        await ShopData.resetPassword(email, token, simpleHash(password));
        showNotification('✓ Senha redefinida! Redirecionando...', 'success');
        setTimeout(() => {
          window.location.href = 'register.html';
        }, 1500);
      } catch (error) {
        console.error('Erro reset:', error);
        showNotification('Erro ao redefinir', 'error');
      }
    });
  }
});
