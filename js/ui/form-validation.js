// ============================================================
// VALIDAÇÕES DE FORMULÁRIOS
// Reutilizável em todas as páginas
// ============================================================

const FormValidator = {
  rules: {
    email: (value) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(value) ? null : 'Email inválido';
    },
    phone: (value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length >= 10 ? null : 'Telefone inválido (mín. 10 dígitos)';
    },
    cpf: (value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 11) return 'CPF deve ter 11 dígitos';
      if (/^(\d)\1{10}$/.test(digits)) return 'CPF inválido';
      return null;
    },
    cep: (value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length === 8 ? null : 'CEP inválido (8 dígitos)';
    },
    password: (value) => {
      if (value.length < 8) return 'Senha mínimo 8 caracteres';
      if (!/[a-z]/.test(value)) return 'Senha deve ter letras minúsculas';
      if (!/[A-Z]/.test(value)) return 'Senha deve ter letras maiúsculas';
      if (!/[0-9]/.test(value)) return 'Senha deve ter números';
      return null;
    },
    required: (value) => {
      return value && value.trim().length > 0 ? null : 'Campo obrigatório';
    },
    minLength: (min) => (value) => {
      return value && value.length >= min ? null : `Mínimo ${min} caracteres`;
    },
    maxLength: (max) => (value) => {
      return value && value.length <= max ? null : `Máximo ${max} caracteres`;
    },
  },

  validate(form, schema) {
    const errors = {};
    const formData = new FormData(form);

    Object.entries(schema).forEach(([fieldName, validators]) => {
      const value = formData.get(fieldName) || '';
      const fieldValidators = Array.isArray(validators) ? validators : [validators];

      for (const validator of fieldValidators) {
        const error = typeof validator === 'function' ? validator(value) : validator;
        if (error) {
          errors[fieldName] = error;
          break;
        }
      }
    });

    return errors;
  },

  showErrors(form, errors) {
    // Remove erros anteriores
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('.field').forEach(el => el.classList.remove('is-invalid'));

    // Mostra novos erros
    Object.entries(errors).forEach(([fieldName, message]) => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        field.classList.add('is-invalid');
        const errorEl = document.createElement('small');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        field.parentNode.appendChild(errorEl);
      }
    });
  },

  clearErrors(form) {
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('.field').forEach(el => el.classList.remove('is-invalid'));
  },
};

// CSS para campos inválidos (adicionar ao index.css)
const validationStyles = `
  .field.is-invalid {
    border-color: #ef4444 !important;
    background: rgba(239, 68, 68, 0.05);
  }

  .field-error {
    display: block;
    margin-top: 4px;
    color: #ef4444;
    font-size: 12px;
    font-weight: 600;
  }
`;

// Injeta estilos se não existir
if (!document.querySelector('#form-validation-styles')) {
  const style = document.createElement('style');
  style.id = 'form-validation-styles';
  style.textContent = validationStyles;
  document.head.appendChild(style);
}
