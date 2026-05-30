// ============================================================
// UI: AUTENTICAÇÃO (LOGIN, REGISTRO, RECUPERAÇÃO)
// Controla funcionalidades como mostrar/esconder senha, validações, etc
// ============================================================

// Hash simples de senha (não é criptografia real, apenas para demo)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converte para 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Aguarda ShopData estar pronto
async function initAuth() {
  // Aguarda até 5 segundos por ShopData
  let attempts = 0;
  while (typeof ShopData === 'undefined' && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  if (typeof ShopData !== 'undefined' && ShopData.ready) {
    try {
      await ShopData.ready();
    } catch (err) {
      console.warn('ShopData.ready() falhou:', err);
    }
  }

  // Executa todo código de autenticação
  setupAuthForms();
  // ---------------------------------------------------------
  // Máscara de Telefone
  // ---------------------------------------------------------
  const phoneInput = document.querySelector('[data-phone-mask]');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');

      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      if (value.length <= 2) {
        e.target.value = value;
      } else if (value.length <= 7) {
        e.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else {
        e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      }
    });
  }

  // ---------------------------------------------------------
  // Toggle de Visibilidade de Senha
  // ---------------------------------------------------------
  const passwordToggles = document.querySelectorAll('[data-toggle-password]');
  
  passwordToggles.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Encontra o input de senha associado
      const passwordInput = button.closest('.password-field').querySelector('.password-input');
      
      if (!passwordInput) return;
      
      // Alterna entre password e text
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      
      // Muda o ícone (opcional - SVG já está no HTML)
      button.classList.toggle('is-visible');
    });
  });

  // ---------------------------------------------------------
  // Validação de Formulário de Login
  // ---------------------------------------------------------
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = loginForm.querySelector('[name="email"]').value;
      const password = loginForm.querySelector('[name="password"]').value;

      // Validação simples
      if (!email || !password) {
        showNotification('Por favor, preencha todos os campos', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showNotification('Email inválido', 'error');
        return;
      }

      try {
        showNotification('Verificando credenciais...', 'info');

        // Busca usuário no Supabase
        if (typeof ShopData === 'undefined' || !ShopData.ready) {
          showNotification('Erro: Sistema não está pronto. Recarregue a página.', 'error');
          return;
        }

        await ShopData.ready();
        const user = await ShopData.getUserByEmail(email);

        if (!user) {
          showNotification('Email ou senha incorretos', 'error');
          return;
        }

        // Valida senha (compara hash)
        const passwordHash = simpleHash(password);
        if (user.password_hash !== passwordHash) {
          showNotification('Email ou senha incorretos', 'error');
          return;
        }

        // Login bem-sucedido
        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        };
        localStorage.setItem('user', JSON.stringify(userData));

        console.log('Login success:', userData);
        showNotification('Bem-vindo! Redirecionando...', 'success');

        // Redireciona para a página de perfil após sucesso
        setTimeout(() => {
          window.location.href = 'account.html';
        }, 1500);
      } catch (error) {
        console.error('Erro no login:', error);
        showNotification('Erro ao fazer login. Tente novamente.', 'error');
      }
    });
  }

  // ---------------------------------------------------------
  // Validação de Formulário de Registro
  // ---------------------------------------------------------
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    // Validar email em tempo real
    const emailInput = registerForm.querySelector('[name="email"]');
    let emailCheckTimeout;
    let dataReady = false;

    // Aguarda ShopData estar pronto
    if (typeof ShopData !== 'undefined' && ShopData.ready) {
      ShopData.ready().then(() => {
        dataReady = true;
      }).catch(() => {
        dataReady = false;
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', async (e) => {
        clearTimeout(emailCheckTimeout);
        const email = e.target.value.trim();

        if (!email || !isValidEmail(email)) {
          e.target.style.borderColor = '';
          return;
        }

        emailCheckTimeout = setTimeout(async () => {
          // Verifica se email já existe no Supabase
          if (!dataReady || typeof ShopData === 'undefined') {
            return; // ShopData ainda não está pronto
          }

          try {
            const existingUser = await ShopData.getUserByEmail(email);
            if (existingUser) {
              e.target.style.borderColor = '#ef4444';
              showNotification('Este email já está cadastrado', 'error');
            } else {
              e.target.style.borderColor = '#10b981';
            }
          } catch (error) {
            console.warn('Erro ao validar email:', error);
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

      // Validações
      if (!name || !email || !phone || !password || !confirmPassword) {
        showNotification('Por favor, preencha todos os campos', 'error');
        return;
      }

      const phoneDigits = phone.replace(/\D/g, '');

      if (phoneDigits.length !== 11) {
        showNotification('Número de celular deve ter exatamente 11 dígitos', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showNotification('Email inválido', 'error');
        return;
      }

      if (password.length < 8) {
        showNotification('Senha deve ter pelo menos 8 caracteres', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showNotification('As senhas não correspondem', 'error');
        return;
      }

      if (!terms) {
        showNotification('Você deve aceitar os Termos de Serviço', 'error');
        return;
      }

      // Validação de força da senha
      if (!isStrongPassword(password)) {
        showNotification('Senha deve conter números e letras', 'error');
        return;
      }

      try {
        showNotification('Criando sua conta...', 'success');

        // Salva no Supabase
        if (typeof ShopData === 'undefined' || !ShopData.ready) {
          showNotification('Erro: Sistema não está pronto. Recarregue a página.', 'error');
          return;
        }

        await ShopData.ready();
        const passwordHash = simpleHash(password);
        await ShopData.registerUser(email, name, phoneDigits, passwordHash);

        // Salva no localStorage
        const userData = { id: `U${Date.now()}`, name, email, phone: phoneDigits };
        localStorage.setItem('user', JSON.stringify(userData));

        console.log('Register success:', userData);
        showNotification('Conta criada com sucesso! Redirecionando...', 'success');

        // Redireciona para account após sucesso
        setTimeout(() => {
          window.location.href = 'account.html';
        }, 1500);
      } catch (error) {
        console.error('Erro ao registrar:', error);
        showNotification('Erro ao criar conta. Tente novamente.', 'error');
      }
    });
  }

  // ---------------------------------------------------------
  // Validação de Formulário de Recuperação de Senha
  // ---------------------------------------------------------
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = forgotPasswordForm.querySelector('[name="email"]').value;

      if (!email) {
        showNotification('Por favor, digite seu email', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showNotification('Email inválido', 'error');
        return;
      }

      try {
        showNotification('Verificando email...', 'info');

        // Verifica se usuário existe
        if (typeof ShopData === 'undefined' || !ShopData.ready) {
          showNotification('Erro: Sistema não está pronto. Recarregue a página.', 'error');
          return;
        }

        await ShopData.ready();
        const user = await ShopData.getUserByEmail(email);

        if (!user) {
          showNotification('Nenhuma conta encontrada com este email', 'error');
          return;
        }

        // Cria token de recuperação
        const token = await ShopData.requestPasswordReset(email);

        if (!token) {
          showNotification('Erro ao solicitar recuperação. Tente novamente.', 'error');
          return;
        }

        // Simula envio de email (em produção, enviaria email real)
        console.log(`[Demo] Link de recuperação: ${window.location.origin}${window.location.pathname}?reset=${token}&email=${encodeURIComponent(email)}`);

        showNotification('Enviando link de recuperação...', 'info');

        setTimeout(() => {
          showNotification('✓ Link de recuperação enviado! Verifique seu email.', 'success');
          forgotPasswordForm.reset();
          setTimeout(() => {
            window.location.href = 'register.html';
          }, 2000);
        }, 1000);
      } catch (error) {
        console.error('Erro na recuperação de senha:', error);
        showNotification('Erro ao processar solicitação. Tente novamente.', 'error');
      }
    });
  }

  // ---------------------------------------------------------
  // Validação de Email
  // ---------------------------------------------------------
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ---------------------------------------------------------
  // Validação de Força de Senha
  // Mínimo: 8 caracteres, pelo menos 1 número e 1 letra
  // ---------------------------------------------------------
  function isStrongPassword(password) {
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    return hasNumber && hasLetter;
  }

  // ---------------------------------------------------------
  // Notificação (Toast)
  // ---------------------------------------------------------
  function showNotification(message, type = 'info') {
    // Remove notificação anterior se existir
    const existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }
    
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
      animation: slideIn 0.3s ease-out;
      z-index: 1000;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove após 4 segundos
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 4000);
  }

  // ---------------------------------------------------------
  // Validação de Formulário de Reset de Senha
  // ---------------------------------------------------------
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const password = resetPasswordForm.querySelector('[name="password"]').value;
      const confirmPassword = resetPasswordForm.querySelector('[name="confirm-password"]').value;

      // Validações
      if (!password || !confirmPassword) {
        showNotification('Por favor, preencha todos os campos', 'error');
        return;
      }

      if (password.length < 8) {
        showNotification('Senha deve ter pelo menos 8 caracteres', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showNotification('As senhas não correspondem', 'error');
        return;
      }

      if (!isStrongPassword(password)) {
        showNotification('Senha deve conter números e letras', 'error');
        return;
      }

      try {
        // Pega o token e email da URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('reset');
        const email = params.get('email');

        if (!token || !email) {
          showNotification('Link inválido ou expirado', 'error');
          setTimeout(() => {
            window.location.href = 'forgot-password.html';
          }, 2000);
          return;
        }

        showNotification('Verificando link...', 'info');

        // Verifica token
        if (typeof ShopData === 'undefined' || !ShopData.ready) {
          showNotification('Erro: Sistema não está pronto. Recarregue a página.', 'error');
          return;
        }

        await ShopData.ready();
        const resetRecord = await ShopData.verifyPasswordResetToken(email, token);

        if (!resetRecord) {
          showNotification('Link expirado ou inválido. Solicite um novo.', 'error');
          setTimeout(() => {
            window.location.href = 'forgot-password.html';
          }, 2000);
          return;
        }

        // Reseta a senha
        const passwordHash = simpleHash(password);
        await ShopData.resetPassword(email, token, passwordHash);

        showNotification('✓ Senha redefinida com sucesso!', 'success');

        setTimeout(() => {
          window.location.href = 'register.html';
        }, 2000);
      } catch (error) {
        console.error('Erro ao resetar senha:', error);
        showNotification('Erro ao redefinir senha. Tente novamente.', 'error');
      }
    });
  }

  // Adiciona estilos de animação se não existirem
  if (!document.querySelector('style[data-auth-animations]')) {
    const style = document.createElement('style');
    style.setAttribute('data-auth-animations', '');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(400px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(400px);
        }
      }
    `;
    document.head.appendChild(style);
  }
});
