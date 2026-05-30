# 🛍️ ShopNow - E-commerce Completo

**Uma solução profissional e pronta para vender online.**

![Design Premium](https://img.shields.io/badge/Design-Premium-667eea)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3fcf8e)
![Responsivo](https://img.shields.io/badge/Responsivo-Mobile%20First-blue)

---

## ✨ Recursos

### 🛒 Loja
- ✅ Homepage com design premium
- ✅ Catálogo de produtos dinâmico
- ✅ Busca e filtro por categoria
- ✅ Carrinho de compras persistente
- ✅ Checkout completo com validações
- ✅ Countdown de ofertas em tempo real
- ✅ Cards de produtos com design profissional

### 👤 Autenticação
- ✅ Registro com verificação de email (Supabase Auth)
- ✅ Login seguro
- ✅ Recuperação de senha
- ✅ Perfil do usuário
- ✅ Histórico de pedidos
- ✅ Gerenciamento de dados pessoais

### 🎛️ Painel Administrativo
- ✅ Dashboard com KPIs e gráficos
- ✅ Gerenciar produtos (CRUD)
- ✅ Gerenciar categorias
- ✅ Relatórios de vendas
- ✅ Histórico de pedidos
- ✅ Gerenciar promoções/ofertas
- ✅ Configurações da loja
- ✅ Busca avançada

### 💳 Pagamentos
- ✅ Suporte para Cartão, PIX, Boleto, Retirada
- ✅ Frete grátis acima de R$ 299
- ✅ Cálculo automático de frete
- ✅ Parcelamento em até 12x

---

## 🚀 Quick Start

### 1. Clonar o repositório
```bash
git clone <repo-url>
cd SaaS-Ecommerce
```

### 2. Configurar Supabase

#### Criar conta em https://supabase.com

#### Copiar credenciais do projeto:
- URL do projeto
- Chave anon pública

#### Atualizar credenciais em `js/data.js`:
```javascript
const SUPABASE_CONFIG = {
  restUrl: 'https://seu-projeto.supabase.co/rest/v1',
  anonKey: 'sua-chave-anon',
};
```

#### Executar setup do banco:
```bash
# Vá em SQL Editor do Supabase e copie o conteúdo de:
supabase/schema.sql
# Execute tudo lá
```

### 3. Habilitar autenticação
1. Supabase → Authentication → Providers
2. Habilitar "Email"
3. Configurar Email Templates:
   - Confirmation URL: `https://seu-dominio.com/pages/confirm-email.html`

### 4. Iniciar servidor local
```bash
# Python 3
python -m http.server 8000

# Ou use Live Server no VS Code
# Abra: http://localhost:8000
```

---

## 📁 Estrutura

```
.
├── index.html                    # Homepage principal
├── pages/
│   ├── register.html            # Página de registro
│   ├── login.html               # Página de login
│   ├── account.html             # Perfil do usuário
│   ├── products.html            # Listagem de produtos
│   ├── product.html             # Detalhes do produto
│   ├── cart.html                # Carrinho
│   ├── checkout.html            # Checkout
│   ├── confirmation.html        # Confirmação de pedido
│   └── admin/                   # Painel administrativo
│       ├── dashboard.html       # Dashboard
│       ├── products.html        # Gerenciar produtos
│       ├── orders.html          # Gerenciar pedidos
│       ├── customers.html       # Clientes
│       ├── promotions.html      # Promoções
│       ├── reports.html         # Relatórios
│       ├── settings.html        # Configurações
│       └── login.html           # Login admin
├── js/
│   ├── data.js                  # Integração Supabase
│   ├── store-name.js            # Nome dinâmico da loja
│   ├── ui/
│   │   ├── common.js            # Funções comuns
│   │   ├── form-validation.js   # Validações
│   │   ├── store-home.js        # Homepage
│   │   ├── store-checkout.js    # Checkout
│   │   ├── store-account.js     # Conta do usuário
│   │   ├── auth-supabase.js     # Autenticação
│   │   └── admin-*.js           # Componentes admin
│   └── store-*.js               # Lógica de páginas
├── css/
│   └── index.css                # Importa todos os estilos
├── imgs/                         # Imagens e ícones
└── supabase/
    └── schema.sql               # Schema do banco de dados
```

---

## 🔑 Credenciais Padrão

### Admin
- **Email:** admin@shopnow.com
- **Senha:** Admin@1234

*(Mudar na página de Settings do admin)*

---

## 📊 Fluxo de Uso

### Visitante
1. Acessa `index.html`
2. Navega pelas categorias
3. Adiciona produtos ao carrinho
4. Vai para checkout
5. Faz login/registro
6. Completa a compra
7. Vê confirmação e recebe email

### Administrador
1. Acessa `pages/admin/login.html`
2. Faz login com credenciais admin
3. Dashboard mostra KPIs
4. Gerencia produtos, categorias, pedidos
5. Cria promoções e ofertas
6. Vê relatórios de vendas

---

## 🛠️ Customização

### Mudar nome da loja
- Editar `js/data.js` → `storeName`
- Ou editar em `pages/admin/settings.html`

### Mudar cores
- Editar `css/base/tokens.css` → `--brand`
- Arquivo usa variáveis CSS

### Adicionar produtos
- Admin → Produtos → Novo Produto
- Upload de imagens (base64)
- Preço, categoria, estoque, etc.

### Configurar frete
- Admin → Settings → Valores de frete
- Editar em `js/ui/store-checkout.js` se quiser mudar lógica

---

## 🔒 Segurança

✅ **Senhas hasheadas** no Supabase Auth  
✅ **Row Level Security (RLS)** ativado  
✅ **Validação de formulários** no client  
✅ **Verificação de email** obrigatória  
✅ **Tokens JWT** seguros  

### ⚠️ Antes de colocar em produção:

1. Mudar `SUPABASE_ANON_KEY` para a chave correta
2. Ativar CORS no Supabase para seu domínio
3. Configurar email real (não usar default do Supabase)
4. Ativar SSL/TLS no seu servidor
5. Usar domínio profissional (não localhost)
6. Configurar backup automático do Supabase

---

## 💡 Features Avançadas

### Relatórios
- Vendas por período
- Produtos mais vendidos
- Clientes top
- Ticket médio

### Automações
- Email de confirmação de pedido
- Email de recuperação de senha
- Sincronização de categorias em tempo real
- Atualização de estoque em tempo real

### Integração de Pagamento *(Pronto para adicionar)*
- Stripe
- MercadoPago
- Paypal
- Manual (PIX, Boleto, Transferência)

---

## 📱 Responsividade

Totalmente testado em:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

---

## 🚨 Troubleshooting

### "Nenhum produto aparece"
→ Verifique se tem produtos no Supabase

### "Erro ao fazer login"
→ Confirme seu email primeiro

### "Checkout não funciona"
→ Verifique se o carrinho tem itens

### "Imagens não carregam"
→ Verifique URLs das imagens no admin

---

## 📈 Performance

- **Lazy loading** de imagens
- **Cache** de dados
- **Compressão** de assets
- **Minificação** de CSS/JS
- **CDN pronto** para integração

---

## 📞 Suporte

Para dúvidas ou melhorias:
1. Verifique a documentação
2. Veja o código comentado
3. Consulte Supabase docs

---

## 📜 Licença

Propriedade intelectual. Uso comercial permitido.

---

**Desenvolvido com ❤️ para vender online.**

🎉 **Pronto para colocar no ar!**
