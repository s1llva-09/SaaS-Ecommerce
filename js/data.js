// ============================================================
// SHOPNOW - DADOS MOCKADOS
// Quando for para Supabase, mantenha a interface ShopData e troque o provider.
// ============================================================

const PRODUCTS = [
  { id: '1', name: 'MacBook Pro 14"', category: 'Eletrônicos', price: 12999, originalPrice: 15499, image: 'https://images.unsplash.com/photo-1636115305669-9096bffe87fd?w=700&q=85', rating: 4.9, reviews: 342, stock: 8, sku: 'MBP14-M3-2024', badge: 'Mais vendido', description: 'Notebook premium com alta performance, tela Liquid Retina e bateria para o dia inteiro.', colors: ['Cinza espacial', 'Prateado'], installments: 12 },
  { id: '2', name: 'Fones Sony WH-1000XM5', category: 'Eletrônicos', price: 2199, originalPrice: 2799, image: 'https://images.unsplash.com/photo-1515940175183-6798529cb860?w=700&q=85', rating: 4.8, reviews: 891, stock: 23, sku: 'SONY-WH5-BLK', badge: 'Oferta', description: 'Cancelamento de ruído líder da categoria, áudio limpo e autonomia para viagens longas.', colors: ['Preto', 'Branco'], installments: 6 },
  { id: '3', name: 'Kit Apple — Watch + AirPods', category: 'Eletrônicos', price: 5499, originalPrice: 7299, image: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=700&q=85', rating: 4.7, reviews: 215, stock: 5, sku: 'APPLE-KIT-01', badge: 'Bundle', description: 'Combo de acessórios Apple para rotina, chamadas, treino e produtividade.', colors: ['Midnight', 'Starlight'], installments: 12 },
  { id: '4', name: 'Tênis Air Max 270', category: 'Calçados', price: 899, originalPrice: 1199, image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=700&q=85', rating: 4.6, reviews: 1243, stock: 42, sku: 'NIKE-AM270-WHT', badge: 'Oferta', description: 'Tênis casual com amortecimento alto no calcanhar e acabamento leve.', colors: ['Branco/Laranja', 'Preto/Vermelho'], sizes: ['37', '38', '39', '40', '41', '42', '43'], installments: 6 },
  { id: '5', name: 'Camiseta Premium Algodão', category: 'Moda', price: 89, image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=700&q=85', rating: 4.4, reviews: 567, stock: 120, sku: 'CAMI-PREM-001', description: 'Camiseta 100% algodão com toque macio, modelagem versátil e acabamento reforçado.', colors: ['Branco', 'Preto', 'Cinza'], sizes: ['P', 'M', 'G', 'GG'], installments: 3 },
  { id: '6', name: 'Tênis Nike Running', category: 'Calçados', price: 699, originalPrice: 899, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=85', rating: 4.7, reviews: 432, stock: 31, sku: 'NIKE-RUN-PRO', badge: 'Novo', description: 'Tênis de corrida com resposta rápida, cabedal respirável e solado leve.', colors: ['Vermelho/Branco', 'Preto'], sizes: ['37', '38', '39', '40', '41', '42', '43'], installments: 6 },
  { id: '7', name: 'Mesa Gamer RGB', category: 'Casa', price: 1899, originalPrice: 2399, image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=700&q=85', rating: 4.5, reviews: 89, stock: 7, sku: 'MESA-GAME-RGB', badge: 'Retirada disponível', description: 'Mesa gamer com iluminação RGB, suporte para monitor e organização de cabos.', colors: ['Preto'], installments: 12 },
  { id: '8', name: 'Smartphone Galaxy S24', category: 'Eletrônicos', price: 4199, originalPrice: 4999, image: 'https://images.unsplash.com/photo-1602526432604-029a709e131c?w=700&q=85', rating: 4.8, reviews: 678, stock: 15, sku: 'SAM-S24-256', badge: 'Oferta', description: 'Smartphone premium com câmera avançada, tela fluida e alto desempenho.', colors: ['Phantom Black', 'Cream'], installments: 12 },
  { id: '9', name: 'Mochila Notebook 15"', category: 'Acessórios', price: 279, originalPrice: 349, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=85', rating: 4.6, reviews: 234, stock: 58, sku: 'MOCH-NOTE-15', description: 'Mochila ergonômica para notebook com divisórias internas e porta USB.', colors: ['Preto', 'Cinza', 'Azul'], installments: 3 },
  { id: '10', name: 'Cadeira Escritório Ergonômica', category: 'Casa', price: 2799, originalPrice: 3499, image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=700&q=85', rating: 4.9, reviews: 412, stock: 3, sku: 'CADE-ERG-PRO', badge: 'Baixo estoque', description: 'Cadeira ergonômica com apoio lombar ajustável, apoio de cabeça e braços 4D.', colors: ['Preto', 'Cinza'], installments: 12 },
  { id: '11', name: 'Kit Moda Verão', category: 'Moda', price: 199, originalPrice: 289, image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=700&q=85', rating: 4.2, reviews: 98, stock: 85, sku: 'KIT-VERA-001', badge: 'Novo', description: 'Kit com peças leves para o verão, com algodão macio e caimento casual.', colors: ['Azul Aqua', 'Rosa', 'Branco'], sizes: ['P', 'M', 'G', 'GG'], installments: 3 },
  { id: '12', name: 'Rack Capsule de Roupas', category: 'Moda', price: 349, image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=700&q=85', rating: 4.3, reviews: 156, stock: 0, sku: 'RACK-FASH-001', badge: 'Sem estoque', description: 'Rack minimalista para organizar looks e coleções cápsula.', installments: 3 },
];

const ORDERS = [
  { id: '#12847', customer: 'Ana Silva', email: 'ana@email.com', items: [{ name: 'MacBook Pro 14"', qty: 1, price: 12999 }], total: 12999, paymentMethod: 'Cartão', type: 'delivery', status: 'shipped', date: '2026-05-22', city: 'São Paulo' },
  { id: '#12846', customer: 'Carlos Mota', email: 'carlos@email.com', items: [{ name: 'Fones Sony WH-1000XM5', qty: 1, price: 2199 }, { name: 'Camiseta Premium Algodão', qty: 2, price: 89 }], total: 2377, paymentMethod: 'PIX', type: 'pickup', status: 'ready', date: '2026-05-22', city: 'Rio de Janeiro' },
  { id: '#12845', customer: 'Beatriz Souza', email: 'bea@email.com', items: [{ name: 'Tênis Air Max 270', qty: 1, price: 899 }], total: 899, paymentMethod: 'Cartão', type: 'delivery', status: 'paid', date: '2026-05-21', city: 'Belo Horizonte' },
  { id: '#12844', customer: 'Diego Lima', email: 'diego@email.com', items: [{ name: 'Smartphone Galaxy S24', qty: 1, price: 4199 }], total: 4199, paymentMethod: 'PIX', type: 'delivery', status: 'delivered', date: '2026-05-20', city: 'Porto Alegre' },
  { id: '#12843', customer: 'Fernanda Castro', email: 'fer@email.com', items: [{ name: 'Mesa Gamer RGB', qty: 1, price: 1899 }], total: 1899, paymentMethod: 'Boleto', type: 'pickup', status: 'pending', date: '2026-05-20', city: 'Recife' },
  { id: '#12842', customer: 'Gustavo Pereira', email: 'gus@email.com', items: [{ name: 'Kit Apple — Watch + AirPods', qty: 1, price: 5499 }], total: 5499, paymentMethod: 'Cartão', type: 'delivery', status: 'cancelled', date: '2026-05-19', city: 'Manaus' },
  { id: '#12841', customer: 'Helena Nunes', email: 'hel@email.com', items: [{ name: 'Cadeira Escritório Ergonômica', qty: 1, price: 2799 }], total: 2799, paymentMethod: 'PIX', type: 'pickup', status: 'delivered', date: '2026-05-18', city: 'Fortaleza' },
  { id: '#12840', customer: 'Igor Santos', email: 'igor@email.com', items: [{ name: 'Camiseta Premium Algodão', qty: 3, price: 89 }, { name: 'Mochila Notebook 15"', qty: 1, price: 279 }], total: 546, paymentMethod: 'Cartão', type: 'delivery', status: 'delivered', date: '2026-05-17', city: 'Salvador' },
  { id: '#12839', customer: 'Juliana Alves', email: 'jul@email.com', items: [{ name: 'Tênis Nike Running', qty: 1, price: 699 }], total: 699, paymentMethod: 'PIX', type: 'delivery', status: 'shipped', date: '2026-05-16', city: 'Brasília' },
  { id: '#12838', customer: 'Kleber Ramos', email: 'kleber@email.com', items: [{ name: 'Kit Moda Verão', qty: 1, price: 199 }, { name: 'Mochila Notebook 15"', qty: 1, price: 279 }], total: 478, paymentMethod: 'Cartão', type: 'delivery', status: 'paid', date: '2026-05-15', city: 'Curitiba' },
];

const CUSTOMERS = [
  { id: 'C001', name: 'Ana Silva', email: 'ana@email.com', city: 'São Paulo', totalOrders: 8, totalSpent: 34567, status: 'active', joinDate: '2024-03-15', phone: '(11) 98765-4321' },
  { id: 'C002', name: 'Carlos Mota', email: 'carlos@email.com', city: 'Rio de Janeiro', totalOrders: 5, totalSpent: 12890, status: 'active', joinDate: '2024-05-20', phone: '(21) 99876-5432' },
  { id: 'C003', name: 'Beatriz Souza', email: 'bea@email.com', city: 'Belo Horizonte', totalOrders: 12, totalSpent: 67234, status: 'active', joinDate: '2023-11-08', phone: '(31) 97654-3210' },
  { id: 'C004', name: 'Diego Lima', email: 'diego@email.com', city: 'Curitiba', totalOrders: 3, totalSpent: 8999, status: 'inactive', joinDate: '2025-01-22', phone: '(41) 96543-2109' },
];

const CASHFLOW = [
  { id: 'CF001', type: 'income', description: 'Venda #12847 - MacBook Pro', category: 'Vendas', amount: 12999, date: '2026-05-22 14:32', paymentMethod: 'Cartão', balance: 87543 },
  { id: 'CF002', type: 'income', description: 'Venda #12846 - Sony + Camiseta', category: 'Vendas', amount: 2377, date: '2026-05-22 11:15', paymentMethod: 'PIX', balance: 74544 },
  { id: 'CF003', type: 'expense', description: 'Fornecedor Apple - Reposição', category: 'Fornecedor', amount: 45000, date: '2026-05-21 09:00', paymentMethod: 'TED', balance: 72167 },
  { id: 'CF004', type: 'expense', description: 'Aluguel - Maio 2026', category: 'Despesa fixa', amount: 8500, date: '2026-05-20 08:00', paymentMethod: 'TED', balance: 116268 },
];

const CATEGORIES = [
  { name: 'Eletrônicos', icon: '💻', count: 45 },
  { name: 'Calçados', icon: '👟', count: 68 },
  { name: 'Moda', icon: '👔', count: 124 },
  { name: 'Casa', icon: '🏠', count: 37 },
  { name: 'Esportes', icon: '⚽', count: 52 },
  { name: 'Livros', icon: '📚', count: 89 },
  { name: 'Beleza', icon: '💄', count: 76 },
  { name: 'Acessórios', icon: '🎒', count: 43 },
];

const WEEKLY_REVENUE = [
  { label: 'Seg', value: 12430 },
  { label: 'Ter', value: 8920 },
  { label: 'Qua', value: 15670 },
  { label: 'Qui', value: 9340 },
  { label: 'Sex', value: 21890 },
  { label: 'Sáb', value: 18450 },
  { label: 'Dom', value: 7230 },
];

const MONTHLY_REVENUE = [
  { label: 'Jan', value: 142000 },
  { label: 'Fev', value: 168000 },
  { label: 'Mar', value: 155000 },
  { label: 'Abr', value: 189000 },
  { label: 'Mai', value: 94020 },
];

const STATUS_CONFIG = {
  pending: { label: 'Pendente', cls: 'badge-amber' },
  paid: { label: 'Pago', cls: 'badge-blue' },
  shipped: { label: 'Enviado', cls: 'badge-indigo' },
  ready: { label: 'Retirada', cls: 'badge-indigo' },
  delivered: { label: 'Entregue', cls: 'badge-green' },
  cancelled: { label: 'Cancelado', cls: 'badge-red' },
  active: { label: 'Ativo', cls: 'badge-green' },
  inactive: { label: 'Inativo', cls: 'badge-amber' },
};

const CHANNELS = [
  { label: 'Site', value: 62, color: '#818cf8' },
  { label: 'App', value: 25, color: '#34d399' },
  { label: 'Marketplace', value: 13, color: '#a7f3d0' },
];

const ShopData = {
  provider: 'mock',
  useProvider(providerName, provider) {
    this.provider = providerName;
    Object.assign(this, provider);
  },
  products: () => PRODUCTS,
  orders: () => ORDERS,
  customers: () => CUSTOMERS,
  cashflow: () => CASHFLOW,
  categories: () => CATEGORIES,
  weeklyRevenue: () => WEEKLY_REVENUE,
  monthlyRevenue: () => MONTHLY_REVENUE,
  status: () => STATUS_CONFIG,
  channels: () => CHANNELS,
};
