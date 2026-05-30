document.addEventListener('DOMContentLoaded', async () => {
  await ShopData.ready();

  const modal = document.querySelector('[data-promo-modal]');
  const modalTitle = document.querySelector('[data-promo-modal-title]');
  const form = document.querySelector('[data-promo-form]');
  const productSelect = document.querySelector('[data-promo-product]');
  const discountInput = document.querySelector('[data-promo-discount]');
  const endDateInput = document.querySelector('[data-promo-enddate]');
  const activeCheckbox = document.querySelector('[data-promo-active]');
  const table = document.querySelector('[data-promotions-table]');
  const addBtn = document.querySelector('[data-promo-add-btn]');
  const closeBtn = document.querySelector('[data-promo-modal-close]');
  const cancelBtn = document.querySelector('[data-promo-modal-cancel]');
  const saveBtn = document.querySelector('[data-promo-save]');

  if (!modal || !form || !productSelect || !table || !addBtn) {
    console.error('Erro: Elementos do modal não encontrados');
    return;
  }

  let editingPromoId = null;
  let deleteConfirmCallback = null;

  function showDeleteConfirm(promoId, productName) {
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal-overlay';
    confirmModal.style.display = 'flex';
    confirmModal.innerHTML = `
      <div class="modal" style="max-width: 400px;">
        <div class="modal__header">
          <h2>Deletar Promoção</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body">
          <p>Tem certeza que deseja deletar a promoção de <strong>${productName}</strong>?</p>
          <p style="color: #999; font-size: 13px; margin-top: 12px;">Esta ação não pode ser desfeita.</p>
        </div>
        <div class="modal__footer">
          <button class="btn btn-secondary" data-cancel>Cancelar</button>
          <button class="btn btn-danger" data-confirm>Deletar</button>
        </div>
      </div>
    `;

    document.body.appendChild(confirmModal);

    const closeBtn = confirmModal.querySelector('.modal__close');
    const cancelBtn = confirmModal.querySelector('[data-cancel]');
    const confirmBtn = confirmModal.querySelector('[data-confirm]');

    const cleanup = () => {
      confirmModal.remove();
      deleteConfirmCallback = null;
    };

    closeBtn.addEventListener('click', cleanup);
    cancelBtn.addEventListener('click', cleanup);

    confirmBtn.addEventListener('click', () => {
      ShopData.deletePromotion(promoId);
      renderTable();
      cleanup();
    });

    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) cleanup();
    });
  }

  function renderProducts() {
    const products = ShopData.products();
    productSelect.innerHTML = '<option value="">Selecione um produto</option>';
    products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = product.name;
      productSelect.appendChild(option);
    });
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  }

  function formatBRDateTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR');
  }

  function getTimeRemaining(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return 'Expirado';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} dia${days > 1 ? 's' : ''}`;
    }

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  function renderTable() {
    const promotions = ShopData.promotions();
    const products = ShopData.products();
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    table.innerHTML = '';

    if (promotions.length === 0) {
      table.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">Nenhuma promoção ativa</td></tr>';
      return;
    }

    promotions.forEach(promo => {
      const product = productMap[promo.productId];
      if (!product) return;

      const row = document.createElement('tr');
      const timeRemaining = getTimeRemaining(promo.endDate);
      const isExpired = new Date(promo.endDate) < new Date();

      row.innerHTML = `
        <td>${product.name}</td>
        <td><span class="badge badge-blue">${promo.discountPercentage}% off</span></td>
        <td>
          <small>${formatBRDateTime(promo.endDate)}</small><br>
          <small style="color: #999;">${timeRemaining}</small>
        </td>
        <td>
          <span class="badge ${promo.active && !isExpired ? 'badge-green' : 'badge-red'}">
            ${promo.active && !isExpired ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td>
          <button class="admin-btn-icon edit-promo" data-promo-id="${promo.id}" title="Editar">✏️</button>
          <button class="admin-btn-icon delete-promo" data-promo-id="${promo.id}" title="Deletar">🗑️</button>
        </td>
      `;

      table.appendChild(row);
    });

    document.querySelectorAll('.edit-promo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const promoId = e.target.dataset.promoId;
        const promo = ShopData.promotions().find(p => p.id === promoId);
        if (promo) openEditModal(promo);
      });
    });

    document.querySelectorAll('.delete-promo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const promoId = e.target.dataset.promoId;
        const promo = ShopData.promotions().find(p => p.id === promoId);
        const product = productMap[promo.productId];
        if (product) {
          showDeleteConfirm(promoId, product.name);
        }
      });
    });
  }

  function openAddModal() {
    editingPromoId = null;
    modalTitle.textContent = 'Adicionar Promoção';
    form.reset();
    activeCheckbox.checked = true;
    modal.style.display = 'flex';
  }

  function openEditModal(promo) {
    editingPromoId = promo.id;
    modalTitle.textContent = 'Editar Promoção';
    productSelect.value = promo.productId;
    discountInput.value = promo.discountPercentage;
    endDateInput.value = formatDateTime(promo.endDate);
    activeCheckbox.checked = promo.active;
    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
    editingPromoId = null;
    form.reset();
  }

  addBtn.addEventListener('click', openAddModal);

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const productId = productSelect.value;
      const discount = Number(discountInput.value);
      const endDate = endDateInput.value;
      const active = activeCheckbox.checked;

      if (!productId || !discount || !endDate) {
        alert('Preencha todos os campos');
        return;
      }

      if (editingPromoId) {
        ShopData.updatePromotion(editingPromoId, {
          productId,
          discountPercentage: discount,
          endDate,
          active,
        });
      } else {
        ShopData.addPromotion({
          productId,
          discountPercentage: discount,
          endDate,
          active,
        });
      }

      renderTable();
      closeModal();
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  renderProducts();
  renderTable();
});
