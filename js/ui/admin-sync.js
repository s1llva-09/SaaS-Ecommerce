// ============================================================
// ADMIN SYNC: Sincroniza mudanças do admin com a loja
// Escuta eventos customizados e localStorage para atualizações
// ============================================================

document.addEventListener('admin:settings:updated', async (e) => {
  console.log('Admin settings updated:', e.detail);
  // Recarrega dados de configurações
  await ShopData.reload();
  // Recarrega conteúdo dinâmico
  location.reload();
});

document.addEventListener('admin:promotions:updated', async (e) => {
  console.log('Admin promotions updated:', e.detail);
  // Recarrega dados de promoções
  await ShopData.reload();
  // Se estiver na home, recarrega as ofertas
  if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    location.reload();
  }
});

document.addEventListener('admin:products:updated', async (e) => {
  console.log('Admin products updated:', e.detail);
  await ShopData.loadSupabaseData();
  location.reload();
});

// Monitorar mudanças via localStorage (sincroniza entre abas)
window.addEventListener('storage', async (e) => {
  if (e.key?.startsWith('admin-settings-update')) {
    console.log('Settings updated from another tab');
    await ShopData.reload();
    location.reload();
  }
  if (e.key?.startsWith('admin-promotions-update')) {
    console.log('Promotions updated from another tab');
    await ShopData.reload();
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
      location.reload();
    }
  }
  if (e.key?.startsWith('admin-products-update')) {
    console.log('Products updated from another tab');
    await ShopData.reload();
    location.reload();
  }
});
