// Atualiza informações da loja dinamicamente a partir das configurações
document.addEventListener('DOMContentLoaded', async () => {
  await ShopData.ready();

  const settings = ShopData.settings();
  const geral = settings.geral || {};
  const comercial = settings.comercial || {};

  const freeShippingValue = comercial.freeShippingValue || 299;
  const freeShippingText = comercial.freeShippingText || `Frete grátis acima de R$ ${freeShippingValue}`;

  // Hero subtitle
  const heroSubtitle = document.querySelector('[data-hero-subtitle]');
  if (heroSubtitle) {
    heroSubtitle.textContent = `Eletrônicos, moda, calçados e muito mais. ${freeShippingText}`;
  }

  // Barra de benefícios
  const freeBenefit = document.querySelector('[data-free-shipping-benefit]');
  if (freeBenefit) {
    freeBenefit.innerHTML = `<span aria-hidden="true">✓</span> ${freeShippingText}`;
  }

  // Rodapé dinâmico
  const footerBenefit = document.querySelector('[data-footer-free-shipping]');
  if (footerBenefit) {
    footerBenefit.textContent = `Suporte 24/7, compra segura e ${freeShippingText}.`;
  }

  window.shopConfig = {
    freeShippingValue,
    freeShippingText,
    storeName: geral.storeName || 'ShopNow',
    logo: String(geral.logo || '').trim(),
    ...comercial,
  };
});
