// ============================================================
// UI: AUTENTICAÇÃO (LOGIN, REGISTRO, RECUPERAÇÃO)
// Controla funcionalidades como mostrar/esconder senha, validações, etc
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
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
    loginForm.addEventListener('submit', (e) => {
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
      
      // Aqui você chamaria sua API de login
      console.log('Login attempt:', { email, password });
      showNotification('Entrando na sua conta...', 'success');
      
      // Simula redirecionamento após sucesso
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1500);
    });
  }

  // ---------------------------------------------------------
  // Validação de Formulário de Registro
  // ---------------------------------------------------------
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = registerForm.querySelector('[name="name"]').value;
      const email = registerForm.querySelector('[name="email"]').value;
      const password = registerForm.querySelector('[name="password"]').value;
      const confirmPassword = registerForm.querySelector('[name="confirm-password"]').value;
      const terms = registerForm.querySelector('[name="terms"]').checked;
      
      // Validações
      if (!name || !email || !password || !confirmPassword) {
        showNotification('Por favor, preencha todos os campos', 'error');
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
      
      // Aqui você chamaria sua API de registro
      console.log('Register attempt:', { name, email, password });
      showNotification('Criando sua conta...', 'success');
      
      // Simula redirecionamento após sucesso
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    });
  }

  // ---------------------------------------------------------
  // Validação de Formulário de Recuperação de Senha
  // ---------------------------------------------------------
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', (e) => {
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
      
      // Aqui você chamaria sua API de recuperação de senha
      console.log('Forgot password attempt:', { email });
      showNotification('Enviando link de recuperação...', 'success');
      
      // Simula sucesso
      setTimeout(() => {
        showNotification('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success');
        forgotPasswordForm.reset();
      }, 1500);
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
