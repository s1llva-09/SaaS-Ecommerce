// Atualiza nome da loja no header de todas as páginas admin
document.addEventListener('DOMContentLoaded', async () => {
  await ShopData.ready();

  const storeNameEl = document.querySelector('[data-store-name]');
  if (storeNameEl) {
    const storeName = ShopData.settings()?.geral?.storeName || 'ShopNow';
    storeNameEl.innerHTML = `${storeName}<small>Admin Panel</small>`;
  }
});
