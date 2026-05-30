-- PRODUTOS (IDs 100-103 para não conflitar)
INSERT INTO public.products (id, name, category, price, original_price, stock, sku, description, rating, reviews)
VALUES
('100', 'Notebook Dell', 'Eletrônicos', 3500.00, 4200.00, 5, 'SKU-001', 'Notebook 15 polegadas i7', 4.5, 12),
('101', 'Tênis Nike', 'Calçados', 299.90, 350.00, 20, 'SKU-002', 'Tênis para corrida', 4.8, 45),
('102', 'Monitor LG', 'Eletrônicos', 1200.00, 1500.00, 8, 'SKU-003', 'Monitor 24 polegadas', 4.3, 8),
('103', 'Fone Bluetooth', 'Eletrônicos', 199.90, 250.00, 15, 'SKU-004', 'Fone sem fio', 4.6, 32)
ON CONFLICT (id) DO UPDATE SET stock = EXCLUDED.stock;

-- CATEGORIAS (UPDATE se existem)
INSERT INTO public.categories (name, icon, count)
VALUES
('Eletrônicos', '💻', 4),
('Calçados', '👟', 1),
('Casa', '🏠', 0)
ON CONFLICT (name) DO UPDATE SET count = EXCLUDED.count;

-- PEDIDOS (IDs únicos com timestamp)
INSERT INTO public.orders (id, customer, email, items, total, payment_method, type, status, date, city, channel)
VALUES
('#98001', 'Ana Silva', 'ana@email.com', '[{"name": "Notebook Dell", "qty": 1, "price": 3500}]', 3500.00, 'credit_card', 'delivery', 'pending', '2026-05-30', 'São Paulo', 'Site'),
('#98002', 'Carlos Mota', 'carlos@email.com', '[{"name": "Tênis Nike", "qty": 2, "price": 299.90}]', 599.80, 'pix', 'delivery', 'delivered', '2026-05-29', 'Rio de Janeiro', 'Site'),
('#98003', 'Maria Santos', 'maria@email.com', '[{"name": "Monitor LG", "qty": 1, "price": 1200}]', 1200.00, 'boleto', 'delivery', 'paid', '2026-05-28', 'Belo Horizonte', 'Site')
ON CONFLICT (id) DO NOTHING;

-- CLIENTES
INSERT INTO public.customers (id, name, email, city, total_orders, total_spent, status, join_date, phone)
VALUES
('C100', 'Ana Silva', 'ana@email.com', 'São Paulo', 1, 3500.00, 'active', '2026-05-30', '(11) 98765-4321'),
('C101', 'Carlos Mota', 'carlos@email.com', 'Rio de Janeiro', 1, 599.80, 'active', '2026-05-29', '(21) 99876-5432'),
('C102', 'Maria Santos', 'maria@email.com', 'Belo Horizonte', 1, 1200.00, 'active', '2026-05-28', '(31) 98765-1234')
ON CONFLICT (id) DO NOTHING;

-- CAIXA
INSERT INTO public.cashflow (id, type, description, amount, date)
VALUES
('F100', 'income', 'Venda #98001', 3500.00, '2026-05-30'),
('F101', 'income', 'Venda #98002', 599.80, '2026-05-29'),
('F102', 'expense', 'Estoque - Eletrônicos', -800.00, '2026-05-27'),
('F103', 'income', 'Venda #98003', 1200.00, '2026-05-28')
ON CONFLICT (id) DO NOTHING;

-- CUPONS
INSERT INTO public.coupons (code, discount_type, discount_value, expiry_date, max_uses, uses)
VALUES
('SHOP10', 'percentage', 10, '2026-06-30', 50, 5),
('BLACKFRIDAY', 'percentage', 30, '2026-06-30', 100, 12),
('FRETE50', 'fixed', 50, '2026-12-31', 999, 0)
ON CONFLICT (code) DO NOTHING;

-- PROMOÇÕES
INSERT INTO public.promotions (id, product_id, discount_percentage, start_date, end_date, active)
VALUES
('PROMO-001', '100', 15, '2026-05-29', '2026-05-30 23:59:59', true),
('PROMO-002', '101', 20, '2026-05-29', '2026-05-30 23:59:59', true),
('PROMO-003', '102', 10, '2026-05-29', '2026-05-30 23:59:59', true)
ON CONFLICT (id) DO NOTHING;

-- CONFIGURAÇÕES DA LOJA
INSERT INTO public.store_settings (id, geral, comercial, contato)
VALUES
('default',
  '{"storeName": "ShopNow", "email": "contato@shopnow.com", "cpfCnpj": "00.000.000/0000-00", "phone": "(11) 3000-0000", "address": "Rua das Flores", "number": "123", "city": "São Paulo", "state": "SP", "complement": "Apto 42", "zipcode": "01310-100"}',
  '{"freeShippingValue": 299, "freeShippingText": "Frete grátis acima de R$ 299", "payment_card": true, "payment_pix": true, "payment_boleto": true, "payment_pickup": true}',
  '{"businessHours": "Seg-Sex: 9h às 18h | Sábado: 9h às 13h", "whatsapp": "(11) 98765-4321", "instagram": "@shopnow", "facebook": "shopnow", "privacyUrl": "https://shopnow.com/privacidade", "termsUrl": "https://shopnow.com/termos"}'
)
ON CONFLICT (id) DO UPDATE SET
  geral = EXCLUDED.geral,
  comercial = EXCLUDED.comercial,
  contato = EXCLUDED.contato;
