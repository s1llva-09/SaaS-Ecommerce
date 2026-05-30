// ============================================================
// ADMIN: CONFIGURAÇÕES
// Gerencia dados da loja e cupons
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  await ShopData.ready();

  const tabButtons = document.querySelectorAll('.settings-tab');
  const panels = document.querySelectorAll('.settings-panel');
  const forms = document.querySelectorAll('.settings-form');
  const couponsList = document.querySelector('[data-coupons-list]');
  const couponsEmpty = document.querySelector('[data-coupons-empty]');
  const addCouponBtn = document.querySelector('[data-add-coupon-btn]');
  const couponModal = document.querySelector('[data-coupon-modal]');
  const couponModalOverlay = document.querySelector('[data-coupon-modal-overlay]');
  const couponForm = document.querySelector('[data-coupon-form]');
  const couponModalClose = document.querySelectorAll('[data-coupon-modal-close]');
  const couponModalTitle = document.querySelector('[data-coupon-modal-title]');

  let editingCouponCode = null;

  // ---------------------------------------------------------
  // Sistema de abas
  // ---------------------------------------------------------
  function activateTab(tabName) {
    tabButtons.forEach(btn => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    panels.forEach(panel => {
      const isActive = panel.dataset.panel === tabName;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });

  activateTab(document.querySelector('.settings-tab.is-active')?.dataset.tab || 'geral');

  // ---------------------------------------------------------
  // Carregar e coletar dados dos formulários
  // ---------------------------------------------------------
  function hydrateForms() {
    const settings = ShopData.settings();

    forms.forEach(form => {
      const formType = form.dataset.form;
      const values = settings[formType] || {};

      form.querySelectorAll('[name]').forEach(field => {
        if (!(field.name in values)) return;

        if (field.type === 'checkbox') {
          const shouldBeChecked = Boolean(values[field.name]);
          field.checked = shouldBeChecked;
          return;
        }

        field.value = values[field.name] ?? '';
      });
    });
  }

  function collectFormData(form) {
    const data = Object.fromEntries(new FormData(form));

    form.querySelectorAll('input[type="checkbox"][name]').forEach(input => {
      data[input.name] = input.checked;
    });

    if (form.dataset.form === 'comercial' && data.freeShippingValue !== '') {
      data.freeShippingValue = Number(data.freeShippingValue);
    }

    return data;
  }

  function formatDateBR(dateValue) {
    const [year, month, day] = String(dateValue).split('-');
    return year && month && day ? `${day}/${month}/${year}` : dateValue;
  }

  // ---------------------------------------------------------
  // Salvar configurações
  // ---------------------------------------------------------
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = collectFormData(form);
      const formType = form.dataset.form;

      try {
        ShopData.updateSettings(formType, data);

        // Atualiza nome da loja no header se for aba "geral"
        if (formType === 'geral' && data.storeName) {
          const storeNameEl = document.querySelector('[data-store-name]');
          if (storeNameEl) {
            storeNameEl.innerHTML = `${data.storeName}<small>Admin Panel</small>`;
          }
        }

        // Atualiza formulário com os dados salvos
        await new Promise(resolve => setTimeout(resolve, 500));
        hydrateForms();

        // Dispara evento para notificar outras abas/janelas sobre mudanças
        const timestamp = new Date().toISOString();
        localStorage.setItem(`admin-settings-update-${formType}`, timestamp);
        window.dispatchEvent(new CustomEvent('admin:settings:updated', { detail: { formType, data, timestamp } }));

        showNotification(`✓ ${formType.charAt(0).toUpperCase() + formType.slice(1)} salvo com sucesso!`);
      } catch (error) {
        console.error('Erro ao salvar:', error);
        showNotification(`✗ Erro ao salvar ${formType}`);
      }
    });
  });

  // ---------------------------------------------------------
  // Renderizar cupons
  // ---------------------------------------------------------
  function renderCoupons() {
    const coupons = ShopData.coupons();
    couponsList.innerHTML = '';

    if (coupons.length === 0) {
      couponsEmpty.hidden = false;
      return;
    }

    couponsEmpty.hidden = true;

    coupons.forEach(coupon => {
      const tr = document.createElement('tr');

      const codeCell = document.createElement('td');
      codeCell.innerHTML = `<strong>${coupon.code}</strong>`;
      tr.appendChild(codeCell);

      const discountCell = document.createElement('td');
      const discountText = coupon.discountType === 'percentage'
        ? `${coupon.discountValue}%`
        : `R$ ${parseFloat(coupon.discountValue).toFixed(2)}`;
      discountCell.textContent = discountText;
      tr.appendChild(discountCell);

      const typeCell = document.createElement('td');
      typeCell.textContent = coupon.discountType === 'percentage' ? 'Percentual' : 'Valor Fixo';
      tr.appendChild(typeCell);

      const expiryCell = document.createElement('td');
      expiryCell.textContent = formatDateBR(coupon.expiryDate);
      tr.appendChild(expiryCell);

      const usesCell = document.createElement('td');
      usesCell.textContent = coupon.maxUses ? `${coupon.uses}/${coupon.maxUses}` : '∞';
      tr.appendChild(usesCell);

      const actionsCell = document.createElement('td');
      actionsCell.className = 'coupon-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-icon';
      editBtn.type = 'button';
      editBtn.title = 'Editar cupom';
      editBtn.setAttribute('aria-label', `Editar cupom ${coupon.code}`);
      editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
      editBtn.addEventListener('click', () => openEditCouponModal(coupon));
      actionsCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-icon btn-danger';
      deleteBtn.type = 'button';
      deleteBtn.title = 'Excluir cupom';
      deleteBtn.setAttribute('aria-label', `Excluir cupom ${coupon.code}`);
      deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
      deleteBtn.addEventListener('click', () => deleteCoupon(coupon.code));
      actionsCell.appendChild(deleteBtn);

      tr.appendChild(actionsCell);
      couponsList.appendChild(tr);
    });
  }

  // ---------------------------------------------------------
  // Modais de cupom
  // ---------------------------------------------------------
  function openCreateCouponModal() {
    editingCouponCode = null;
    couponModalTitle.textContent = 'Novo cupom';
    couponForm.reset();
    openCouponModal();
  }

  function openEditCouponModal(coupon) {
    editingCouponCode = coupon.code;
    couponModalTitle.textContent = 'Editar cupom';
    couponForm.querySelector('input[name="code"]').value = coupon.code;
    couponForm.querySelector('select[name="discountType"]').value = coupon.discountType;
    couponForm.querySelector('input[name="discountValue"]').value = coupon.discountValue;
    couponForm.querySelector('input[name="expiryDate"]').value = coupon.expiryDate;
    couponForm.querySelector('input[name="maxUses"]').value = coupon.maxUses || '';
    couponForm.querySelector('input[name="code"]').disabled = true;
    openCouponModal();
  }

  function openCouponModal() {
    couponModalOverlay.classList.add('is-open');
    couponModal.classList.add('is-open');
    couponModalOverlay.setAttribute('aria-hidden', 'false');
    couponModal.setAttribute('aria-hidden', 'false');
  }

  function closeCouponModal() {
    couponModalOverlay.classList.remove('is-open');
    couponModal.classList.remove('is-open');
    couponModalOverlay.setAttribute('aria-hidden', 'true');
    couponModal.setAttribute('aria-hidden', 'true');
    couponForm.querySelector('input[name="code"]').disabled = false;
    editingCouponCode = null;
  }

  // ---------------------------------------------------------
  // Salvar cupom
  // ---------------------------------------------------------
  couponForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(couponForm);
    const code = formData.get('code').toUpperCase().trim();
    const discountType = formData.get('discountType');
    const discountValue = parseFloat(formData.get('discountValue'));
    const expiryDate = formData.get('expiryDate');
    const maxUses = parseInt(formData.get('maxUses')) || 0;

    if (!code || !discountValue || !expiryDate) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const coupons = ShopData.coupons();
    const codeExists = coupons.some(c => c.code === code && c.code !== editingCouponCode);

    if (codeExists) {
      alert('Este código de cupom já existe');
      return;
    }

    if (editingCouponCode) {
      ShopData.updateCoupon(editingCouponCode, { code, discountType, discountValue, expiryDate, maxUses });
      showNotification('Cupom atualizado com sucesso!');
    } else {
      ShopData.addCoupon({ code, discountType, discountValue, expiryDate, maxUses, uses: 0 });
      showNotification('Cupom criado com sucesso!');
    }

    closeCouponModal();
    renderCoupons();
  });

  function deleteCoupon(code) {
    if (confirm(`Tem certeza que deseja deletar o cupom "${code}"?`)) {
      ShopData.deleteCoupon(code);
      showNotification('Cupom deletado com sucesso!');
      renderCoupons();
    }
  }

  // ---------------------------------------------------------
  // Notificação
  // ---------------------------------------------------------
  function showNotification(message) {
    // Remove notificação anterior se existir
    const existing = document.querySelector('.settings-toast');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = 'settings-toast';
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => {
      notif.classList.add('hide');
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  // ---------------------------------------------------------
  // Event listeners
  // ---------------------------------------------------------
  addCouponBtn.addEventListener('click', openCreateCouponModal);
  couponModalOverlay.addEventListener('click', closeCouponModal);

  couponModalClose.forEach(btn => {
    btn.addEventListener('click', closeCouponModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && couponModal.getAttribute('aria-hidden') === 'false') {
      closeCouponModal();
    }
  });

  hydrateForms();
  renderCoupons();
});
