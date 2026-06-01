// ============================================================
// UI: CONTA
// Lista pedidos recentes e abre drawer de detalhe ao clicar.
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
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
  const REVIEW_STORAGE_KEY = 'shopnow-product-reviews';
  let productReviews = [];

  // Remove any previous localStorage review state and keep reviews only in memory.
  if (localStorage.getItem(REVIEW_STORAGE_KEY)) {
    localStorage.removeItem(REVIEW_STORAGE_KEY);
  }

  function loadProductReviews() {
    return productReviews;
  }

  function saveProductReviews(reviews) {
    productReviews = Array.isArray(reviews) ? reviews : [];
  }

  function getReviewIdentifier(item) {
    // Use the most stable identifier available for order items.
    // Orders created from checkout carry productId, while some existing items may use id or sku.
    return String(item.productId || item.id || item.sku || item.name || '').trim();
  }

  function getProductReview(item) {
    const key = getReviewIdentifier(item);
    return loadProductReviews().find(review => review.productKey === key);
  }

  function setProductReview(review) {
    const reviews = loadProductReviews();
    const index = reviews.findIndex(item => item.productKey === review.productKey);
    if (index >= 0) {
      reviews[index] = review;
    } else {
      reviews.push(review);
    }
    saveProductReviews(reviews);
  }

  let reviewDialog = null;

  function createReviewDialog() {
    const overlay = document.createElement('div');
    overlay.className = 'review-modal-overlay';
    overlay.addEventListener('click', event => {
      if (event.target === overlay) closeReviewModal();
    });

    const modal = document.createElement('div');
    modal.className = 'review-modal';

    const header = document.createElement('div');
    header.className = 'review-modal__header';

    const title = document.createElement('strong');
    title.textContent = 'Avaliar produto';
    header.appendChild(title);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'review-modal-close';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', closeReviewModal);
    header.appendChild(closeButton);

    modal.appendChild(header);

    const productName = document.createElement('p');
    productName.className = 'review-modal__product-name';
    modal.appendChild(productName);

    const stars = document.createElement('div');
    stars.className = 'review-modal__stars';
    modal.appendChild(stars);

    const actions = document.createElement('div');
    actions.className = 'review-modal__actions';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'btn btn-outline';
    cancel.textContent = 'Cancelar';
    cancel.addEventListener('click', closeReviewModal);
    actions.appendChild(cancel);

    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'btn btn-primary';
    save.textContent = 'Salvar avaliação';
    actions.appendChild(save);

    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    return {
      overlay,
      productName,
      stars,
      save,
      currentItem: null,
      currentOrder: null,
      currentRating: 0,
      previousRating: 0,
    };
  }

  function renderReviewStars(value) {
    if (!reviewDialog) return;
    reviewDialog.currentRating = value;
    reviewDialog.stars.innerHTML = '';
    for (let i = 1; i <= 5; i += 1) {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'review-modal__star' + (i <= value ? ' is-active' : '');
      star.innerHTML = '★';
      star.addEventListener('click', () => renderReviewStars(i));
      reviewDialog.stars.appendChild(star);
    }
  }

  function refreshReviewButtons() {
    if (!reviewDialog) return;
    body.querySelectorAll('[data-review-button]').forEach(btn => {
      const item = {
        productId: btn.dataset.reviewProductId,
        id: btn.dataset.reviewProductId,
        sku: btn.dataset.reviewProductKey,
        name: btn.dataset.reviewProductName,
      };
      const review = getProductReview(item);
      btn.textContent = review ? 'Editar avaliação' : 'Avaliar produto';
      const hint = btn.nextElementSibling;
      if (hint && hint.classList.contains('reviewed-badge')) {
        hint.textContent = review ? `Avaliado ${review.rating}★` : '';
      }
    });
  }

  function updateOrderCardReviewCount(order) {
    const orderCard = list.querySelector(`[data-order-id="${order.id}"]`);
    if (!orderCard) return;
    const infoDiv = orderCard.querySelector('div');
    if (!infoDiv) return;

    const reviewedItemsCount = order.items.filter(item => getProductReview(item)).length;
    let reviewBadge = orderCard.querySelector('.order-card__review-count');

    if (reviewedItemsCount) {
      if (!reviewBadge) {
        reviewBadge = document.createElement('span');
        reviewBadge.className = 'order-card__review-count';
        infoDiv.appendChild(reviewBadge);
      }
      reviewBadge.textContent = reviewedItemsCount === 1
        ? '1 item avaliado'
        : `${reviewedItemsCount} itens avaliados`;
    } else if (reviewBadge) {
      reviewBadge.remove();
    }
  }

  function openReviewModal(item, order) {
    if (!reviewDialog) reviewDialog = createReviewDialog();
    const savedReview = getProductReview(item) || { rating: 0, comment: '' };
    reviewDialog.currentItem = item;
    reviewDialog.currentOrder = order;
    reviewDialog.productName.textContent = item.name || 'Produto';
    reviewDialog.comment.value = savedReview.comment || '';
    renderReviewStars(savedReview.rating || 0);
    reviewDialog.save.onclick = () => {
      const review = {
        productKey: getReviewIdentifier(item),
        productName: item.name || '',
        orderId: order.id,
        rating: reviewDialog.currentRating,
        comment: reviewDialog.comment.value.trim(),
        date: new Date().toISOString(),
      };
      setProductReview(review);
      ShopNow.toast('Avaliação salva');
      refreshReviewButtons();
      updateOrderCardReviewCount(order);
      closeReviewModal();
    };
    reviewDialog.overlay.classList.add('is-open');
  }

  function closeReviewModal() {
    if (!reviewDialog) return;
    reviewDialog.overlay.classList.remove('is-open');
  }

  if (!reviewDialog) reviewDialog = createReviewDialog();

  function updateOrderStats() {
    if (!ordersCount || !spentTotal) return;
    const userId = String(user.id || '');
    const userEmailLower = String(user.email || '').toLowerCase();
    const userOrders = ShopData.orders().filter(order =>
      String(order.userId || '') === userId || String(order.email || '').toLowerCase() === userEmailLower
    );
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

  const orderSkeletonCount = 3;
  const ordersCountPlaceholder = document.querySelector('[data-orders-count]');
  const spentTotalPlaceholder = document.querySelector('[data-spent-total]');

  function createOrderSkeleton() {
    const article = document.createElement('article');
    article.className = 'order-card card skeleton';
    article.style.minHeight = '120px';
    return article;
  }

  function renderOrderSkeletons() {
    if (ordersCountPlaceholder) {
      ordersCountPlaceholder.textContent = '—';
      ordersCountPlaceholder.classList.add('skeleton');
    }
    if (spentTotalPlaceholder) {
      spentTotalPlaceholder.textContent = '—';
      spentTotalPlaceholder.classList.add('skeleton');
    }
    list.innerHTML = '';
    for (let i = 0; i < orderSkeletonCount; i += 1) {
      list.appendChild(createOrderSkeleton());
    }
  }

  function clearOrderSkeletons() {
    if (ordersCountPlaceholder) {
      ordersCountPlaceholder.classList.remove('skeleton');
    }
    if (spentTotalPlaceholder) {
      spentTotalPlaceholder.classList.remove('skeleton');
    }
  }

  renderOrderSkeletons();
  await ShopData.ready();
  clearOrderSkeletons();
  updateOrderStats();

  // ---------------------------------------------------------
  // Renderiza os cards de pedidos
  // ---------------------------------------------------------
  list.innerHTML = '';
  const userId = String(user.id || '');
  const userEmailLower = String(user.email || '').toLowerCase();
  const userOrders = ShopData.orders().filter(order =>
    String(order.userId || '') === userId || String(order.email || '').toLowerCase() === userEmailLower
  );
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
    const reviewedItemsCount = order.items.filter(item => getProductReview(item)).length;
    if (reviewedItemsCount) {
      const reviewBadge = document.createElement('span');
      reviewBadge.className = 'order-card__review-count';
      reviewBadge.textContent = reviewedItemsCount === 1
        ? '1 item avaliado'
        : `${reviewedItemsCount} itens avaliados`;
      infoDiv.appendChild(reviewBadge);
    }
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

      const reviewButton = document.createElement('button');
      reviewButton.type = 'button';
      reviewButton.className = 'btn btn-outline btn-sm';
      reviewButton.dataset.reviewButton = '';
      reviewButton.dataset.reviewProductKey = getReviewIdentifier(item);
      reviewButton.dataset.reviewProductName = item.name || '';
      reviewButton.dataset.reviewProductId = item.productId || item.id || item.sku || '';
      const existingReview = getProductReview(item);
      reviewButton.textContent = existingReview ? 'Editar avaliação' : 'Avaliar produto';
      reviewButton.addEventListener('click', event => {
        event.stopPropagation();
        openReviewModal(item, order);
      });
      infoDiv.appendChild(reviewButton);

      const reviewHint = document.createElement('span');
      reviewHint.className = 'reviewed-badge';
      reviewHint.textContent = existingReview ? `Avaliado ${existingReview.rating}★` : '';
      infoDiv.appendChild(reviewHint);

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
