// Atualiza nome da loja e logo em todos os elementos [data-store-name] da página
document.addEventListener('DOMContentLoaded', async () => {
  await ShopData.ready();

  const settings = ShopData.settings();
  const storeName = settings?.geral?.storeName || 'ShopNow';
  const logoValue = String(settings?.geral?.logo || '').trim();

  document.querySelectorAll('[data-store-name]').forEach(el => {
    el.textContent = storeName;
    const anchor = el.closest('a.store-brand');
    if (!anchor) return;

    let logoImg = anchor.querySelector('[data-store-logo]');
    if (logoValue) {
      if (!logoImg) {
        logoImg = document.createElement('img');
        logoImg.dataset.storeLogo = 'true';
        logoImg.className = 'store-brand__logo';
        logoImg.alt = `${storeName} logo`;
        anchor.insertBefore(logoImg, anchor.firstChild);
      }
      logoImg.src = logoValue;
      anchor.classList.add('store-brand--has-logo');
      anchor.querySelectorAll('.store-brand__mark').forEach(mark => {
        mark.style.display = 'none';
      });
    } else {
      if (logoImg) {
        logoImg.remove();
      }
      anchor.classList.remove('store-brand--has-logo');
      anchor.querySelectorAll('.store-brand__mark').forEach(mark => {
        mark.style.display = '';
      });
    }
  });
});
