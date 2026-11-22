// KAISEN · Área do aluno — login por e-mail e senha (Supabase Auth).
// Só entra quem tem conta criada por você no painel do Supabase (sem cadastro aberto).

const CFG = window.APP_CONFIG || {};
const MODO_DEMO = !(CFG.supabaseUrl && CFG.supabaseAnonKey);
const app = document.getElementById('app');

// ---------------------------------------------------------------------
// Utilidades de tela
// ---------------------------------------------------------------------
function h(tag, attrs, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const f of filhos.flat()) {
    if (f === null || f === undefined || f === false) continue;
    el.append(f instanceof Node ? f : document.createTextNode(String(f)));
  }
  return el;
}

function svg(viewBox, tam, desenho) {
  const ns = 'http://www.w3.org/2000/svg';
  const s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', viewBox);
  s.setAttribute('width', tam);
  s.setAttribute('height', tam);
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = desenho; // desenho fixo, sem dados de usuário
  return s;
}

const torii = (tam) => {
  const s = svg('4 10 56 48', tam,
    '<g fill="currentColor"><path d="M6 14c9 3 43 3 52 0l-2 7H8z"/><rect x="12" y="23" width="40" height="4"/>' +
    '<rect x="29" y="19" width="6" height="8"/><rect x="16" y="19" width="5" height="37"/><rect x="43" y="19" width="5" height="37"/></g>');
  s.classList.add('torii');
  return s;
};
const olho = (aberto) => svg('0 0 24 24', 22, aberto
  ? '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></g>'
  : '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A10 10 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4.1M6.6 6.6A17 17 0 002 12s3.6 7 10 7a10 10 0 005.4-1.6M9.9 9.9a3 3 0 004.2 4.2"/></g>');

function tela(classeBody, ...conteudo) {
  document.body.className = classeBody;
  app.replaceChildren(...conteudo);
  window.scrollTo(0, 0);
}

function campo(rotulo, input) {
  input.id = input.id || 'c-' + Math.random().toString(36).slice(2, 8);
  return h('div', { class: 'campo' }, h('label', { for: input.id }, rotulo), input);
}

function campoSenha(rotulo, autocomplete) {
  const input = h('input', { type: 'password', autocomplete, required: true, minlength: 6 });
  const botao = h('button', { type: 'button', class: 'ver-senha', 'aria-label': 'Mostrar senha' }, olho(true));
  botao.addEventListener('click', () => {
    const mostrar = input.type === 'password';
    input.type = mostrar ? 'text' : 'password';
    botao.replaceChildren(olho(!mostrar));
    botao.setAttribute('aria-label', mostrar ? 'Esconder senha' : 'Mostrar senha');
  });
  return { input, el: campo(rotulo, h('div', { class: 'senha' }, input, botao)) };
}

function mensagem(caixa, texto, tipo = 'erro') {
  caixa.replaceChildren(texto ? h('p', { class: 'mensagem ' + tipo, role: tipo === 'erro' ? 'alert' : 'status' }, texto) : '');
}

async function comCarregamento(botao, fn) {
  const texto = botao.textContent;
  botao.disabled = true;
  botao.textContent = 'Aguarde…';
  try { return await fn(); }
  finally { if (botao.isConnected) { botao.disabled = false; botao.textContent = texto; } }
}

function cabeca() {
  return h('div', { class: 'cabeca' },
    torii(58),
    h('h1', null, CFG.nome || 'KAISEN'),
    CFG.kanji ? h('p', { class: 'kanji' }, CFG.kanji) : null,
    CFG.subtitulo ? h('p', { class: 'eyebrow' }, CFG.subtitulo) : null);
}

// ---------------------------------------------------------------------
// Autenticação: Supabase (real) ou demonstração (local)
// ---------------------------------------------------------------------
function traduzirErro(e) {
  const msg = (e && e.message) || String(e || '');
  if (/Invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if (/Email not confirmed/i.test(msg)) return 'Esta conta ainda não foi confirmada. Fale com a sua treinadora.';
  if (/rate limit|too many/i.test(msg)) return 'Muitas tentativas. Espere alguns minutos e tente de novo.';
  if (/Password should be at least/i.test(msg)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/same password|should be different/i.test(msg)) return 'A nova senha precisa ser diferente da anterior.';
  if (/Failed to fetch|NetworkError|network/i.test(msg)) return 'Sem conexão com a internet. Verifique e tente de novo.';
  return 'Não foi possível concluir. Tente de novo em instantes.';
}

function authDemo() {
  const CONTAS = { 'treinadora@demo.com': 'Treinadora', 'aluno@demo.com': 'Aluno' };
  const CHAVE = 'kaisen-demo-sessao';
  let memoria = null;
  const ler = () => { try { return localStorage.getItem(CHAVE); } catch { return memoria; } };
  const gravar = (v) => {
    memoria = v;
    try { v ? localStorage.setItem(CHAVE, v) : localStorage.removeItem(CHAVE); } catch { /* usa memória */ }
  };
  const ouvintes = new Set();
  return {
    async iniciar() {},
    aoMudar(cb) { ouvintes.add(cb); },
    async usuario() { const e = ler(); return e ? { email: e } : null; },
    async entrar(email, senha) {
      email = email.trim().toLowerCase();
      if (!CONTAS[email] || senha !== 'demo123') throw new Error('Invalid login credentials');
      gravar(email);
    },
    async sair() { gravar(null); ouvintes.forEach((cb) => cb('SIGNED_OUT')); },
    async recuperar() { /* no modo demonstração nenhum e-mail é enviado */ },
    async novaSenha() {}
  };
}

function authSupabase() {
  let sb = null;
  const ouvintes = new Set();
  const checar = ({ data, error }) => { if (error) throw error; return data; };
  return {
    async iniciar() {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      sb = createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      sb.auth.onAuthStateChange((evento) => ouvintes.forEach((cb) => cb(evento)));
    },
    aoMudar(cb) { ouvintes.add(cb); },
    async usuario() { const { data } = await sb.auth.getSession(); return data.session ? data.session.user : null; },
    async entrar(email, senha) { checar(await sb.auth.signInWithPassword({ email: email.trim(), password: senha })); },
    async sair() { await sb.auth.signOut(); },
    async recuperar(email) {
      checar(await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: location.origin + location.pathname }));
    },
    async novaSenha(senha) { checar(await sb.auth.updateUser({ password: senha })); }
  };
}

const auth = MODO_DEMO ? authDemo() : authSupabase();

// ---------------------------------------------------------------------
// Telas
// ---------------------------------------------------------------------
function telaLogin(aviso) {
  const email = h('input', { type: 'email', autocomplete: 'username', inputmode: 'email', required: true, placeholder: 'seu@email.com' });
  const senha = campoSenha('Senha', 'current-password');
  const caixaMsg = h('div', { 'aria-live': 'polite' });
  const entrar = h('button', { class: 'btn', type: 'submit' }, 'Entrar');

  const form = h('form', { novalidate: true }, campo('E-mail', email), senha.el, caixaMsg, entrar,
    h('button', { type: 'button', class: 'link', onclick: () => telaEsqueci(email.value) }, 'Esqueci minha senha'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!email.value.trim() || !senha.input.value) return mensagem(caixaMsg, 'Preencha e-mail e senha.');
    mensagem(caixaMsg, '');
    comCarregamento(entrar, async () => {
      try {
        await auth.entrar(email.value, senha.input.value);
        telaInicio();
      } catch (err) {
        console.error(err);
        mensagem(caixaMsg, traduzirErro(err));
        senha.input.select();
      }
    });
  });

  tela('login', h('div', { class: 'entrada' },
    cabeca(),
    h('div', { class: 'cartao' },
      h('h2', null, 'Entrar'),
      h('p', { class: 'sub' }, 'Use o e-mail e a senha que a sua treinadora enviou.'),
      form),
    MODO_DEMO ? h('p', { class: 'aviso-demo' }, 'Modo demonstração. Teste com ', h('b', null, 'aluno@demo.com'), ' ou ',
      h('b', null, 'treinadora@demo.com'), ', senha ', h('b', null, 'demo123'), '.') : null));
  if (aviso) mensagem(caixaMsg, aviso, 'ok');
  email.focus({ preventScroll: true });
}

function telaEsqueci(emailInicial = '') {
  const email = h('input', { type: 'email', autocomplete: 'username', inputmode: 'email', required: true, value: emailInicial });
  const caixaMsg = h('div', { 'aria-live': 'polite' });
  const enviar = h('button', { class: 'btn', type: 'submit' }, 'Enviar link');
  const form = h('form', { novalidate: true }, campo('E-mail da sua conta', email), caixaMsg, enviar,
    h('button', { type: 'button', class: 'link', onclick: () => telaLogin() }, 'Voltar para o login'));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!email.value.trim()) return mensagem(caixaMsg, 'Digite o seu e-mail.');
    comCarregamento(enviar, async () => {
      try {
        await auth.recuperar(email.value);
        mensagem(caixaMsg, 'Se esse e-mail tiver conta, você vai receber um link para criar uma nova senha. Confira também o spam.', 'ok');
      } catch (err) {
        console.error(err);
        mensagem(caixaMsg, traduzirErro(err));
      }
    });
  });
  tela('login', h('div', { class: 'entrada' }, cabeca(),
    h('div', { class: 'cartao' }, h('h2', null, 'Recuperar senha'),
      h('p', { class: 'sub' }, 'Enviaremos um link para você criar uma nova senha.'), form)));
  email.focus({ preventScroll: true });
}

function telaNovaSenha() {
  const s1 = campoSenha('Nova senha', 'new-password');
  const s2 = campoSenha('Repita a nova senha', 'new-password');
  const caixaMsg = h('div', { 'aria-live': 'polite' });
  const salvar = h('button', { class: 'btn', type: 'submit' }, 'Salvar nova senha');
  const form = h('form', { novalidate: true }, s1.el, s2.el, caixaMsg, salvar);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (s1.input.value.length < 6) return mensagem(caixaMsg, 'A senha precisa ter pelo menos 6 caracteres.');
    if (s1.input.value !== s2.input.value) return mensagem(caixaMsg, 'As senhas não são iguais.');
    comCarregamento(salvar, async () => {
      try {
        await auth.novaSenha(s1.input.value);
        telaInicio();
      } catch (err) {
        console.error(err);
        mensagem(caixaMsg, traduzirErro(err));
      }
    });
  });
  tela('login', h('div', { class: 'entrada' }, cabeca(),
    h('div', { class: 'cartao' }, h('h2', null, 'Nova senha'), h('p', { class: 'sub' }, 'Crie uma senha com pelo menos 6 caracteres.'), form)));
}

// Tela após o login: por enquanto em branco, só com o fundo do site
function telaInicio() {
  const sair = h('button', { class: 'btn secundario', type: 'button' }, 'Sair');
  sair.addEventListener('click', () => comCarregamento(sair, async () => {
    await auth.sair();
    telaLogin('Você saiu da sua conta.');
  }));
  tela('inicio', h('div', { class: 'inicio' },
    h('header', { class: 'topo' },
      h('div', { class: 'marca' }, torii(26),
        h('span', { class: 'marca-nome' }, CFG.nome || 'KAISEN'),
        CFG.kanji ? h('span', { class: 'marca-kanji' }, CFG.kanji) : null),
      sair),
    h('main', { 'aria-label': 'Conteúdo' })));
}

// ---------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------
async function iniciar() {
  let recuperando = false;
  try {
    await auth.iniciar();
  } catch (e) {
    console.error(e);
    tela('login', h('div', { class: 'entrada' }, cabeca(), h('div', { class: 'cartao' },
      h('h2', null, 'Sem conexão'),
      h('p', { class: 'sub' }, 'Não foi possível carregar. Verifique a internet e tente de novo.'),
      h('button', { class: 'btn', onclick: () => location.reload() }, 'Tentar de novo'))));
    return;
  }
  auth.aoMudar((evento) => {
    if (evento === 'PASSWORD_RECOVERY') { recuperando = true; telaNovaSenha(); }
    if (evento === 'SIGNED_OUT' && document.body.className !== 'login') telaLogin();
  });
  const usuario = await auth.usuario();
  if (recuperando) return;
  if (usuario) telaInicio(); else telaLogin();
}

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
iniciar();
