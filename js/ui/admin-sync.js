// ============================================================
// ADMIN SYNC: Sincroniza mudanças do admin com a loja
// Escuta eventos customizados e localStorage para atualizações
// ============================================================

document.addEventListener('admin:settings:updated', async (e) => {
  console.log('Admin settings updated:', e.detail);
  // Recarrega dados de configurações
  await ShopData.loadSupabaseData();
  // Recarrega conteúdo dinâmico
  location.reload();
});

document.addEventListener('admin:promotions:updated', async (e) => {
  console.log('Admin promotions updated:', e.detail);
  // Recarrega dados de promoções
  await ShopData.loadSupabaseData();
  // Se estiver na home, recarrega as ofertas
  if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    location.reload();
  }
});

// Monitorar mudanças via localStorage (sincroniza entre abas)
window.addEventListener('storage', async (e) => {
  if (e.key?.startsWith('admin-settings-update')) {
    console.log('Settings updated from another tab');
    await ShopData.loadSupabaseData();
    location.reload();
  }
  if (e.key?.startsWith('admin-promotions-update')) {
    console.log('Promotions updated from another tab');
    await ShopData.loadSupabaseData();
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
      location.reload();
    }
  }
});
