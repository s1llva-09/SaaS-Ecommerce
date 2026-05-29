// ============================================================
// UI ADMIN: NOTIFICAÇÕES
// Dropdown do sino no topbar — compartilhado entre todas as
// páginas admin via script tag individual em cada HTML.
// ============================================================

// -----------------------------------------------------------
// DADOS MOCK
// Cada notificação tem:
//   id       — identificador único
//   type     — 'order' | 'stock' | 'payment'  (controla o ícone e a cor)
//   text     — mensagem exibida
//   time     — tempo relativo (string)
//   unread   — true = negrito + ponto vermelho no sino
// -----------------------------------------------------------
const NOTIFICATIONS = [
  { id: 'N1', type: 'order',   text: 'Novo pedido #12852 — Ana Silva',         time: '2 min atrás',  unread: true  },
  { id: 'N2', type: 'stock',   text: 'Estoque baixo: MacBook Pro 14" (8 un.)', time: '14 min atrás', unread: true  },
  { id: 'N3', type: 'order',   text: 'Pedido #12847 entregue — Carlos Mota',   time: '1h atrás',     unread: true  },
  { id: 'N4', type: 'stock',   text: 'Sem estoque: Rack Capsule de Roupas',    time: '3h atrás',     unread: false },
  { id: 'N5', type: 'payment', text: 'Pagamento confirmado — #12850 R$ 899',   time: '5h atrás',     unread: false },
];

// -----------------------------------------------------------
// ÍCONES por tipo — SVGs consistentes entre plataformas
// -----------------------------------------------------------
const NOTIF_ICONS = {
  order:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  stock:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  payment: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
};

// -----------------------------------------------------------
// IMPLEMENTAR: inicNotifications()
//
// 1. Selecionar: btn   = [data-notif-btn]
//               dot   = [data-notif-dot]
//               panel = [data-notif-dropdown]
//
// 2. Renderizar o HTML interno do panel com NOTIFICATIONS:
//    - Se vazio: mostrar <div class="notif-empty">Nenhuma notificação</div>
//    - Se tem itens: montar .notif-header (título + botão limpar)
//                   e <ul class="notif-list"> com um <li> por notificação
//    - Cada <li class="notif-item [notif-item--unread se unread]">:
//        <div class="notif-icon notif-icon--[type]">ÍCONE</div>
//        <div class="notif-body">
//          <p class="notif-text">text</p>
//          <span class="notif-time">time</span>
//        </div>
//
// 3. Mostrar o ponto vermelho (dot) se houver itens com unread: true
//    dot.style.display = temNaoLidas ? '' : 'none'
//
// 4. Ao clicar no btn:
//    - Alternar a classe .is-open no panel
//
// 5. Ao clicar fora (document click):
//    - Se o click não foi dentro do .notif-wrapper, fechar o panel
//      removendo .is-open
//
// 6. Ao clicar em "Limpar" (.notif-clear-btn):
//    - Limpar NOTIFICATIONS (esvazie o array ou filtre)
//    - Re-renderizar o panel
//    - Esconder o dot
// -----------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('[data-notif-btn]')
  const dot   = document.querySelector('[data-notif-dot]')
  const panel = document.querySelector('[data-notif-dropdown]')

  // Sem os elementos na página, não faz nada
  if (!btn || !panel) return

    // ---------------------------------------------------------
  // Renderiza o HTML interno do painel
  // Chamada sempre que os dados mudam (ex: ao limpar)
  // ---------------------------------------------------------
  function render() {
    const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

    if (dot) dot.style.display = unreadCount ? '' : 'none';

    panel.innerHTML = '';

    // Header sempre presente
    const header = document.createElement('div');
    header.className = 'notif-header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'notif-header__title';
    const titleSpan = document.createElement('span');
    titleSpan.textContent = 'Notificações';
    titleGroup.appendChild(titleSpan);
    if (unreadCount > 0) {
      const badge = document.createElement('span');
      badge.className = 'notif-count-badge';
      badge.textContent = unreadCount;
      titleGroup.appendChild(badge);
    }
    header.appendChild(titleGroup);

    if (NOTIFICATIONS.length > 0) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'notif-clear-btn';
      clearBtn.textContent = 'Limpar tudo';
      clearBtn.addEventListener('click', () => { NOTIFICATIONS.length = 0; render(); });
      header.appendChild(clearBtn);
    }
    panel.appendChild(header);

    // Estado vazio
    if (!NOTIFICATIONS.length) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'notif-empty';
      emptyDiv.innerHTML = `
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <p>Tudo em dia!</p>
        <span>Nenhuma notificação pendente</span>
      `;
      panel.appendChild(emptyDiv);
      return;
    }

    // Lista
    const ul = document.createElement('ul');
    ul.className = 'notif-list';

    NOTIFICATIONS.forEach(n => {
      const li = document.createElement('li');
      li.className = 'notif-item' + (n.unread ? ' notif-item--unread' : '');

      const iconDiv = document.createElement('div');
      iconDiv.className = `notif-icon notif-icon--${n.type}`;
      iconDiv.innerHTML = NOTIF_ICONS[n.type];
      li.appendChild(iconDiv);

      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'notif-body';

      const textP = document.createElement('p');
      textP.className = 'notif-text';
      textP.textContent = n.text;
      bodyDiv.appendChild(textP);

      const metaDiv = document.createElement('div');
      metaDiv.className = 'notif-meta';
      const timeSpan = document.createElement('span');
      timeSpan.className = 'notif-time';
      timeSpan.textContent = n.time;
      metaDiv.appendChild(timeSpan);
      if (n.unread) {
        const unreadDot = document.createElement('span');
        unreadDot.className = 'notif-unread-dot';
        metaDiv.appendChild(unreadDot);
      }
      bodyDiv.appendChild(metaDiv);

      li.appendChild(bodyDiv);

      // Clicar numa notificação não lida a marca como lida
      if (n.unread) {
        li.addEventListener('click', () => { n.unread = false; render(); });
      }

      ul.appendChild(li);
    });

    panel.appendChild(ul);

    // Footer: marcar todas como lidas
    if (unreadCount > 0) {
      const footer = document.createElement('div');
      footer.className = 'notif-footer';
      const markAllBtn = document.createElement('button');
      markAllBtn.className = 'notif-mark-all-btn';
      markAllBtn.textContent = 'Marcar todas como lidas';
      markAllBtn.addEventListener('click', () => { NOTIFICATIONS.forEach(n => n.unread = false); render(); });
      footer.appendChild(markAllBtn);
      panel.appendChild(footer);
    }
  }

  // Abre/fecha ao clicar no sino
  btn.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.toggle('is-open');
  });

  // Fecha ao clicar fora
  document.addEventListener('click', e => {
    if (!e.target.closest('.notif-wrapper')) {
      panel.classList.remove('is-open');
    }
  });

  // Fecha com Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') panel.classList.remove('is-open');
  });

  render();
}); // ← fecha DOMContentLoaded

// ============================================================
// SIDEBAR MOBILE — toggle hamburguer
//
// Responsável por abrir e fechar a sidebar em telas pequenas.
// O hamburguer ([data-sidebar-btn]) e o overlay ([data-sidebar-overlay])
// só existem no HTML, mas o CSS só os exibe em @media ≤ 768px.
//
// Funcionamento:
//   - Clicar no hamburguer: adiciona/remove .is-open na sidebar
//     e no overlay ao mesmo tempo (toggle em ambos)
//   - Clicar no overlay (área escura fora da sidebar): fecha tudo
//     removendo .is-open de ambos
//
// O overlay serve dois propósitos:
//   1. Indicar visualmente que a sidebar está aberta (fundo escuro)
//   2. Ser o alvo de clique para fechar sem precisar de um botão X
//
// Guard `if (!btn) return` evita erros em páginas sem hamburguer.
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const btn     = document.querySelector('[data-sidebar-btn]');
  const sidebar = document.querySelector('.admin-sidebar');
  const overlay = document.querySelector('[data-sidebar-overlay]');
  if (!btn) return;

  // Abre ou fecha a sidebar junto com o overlay
  btn.addEventListener('click', () => {
    sidebar.classList.toggle('is-open');
    overlay.classList.toggle('is-open');
  });

  // Clicar fora (no overlay) fecha a sidebar
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-open');
  });
});
