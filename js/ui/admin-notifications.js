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
// ÍCONES por tipo (emoji simples — pode trocar por SVG)
// -----------------------------------------------------------
const NOTIF_ICONS = {
  order:   '🛒',
  stock:   '⚠️',
  payment: '✅',
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
    const unread = NOTIFICATIONS.filter(n => n.unread);

    // Ponto vermelho no sino: aparece só se houver não lidas
    dot.style.display = unread.length ? '' : 'none';

    if (!NOTIFICATIONS.length) {
      panel.innerHTML = `<div class="notif-empty">Nenhuma notificação</div>`;
      return;
    }

    panel.innerHTML = `
      <div class="notif-header">
        <span>Notificações</span>
        <button class="notif-clear-btn" data-notif-clear>Limpar tudo</button>
      </div>
      <ul class="notif-list">
        ${NOTIFICATIONS.map(n => `
          <li class="notif-item ${n.unread ? 'notif-item--unread' : ''}">
            <div class="notif-icon notif-icon--${n.type}">${NOTIF_ICONS[n.type]}</div>
            <div class="notif-body">
              <p class="notif-text">${n.text}</p>
              <span class="notif-time">${n.time}</span>
            </div>
          </li>
        `).join('')}
      </ul>
    `
    // Botão limpar só existe após o innerHTML acima, então ouve aqui
    panel.querySelector('[data-notif-clear]')?.addEventListener('click', () => {
      NOTIFICATIONS.length = 0;
      render();
    })
  } // ← fecha render()

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
