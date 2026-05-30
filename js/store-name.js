// Atualiza nome da loja no header da home
document.addEventListener('DOMContentLoaded', async () => {
  await ShopData.ready();

  const storeNameEl = document.querySelector('[data-store-name]');
  if (storeNameEl) {
    const storeName = ShopData.settings()?.geral?.storeName || 'ShopNow';
    storeNameEl.textContent = storeName;
  }
});
