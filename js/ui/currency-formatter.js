// Formata campos de valor monetário
document.addEventListener('DOMContentLoaded', () => {
  const currencyInputs = document.querySelectorAll('input[name*="Value"], input[name*="value"], input[type="number"]');

  currencyInputs.forEach(input => {
    // Para input type="number", manter sempre com ponto
    if (input.type === 'number') {
      input.addEventListener('blur', (e) => {
        const value = parseFloat(e.target.value) || 0;
        e.target.value = value.toFixed(2);
      });

      input.addEventListener('input', (e) => {
        // Remove tudo exceto números e ponto
        e.target.value = e.target.value.replace(/[^\d.]/g, '');
        // Garante apenas um ponto
        let parts = e.target.value.split('.');
        if (parts.length > 2) {
          e.target.value = parts[0] + '.' + parts.slice(1).join('');
        }
      });
    }
  });
});
