// Atualiza informações da loja dinamicamente a partir das configurações
document.addEventListener('DOMContentLoaded', async () => {
  await ShopData.ready();

  const settings = ShopData.settings();
  const comercial = settings.comercial || {};

  // Atualiza texto de frete grátis
  const freeShippingValue = comercial.freeShippingValue || 299;
  const freeShippingText = comercial.freeShippingText || `Frete grátis acima de R$ ${freeShippingValue}`;

  // Atualiza no hero
  const heroText = document.querySelector('section.hero p');
  if (heroText) {
    heroText.textContent = `Eletrônicos, moda, calçados e muito mais. ${freeShippingText}`;
  }

  // Atualiza na seção de benefícios
  const benefitBar = document.querySelector('.benefits-bar__inner');
  if (benefitBar) {
    const benefitItems = benefitBar.querySelectorAll('div');
    if (benefitItems[0]) {
      benefitItems[0].innerHTML = `<span>▱</span> ${freeShippingText}`;
    }
  }

  // Atualiza no carrinho e checkout se existir
  const cartBenefits = document.querySelectorAll('[class*="benefits"] div, [class*="benefit"] div');
  cartBenefits.forEach(item => {
    if (item.textContent && item.textContent.includes('Frete grátis')) {
      item.textContent = freeShippingText;
    }
  });

  // Armazena valor no window para uso em outros scripts
  window.shopConfig = {
    freeShippingValue,
    freeShippingText,
    ...comercial
  };
});
