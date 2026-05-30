// ============================================================
// SHOPNOW - DATA PROVIDER
// Dados reais via Supabase REST. Sem seeds/mock de produtos.
// ============================================================

const SUPABASE_CONFIG = {
  restUrl: 'https://nnkokgtplnuhmhlqarba.supabase.co/rest/v1',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua29rZ3RwbG51aG1obHFhcmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjk3MjUsImV4cCI6MjA5NDgwNTcyNX0.2nf1eytsNVNAAi4FymsmTSQEnwpzokGRXV6Lbp7k0pU',
};

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

const EMPTY_SETTINGS = {
  geral: {
    storeName: '',
    email: '',
    cpfCnpj: '',
    phone: '',
    address: '',
    number: '',
    city: '',
    state: '',
    complement: '',
    zipcode: '',
  },
  comercial: {
    freeShippingValue: '',
    freeShippingText: '',
    payment_card: false,
    payment_pix: false,
    payment_boleto: false,
    payment_pickup: false,
  },
  contato: {
    businessHours: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    privacyUrl: '',
    termsUrl: '',
  },
};

const _state = {
  products: [],
  orders: [],
  customers: [],
  cashflow: [],
  categories: [],
  coupons: [],
  settings: typeof structuredClone === 'function'
    ? structuredClone(EMPTY_SETTINGS)
    : JSON.parse(JSON.stringify(EMPTY_SETTINGS)),
  promotions: [],
  weeklyRevenue: [],
  monthlyRevenue: [],
  channels: [],
};

const _missingTables = new Set();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getValue(row, ...keys) {
  for (const key of keys) {
    if (row && row[key] !== undefined && row[key] !== null) return row[key];
  }
  return undefined;
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function dateOnly(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_CONFIG.anonKey,
    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${SUPABASE_CONFIG.restUrl}/${path}`, {
    method: options.method || 'GET',
    headers: supabaseHeaders(options.headers),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const error = new Error(`${options.method || 'GET'} ${path} failed (${response.status})`);
    error.status = response.status;
    error.detail = detail;
    throw error;
  }

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function fetchRows(table) {
  try {
    const data = await supabaseRequest(`${table}?select=*`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.status === 404) {
      _missingTables.add(table);
      return [];
    }
    console.warn(`[ShopData] Falha ao buscar ${table}:`, error);
    return [];
  }
}

function persist(table, action) {
  action().catch(error => {
    if (error.status === 404) _missingTables.add(table);
    console.warn(`[ShopData] Falha ao salvar ${table}:`, error, error.detail || '');
  });
}

function toQueryFilter(column, value) {
  const params = new URLSearchParams({ [column]: `eq.${value}` });
  return params.toString();
}

function insertRow(table, row) {
  return supabaseRequest(table, {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: row,
  });
}

function upsertRow(table, row, conflictKey = 'id') {
  return supabaseRequest(`${table}?on_conflict=${conflictKey}`, {
    method: 'POST',
    headers: { Prefer: 'return=minimal,resolution=merge-duplicates' },
    body: row,
  });
}

function patchRow(table, column, value, row) {
  return supabaseRequest(`${table}?${toQueryFilter(column, value)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: row,
  });
}

function deleteRow(table, column, value) {
  return supabaseRequest(`${table}?${toQueryFilter(column, value)}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });
}

function normalizeProduct(row) {
  return {
    id: String(getValue(row, 'id') ?? ''),
    name: getValue(row, 'name', 'nome') || '',
    category: getValue(row, 'category', 'categoria') || '',
    price: asNumber(getValue(row, 'price', 'preco')),
    originalPrice: asNumber(getValue(row, 'originalPrice', 'original_price', 'preco_original'), 0) || undefined,
    image: getValue(row, 'image', 'image_url', 'imagem') || '',
    rating: asNumber(getValue(row, 'rating', 'avaliacao'), 0),
    reviews: asNumber(getValue(row, 'reviews', 'review_count', 'avaliacoes'), 0),
    stock: asNumber(getValue(row, 'stock', 'estoque'), 0),
    sku: getValue(row, 'sku') || '',
    badge: getValue(row, 'badge', 'selo') || '',
    description: getValue(row, 'description', 'descricao') || '',
    colors: asArray(getValue(row, 'colors', 'cores')),
    sizes: asArray(getValue(row, 'sizes', 'tamanhos')),
    installments: asNumber(getValue(row, 'installments', 'parcelas'), 1),
  };
}

function productToRow(product) {
  return {
    id: String(product.id),
    name: product.name || '',
    category: product.category || '',
    price: asNumber(product.price),
    original_price: product.originalPrice ? asNumber(product.originalPrice) : null,
    image: product.image || '',
    rating: asNumber(product.rating, 0),
    reviews: asNumber(product.reviews, 0),
    stock: asNumber(product.stock, 0),
    sku: product.sku || '',
    badge: product.badge || '',
    description: product.description || '',
    colors: product.colors || [],
    sizes: product.sizes || [],
    installments: asNumber(product.installments, 1),
  };
}

function normalizeOrder(row) {
  return {
    id: String(getValue(row, 'id') ?? ''),
    userId: getValue(row, 'userId', 'user_id') || '',
    customer: getValue(row, 'customer', 'customer_name', 'cliente') || '',
    email: getValue(row, 'email', 'customer_email') || '',
    items: asArray(getValue(row, 'items', 'itens')),
    total: asNumber(getValue(row, 'total')),
    paymentMethod: getValue(row, 'paymentMethod', 'payment_method', 'pagamento') || '',
    type: getValue(row, 'type', 'delivery_type', 'tipo') || 'delivery',
    status: getValue(row, 'status') || 'pending',
    date: dateOnly(getValue(row, 'date', 'created_at', 'data')),
    city: getValue(row, 'city', 'cidade') || '',
    channel: getValue(row, 'channel', 'canal') || 'Site',
  };
}

function orderToRow(order) {
  return {
    id: String(order.id),
    customer: order.customer || '',
    email: order.email || '',
    items: order.items || [],
    total: asNumber(order.total),
    payment_method: order.paymentMethod || '',
    type: order.type || 'delivery',
    status: order.status || 'pending',
    date: order.date || new Date().toISOString().slice(0, 10),
    city: order.city || '',
    channel: order.channel || 'Site',
  };
}

function normalizeCustomer(row) {
  return {
    id: String(getValue(row, 'id') ?? ''),
    name: getValue(row, 'name', 'nome') || '',
    email: getValue(row, 'email') || '',
    city: getValue(row, 'city', 'cidade') || '',
    totalOrders: asNumber(getValue(row, 'totalOrders', 'total_orders', 'pedidos'), 0),
    totalSpent: asNumber(getValue(row, 'totalSpent', 'total_spent', 'total_gasto'), 0),
    status: getValue(row, 'status') || 'active',
    joinDate: dateOnly(getValue(row, 'joinDate', 'join_date', 'created_at')),
    phone: getValue(row, 'phone', 'telefone') || '',
  };
}

function customerToRow(customer) {
  return {
    id: String(customer.id),
    name: customer.name || '',
    email: customer.email || '',
    city: customer.city || '',
    total_orders: asNumber(customer.totalOrders, 0),
    total_spent: asNumber(customer.totalSpent, 0),
    status: customer.status || 'active',
    join_date: customer.joinDate || new Date().toISOString().slice(0, 10),
    phone: customer.phone || '',
  };
}

function normalizeCategory(row) {
  return {
    name: getValue(row, 'name', 'nome') || '',
    icon: getValue(row, 'icon', 'icone') || '',
    image: getValue(row, 'image', 'image_url', 'imagem') || undefined,
    count: asNumber(getValue(row, 'count', 'product_count', 'quantidade'), 0),
  };
}

function categoryToRow(category) {
  return {
    name: category.name || '',
    icon: category.icon || '',
    image: category.image || null,
    count: asNumber(category.count, 0),
  };
}

function normalizeCashflow(row) {
  return {
    id: String(getValue(row, 'id') ?? ''),
    type: getValue(row, 'type', 'tipo') || 'income',
    description: getValue(row, 'description', 'descricao') || '',
    category: getValue(row, 'category', 'categoria') || '',
    amount: asNumber(getValue(row, 'amount', 'valor')),
    date: getValue(row, 'date', 'data') || new Date().toISOString().slice(0, 16).replace('T', ' '),
    paymentMethod: getValue(row, 'paymentMethod', 'payment_method', 'pagamento') || '',
  };
}

function cashflowToRow(entry) {
  return {
    id: String(entry.id),
    type: entry.type || 'income',
    description: entry.description || '',
    category: entry.category || '',
    amount: asNumber(entry.amount),
    date: entry.date || new Date().toISOString().slice(0, 16).replace('T', ' '),
    payment_method: entry.paymentMethod || '',
  };
}

function normalizeCoupon(row) {
  return {
    code: String(getValue(row, 'code', 'codigo') || '').toUpperCase(),
    discountType: getValue(row, 'discountType', 'discount_type', 'tipo_desconto') || 'percentage',
    discountValue: asNumber(getValue(row, 'discountValue', 'discount_value', 'valor_desconto')),
    expiryDate: dateOnly(getValue(row, 'expiryDate', 'expiry_date', 'validade')),
    maxUses: asNumber(getValue(row, 'maxUses', 'max_uses', 'usos_maximos'), 0),
    uses: asNumber(getValue(row, 'uses', 'usos'), 0),
  };
}

function couponToRow(coupon) {
  return {
    code: String(coupon.code || '').toUpperCase(),
    discount_type: coupon.discountType || 'percentage',
    discount_value: asNumber(coupon.discountValue),
    expiry_date: coupon.expiryDate || null,
    max_uses: asNumber(coupon.maxUses, 0),
    uses: asNumber(coupon.uses, 0),
  };
}

function normalizePromotion(row) {
  return {
    id: String(getValue(row, 'id') ?? ''),
    productId: String(getValue(row, 'product_id', 'productId') ?? ''),
    discountPercentage: asNumber(getValue(row, 'discount_percentage', 'discountPercentage'), 0),
    startDate: getValue(row, 'start_date', 'startDate') || '',
    endDate: getValue(row, 'end_date', 'endDate') || '',
    active: getValue(row, 'active') === true || getValue(row, 'active') === 'true',
  };
}

function promotionToRow(promotion) {
  return {
    id: String(promotion.id),
    product_id: String(promotion.productId),
    discount_percentage: asNumber(promotion.discountPercentage, 0),
    start_date: promotion.startDate || new Date().toISOString(),
    end_date: promotion.endDate || '',
    active: promotion.active === true,
  };
}

function normalizeSettings(rows) {
  const settings = clone(EMPTY_SETTINGS);
  if (!rows.length) return settings;

  const first = rows[0];
  if (first.geral || first.comercial || first.contato) {
    return {
      geral: { ...settings.geral, ...(first.geral || {}) },
      comercial: { ...settings.comercial, ...(first.comercial || {}) },
      contato: { ...settings.contato, ...(first.contato || {}) },
    };
  }

  rows.forEach(row => {
    const type = getValue(row, 'type', 'section', 'key');
    const data = getValue(row, 'data', 'payload', 'value');
    if (type && settings[type] && data && typeof data === 'object') {
      settings[type] = { ...settings[type], ...data };
    }
  });

  return settings;
}

function deriveCustomers(orders) {
  const byEmail = new Map();
  orders.forEach(order => {
    if (!order.email) return;
    const current = byEmail.get(order.email) || {
      id: `C${String(byEmail.size + 1).padStart(3, '0')}`,
      name: order.customer,
      email: order.email,
      city: order.city,
      totalOrders: 0,
      totalSpent: 0,
      status: 'active',
      joinDate: order.date,
      phone: '',
    };
    current.totalOrders += 1;
    current.totalSpent += order.total;
    if (order.date < current.joinDate) current.joinDate = order.date;
    byEmail.set(order.email, current);
  });
  return [...byEmail.values()];
}

function refreshCategoryCounts() {
  const counts = _state.products.reduce((map, product) => {
    map[product.category] = (map[product.category] || 0) + 1;
    return map;
  }, {});

  _state.categories.forEach(category => {
    category.count = category.count || counts[category.name] || 0;
  });
}

function aggregateRevenueByDay(orders) {
  return orders.reduce((map, order) => {
    const key = dateOnly(order.date);
    map[key] = (map[key] || 0) + order.total;
    return map;
  }, {});
}

function makeWeeklyRevenue(orders) {
  const revenue = aggregateRevenueByDay(orders);
  const latest = Object.keys(revenue).sort().at(-1) || new Date().toISOString().slice(0, 10);
  const start = new Date(`${latest}T00:00:00`);
  start.setDate(start.getDate() - 6);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    return { label: labels[date.getDay()], value: revenue[key] || 0 };
  });
}

function makeMonthlyRevenue(orders) {
  const revenue = orders.reduce((map, order) => {
    const key = dateOnly(order.date).slice(0, 7);
    map[key] = (map[key] || 0) + order.total;
    return map;
  }, {});
  const latest = Object.keys(revenue).sort().at(-1) || new Date().toISOString().slice(0, 7);
  const [year, month] = latest.split('-').map(Number);
  const start = new Date(year, month - 5, 1);
  const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return { label: labels[date.getMonth()], value: revenue[key] || 0 };
  });
}

function makeChannels(orders) {
  const map = orders.reduce((acc, order) => {
    const channel = order.channel || 'Site';
    acc[channel] = (acc[channel] || 0) + 1;
    return acc;
  }, {});
  const total = Object.values(map).reduce((sum, count) => sum + count, 0);
  const colors = ['#818cf8', '#34d399', '#fbbf24', '#60a5fa', '#f87171'];

  if (!total) return [];

  return Object.entries(map).map(([label, count], index) => ({
    label,
    value: Math.round((count / total) * 100),
    color: colors[index % colors.length],
  }));
}

function refreshDerivedData() {
  refreshCategoryCounts();
  _state.weeklyRevenue = makeWeeklyRevenue(_state.orders);
  _state.monthlyRevenue = makeMonthlyRevenue(_state.orders);
  _state.channels = makeChannels(_state.orders);
}

async function loadSupabaseData() {
  const [
    products,
    orders,
    customers,
    categories,
    cashflow,
    coupons,
    promotions,
    storeSettings,
    legacySettings,
  ] = await Promise.all([
    fetchRows('products'),
    fetchRows('orders'),
    fetchRows('customers'),
    fetchRows('categories'),
    fetchRows('cashflow'),
    fetchRows('coupons'),
    fetchRows('promotions'),
    fetchRows('store_settings'),
    fetchRows('settings'),
  ]);

  _state.products = products.map(normalizeProduct).filter(product => product.id && product.name);
  _state.orders = orders.map(normalizeOrder).filter(order => order.id);
  _state.customers = customers.length
    ? customers.map(normalizeCustomer).filter(customer => customer.id)
    : deriveCustomers(_state.orders);
  _state.categories = categories.map(normalizeCategory).filter(category => category.name);
  _state.cashflow = cashflow.map(normalizeCashflow).filter(entry => entry.id);
  _state.coupons = coupons.map(normalizeCoupon).filter(coupon => coupon.code);
  _state.promotions = promotions.map(normalizePromotion).filter(promo => promo.id && promo.productId);
  _state.settings = normalizeSettings(storeSettings.length ? storeSettings : legacySettings);

  refreshDerivedData();
}

let _readyPromise = null;

const ShopData = {
  provider: 'supabase',
  config: SUPABASE_CONFIG,
  missingTables: () => [..._missingTables],
  ready() {
    if (!_readyPromise) {
      _readyPromise = loadSupabaseData().catch(error => {
        console.warn('[ShopData] Supabase indisponivel. Renderizando sem dados mockados.', error);
        refreshDerivedData();
      });
    }
    return _readyPromise;
  },
  reload() {
    _readyPromise = null;
    return this.ready();
  },
  products: () => _state.products,
  orders: () => _state.orders,
  customers: () => _state.customers,
  cashflow: () => _state.cashflow,
  categories: () => _state.categories,
  weeklyRevenue: () => _state.weeklyRevenue,
  monthlyRevenue: () => _state.monthlyRevenue,
  status: () => STATUS_CONFIG,
  channels: () => _state.channels,
  coupons: () => _state.coupons,
  promotions: () => _state.promotions,
  settings: () => _state.settings,

  addProduct(product) {
    const next = {
      id: String(product.id || Date.now()),
      rating: 0,
      reviews: 0,
      installments: 1,
      ...product,
    };
    _state.products.push(next);
    refreshDerivedData();
    persist('products', () => upsertRow('products', productToRow(next)));
    return next;
  },

  updateProduct(id, updates) {
    const index = _state.products.findIndex(product => product.id === String(id));
    if (index === -1) return;
    _state.products[index] = { ..._state.products[index], ...updates, id: String(id) };
    refreshDerivedData();
    persist('products', () => upsertRow('products', productToRow(_state.products[index])));
  },

  deleteProduct(id) {
    const index = _state.products.findIndex(product => product.id === String(id));
    if (index === -1) return;
    _state.products.splice(index, 1);
    refreshDerivedData();
    persist('products', () => deleteRow('products', 'id', String(id)));
  },

  addOrder(order) {
    const next = { id: `#${Date.now()}`, status: 'pending', type: 'delivery', ...order };
    _state.orders.unshift(next);
    _state.customers = deriveCustomers(_state.orders);
    refreshDerivedData();
    persist('orders', () => upsertRow('orders', orderToRow(next)));
    return next;
  },

  updateOrderStatus(id, status) {
    const order = _state.orders.find(item => item.id === id);
    if (!order) return;
    order.status = status;
    refreshDerivedData();
    persist('orders', () => patchRow('orders', 'id', id, { status }));
  },

  addCashflow(entry) {
    _state.cashflow.push(entry);
    persist('cashflow', () => upsertRow('cashflow', cashflowToRow(entry)));
  },

  updateCustomerStatus(id, status) {
    const customer = _state.customers.find(item => item.id === id);
    if (!customer) return;
    customer.status = status;
    persist('customers', () => patchRow('customers', 'id', id, { status }));
  },

  addCategory(category) {
    const next = { count: 0, ...category };
    _state.categories.push(next);
    refreshDerivedData();
    persist('categories', () => upsertRow('categories', categoryToRow(next), 'name'));
  },

  updateCategory(name, updates) {
    const index = _state.categories.findIndex(category => category.name === name);
    if (index === -1) return;
    _state.categories[index] = { ..._state.categories[index], ...updates };
    refreshDerivedData();
    persist('categories', () => {
      if (updates.name && updates.name !== name) {
        return deleteRow('categories', 'name', name)
          .then(() => upsertRow('categories', categoryToRow(_state.categories[index]), 'name'));
      }
      return upsertRow('categories', categoryToRow(_state.categories[index]), 'name');
    });
  },

  deleteCategory(name) {
    const index = _state.categories.findIndex(category => category.name === name);
    if (index === -1) return;
    _state.categories.splice(index, 1);
    persist('categories', () => deleteRow('categories', 'name', name));
  },

  addCoupon(coupon) {
    const next = { ...coupon, code: String(coupon.code || '').toUpperCase(), uses: coupon.uses || 0 };
    _state.coupons.push(next);
    persist('coupons', () => upsertRow('coupons', couponToRow(next), 'code'));
  },

  updateCoupon(oldCode, updates) {
    const index = _state.coupons.findIndex(coupon => coupon.code === oldCode);
    if (index === -1) return;
    _state.coupons[index] = { ..._state.coupons[index], ...updates, code: String(updates.code || oldCode).toUpperCase() };
    persist('coupons', () => {
      if (_state.coupons[index].code !== oldCode) {
        return deleteRow('coupons', 'code', oldCode)
          .then(() => upsertRow('coupons', couponToRow(_state.coupons[index]), 'code'));
      }
      return upsertRow('coupons', couponToRow(_state.coupons[index]), 'code');
    });
  },

  deleteCoupon(code) {
    const index = _state.coupons.findIndex(coupon => coupon.code === code);
    if (index === -1) return;
    _state.coupons.splice(index, 1);
    persist('coupons', () => deleteRow('coupons', 'code', code));
  },

  addPromotion(promotion) {
    const next = { ...promotion, id: String(promotion.id || `PROMO-${Date.now()}`), active: promotion.active !== false };
    _state.promotions.push(next);
    persist('promotions', () => upsertRow('promotions', promotionToRow(next)));
    return next;
  },

  updatePromotion(id, updates) {
    const index = _state.promotions.findIndex(promo => promo.id === id);
    if (index === -1) return;
    _state.promotions[index] = { ..._state.promotions[index], ...updates, id };
    persist('promotions', () => upsertRow('promotions', promotionToRow(_state.promotions[index])));
  },

  deletePromotion(id) {
    const index = _state.promotions.findIndex(promo => promo.id === id);
    if (index === -1) return;
    _state.promotions.splice(index, 1);
    persist('promotions', () => deleteRow('promotions', 'id', id));
  },

  updateSettings(type, data) {
    if (!_state.settings[type]) return;
    _state.settings[type] = { ..._state.settings[type], ...data };
    persist('store_settings', () => upsertRow('store_settings', {
      id: 'default',
      geral: _state.settings.geral,
      comercial: _state.settings.comercial,
      contato: _state.settings.contato,
    }));
  },

  // ---------------------------------------------------------
  // Funções de usuário
  // ---------------------------------------------------------
  async registerUser(email, name, phone, passwordHash) {
    const id = `U${Date.now()}`;
    const user = {
      id,
      email: email.toLowerCase(),
      name,
      phone: phone || '',
      password_hash: passwordHash,
      status: 'active',
    };
    await supabaseRequest('users', {
      method: 'POST',
      body: user,
    });
    return user;
  },

  async getUserByEmail(email) {
    try {
      const data = await supabaseRequest(`users?email=eq.${encodeURIComponent(email.toLowerCase())}`);
      return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.warn('Erro ao buscar usuário:', error);
      return null;
    }
  },

  async updateUser(userId, updates) {
    try {
      await supabaseRequest(`users?id=eq.${userId}`, {
        method: 'PATCH',
        body: updates,
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  },

  async requestPasswordReset(email) {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const id = `PR${Date.now()}`;

    try {
      await supabaseRequest('password_resets', {
        method: 'POST',
        body: {
          id,
          user_email: email.toLowerCase(),
          token,
          expires_at: expiresAt,
          used: false,
        },
      });
      return token;
    } catch (error) {
      console.error('Erro ao criar reset de senha:', error);
      return null;
    }
  },

  async verifyPasswordResetToken(email, token) {
    try {
      const data = await supabaseRequest(`password_resets?user_email=eq.${encodeURIComponent(email.toLowerCase())}&token=eq.${token}&used=eq.false`);
      if (!Array.isArray(data) || data.length === 0) return null;

      const reset = data[0];
      if (new Date(reset.expires_at) < new Date()) {
        return null; // Token expirado
      }
      return reset;
    } catch (error) {
      console.warn('Erro ao verificar token:', error);
      return null;
    }
  },

  async resetPassword(email, token, newPasswordHash) {
    try {
      // Marca token como usado
      await supabaseRequest(`password_resets?user_email=eq.${encodeURIComponent(email.toLowerCase())}&token=eq.${token}`, {
        method: 'PATCH',
        body: { used: true },
      });

      // Atualiza senha do usuário
      await this.updateUser(
        (await this.getUserByEmail(email))?.id,
        { password_hash: newPasswordHash, updated_at: new Date().toISOString() }
      );
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
    }
  },

  // ---------------------------------------------------------
  // Funções de verificação de email
  // ---------------------------------------------------------
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  async createEmailVerification(email) {
    const code = this.generateVerificationCode();
    const id = `EV${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    try {
      await supabaseRequest('email_verifications', {
        method: 'POST',
        body: {
          id,
          user_email: email.toLowerCase(),
          code,
          verified: false,
          expires_at: expiresAt,
        },
      });
      return code;
    } catch (error) {
      console.error('Erro ao criar verificação:', error);
      return null;
    }
  },

  async verifyEmailCode(email, code) {
    try {
      const data = await supabaseRequest(
        `email_verifications?user_email=eq.${encodeURIComponent(email.toLowerCase())}&code=eq.${code}&verified=eq.false`
      );

      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }

      const verification = data[0];
      if (new Date(verification.expires_at) < new Date()) {
        return null; // Expirado
      }

      return verification;
    } catch (error) {
      console.warn('Erro ao verificar código:', error);
      return null;
    }
  },

  async markEmailAsVerified(email, code) {
    try {
      await supabaseRequest(
        `email_verifications?user_email=eq.${encodeURIComponent(email.toLowerCase())}&code=eq.${code}`,
        {
          method: 'PATCH',
          body: { verified: true },
        }
      );
    } catch (error) {
      console.error('Erro ao marcar como verificado:', error);
    }
  },
};

ShopData.ready();

(function gateDOMContentLoadedUntilDataIsReady() {
  const nativeAddEventListener = document.addEventListener.bind(document);

  document.addEventListener = function addEventListenerWithDataReady(type, listener, options) {
    if (type !== 'DOMContentLoaded' || !listener) {
      return nativeAddEventListener(type, listener, options);
    }

    const wrapped = function wrappedDOMContentLoaded(event) {
      ShopData.ready().then(() => {
        if (typeof listener === 'function') {
          listener.call(this, event);
        } else if (typeof listener.handleEvent === 'function') {
          listener.handleEvent(event);
        }
      });
    };

    return nativeAddEventListener(type, wrapped, options);
  };
})();
