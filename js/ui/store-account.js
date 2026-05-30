// ============================================================
// UI: CONTA
// Lista pedidos recentes e abre drawer de detalhe ao clicar.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const list    = document.querySelector('[data-order-list]');
  const overlay = document.querySelector('[data-od-overlay]');
  const drawer  = document.querySelector('[data-od-drawer]');
  const title   = document.querySelector('[data-od-title]');
  const body    = document.querySelector('[data-od-body]');
  const closeBtn = document.querySelector('[data-od-close]');
  const logoutBtn = document.querySelector('[data-logout-btn]');

  // ---------------------------------------------------------
  // Carrega dados do usuário logado
  // ---------------------------------------------------------
  const user = ShopNow.getUser();
  if (!user) {
    window.location.href = `${ShopNow.root()}pages/register.html`;
    throw new Error('Usuário não autenticado');
  }

  const userAvatar = document.querySelector('[data-user-avatar]');
  const userName = document.querySelector('[data-user-name]');
  const userEmail = document.querySelector('[data-user-email]');

  if (userAvatar && user.name) {
    const initials = user.name.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
    userAvatar.textContent = initials;
  }
  if (userName) userName.textContent = user.name || 'Usuário';
  if (userEmail) userEmail.textContent = user.email || '';

  // ---------------------------------------------------------
  // Atualiza informações do perfil
  // ---------------------------------------------------------
  const ordersCount = document.querySelector('[data-orders-count]');
  const spentTotal = document.querySelector('[data-spent-total]');

  if (ordersCount && spentTotal) {
    const userOrders = ShopData.orders().filter(order => order.userId === user.id);
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
    ordersCount.textContent = userOrders.length;
    spentTotal.textContent = ShopNow.money(totalSpent);
  }

  // ---------------------------------------------------------
  // Modal de editar perfil
  // ---------------------------------------------------------
  const editProfileBtn = document.querySelector('[data-edit-profile-btn]');
  const editProfileOverlay = document.querySelector('[data-edit-profile-overlay]');
  const editProfileModal = document.querySelector('[data-edit-profile-modal]');
  const editProfileForm = document.querySelector('[data-edit-profile-form]');
  const editProfileCancel = document.querySelector('[data-edit-profile-cancel]');

  function openEditProfileModal() {
    if (editProfileForm) {
      editProfileForm.querySelector('[name="name"]').value = user.name || '';
      editProfileForm.querySelector('[name="email"]').value = user.email || '';
      editProfileForm.querySelector('[name="phone"]').value = user.phone || '';
    }
    editProfileOverlay?.classList.add('is-open');
    editProfileModal?.classList.add('is-open');
    editProfileOverlay?.setAttribute('aria-hidden', 'false');
    editProfileModal?.setAttribute('aria-hidden', 'false');
  }

  function closeEditProfileModal() {
    editProfileOverlay?.classList.remove('is-open');
    editProfileModal?.classList.remove('is-open');
    editProfileOverlay?.setAttribute('aria-hidden', 'true');
    editProfileModal?.setAttribute('aria-hidden', 'true');
  }

  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', openEditProfileModal);
  }

  if (editProfileCancel) {
    editProfileCancel.addEventListener('click', closeEditProfileModal);
  }

  if (editProfileOverlay) {
    editProfileOverlay.addEventListener('click', closeEditProfileModal);
  }

  if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updatedUser = {
        ...user,
        name: editProfileForm.querySelector('[name="name"]').value,
        email: editProfileForm.querySelector('[name="email"]').value,
        phone: editProfileForm.querySelector('[name="phone"]').value,
      };

      const token = localStorage.getItem('supabase_token');
      if (token) {
        try {
          const res = await fetch('https://nnkokgtplnuhmhlqarba.supabase.co/auth/v1/user', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua29rZ3RwbG51aG1obHFhcmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjk3MjUsImV4cCI6MjA5NDgwNTcyNX0.2nf1eytsNVNAAi4FymsmTSQEnwpzokGRXV6Lbp7k0pU',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: updatedUser.email,
              data: { name: updatedUser.name, phone: updatedUser.phone },
            }),
          });
          if (!res.ok) throw new Error();
        } catch {
          ShopNow.toast('Erro ao salvar no servidor. Tente novamente.', 'error');
          return;
        }
      }

      localStorage.setItem('user', JSON.stringify(updatedUser));

      if (userAvatar && updatedUser.name) {
        const initials = updatedUser.name.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
        userAvatar.textContent = initials;
      }
      if (userName) userName.textContent = updatedUser.name;
      if (userEmail) userEmail.textContent = updatedUser.email;

      closeEditProfileModal();
      ShopNow.toast('✓ Perfil atualizado com sucesso!');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editProfileModal?.getAttribute('aria-hidden') === 'false') {
      closeEditProfileModal();
    }
  });

  // ---------------------------------------------------------
  // Logout com Modal
  // ---------------------------------------------------------
  const logoutModalOverlay = document.querySelector('[data-logout-overlay]');
  const logoutModal = document.querySelector('[data-logout-modal]');
  const logoutCancel = document.querySelector('[data-logout-cancel]');
  const logoutConfirm = document.querySelector('[data-logout-confirm]');

  function openLogoutModal() {
    logoutModalOverlay?.classList.add('is-open');
    logoutModal?.classList.add('is-open');
    logoutModalOverlay?.setAttribute('aria-hidden', 'false');
    logoutModal?.setAttribute('aria-hidden', 'false');
  }

  function closeLogoutModal() {
    logoutModalOverlay?.classList.remove('is-open');
    logoutModal?.classList.remove('is-open');
    logoutModalOverlay?.setAttribute('aria-hidden', 'true');
    logoutModal?.setAttribute('aria-hidden', 'true');
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', openLogoutModal);
  }

  if (logoutCancel) {
    logoutCancel.addEventListener('click', closeLogoutModal);
  }

  if (logoutConfirm) {
    logoutConfirm.addEventListener('click', () => {
      ShopNow.logout();
    });
  }

  if (logoutModalOverlay) {
    logoutModalOverlay.addEventListener('click', closeLogoutModal);
  }

  // Fechar modal com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLogoutModal();
    }
  });

  if (!list) return;

  // ---------------------------------------------------------
  // Renderiza os cards de pedidos
  // ---------------------------------------------------------
  list.innerHTML = '';
  const userOrders = ShopData.orders().filter(order => order.userId === user.id);
  userOrders.forEach(order => {
    const article = document.createElement('article');
    article.className = 'order-card card';
    article.style.cursor = 'pointer';
    article.dataset.orderId = order.id;

    const strong = document.createElement('strong');
    strong.className = 'text-brand';
    strong.textContent = order.id;
    article.appendChild(strong);

    const infoDiv = document.createElement('div');
    const infoStrong = document.createElement('strong');
    infoStrong.textContent = order.items.map(item => item.name).join(', ');
    infoDiv.appendChild(infoStrong);
    const metaP = document.createElement('p');
    metaP.className = 'text-muted';
    metaP.style.margin = '4px 0';
    metaP.textContent = `${order.date} — ${order.paymentMethod}`;
    infoDiv.appendChild(metaP);
    article.appendChild(infoDiv);

    const rightDiv = document.createElement('div');
    rightDiv.style.textAlign = 'right';
    // statusBadge retorna HTML estático (só classes/labels do sistema, sem dados do usuário)
    rightDiv.innerHTML = ShopNow.statusBadge(order.status);
    const totalP = document.createElement('p');
    totalP.style.margin = '8px 0 0';
    const totalStrong = document.createElement('strong');
    totalStrong.textContent = ShopNow.money(order.total);
    totalP.appendChild(totalStrong);
    rightDiv.appendChild(totalP);
    article.appendChild(rightDiv);

    list.appendChild(article);
  });

  // ---------------------------------------------------------
  // Abre o drawer ao clicar em um card
  // ---------------------------------------------------------
  function openDrawer(orderId) {
    const order = userOrders.find(o => o.id === orderId);
    if (!order) return;

    // Título do drawer
    title.textContent = `Pedido ${order.id}`;

    // Constrói o body do drawer via createElement
    body.innerHTML = '';

    // Seção de Itens
    const itemsSection = document.createElement('div');
    itemsSection.className = 'od-section';

    const itemsSectionTitle = document.createElement('p');
    itemsSectionTitle.className = 'od-section-title';
    itemsSectionTitle.textContent = 'Itens';
    itemsSection.appendChild(itemsSectionTitle);

    order.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'od-item';

      const infoDiv = document.createElement('div');
      infoDiv.className = 'od-item__info';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'od-item__name';
      nameSpan.textContent = item.name;
      infoDiv.appendChild(nameSpan);

      const qtySpan = document.createElement('span');
      qtySpan.className = 'od-item__qty';
      qtySpan.textContent = `Qtd: ${item.qty}`;
      infoDiv.appendChild(qtySpan);

      itemDiv.appendChild(infoDiv);

      const priceSpan = document.createElement('span');
      priceSpan.className = 'od-item__price';
      priceSpan.textContent = ShopNow.money(item.price * item.qty);
      itemDiv.appendChild(priceSpan);

      itemsSection.appendChild(itemDiv);
    });

    body.appendChild(itemsSection);

    // Seção de Informações
    const typeLabel = order.type === 'pickup' ? 'Retirada' : 'Entrega';

    const infoSection = document.createElement('div');
    infoSection.className = 'od-section';

    const infoSectionTitle = document.createElement('p');
    infoSectionTitle.className = 'od-section-title';
    infoSectionTitle.textContent = 'Informações';
    infoSection.appendChild(infoSectionTitle);

    const metaDiv = document.createElement('div');
    metaDiv.className = 'od-meta';

    const metaItems = [
      { label: 'Data',       value: order.date },
      { label: 'Pagamento',  value: order.paymentMethod },
      { label: 'Tipo',       value: typeLabel },
      { label: 'Cidade',     value: order.city },
    ];

    metaItems.forEach(({ label, value }) => {
      const metaItem = document.createElement('div');
      metaItem.className = 'od-meta-item';
      const lbl = document.createElement('label');
      lbl.textContent = label;
      metaItem.appendChild(lbl);
      const span = document.createElement('span');
      span.textContent = value;
      metaItem.appendChild(span);
      metaDiv.appendChild(metaItem);
    });

    // Status usa statusBadge (HTML estático do sistema)
    const statusMetaItem = document.createElement('div');
    statusMetaItem.className = 'od-meta-item';
    const statusLbl = document.createElement('label');
    statusLbl.textContent = 'Status';
    statusMetaItem.appendChild(statusLbl);
    const statusSpan = document.createElement('span');
    statusSpan.innerHTML = ShopNow.statusBadge(order.status);
    statusMetaItem.appendChild(statusSpan);
    metaDiv.appendChild(statusMetaItem);

    infoSection.appendChild(metaDiv);
    body.appendChild(infoSection);

    // Total
    const totalDiv = document.createElement('div');
    totalDiv.className = 'od-total';
    const totalLabel = document.createElement('span');
    totalLabel.textContent = 'Total';
    totalDiv.appendChild(totalLabel);
    const totalValue = document.createElement('span');
    totalValue.textContent = ShopNow.money(order.total);
    totalDiv.appendChild(totalValue);
    body.appendChild(totalDiv);

    overlay.classList.add('is-open');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
  }

  // ---------------------------------------------------------
  // Fecha o drawer
  // ---------------------------------------------------------
  function closeDrawer() {
    overlay.classList.remove('is-open');
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  // Clicar num card de pedido
  list.addEventListener('click', e => {
    const card = e.target.closest('[data-order-id]');
    if (card) openDrawer(card.dataset.orderId);
  });

  // Fechar pelo botão X
  closeBtn.addEventListener('click', closeDrawer);

  // Fechar pelo overlay
  overlay.addEventListener('click', closeDrawer);

  // Fechar com Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });
});
