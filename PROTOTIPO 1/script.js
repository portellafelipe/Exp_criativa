// =========================================================
// VITOR — Constantes e estado global da aplicação
// Define as chaves do localStorage, lista de categorias
// disponíveis, mapeamento de ícones por categoria e os
// objetos de estado global Auth e App.
// =========================================================
const KEYS = {
  usuarios: 'unifound_users_v1',
  sessao: 'unifound_session_v1',
  itens: 'unifound_itens_v1'
};

const CATEGORIAS = ['Chave','Carteira','Celular','Documento','Eletrônico','Roupa','Mochila/Bolsa','Outro'];

const CAT_ICONS = {
  'Chave':'&#128273;','Carteira':'&#128180;','Celular':'&#128241;',
  'Documento':'&#128196;','Eletrônico':'&#128187;','Roupa':'&#128084;',
  'Mochila/Bolsa':'&#127890;','Outro':'&#128269;'
};

const Auth = {
  usuarios: [],
  usuarioAtual: null
};

const App = {
  itens: [],
  filtroCategoria: 'Todos',
  filtroBusca: '',
  ordenacao: 'recente'
};

// =========================================================
// FELIPE — Dados de exemplo
// Conjunto de itens pré-cadastrados que populam o feed
// quando nenhum dado ainda foi salvo no localStorage.
// =========================================================
const ITENS_EXEMPLO = [
  { id:1000001, nome:'Carteira preta', categoria:'Carteira', locali:'Bloco B — Sala 204', data:'2025-03-20', contato:'João Silva — joao@email.com', status:'perdido', criadoEm: Date.now()-86400000*6, userId: null },
  { id:1000002, nome:'Chave com chaveiro azul', categoria:'Chave', local:'Refeitório central', data:'2025-03-22', contato:'Maria Oliveira — (31) 99812-3456', status:'encontrado', criadoEm: Date.now()-86400000*4, userId: null },
  { id:1000003, nome:'Celular Samsung Galaxy A54', categoria:'Celular', local:'Biblioteca — Sala de estudos 2', data:'2025-03-23', contato:'Pedro Costa — pedro.costa@email.com', status:'perdido', criadoEm: Date.now()-86400000*3, userId: null },
  { id:1000004, nome:'Mochila Nike cinza', categoria:'Mochila/Bolsa', local:'Quadra esportiva', data:'2025-03-19', contato:'Ana Souza — ana.souza@puc.br', status:'encontrado', criadoEm: Date.now()-86400000*7, userId: null },
  { id:1000005, nome:'Carteira de estudante', categoria:'Documento', local:'Estacionamento — Bloco A', data:'2025-03-24', contato:'Lucas Mendes — lucas.m@email.com', status:'perdido', criadoEm: Date.now()-86400000*1, userId: null },
  { id:1000006, nome:'Fone de ouvido JBL preto', categoria:'Eletrônico', local:'Cantina do Bloco C', data:'2025-03-21', contato:'Camila Ferreira — (31) 98877-5544', status:'perdido', criadoEm: Date.now()-86400000*5, userId: null }
];

// =========================================================
// HIGOR — Persistência de usuários e sessão
// Gerencia carregamento e salvamento de contas no
// localStorage, além de controle de sessão ativa via ID.
// =========================================================
function carregarUsuarios() {
  try { Auth.usuarios = JSON.parse(localStorage.getItem(KEYS.usuarios)) || []; }
  catch { Auth.usuarios = []; }
}

function salvarUsuarios() {
  localStorage.setItem(KEYS.usuarios, JSON.stringify(Auth.usuarios));
}

function carregarSessao() {
  const id = localStorage.getItem(KEYS.sessao);
  if (!id) return null;
  return Auth.usuarios.find(u => String(u.id) === String(id)) || null;
}

function salvarSessao(userId) {
  localStorage.setItem(KEYS.sessao, String(userId));
}

function limparSessao() {
  localStorage.removeItem(KEYS.sessao);
}

// =========================================================
// HIGOR — Persistência de itens
// Salva e carrega os itens do feed no localStorage,
// usando os dados de exemplo como fallback inicial.
// =========================================================
function salvarDados() {
  localStorage.setItem(KEYS.itens, JSON.stringify(App.itens));
}

function carregarDados() {
  try {
    const raw = localStorage.getItem(KEYS.itens);
    App.itens = raw ? JSON.parse(raw) : ITENS_EXEMPLO;
    if (!raw) salvarDados();
  } catch { App.itens = ITENS_EXEMPLO; }
}

// =========================================================
// HIGOR — Autenticação: registro de usuário
// Valida os dados do formulário de cadastro (campos
// obrigatórios, tamanho mínimo de senha e e-mail único),
// cria a conta e persiste no localStorage.
// =========================================================
function registrar(nome, email, senha) {
  if (!nome.trim() || !email.trim() || !senha) return { ok: false, msg: 'Preencha todos os campos.' };
  if (senha.length < 6) return { ok: false, msg: 'A senha deve ter pelo menos 6 caracteres.' };
  if (Auth.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, msg: 'Já existe uma conta com esse e-mail.' };
  }
  const novo = { id: Date.now(), nome: nome.trim(), email: email.trim().toLowerCase(), senha, criadoEm: Date.now() };
  Auth.usuarios.push(novo);
  salvarUsuarios();
  return { ok: true, usuario: novo };
}

// =========================================================
// HIGOR — Autenticação: login
// Verifica se o e-mail existe na base e se a senha
// corresponde, retornando o objeto do usuário ou erro.
// =========================================================
function login(email, senha) {
  if (!email.trim() || !senha) return { ok: false, msg: 'Preencha e-mail e senha.' };
  const u = Auth.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!u) return { ok: false, msg: 'E-mail não encontrado.' };
  if (u.senha !== senha) return { ok: false, msg: 'Senha incorreta.' };
  return { ok: true, usuario: u };
}

// =========================================================
// HIGOR — Autenticação: entrar no app e logout
// entrarNoApp() atualiza o estado global, persiste a
// sessão e transiciona da tela de auth para o app.
// logout() limpa o estado e reverte para a tela de auth.
// =========================================================
function entrarNoApp(usuario) {
  Auth.usuarioAtual = usuario;
  salvarSessao(usuario.id);
  const iniciais = usuario.nome.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();
  document.getElementById('headerAvatar').innerHTML = iniciais;
  document.getElementById('headerName').textContent = usuario.nome.split(' ')[0];
  document.getElementById('dropdownName').textContent = usuario.nome;
  document.getElementById('dropdownEmail').textContent = usuario.email;
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('appWrapper').classList.add('visible');
  carregarDados();
  renderFeed();
}

function logout() {
  Auth.usuarioAtual = null;
  limparSessao();
  document.getElementById('appWrapper').classList.remove('visible');
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('userDropdown').classList.remove('open');
  trocarTab('login');
  mostrarToast('Sessão encerrada.', '');
}

// =========================================================
// HIGOR — Autenticação: alternância de abas
// Sincroniza o estado visual e ARIA das abas de
// login/cadastro, incluindo título e limpeza de erros.
// =========================================================
function trocarTab(qual) {
  const isLogin = qual === 'login';
  document.getElementById('tabLogin').classList.toggle('active', isLogin);
  document.getElementById('tabCadastro').classList.toggle('active', !isLogin);
  document.getElementById('tabLogin').setAttribute('aria-selected', isLogin);
  document.getElementById('tabCadastro').setAttribute('aria-selected', !isLogin);
  document.getElementById('formLogin').classList.toggle('active', isLogin);
  document.getElementById('formCadastro').classList.toggle('active', !isLogin);
  document.getElementById('authPanelTitle').textContent = isLogin ? 'Bem-vindo de volta' : 'Crie sua conta';
  document.getElementById('authPanelSub').textContent = isLogin ? 'Acesse sua conta para continuar' : 'Registre-se gratuitamente';
  document.getElementById('loginError').classList.remove('show');
  document.getElementById('cadError').classList.remove('show');
}

// =========================================================
// GUSTAVO — Filtro e ordenação do feed
// Aplica os filtros de categoria, busca textual (nome,
// local, contato, categoria) e ordena o array resultante
// conforme a opção selecionada pelo usuário.
// =========================================================
function filtrar() {
  let r = [...App.itens];
  if (App.filtroCategoria !== 'Todos') r = r.filter(i => i.categoria === App.filtroCategoria);
  if (App.filtroBusca.trim()) {
    const q = App.filtroBusca.toLowerCase().trim();
    r = r.filter(i =>
      i.nome.toLowerCase().includes(q) ||
      i.local.toLowerCase().includes(q) ||
      i.contato.toLowerCase().includes(q) ||
      i.categoria.toLowerCase().includes(q)
    );
  }
  switch (App.ordenacao) {
    case 'recente': r.sort((a,b) => b.criadoEm - a.criadoEm); break;
    case 'antigo':  r.sort((a,b) => a.criadoEm - b.criadoEm); break;
    case 'az':      r.sort((a,b) => a.nome.localeCompare(b.nome,'pt-BR')); break;
    case 'za':      r.sort((a,b) => b.nome.localeCompare(a.nome,'pt-BR')); break;
  }
  return r;
}

function formatarData(iso) {
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// =========================================================
// GUSTAVO — Renderização do feed
// Aplica filtro/ordenação, limpa o grid e injeta os cards
// ou o estado vazio. Também atualiza contadores e pills.
// =========================================================
function renderFeed() {
  const grid = document.getElementById('feedGrid');
  const resultado = filtrar();
  grid.innerHTML = '';

  if (resultado.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">&#128269;</div>
        <div class="empty-title">Nenhum item encontrado</div>
        <p class="empty-desc">Tente ajustar os filtros ou a busca, ou registre um novo item perdido.</p>
      </div>`;
  } else {
    resultado.forEach(item => grid.appendChild(criarCard(item)));
  }

  atualizarContadores();
  atualizarPills();
  document.getElementById('feedCount').textContent =
    resultado.length === 1 ? '1 item' : `${resultado.length} itens`;
}

// =========================================================
// GUSTAVO — Criação dinâmica de cards
// Gera o elemento <article> de cada item com HTML interno,
// badges de status/categoria, botões de ação condicionais
// (somente para o dono) e event listeners de interação.
// =========================================================
function criarCard(item) {
  const isMeu = Auth.usuarioAtual && item.userId === Auth.usuarioAtual.id;
  const isFound = item.status === 'encontrado';
  const icon = CAT_ICONS[item.categoria] || '&#128269;';

  const art = document.createElement('article');
  art.className = `card ${isFound ? 'found-card' : 'lost-card'}`;
  art.setAttribute('role', 'listitem');
  art.setAttribute('data-id', item.id);
  art.setAttribute('tabindex', '0');
  art.setAttribute('aria-label', `${item.nome} — ${item.status}`);

  art.innerHTML = `
    <div class="card-header">
      <h2 class="card-title">${escapeHtml(item.nome)}</h2>
      <div class="card-actions">
        ${isMeu && !isFound ? `<button class="action-btn found-btn" title="Marcar como encontrado" data-action="found" data-id="${item.id}">&#10003;</button>` : ''}
        ${isMeu ? `<button class="action-btn delete" title="Excluir item" data-action="delete" data-id="${item.id}">&#128465;</button>` : ''}
      </div>
    </div>
    <div class="card-meta">
      <div class="meta-row"><span class="meta-icon">${icon}</span><span>${escapeHtml(item.categoria)}</span></div>
      <div class="meta-row"><span class="meta-icon">&#128205;</span><span>${escapeHtml(item.local)}</span></div>
      <div class="meta-row"><span class="meta-icon">&#128197;</span><span>${formatarData(item.data)}</span></div>
      <div class="meta-row"><span class="meta-icon">&#128100;</span><span>${escapeHtml(item.contato)}</span></div>
    </div>
    <div class="card-footer">
      <span class="status-badge ${isFound ? 'found' : 'lost'}">
        <span class="status-dot"></span>${isFound ? 'Encontrado' : 'Perdido'}
      </span>
      <div style="display:flex;gap:6px;align-items:center;">
        ${isMeu ? '<span class="mine-badge">Meu item</span>' : ''}
        <span class="categoria-badge">${escapeHtml(item.categoria)}</span>
      </div>
    </div>`;

  art.addEventListener('click', e => { if (!e.target.closest('[data-action]')) abrirModal(item.id); });
  art.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.target.closest('[data-action]')) abrirModal(item.id); });

  const btnFound = art.querySelector('[data-action="found"]');
  if (btnFound) btnFound.addEventListener('click', e => { e.stopPropagation(); marcarEncontrado(item.id); });

  const btnDelete = art.querySelector('[data-action="delete"]');
  if (btnDelete) btnDelete.addEventListener('click', e => { e.stopPropagation(); excluirItem(item.id); });

  return art;
}

// =========================================================
// FELIPE — Contadores e pills de categoria
// atualizarContadores() atualiza os totais na barra de
// resumo. atualizarPills() gera os botões de filtro com
// a contagem de itens em cada categoria.
// =========================================================
function atualizarContadores() {
  document.getElementById('totalCount').textContent = App.itens.length;
  document.getElementById('perdidosCount').textContent = App.itens.filter(i => i.status === 'perdido').length;
  document.getElementById('encontradosCount').textContent = App.itens.filter(i => i.status === 'encontrado').length;
}

function atualizarPills() {
  const container = document.getElementById('filterPills');
  container.innerHTML = '';
  ['Todos', ...CATEGORIAS].forEach(cat => {
    const count = cat === 'Todos' ? App.itens.length : App.itens.filter(i => i.categoria === cat).length;
    const btn = document.createElement('button');
    btn.className = `pill ${App.filtroCategoria === cat ? 'active' : ''}`;
    btn.setAttribute('aria-pressed', App.filtroCategoria === cat);
    btn.innerHTML = `${escapeHtml(cat)} <span class="pill-count">${count}</span>`;
    btn.addEventListener('click', () => { App.filtroCategoria = cat; renderFeed(); });
    container.appendChild(btn);
  });
}

// =========================================================
// VICTOR — Ações sobre os itens
// marcarEncontrado() altera o status do item para
// "encontrado" (só o dono pode). excluirItem() remove
// o item após confirmação, com checagem de propriedade.
// =========================================================
function marcarEncontrado(id) {
  const idx = App.itens.findIndex(i => i.id === id);
  if (idx === -1) return;
  if (App.itens[idx].userId !== Auth.usuarioAtual?.id) return;
  App.itens[idx].status = 'encontrado';
  salvarDados();
  renderFeed();
  fecharModal();
  mostrarToast('Item marcado como encontrado!', 'success');
}

function excluirItem(id) {
  const item = App.itens.find(i => i.id === id);
  if (!item) return;
  if (item.userId !== Auth.usuarioAtual?.id) return;
  if (!confirm(`Tem certeza que deseja excluir "${item.nome}"? Esta ação não pode ser desfeita.`)) return;
  App.itens = App.itens.filter(i => i.id !== id);
  salvarDados();
  renderFeed();
  fecharModal();
  mostrarToast('Item removido do feed.', 'success');
}

// =========================================================
// GUSTAVO — Modal de detalhes
// abrirModal() busca o item, monta o HTML dos detalhes e
// das ações condicionais por dono, e registra os listeners
// dos botões injetados dinamicamente no modal.
// =========================================================
function abrirModal(id) {
  const item = App.itens.find(i => i.id === id);
  if (!item) return;

  const isFound = item.status === 'encontrado';
  const isMeu = Auth.usuarioAtual && item.userId === Auth.usuarioAtual.id;
  const icon = CAT_ICONS[item.categoria] || '&#128269;';

  document.getElementById('modalTitle').textContent = item.nome;
  document.getElementById('modalStatus').innerHTML = `
    <span class="status-badge ${isFound ? 'found' : 'lost'}">
      <span class="status-dot"></span>${isFound ? 'Encontrado' : 'Perdido'}
    </span>
    <span class="categoria-badge">${escapeHtml(item.categoria)}</span>
    ${isMeu ? '<span class="mine-badge">Meu item</span>' : ''}`;

  document.getElementById('modalDetails').innerHTML = `
    <div class="detail-row">
      <div class="detail-icon">${icon}</div>
      <div class="detail-info"><div class="detail-label">Categoria</div><div class="detail-value">${escapeHtml(item.categoria)}</div></div>
    </div>
    <div class="detail-row">
      <div class="detail-icon">&#128205;</div>
      <div class="detail-info"><div class="detail-label">Localização</div><div class="detail-value">${escapeHtml(item.local)}</div></div>
    </div>
    <div class="detail-row">
      <div class="detail-icon">&#128197;</div>
      <div class="detail-info"><div class="detail-label">Data da perda</div><div class="detail-value">${formatarData(item.data)}</div></div>
    </div>
    <div class="detail-row">
      <div class="detail-icon">&#128100;</div>
      <div class="detail-info"><div class="detail-label">Contato</div><div class="detail-value">${escapeHtml(item.contato)}</div></div>
    </div>
    `;
    

  document.getElementById('modalActions').innerHTML = `
    ${isMeu && !isFound ? `<button class="btn-found" id="modalBtnFound">&#10003; Marcar como encontrado</button>` : ''}
    ${isMeu ? `<button class="btn-delete" id="modalBtnDelete">&#128465; Excluir item</button>` : ''}`;

  const bf = document.getElementById('modalBtnFound');
  if (bf) bf.addEventListener('click', () => marcarEncontrado(id));
  const bd = document.getElementById('modalBtnDelete');
  if (bd) bd.addEventListener('click', () => excluirItem(id));

  document.getElementById('modalDetalhes').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  document.getElementById('modalDetalhes').classList.remove('open');
  document.body.style.overflow = '';
}

// =========================================================
// VICTOR — Modal de formulário
// abrirForm() reseta o formulário, preenche a data atual
// e foca o primeiro campo para melhor UX.
// fecharForm() fecha o modal e restaura o scroll da página.
// =========================================================
function abrirForm() {
  document.getElementById('formItem').reset();
  document.getElementById('fData').value = new Date().toISOString().split('T')[0];
  document.getElementById('modalForm').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('fNome').focus(), 50);
}

function fecharForm() {
  document.getElementById('modalForm').classList.remove('open');
  document.body.style.overflow = '';
}

// =========================================================
// VITOR — Notificações toast
// Cria e exibe mensagens temporárias de feedback na tela,
// removendo-as automaticamente após 3,2 segundos.
// =========================================================
function mostrarToast(msg, tipo) {
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  t.textContent = msg;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// =========================================================
// HIGOR — Event listeners da tela de autenticação
// Conecta as abas, os links de alternância entre forms,
// o toggle de visibilidade de senha e os submits de
// login/cadastro com suas respectivas funções de lógica.
// =========================================================
document.getElementById('tabLogin').addEventListener('click', () => trocarTab('login'));
document.getElementById('tabCadastro').addEventListener('click', () => trocarTab('cadastro'));
document.getElementById('switchToCadastro').addEventListener('click', () => trocarTab('cadastro'));
document.getElementById('switchToLogin').addEventListener('click', () => trocarTab('login'));

document.querySelectorAll('.toggle-pass').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = document.getElementById(btn.dataset.target);
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
});

document.getElementById('formLogin').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const senha = document.getElementById('loginSenha').value;
  const res = login(email, senha);
  const erroEl = document.getElementById('loginError');
  if (!res.ok) {
    erroEl.textContent = res.msg;
    erroEl.classList.add('show');
    document.getElementById('loginEmail').classList.add('error');
    document.getElementById('loginSenha').classList.add('error');
    return;
  }
  erroEl.classList.remove('show');
  entrarNoApp(res.usuario);
  mostrarToast(`Bem-vindo(a), ${res.usuario.nome.split(' ')[0]}!`, 'success');
});

document.getElementById('formCadastro').addEventListener('submit', e => {
  e.preventDefault();
  const nome = document.getElementById('cadNome').value;
  const email = document.getElementById('cadEmail').value;
  const senha = document.getElementById('cadSenha').value;
  const conf  = document.getElementById('cadSenhaConf').value;
  const erroEl = document.getElementById('cadError');

  if (senha !== conf) {
    erroEl.textContent = 'As senhas não coincidem.';
    erroEl.classList.add('show');
    return;
  }

  const res = registrar(nome, email, senha);
  if (!res.ok) {
    erroEl.textContent = res.msg;
    erroEl.classList.add('show');
    return;
  }
  erroEl.classList.remove('show');
  entrarNoApp(res.usuario);
  mostrarToast(`Conta criada! Bem-vindo(a), ${res.usuario.nome.split(' ')[0]}!`, 'success');
});

document.getElementById('loginEmail').addEventListener('input', () => {
  document.getElementById('loginEmail').classList.remove('error');
  document.getElementById('loginSenha').classList.remove('error');
});

// =========================================================
// GUSTAVO — Event listeners do app (busca, ordenação, form)
// Conecta o campo de busca e o select de ordenação ao
// renderFeed, e processa o submit do formulário de item
// com validação e adição ao feed.
// =========================================================
document.getElementById('inputBusca').addEventListener('input', e => {
  App.filtroBusca = e.target.value;
  renderFeed();
});

document.getElementById('sortSelect').addEventListener('change', e => {
  App.ordenacao = e.target.value;
  renderFeed();
});

document.getElementById('btnAbrirForm').addEventListener('click', abrirForm);

document.getElementById('formItem').addEventListener('submit', e => {
  e.preventDefault();
  const nome    = document.getElementById('fNome').value.trim();
  const cat     = document.getElementById('fCategoria').value;
  const data    = document.getElementById('fData').value;
  const local   = document.getElementById('fLocal').value.trim();
  const contato = document.getElementById('fContato').value.trim();

  if (!nome || !cat || !data || !local || !contato) {
    mostrarToast('Preencha todos os campos obrigatórios.', 'error');
    return;
  }

  const novoItem = {
    id: Date.now(),
    nome, categoria: cat, local, data, contato,
    status: 'perdido',
    criadoEm: Date.now(),
    userId: Auth.usuarioAtual?.id || null
  };

  App.itens.unshift(novoItem);
  salvarDados();
  fecharForm();
  renderFeed();
  mostrarToast('Item registrado com sucesso!', 'success');
});

// =========================================================
// VICTOR — Event listeners dos modais
// Conecta os botões de fechar, o clique no overlay e o
// atalho de teclado Escape para fechar os modais de
// detalhes e de formulário.
// =========================================================
document.getElementById('btnFecharModal').addEventListener('click', fecharModal);
document.getElementById('modalDetalhes').addEventListener('click', e => {
  if (e.target === document.getElementById('modalDetalhes')) fecharModal();
});

document.getElementById('btnFecharForm').addEventListener('click', fecharForm);
document.getElementById('modalForm').addEventListener('click', e => {
  if (e.target === document.getElementById('modalForm')) fecharForm();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { fecharModal(); fecharForm(); }
});

// =========================================================
// VITOR — Event listeners do menu do usuário e inicialização
// Gerencia o dropdown do usuário logado (abrir/fechar ao
// clicar fora) e a função init que restaura a sessão
// salva ao carregar a página.
// =========================================================
document.getElementById('userMenuBtn').addEventListener('click', e => {
  e.stopPropagation();
  const dd = document.getElementById('userDropdown');
  const isOpen = dd.classList.toggle('open');
  document.getElementById('userMenuBtn').setAttribute('aria-expanded', isOpen);
});
document.addEventListener('click', () => {
  document.getElementById('userDropdown').classList.remove('open');
  document.getElementById('userMenuBtn').setAttribute('aria-expanded', false);
});

document.getElementById('btnLogout').addEventListener('click', logout);

(function init() {
  carregarUsuarios();
  const sessao = carregarSessao();
  if (sessao) {
    entrarNoApp(sessao);
  }
})();
