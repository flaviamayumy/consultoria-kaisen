// KAISEN · Área do aluno — login, área da treinadora e as abas do aluno.
import { dados, MODO_DEMO, hojeISO, traduzirErro, blocosDe } from './dados.js';
import {
  h, limpar, icone, aviso, confirmar, acao, campo, dataBR, videoYoutube, idYoutube, nomeExibicao, vazio
} from './ui.js';

const CFG = window.APP_CONFIG || {};
const app = document.getElementById('app');
let eu = null;

// ---------------------------------------------------------------------
// Conteúdo fixo
// ---------------------------------------------------------------------
const PERGUNTAS = [
  { k: 'objetivo', r: 'Qual é o seu principal objetivo com o treino?', t: 'area', obrig: true },
  { k: 'experiencia', r: 'Há quanto tempo você treina musculação?', t: 'select', ops: ['Nunca treinei', 'Menos de 6 meses', '6 meses a 2 anos', 'Mais de 2 anos'], obrig: true },
  { k: 'dias', r: 'Quantos dias por semana você pode treinar?', t: 'select', ops: ['1', '2', '3', '4', '5', '6', '7'], obrig: true },
  { k: 'tempo', r: 'Quanto tempo você tem para cada treino?', t: 'select', ops: ['Até 30 min', '30 a 45 min', '45 a 60 min', 'Mais de 60 min'] },
  { k: 'local', r: 'Onde você vai treinar?', t: 'select', ops: ['Academia', 'Em casa', 'Academia e em casa', 'Ao ar livre'] },
  { k: 'equipamentos', r: 'Se treina em casa, quais equipamentos você tem?', t: 'area' },
  { k: 'atividades', r: 'Pratica outras atividades físicas? Quais e quantas vezes por semana?', t: 'area' },
  { k: 'lesoes', r: 'Tem ou já teve lesões, dores ou limitações? Onde?', t: 'area' },
  { k: 'cirurgias', r: 'Já fez alguma cirurgia? Qual e quando?', t: 'area' },
  { k: 'saude', r: 'Tem alguma condição de saúde (pressão alta, diabetes, problemas cardíacos ou respiratórios etc.)?', t: 'area' },
  { k: 'medicamentos', r: 'Usa algum medicamento de forma contínua?', t: 'area' },
  { k: 'hormonizacao', r: 'Faz hormonização? Se sim, qual e há quanto tempo?', t: 'area', dica: 'Opcional. Ajuda a ajustar o treino à sua realidade.' },
  { k: 'liberacao', r: 'Tem liberação médica para atividade física?', t: 'select', ops: ['Sim', 'Não', 'Não sei'] },
  { k: 'sono', r: 'Quantas horas você dorme por noite, em média?', t: 'select', ops: ['Menos de 5 h', '5 a 6 h', '7 a 8 h', 'Mais de 8 h'] },
  { k: 'rotina', r: 'Como é sua rotina de trabalho ou estudo? (sentado, em pé, turnos…)', t: 'area' },
  { k: 'alimentacao', r: 'Como é a sua alimentação hoje?', t: 'area' },
  { k: 'preferencias', r: 'Exercícios que você gosta ou não gosta de fazer', t: 'area' },
  { k: 'obs', r: 'Algo mais que eu deva saber?', t: 'area' }
];
const ANGULOS = [['frente', 'Frente'], ['lado', 'Lado'], ['costas', 'Costas']];
const NOME_ANGULO = { frente: 'Frente', lado: 'Lado', costas: 'Costas', outra: 'Outra' };
const ABAS = [['treinos', 'Treinos', 'dumbbell'], ['checkin', 'Check-in', 'calendar'], ['fotos', 'Fotos', 'camera'], ['anamnese', 'Anamnese', 'clipboard']];

// ---------------------------------------------------------------------
// Marca (torii em SVG, igual ao site)
// ---------------------------------------------------------------------
function torii(tam) {
  const ns = 'http://www.w3.org/2000/svg';
  const s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', '4 10 56 48');
  s.setAttribute('width', tam);
  s.setAttribute('height', tam);
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('class', 'torii');
  s.innerHTML = '<g fill="currentColor"><path d="M6 14c9 3 43 3 52 0l-2 7H8z"/><rect x="12" y="23" width="40" height="4"/>' +
    '<rect x="29" y="19" width="6" height="8"/><rect x="16" y="19" width="5" height="37"/><rect x="43" y="19" width="5" height="37"/></g>';
  return s;
}
function cabeca() {
  return h('div', { class: 'cabeca' }, torii(58), h('h1', null, CFG.nome || 'KAISEN'),
    CFG.kanji ? h('p', { class: 'kanji' }, CFG.kanji) : null,
    CFG.subtitulo ? h('p', { class: 'eyebrow' }, CFG.subtitulo) : null);
}
const olho = (aberto) => {
  const ns = 'http://www.w3.org/2000/svg';
  const s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', 22); s.setAttribute('height', 22); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = aberto
    ? '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></g>'
    : '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A10 10 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4.1M6.6 6.6A17 17 0 002 12s3.6 7 10 7a10 10 0 005.4-1.6M9.9 9.9a3 3 0 004.2 4.2"/></g>';
  return s;
};

// ---------------------------------------------------------------------
// Login, recuperação e nova senha
// ---------------------------------------------------------------------
function telaEntrada(...conteudo) {
  document.body.className = 'login';
  limpar(app, h('div', { class: 'entrada' }, cabeca(), ...conteudo));
  window.scrollTo(0, 0);
}
function msg(caixa, texto, tipo = 'erro') {
  limpar(caixa, texto ? h('p', { class: 'mensagem ' + tipo, role: tipo === 'erro' ? 'alert' : 'status' }, texto) : null);
}
function campoSenha(rotulo, autocomplete) {
  const input = h('input', { type: 'password', autocomplete, required: true, minlength: 6 });
  const botao = h('button', { type: 'button', class: 'ver-senha', 'aria-label': 'Mostrar senha' }, olho(true));
  botao.addEventListener('click', () => {
    const mostrar = input.type === 'password';
    input.type = mostrar ? 'text' : 'password';
    limpar(botao, olho(!mostrar));
    botao.setAttribute('aria-label', mostrar ? 'Esconder senha' : 'Mostrar senha');
  });
  return { input, el: campo(rotulo, h('div', { class: 'senha' }, input, botao)) };
}
async function carregando(botao, fn) {
  const texto = botao.textContent;
  botao.disabled = true; botao.textContent = 'Aguarde…';
  try { return await fn(); } finally { if (botao.isConnected) { botao.disabled = false; botao.textContent = texto; } }
}

function telaLogin(avisoOk) {
  const email = h('input', { type: 'email', autocomplete: 'username', inputmode: 'email', required: true, placeholder: 'seu@email.com' });
  const senha = campoSenha('Senha', 'current-password');
  const caixa = h('div', { 'aria-live': 'polite' });
  const entrar = h('button', { class: 'btn largo', type: 'submit' }, 'Entrar');
  const form = h('form', { novalidate: true, class: 'form' }, campo('E-mail', email), senha.el, caixa, entrar,
    h('button', { type: 'button', class: 'link', onclick: () => telaEsqueci(email.value) }, 'Esqueci minha senha'));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!email.value.trim() || !senha.input.value) return msg(caixa, 'Preencha e-mail e senha.');
    msg(caixa, '');
    carregando(entrar, async () => {
      try {
        await dados.entrar(email.value, senha.input.value);
        eu = null;
        location.hash = '#/';
        await render();
      } catch (err) {
        console.error(err);
        msg(caixa, traduzirErro(err));
        senha.input.select();
      }
    });
  });
  telaEntrada(
    h('div', { class: 'cartao entrada-cartao' }, h('h2', null, 'Entrar'),
      h('p', { class: 'sub' }, 'Use o e-mail e a senha que a sua treinadora enviou.'), form),
    MODO_DEMO ? h('p', { class: 'aviso-demo' }, 'Modo demonstração. Teste com ', h('b', null, 'aluno@demo.com'), ' ou ',
      h('b', null, 'treinadora@demo.com'), ', senha ', h('b', null, 'demo123'), '.') : null);
  if (avisoOk) msg(caixa, avisoOk, 'ok');
  email.focus({ preventScroll: true });
}

function telaEsqueci(emailInicial = '') {
  const email = h('input', { type: 'email', autocomplete: 'username', inputmode: 'email', required: true, value: emailInicial });
  const caixa = h('div', { 'aria-live': 'polite' });
  const enviar = h('button', { class: 'btn largo', type: 'submit' }, 'Enviar link');
  const form = h('form', { novalidate: true, class: 'form' }, campo('E-mail da sua conta', email), caixa, enviar,
    h('button', { type: 'button', class: 'link', onclick: () => telaLogin() }, 'Voltar para o login'));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!email.value.trim()) return msg(caixa, 'Digite o seu e-mail.');
    carregando(enviar, async () => {
      try {
        await dados.recuperar(email.value);
        msg(caixa, 'Se esse e-mail tiver conta, você vai receber um link para criar uma nova senha. Confira também o spam.', 'ok');
      } catch (err) { msg(caixa, traduzirErro(err)); }
    });
  });
  telaEntrada(h('div', { class: 'cartao entrada-cartao' }, h('h2', null, 'Recuperar senha'),
    h('p', { class: 'sub' }, 'Enviaremos um link para você criar uma nova senha.'), form));
}

function telaNovaSenha() {
  const s1 = campoSenha('Nova senha', 'new-password');
  const s2 = campoSenha('Repita a nova senha', 'new-password');
  const caixa = h('div', { 'aria-live': 'polite' });
  const salvar = h('button', { class: 'btn largo', type: 'submit' }, 'Salvar nova senha');
  const form = h('form', { novalidate: true, class: 'form' }, s1.el, s2.el, caixa, salvar);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (s1.input.value.length < 6) return msg(caixa, 'A senha precisa ter pelo menos 6 caracteres.');
    if (s1.input.value !== s2.input.value) return msg(caixa, 'As senhas não são iguais.');
    carregando(salvar, async () => {
      try {
        await dados.novaSenha(s1.input.value);
        aviso('Senha alterada!');
        location.hash = '#/';
        await render();
      } catch (err) { msg(caixa, traduzirErro(err)); }
    });
  });
  telaEntrada(h('div', { class: 'cartao entrada-cartao' }, h('h2', null, 'Nova senha'),
    h('p', { class: 'sub' }, 'Crie uma senha com pelo menos 6 caracteres.'), form));
}

// ---------------------------------------------------------------------
// Estrutura das telas internas
// ---------------------------------------------------------------------
function pagina({ titulo, voltar, nav = false } = {}) {
  document.body.className = 'dentro' + (nav ? ' com-abas' : '');
  const conteudo = h('main', { class: 'conteudo', id: 'conteudo' });
  const sair = h('button', { class: 'btn-icone', type: 'button', 'aria-label': 'Sair da conta', title: 'Sair' }, icone('logout'));
  sair.addEventListener('click', async () => {
    if (!(await confirmar('Sair da sua conta?', 'Sair'))) return;
    await dados.sair();
    eu = null;
    telaLogin('Você saiu da sua conta.');
  });
  const topo = h('header', { class: 'topo' },
    voltar ? h('a', { href: voltar, class: 'btn-icone', 'aria-label': 'Voltar' }, icone('back'))
      : h('a', { class: 'marca', href: '#/', 'aria-label': 'Início' }, torii(24),
        h('span', { class: 'marca-nome' }, CFG.nome || 'KAISEN'),
        CFG.kanji ? h('span', { class: 'marca-kanji' }, CFG.kanji) : null),
    voltar ? h('h1', { class: 'titulo-topo' }, titulo || '') : h('span', { class: 'espaco' }),
    sair);
  limpar(app,
    MODO_DEMO ? h('div', { class: 'faixa-demo' }, 'Modo demonstração: os dados ficam só neste aparelho.') : null,
    topo,
    !voltar && titulo ? h('h1', { class: 'titulo-pagina' }, titulo) : null,
    conteudo,
    nav ? navAluno() : null);
  window.scrollTo(0, 0);
  return conteudo;
}

function navAluno() {
  const atual = (location.hash.slice(2).split('/')[0]) || 'treinos';
  const ativo = atual === 'treino' ? 'treinos' : atual;
  return h('nav', { class: 'abas', 'aria-label': 'Abas' },
    ABAS.map(([rota, rotulo, ic]) => h('a', {
      href: '#/' + rota, class: 'aba' + (ativo === rota ? ' ativa' : ''), 'aria-current': ativo === rota ? 'page' : false
    }, icone(ic), h('span', null, rotulo))));
}

function girando(el) {
  limpar(el, h('div', { class: 'carregando-bloco' }, h('span', { class: 'giro', 'aria-hidden': 'true' }), 'Carregando…'));
}

// ---------------------------------------------------------------------
// Roteamento
// ---------------------------------------------------------------------
let renderAtual = 0;
async function render() {
  const meu = ++renderAtual;
  let partes = (location.hash.slice(1) || '/').split('?')[0].split('/').filter(Boolean);
  if ((partes[0] || '').includes('access_token=') || (partes[0] || '').includes('error=')) partes = [];
  const [r0, r1, r2, r3] = partes;
  try {
    if (r0 === 'nova-senha') return telaNovaSenha();
    if (!eu) {
      const u = await dados.usuario();
      if (meu !== renderAtual) return;
      if (!u) return telaLogin();
      eu = await dados.meuPerfil();
      if (meu !== renderAtual) return;
      if (!eu) {
        telaEntrada(h('div', { class: 'cartao entrada-cartao' }, h('h2', null, 'Conta sem perfil'),
          h('p', { class: 'sub' }, 'Sua conta existe, mas o perfil ainda não foi criado. Fale com a sua treinadora.'),
          h('button', { class: 'btn largo', onclick: async () => { await dados.sair(); telaLogin(); } }, 'Sair')));
        return;
      }
    }

    if (eu.papel === 'treinadora') {
      if (r0 === 'aluno' && r2 === 'treino') return telaEditorTreino(r1, r3);
      if (r0 === 'aluno' && r1) return telaAlunoDaTreinadora(r1, r2 || 'treinos');
      return telaAlunos();
    }

    // aluno
    if (r0 === 'treino' && r1) return telaTreinoDoAluno(r1);
    const aba = ABAS.some(([a]) => a === r0) ? r0 : 'treinos';
    const titulos = { treinos: primeiroNome(eu) ? `Olá, ${primeiroNome(eu)}!` : 'Seus treinos', checkin: 'Check-in', fotos: 'Antes e depois', anamnese: 'Anamnese' };
    const main = pagina({ titulo: titulos[aba], nav: true });
    await abrirAba(main, aba, eu, false);
  } catch (e) {
    console.error(e);
    aviso(traduzirErro(e), 'erro');
  }
}

function primeiroNome(p) {
  const n = nomeExibicao(p);
  return n.includes('@') ? '' : n.split(' ')[0];
}

async function abrirAba(el, aba, aluno, souTreinadora) {
  girando(el);
  if (aba === 'treinos') return abaTreinos(el, aluno, souTreinadora);
  if (aba === 'checkin') return abaCheckin(el, aluno, souTreinadora);
  if (aba === 'fotos') return abaFotos(el, aluno, souTreinadora);
  if (aba === 'anamnese') return abaAnamnese(el, aluno, souTreinadora);
}

// ---------------------------------------------------------------------
// TREINADORA: lista de alunos
// ---------------------------------------------------------------------
function linkPainelUsuarios() {
  const m = String(CFG.supabaseUrl || '').match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
  return m ? `https://supabase.com/dashboard/project/${m[1]}/auth/users` : 'https://supabase.com/dashboard';
}

async function telaAlunos() {
  const main = pagina({ titulo: 'Seus alunos' });
  girando(main);
  const [alunos, resumo] = await Promise.all([dados.listarAlunos(), dados.resumoAlunos()]);
  alunos.sort((a, b) => nomeExibicao(a).localeCompare(nomeExibicao(b)));
  const busca = h('input', { type: 'search', placeholder: 'Buscar por nome ou e-mail', 'aria-label': 'Buscar aluno' });
  const lista = h('div', { class: 'lista' });
  const desenhar = () => {
    const q = busca.value.trim().toLowerCase();
    const vis = alunos.filter((a) => !q || [a.nome, a.nome_social, a.email].some((x) => (x || '').toLowerCase().includes(q)));
    limpar(lista, vis.length ? vis.map((a) => {
      const r = resumo[a.id] || {};
      const dias = r.ultimoCheckin ? Math.round((new Date(hojeISO()) - new Date(r.ultimoCheckin)) / 864e5) : null;
      const textoCk = dias === null ? 'Sem check-in ainda' : dias === 0 ? 'Treinou hoje' : dias === 1 ? 'Último treino: ontem' : `Último treino: há ${dias} dias`;
      return h('a', { class: 'cartao aluno', href: `#/aluno/${a.id}/treinos` },
        h('div', { class: 'avatar', 'aria-hidden': 'true' }, (nomeExibicao(a)[0] || '?').toUpperCase()),
        h('div', { class: 'aluno-info' },
          h('strong', null, nomeExibicao(a)),
          h('small', { class: dias !== null && dias > 7 ? 'alerta-texto' : '' }, textoCk)),
        !r.temAnamnese ? h('span', { class: 'badge pendente' }, 'Sem anamnese') : null);
    }) : vazio(alunos.length ? 'Nenhum aluno encontrado.' : 'Você ainda não tem alunos. Crie a primeira conta no Supabase.'));
  };
  busca.addEventListener('input', desenhar);
  limpar(main,
    h('div', { class: 'cartao convite' },
      h('p', null, 'Para cadastrar um aluno, crie a conta dele no Supabase (Authentication → Users → Adicionar usuário). Ele aparece aqui na hora.'),
      MODO_DEMO ? null : h('a', { class: 'btn secundario pequeno', href: linkPainelUsuarios(), target: '_blank', rel: 'noopener' }, 'Abrir o Supabase')),
    alunos.length > 5 ? busca : null,
    lista);
  desenhar();
}

async function telaAlunoDaTreinadora(id, aba) {
  const main = pagina({ titulo: 'Aluno', voltar: '#/alunos' });
  girando(main);
  const aluno = await dados.perfil(id);
  if (!aluno) return limpar(main, vazio('Aluno não encontrado.'));
  app.querySelector('.titulo-topo').textContent = nomeExibicao(aluno);
  if (!ABAS.some(([a]) => a === aba)) aba = 'treinos';

  const corpo = h('div', { class: 'aba-corpo' });
  const cab = h('div', { class: 'cartao cabecalho-aluno' });
  const desenharCab = () => limpar(cab,
    h('div', { class: 'avatar grande', 'aria-hidden': 'true' }, (nomeExibicao(aluno)[0] || '?').toUpperCase()),
    h('div', { class: 'cab-info' },
      h('strong', null, aluno.nome || 'Sem nome cadastrado'),
      aluno.nome_social ? h('small', null, `Nome social: ${aluno.nome_social}`) : null,
      h('small', null, [aluno.pronomes, aluno.email].filter(Boolean).join(' · '))),
    h('button', { class: 'btn-icone', type: 'button', 'aria-label': 'Editar dados do aluno', title: 'Editar dados', onclick: editarDados }, icone('edit', 18)));
  function editarDados() {
    const nome = h('input', { value: aluno.nome || '' });
    const social = h('input', { value: aluno.nome_social || '' });
    const pron = h('input', { value: aluno.pronomes || '', placeholder: 'ex.: ela/dela' });
    const salvar = h('button', { class: 'btn pequeno', type: 'submit' }, 'Salvar');
    limpar(cab, h('form', { class: 'form largo', onsubmit: (e) => {
      e.preventDefault();
      acao(salvar, async () => {
        await dados.atualizarPerfil(aluno.id, { nome: nome.value.trim(), nome_social: social.value.trim(), pronomes: pron.value.trim() });
        Object.assign(aluno, { nome: nome.value.trim(), nome_social: social.value.trim() || null, pronomes: pron.value.trim() || null });
        app.querySelector('.titulo-topo').textContent = nomeExibicao(aluno);
        aviso('Dados salvos!');
        desenharCab();
      });
    } }, h('div', { class: 'grade-campos' }, campo('Nome completo', nome), campo('Nome social', social), campo('Pronomes', pron)),
    h('div', { class: 'linha-botoes' }, salvar, h('button', { class: 'btn texto', type: 'button', onclick: desenharCab }, 'Cancelar'))));
  }
  desenharCab();

  limpar(main, cab,
    h('div', { class: 'chips', role: 'tablist' }, ABAS.map(([v, r]) =>
      h('a', { class: 'chip' + (aba === v ? ' ativo' : ''), href: `#/aluno/${id}/${v}`, role: 'tab', 'aria-selected': aba === v ? 'true' : 'false' }, r))),
    corpo);
  await abrirAba(corpo, aba, aluno, true);
}

// ---------------------------------------------------------------------
// ABA TREINOS
// ---------------------------------------------------------------------
async function abaTreinos(el, aluno, souT) {
  const [treinos, anamnese] = await Promise.all([dados.listarTreinos(aluno.id), souT ? null : dados.obterAnamnese(aluno.id)]);
  const ativos = treinos.filter((t) => !t.arquivado);
  if (!souT) {
    limpar(el,
      !anamnese ? h('a', { class: 'cartao alerta-cartao', href: '#/anamnese' }, icone('clipboard'),
        h('span', null, h('strong', null, 'Preencha sua anamnese'), h('small', null, 'Leva poucos minutos e é essencial para o seu treino.'))) : null,
      ativos.length ? ativos.map((t) => h('a', { class: 'cartao treino-aluno', href: `#/treino/${t.id}` },
        h('div', null, h('strong', null, t.nome), h('small', null, `${t.itens.length} exercício(s)`)),
        h('span', { class: 'play', 'aria-hidden': 'true' }, icone('play', 20))))
        : vazio('Sua treinadora ainda está montando seus treinos. Eles aparecem aqui assim que ficarem prontos.'));
    return;
  }

  const alunos = await dados.listarAlunos();
  const arquivados = treinos.filter((t) => t.arquivado);
  const cartao = (t) => {
    const painelCopia = h('div', { class: 'copiar-treino', hidden: true });
    const destino = h('select', { 'aria-label': 'Copiar para qual aluno' },
      alunos.map((a) => h('option', { value: a.id, selected: a.id === aluno.id }, nomeExibicao(a) + (a.id === aluno.id ? ' (este aluno)' : ''))));
    limpar(painelCopia, h('label', null, 'Copiar para:'), destino,
      h('button', { class: 'btn pequeno', type: 'button', onclick: (e) => acao(e.currentTarget, async () => {
        const mesmo = destino.value === aluno.id;
        await dados.salvarTreino({ aluno_id: destino.value, nome: t.nome + (mesmo ? ' (cópia)' : ''), observacoes: t.observacoes }, t.itens);
        aviso('Treino copiado!');
        if (mesmo) abrirAba(el, 'treinos', aluno, true); else painelCopia.hidden = true;
      }) }, 'Copiar'));
    return h('div', { class: 'cartao treino' + (t.arquivado ? ' arquivado' : '') },
      h('div', { class: 'treino-topo' },
        h('div', null, h('strong', null, t.nome), h('small', null, `${t.itens.length} exercício(s)`)),
        h('a', { class: 'btn pequeno', href: `#/aluno/${aluno.id}/treino/${t.id}` }, icone('edit', 16), ' Editar')),
      t.itens.length ? h('ol', { class: 'mini-lista' }, t.itens.map((i) =>
        h('li', null, i.exercicio, h('span', { class: 'muted' }, ' ' + resumoSeries(i))))) : null,
      h('div', { class: 'linha-botoes fim' },
        h('button', { class: 'btn texto', type: 'button', onclick: () => { painelCopia.hidden = !painelCopia.hidden; } }, 'Copiar'),
        h('button', { class: 'btn texto', type: 'button', onclick: (e) => acao(e.currentTarget, async () => {
          await dados.arquivarTreino(t.id, !t.arquivado);
          abrirAba(el, 'treinos', aluno, true);
        }) }, t.arquivado ? 'Reativar' : 'Arquivar'),
        h('button', { class: 'btn texto perigo', type: 'button', onclick: async (e) => {
          const b = e.currentTarget;
          if (!(await confirmar(`Excluir "${t.nome}"? Os check-ins do aluno continuam salvos.`, 'Excluir'))) return;
          acao(b, async () => { await dados.excluirTreino(t.id); aviso('Treino excluído.'); abrirAba(el, 'treinos', aluno, true); });
        } }, 'Excluir')),
      painelCopia);
  };
  limpar(el,
    h('a', { class: 'btn largo', href: `#/aluno/${aluno.id}/treino/novo` }, icone('plus', 18), ' Novo treino'),
    ativos.length ? ativos.map(cartao) : vazio('Nenhum treino ativo. Crie o primeiro!'),
    arquivados.length ? h('details', { class: 'arquivados' }, h('summary', null, `Treinos arquivados (${arquivados.length})`), arquivados.map(cartao)) : null);
}

// Editor de treino (treinadora)
async function telaEditorTreino(alunoId, treinoId) {
  const novo = !treinoId || treinoId === 'novo';
  const main = pagina({ titulo: novo ? 'Novo treino' : 'Editar treino', voltar: `#/aluno/${alunoId}/treinos` });
  girando(main);
  const [treino, conhecidos] = await Promise.all([novo ? null : dados.obterTreino(treinoId), dados.exerciciosConhecidos()]);
  if (!novo && !treino) return limpar(main, vazio('Treino não encontrado.'));
  const porNome = new Map(conhecidos.map((c) => [c.exercicio.trim().toLowerCase(), c]));
  const lista = h('datalist', { id: 'exercicios-conhecidos' }, conhecidos.map((c) => h('option', { value: c.exercicio })));

  const nome = h('input', { value: treino ? treino.nome : '', required: true, placeholder: 'ex.: Treino A – Inferiores' });
  const obs = h('textarea', { rows: 2, placeholder: 'Orientações gerais (aquecimento, intensidade…)' }, treino ? (treino.observacoes || '') : '');
  const itens = treino ? treino.itens.map((i) => ({ ...i })) : [];
  const caixaItens = h('div', { class: 'itens' });
  const novaLinha = (tipo = '') => ({ tipo, series: '3', repeticoes: '10-12', carga: '', descanso: '60s' });
  const vazioItem = () => ({ exercicio: '', video_url: '', observacao: '', blocos: [novaLinha()] });
  itens.forEach((i) => { i.blocos = blocosDe(i).map((b) => ({ ...b })); });
  const tipos = h('datalist', { id: 'tipos-serie' },
    ['Aquecimento', 'Reconhecimento', 'Força', 'Válida', 'Hipertrofia', 'Drop-set', 'Rest-pause', 'Back-off', 'Falha', 'Isometria'].map((t) => h('option', { value: t })));
  if (!itens.length) itens.push(vazioItem());

  // Uma linha de série no estilo do MFit: [≡] Série/rep | Carga | Intervalo [lixeira]
  const linhaSerie = (it, b, k) => {
    const serieRep = h('input', { value: juntarSerieRep(b), placeholder: '3/ 8-12', 'aria-label': `Série e repetições da linha ${k + 1}`,
      oninput: (e) => { Object.assign(b, separarSerieRep(e.target.value)); } });
    const inp = (c, ph, rot, extra = {}) => h('input', { value: b[c] || '', placeholder: ph, 'aria-label': `${rot} da linha ${k + 1}`, ...extra,
      oninput: (e) => { b[c] = e.target.value; } });
    const alca = h('button', { class: 'alca', type: 'button', 'aria-label': 'Arrastar para reordenar' }, icone('menu', 18));
    const linha = h('div', { class: 'linha-serie', 'data-k': k },
      alca,
      h('label', { class: 'cel' }, h('span', null, 'Série/rep'), serieRep),
      h('label', { class: 'cel' }, h('span', null, 'Carga'), inp('carga', '0', 'Carga')),
      h('label', { class: 'cel' }, h('span', null, 'Intervalo'), inp('descanso', '60s', 'Intervalo')),
      h('button', { class: 'btn-icone perigo', type: 'button', 'aria-label': `Remover linha ${k + 1}`, disabled: it.blocos.length === 1,
        onclick: () => { it.blocos.splice(k, 1); desenhar(); } }, icone('trash', 16)));
    b.tipo && linha.querySelector('.cel span').append(h('em', null, ` · ${b.tipo}`));
    // arrastar para reordenar (mouse e toque)
    alca.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      const caixa = linha.parentElement;
      linha.classList.add('arrastando');
      const mover = (e) => {
        const alvo = [...caixa.children].find((el) => el !== linha && (() => { const r = el.getBoundingClientRect(); return e.clientY > r.top && e.clientY < r.bottom; })());
        if (!alvo) return;
        const r = alvo.getBoundingClientRect();
        caixa.insertBefore(linha, e.clientY < r.top + r.height / 2 ? alvo : alvo.nextSibling);
      };
      const soltar = () => {
        window.removeEventListener('pointermove', mover);
        window.removeEventListener('pointerup', soltar);
        window.removeEventListener('pointercancel', soltar);
        linha.classList.remove('arrastando');
        const ordem = [...caixa.children].map((el) => Number(el.dataset.k));
        it.blocos = ordem.map((x) => it.blocos[x]);
        desenhar();
      };
      window.addEventListener('pointermove', mover);
      window.addEventListener('pointerup', soltar);
      window.addEventListener('pointercancel', soltar);
    });
    return linha;
  };


  const desenhar = () => {
    limpar(caixaItens, itens.map((it, n) => {
      const entrada = (k, rot, ph, extra = {}) => campo(rot, h('input', { value: it[k] || '', placeholder: ph, ...extra, oninput: (e) => { it[k] = e.target.value; } }));
      const exercicio = h('input', { value: it.exercicio || '', list: 'exercicios-conhecidos', placeholder: 'Nome do exercício', required: true,
        oninput: (e) => { it.exercicio = e.target.value; },
        onchange: (e) => {
          const c = porNome.get(e.target.value.trim().toLowerCase());
          if (c && c.video_url && !it.video_url) { it.video_url = c.video_url; desenhar(); }
        } });
      const video = h('input', { type: 'url', inputmode: 'url', value: it.video_url || '', placeholder: 'https://youtu.be/…',
        oninput: (e) => { it.video_url = e.target.value; } });
      const vid = idYoutube(it.video_url || '');
      const midia = h('div', { class: 'item-video' });
      if (vid) {
        limpar(midia, h('button', { class: 'thumb', type: 'button', 'aria-label': 'Ver vídeo', onclick: () => limpar(midia, videoYoutube(it.video_url)) },
          h('img', { src: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`, alt: '', loading: 'lazy' }),
          h('span', { class: 'thumb-play' }, icone('play', 26))));
      }
      video.onchange = () => desenhar();
      const linhas = h('div', { class: 'linhas-serie' }, it.blocos.map((b, k) => linhaSerie(it, b, k)));
      return h('div', { class: 'cartao item' },
        h('div', { class: 'item-topo' },
          h('span', { class: 'num' }, n + 1),
          h('div', { class: 'item-nome' }, exercicio),
          h('div', { class: 'item-acoes' },
            h('button', { class: 'btn-icone', type: 'button', 'aria-label': 'Subir exercício', disabled: n === 0, onclick: () => { [itens[n - 1], itens[n]] = [itens[n], itens[n - 1]]; desenhar(); } }, icone('up', 18)),
            h('button', { class: 'btn-icone', type: 'button', 'aria-label': 'Descer exercício', disabled: n === itens.length - 1, onclick: () => { [itens[n + 1], itens[n]] = [itens[n], itens[n + 1]]; desenhar(); } }, icone('down', 18)),
            h('button', { class: 'btn-icone perigo', type: 'button', 'aria-label': 'Remover exercício', onclick: () => { itens.splice(n, 1); desenhar(); } }, icone('trash', 18)))),
        midia,
        linhas,
        campo('Observações', h('textarea', { rows: 2, placeholder: 'ex.: Progredir em todas as séries e se manter dentro das reps programadas.',
          oninput: (e) => { it.observacao = e.target.value; } }, it.observacao || '')),
        h('div', { class: 'botoes-serie' },
          h('button', { class: 'btn', type: 'button', onclick: () => {
            const ult = it.blocos[it.blocos.length - 1];
            it.blocos.push(ult ? { ...ult, tipo: '' } : novaLinha());
            desenhar();
          } }, 'Adicionar série'),
          h('button', { class: 'btn secundario', type: 'button', onclick: async () => {
            const outros = itens.filter((x) => x !== it);
            if (!outros.length) return aviso('Adicione outro exercício para replicar as séries.', 'erro');
            if (!(await confirmar(`Copiar as séries de "${it.exercicio || 'este exercício'}" (${resumoSeries(it)}) para os outros ${outros.length} exercício(s) deste treino?`, 'Replicar'))) return;
            outros.forEach((x) => { x.blocos = it.blocos.map((b) => ({ ...b })); });
            desenhar();
            aviso('Séries replicadas!');
          } }, 'Replicar séries')),
        h('details', { class: 'link-video', open: !vid && !!it.video_url },
          h('summary', null, vid ? 'Trocar vídeo do YouTube' : 'Adicionar vídeo do YouTube'),
          campo('Link do vídeo', video, 'Suba como "Não listado" no YouTube e cole o link aqui.')));
    }));
  };

  const salvar = h('button', { class: 'btn largo', type: 'submit' }, 'Salvar treino');
  limpar(main, lista, h('form', { class: 'form', onsubmit: (e) => {
    e.preventDefault();
    const validos = itens.filter((i) => (i.exercicio || '').trim());
    if (!nome.value.trim()) return aviso('Dê um nome ao treino.', 'erro');
    if (!validos.length) return aviso('Adicione pelo menos um exercício.', 'erro');
    const linkRuim = validos.find((i) => i.video_url && !idYoutube(i.video_url));
    if (linkRuim) return aviso(`O link de vídeo de "${linkRuim.exercicio}" não é do YouTube.`, 'erro');
    acao(salvar, async () => {
      await dados.salvarTreino({ id: treino ? treino.id : null, aluno_id: alunoId, nome: nome.value.trim(), observacoes: obs.value.trim() },
        validos.map((i) => {
          const blocos = i.blocos.map((b) => ({ tipo: (b.tipo || '').trim(), series: (b.series || '').trim(), repeticoes: (b.repeticoes || '').trim(),
            carga: (b.carga || '').trim(), descanso: (b.descanso || '').trim() })).filter((b) => b.tipo || b.series || b.repeticoes || b.carga || b.descanso);
          const p = blocos.find((b) => !/aquec|reconh/i.test(b.tipo)) || blocos[0] || {};
          return { ...i, exercicio: i.exercicio.trim(), video_url: (i.video_url || '').trim(), blocos,
            series: p.series || '', repeticoes: p.repeticoes || '', carga: p.carga || '', descanso: p.descanso || '' };
        }));
      aviso('Treino salvo!');
      location.hash = `#/aluno/${alunoId}/treinos`;
    });
  } },
    h('div', { class: 'cartao form' }, campo('Nome do treino', nome), campo('Observações', obs)),
    h('h2', { class: 'secao' }, 'Exercícios'),
    caixaItens,
    h('button', { class: 'btn secundario largo', type: 'button', onclick: () => { itens.push(vazioItem()); desenhar(); caixaItens.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } },
      icone('plus', 18), ' Adicionar exercício'),
    h('div', { class: 'barra-fixa' }, salvar)));
  desenhar();
}

// Treino na visão do aluno (execução)
async function telaTreinoDoAluno(tid) {
  const main = pagina({ titulo: 'Treino', voltar: '#/treinos' });
  girando(main);
  const [treino, checkins] = await Promise.all([dados.obterTreino(tid), dados.listarCheckins(eu.id)]);
  if (!treino) return limpar(main, vazio('Treino não encontrado.'));
  app.querySelector('.titulo-topo').textContent = treino.nome;
  const jaFezHoje = checkins.some((c) => c.dia === hojeISO());
  const feitos = new Set();
  const progresso = h('div', { class: 'progresso', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': treino.itens.length });
  const atualizar = () => {
    progresso.setAttribute('aria-valuenow', feitos.size);
    limpar(progresso, h('div', { class: 'barra', style: { width: `${(feitos.size / (treino.itens.length || 1)) * 100}%` } }),
      h('span', null, `${feitos.size} de ${treino.itens.length} feitos`));
  };

  const cartoes = treino.itens.map((it, n) => {
    const area = h('div');
    const cartao = h('div', { class: 'cartao exec' });
    const check = h('input', { type: 'checkbox', 'aria-label': `Marcar ${it.exercicio} como feito`,
      onchange: (e) => { if (e.target.checked) feitos.add(n); else feitos.delete(n); cartao.classList.toggle('feito', e.target.checked); atualizar(); } });
    const linhas = blocosDe(it);
    limpar(cartao,
      h('div', { class: 'exec-topo' },
        h('span', { class: 'num' }, n + 1),
        h('div', { class: 'exec-nome' }, h('strong', null, it.exercicio)),
        h('label', { class: 'check-grande' }, check, h('span', null, icone('check', 20)))),
      h('div', { class: 'series-lista' }, linhas.map((b) => {
        const d = segundos(b.descanso);
        return h('div', { class: 'serie-linha' + (/aquec|reconh/i.test(b.tipo || '') ? ' leve' : '') },
          b.tipo ? h('span', { class: 'serie-tipo' }, b.tipo) : null,
          h('div', { class: 'prescricao' },
            b.series || b.repeticoes ? h('span', null, h('b', null, `${b.series || '-'} x ${b.repeticoes || '-'}`)) : null,
            b.carga ? h('span', null, 'Carga: ', h('b', null, b.carga)) : null,
            d > 0 ? h('button', { class: 'btn-desc', type: 'button', 'aria-label': `Cronômetro de descanso de ${d} segundos`, onclick: () => cronometro(d) }, icone('timer', 14), ` ${d}s`) : null));
      })),
      it.observacao ? h('p', { class: 'obs' }, it.observacao) : null,
      area,
      h('div', { class: 'linha-botoes' },
        idYoutube(it.video_url) ? h('button', { class: 'btn pequeno secundario', type: 'button', onclick: (e) => {
          const b = e.currentTarget;
          if (area.firstChild) { limpar(area); b.lastChild.textContent = ' Ver vídeo'; }
          else { limpar(area, videoYoutube(it.video_url)); b.lastChild.textContent = ' Fechar vídeo'; }
        } }, icone('play', 16), h('span', null, ' Ver vídeo')) : null));
    return cartao;
  });

  const nota = h('textarea', { rows: 2, placeholder: 'Como foi o treino? (opcional)' });
  const concluir = h('button', { class: 'btn largo destaque', type: 'button' }, icone('check', 18), ' Concluir e fazer check-in');
  concluir.addEventListener('click', () => acao(concluir, async () => {
    await dados.fazerCheckin({ dia: hojeISO(), treino, nota: nota.value.trim() });
    aviso('Check-in feito! Mandou bem 💪');
    location.hash = '#/checkin';
  }));

  limpar(main,
    treino.observacoes ? h('div', { class: 'cartao nota' }, h('strong', null, 'Orientações'), h('p', null, treino.observacoes)) : null,
    progresso, cartoes,
    jaFezHoje
      ? h('div', { class: 'cartao ok-cartao' }, icone('check'), h('span', null, 'Você já fez o check-in de hoje. Bom trabalho!'))
      : h('div', { class: 'cartao form' }, h('h2', null, 'Terminou?'), campo('Comentário para a treinadora', nota), concluir));
  atualizar();
}

function cronometro(segundos) {
  let resta = segundos;
  const numero = h('div', { class: 'cron-numero', 'aria-live': 'polite' }, resta);
  const fundo = h('div', { class: 'cron-fundo', role: 'dialog', 'aria-label': 'Cronômetro de descanso' },
    h('div', { class: 'cron' }, h('p', null, 'Descanso'), numero,
      h('div', { class: 'linha-botoes centro' },
        h('button', { class: 'btn secundario', onclick: () => { resta += 15; numero.textContent = resta; } }, '+15s'),
        h('button', { class: 'btn', onclick: () => fechar() }, 'Pular'))));
  const t = setInterval(() => {
    resta -= 1;
    numero.textContent = Math.max(resta, 0);
    if (resta <= 0) { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); bip(); fechar(); }
  }, 1000);
  function fechar() { clearInterval(t); fundo.remove(); }
  document.body.append(fundo);
}
function bip() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); o.frequency.value = 880; o.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.25);
  } catch { /* sem som */ }
}

// ---------------------------------------------------------------------
// ABA CHECK-IN
// ---------------------------------------------------------------------
function inicioDaSemana(d) {
  const x = new Date(d + 'T12:00:00');
  const dow = (x.getDay() + 6) % 7; // segunda = 0
  x.setDate(x.getDate() - dow);
  return hojeISO(x);
}

async function abaCheckin(el, aluno, souT) {
  const [checkins, treinos] = await Promise.all([dados.listarCheckins(aluno.id), souT ? [] : dados.listarTreinos(aluno.id)]);
  const hoje = hojeISO();
  const porDia = new Map(checkins.map((c) => [c.dia, c]));
  const semana = inicioDaSemana(hoje);
  const mesAtual = hoje.slice(0, 7);
  const naSemana = checkins.filter((c) => c.dia >= semana && c.dia <= hoje).length;
  const noMes = checkins.filter((c) => c.dia.startsWith(mesAtual)).length;

  let mesVisto = mesAtual;
  const calendarioEl = h('div', { class: 'cartao calendario' });
  const detalhe = h('div', { 'aria-live': 'polite' });
  const desenharCalendario = () => {
    const [ano, mes] = mesVisto.split('-').map(Number);
    const primeiro = new Date(ano, mes - 1, 1);
    const diasNoMes = new Date(ano, mes, 0).getDate();
    const deslocamento = (primeiro.getDay() + 6) % 7;
    const nomeMes = primeiro.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const celulas = [];
    for (let i = 0; i < deslocamento; i++) celulas.push(h('span', { class: 'dia vazio', 'aria-hidden': 'true' }));
    for (let d = 1; d <= diasNoMes; d++) {
      const iso = `${mesVisto}-${String(d).padStart(2, '0')}`;
      const c = porDia.get(iso);
      const classes = 'dia' + (c ? ' marcado' : '') + (iso === hoje ? ' hoje' : '') + (iso > hoje ? ' futuro' : '');
      celulas.push(c
        ? h('button', { class: classes, type: 'button', 'aria-label': `${d}: treinou${c.treino_nome ? ' — ' + c.treino_nome : ''}`,
          onclick: () => limpar(detalhe, cartaoCheckin(c)) }, d)
        : h('span', { class: classes }, d));
    }
    const proximoBloqueado = mesVisto >= mesAtual;
    limpar(calendarioEl,
      h('div', { class: 'cal-topo' },
        h('button', { class: 'btn-icone', type: 'button', 'aria-label': 'Mês anterior', onclick: () => { mesVisto = mudarMes(mesVisto, -1); desenharCalendario(); } }, icone('back', 18)),
        h('strong', null, nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)),
        h('button', { class: 'btn-icone girar', type: 'button', 'aria-label': 'Próximo mês', disabled: proximoBloqueado, onclick: () => { mesVisto = mudarMes(mesVisto, 1); desenharCalendario(); } }, icone('back', 18))),
      h('div', { class: 'cal-semana', 'aria-hidden': 'true' }, ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((l) => h('span', null, l))),
      h('div', { class: 'cal-grade' }, celulas));
  };
  const mudarMes = (ym, delta) => {
    const [a, m] = ym.split('-').map(Number);
    const d = new Date(a, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  function cartaoCheckin(c) {
    const podeApagar = true;
    return h('div', { class: 'cartao checkin-item' },
      h('div', { class: 'treino-topo' },
        h('div', null, h('strong', null, dataBR(c.dia)), h('small', null, c.treino_nome || 'Treino livre')),
        podeApagar ? h('button', { class: 'btn-icone perigo', type: 'button', 'aria-label': 'Apagar check-in', onclick: async (e) => {
          const b = e.currentTarget;
          if (!(await confirmar(`Apagar o check-in de ${dataBR(c.dia)}?`, 'Apagar'))) return;
          acao(b, async () => { await dados.excluirCheckin(c.id); aviso('Check-in apagado.'); abrirAba(el, 'checkin', aluno, souT); });
        } }, icone('trash', 18)) : null),
      c.nota ? h('p', { class: 'feedback' }, `“${c.nota}”`) : null);
  }

  let formulario = null;
  if (!souT) {
    if (porDia.has(hoje)) {
      formulario = h('div', { class: 'cartao ok-cartao' }, icone('check'), h('span', null, 'Check-in de hoje feito! Volte amanhã 🔥'));
    } else {
      const ativos = treinos.filter((t) => !t.arquivado);
      const dia = h('input', { type: 'date', value: hoje, max: hoje });
      const qual = h('select', null, ativos.map((t) => h('option', { value: t.id }, t.nome)), h('option', { value: '' }, 'Outro treino / atividade'));
      const nota = h('textarea', { rows: 2, placeholder: 'Como foi? (opcional)' });
      const botao = h('button', { class: 'btn largo destaque', type: 'submit' }, icone('check', 18), ' Fazer check-in');
      formulario = h('form', { class: 'cartao form', onsubmit: (e) => {
        e.preventDefault();
        if (!dia.value || dia.value > hoje) return aviso('Escolha uma data até hoje.', 'erro');
        acao(botao, async () => {
          await dados.fazerCheckin({ dia: dia.value, treino: ativos.find((t) => t.id === qual.value) || null, nota: nota.value.trim() });
          aviso('Check-in feito! 💪');
          abrirAba(el, 'checkin', aluno, souT);
        });
      } },
        h('h2', null, 'Treinou? Marque aqui'),
        h('div', { class: 'grade-campos' }, campo('Dia', dia), campo('Qual treino', qual)),
        campo('Comentário', nota), botao);
    }
  }

  limpar(el,
    formulario,
    h('div', { class: 'numeros' },
      h('div', { class: 'numero' }, h('strong', null, naSemana), h('span', null, 'nesta semana')),
      h('div', { class: 'numero' }, h('strong', null, noMes), h('span', null, 'neste mês')),
      h('div', { class: 'numero' }, h('strong', null, checkins.length), h('span', null, 'no total'))),
    calendarioEl,
    detalhe,
    checkins.length ? h('h2', { class: 'secao' }, 'Últimos check-ins') : null,
    checkins.length ? checkins.slice(0, 10).map(cartaoCheckin)
      : vazio(souT ? 'Este aluno ainda não fez check-in.' : 'Seus check-ins aparecem aqui. Bora começar!'));
  desenharCalendario();
}

// ---------------------------------------------------------------------
// ABA FOTOS (antes e depois)
// ---------------------------------------------------------------------
async function abaFotos(el, aluno, souT) {
  const fotos = await dados.listarFotos(aluno.id);
  const urls = await dados.urlsFotos(fotos.map((f) => f.caminho)).catch(() => ({}));
  const datas = [...new Set(fotos.map((f) => f.dia))].sort();

  // envio
  const dia = h('input', { type: 'date', value: hojeISO(), max: hojeISO() });
  const entradas = ANGULOS.map(([k, rot]) => {
    const input = h('input', { type: 'file', accept: 'image/*', id: `foto-${k}`, class: 'arquivo-escondido' });
    const previa = h('span', { class: 'slot-previa' }, icone('camera', 26), h('span', null, rot));
    input.addEventListener('change', () => {
      const f = input.files[0];
      if (!f) return;
      const u = URL.createObjectURL(f);
      limpar(previa, h('img', { src: u, alt: `Prévia: ${rot}` }), h('span', null, rot));
    });
    return { k, input, el: h('label', { class: 'slot-foto', for: `foto-${k}` }, input, previa) };
  });
  const enviar = h('button', { class: 'btn largo', type: 'submit' }, icone('camera', 18), ' Enviar fotos');
  const formEnvio = h('form', { class: 'cartao form', onsubmit: (e) => {
    e.preventDefault();
    const lista = entradas.filter((x) => x.input.files[0]).map((x) => ({ arquivo: x.input.files[0], angulo: x.k }));
    if (!lista.length) return aviso('Escolha pelo menos uma foto.', 'erro');
    if (!dia.value) return aviso('Escolha a data das fotos.', 'erro');
    acao(enviar, async () => {
      await dados.enviarFotos(aluno.id, dia.value, lista);
      aviso('Fotos enviadas!');
      abrirAba(el, 'fotos', aluno, souT);
    });
  } },
    h('h2', null, souT ? 'Adicionar fotos do aluno' : 'Novas fotos'),
    h('p', { class: 'muted pequeno-texto' }, 'Dica: mesma luz, mesma roupa e mesma distância em todas as fotos. Só você e a treinadora veem.'),
    campo('Data das fotos', dia),
    h('div', { class: 'slots' }, entradas.map((x) => x.el)),
    enviar);

  // comparação
  let comparacao = null;
  if (datas.length >= 2) {
    const antes = h('select', { 'aria-label': 'Data do antes' }, datas.map((d, i) => h('option', { value: d, selected: i === 0 }, dataBR(d))));
    const depois = h('select', { 'aria-label': 'Data do depois' }, datas.map((d, i) => h('option', { value: d, selected: i === datas.length - 1 }, dataBR(d))));
    const grade = h('div', { class: 'comparacao' });
    const desenhar = () => {
      const linhas = ['frente', 'lado', 'costas', 'outra'].map((ang) => {
        const a = fotos.filter((f) => f.dia === antes.value && f.angulo === ang).pop();
        const b = fotos.filter((f) => f.dia === depois.value && f.angulo === ang).pop();
        if (!a && !b) return null;
        const quadro = (f, rot) => h('figure', null,
          f && urls[f.caminho] ? h('img', { src: urls[f.caminho], alt: `${NOME_ANGULO[ang]} — ${rot}`, loading: 'lazy' }) : h('div', { class: 'foto-vazia' }, 'sem foto'),
          h('figcaption', null, rot));
        return h('div', { class: 'comp-linha' }, h('h3', { class: 'grupo' }, NOME_ANGULO[ang]),
          h('div', { class: 'comp-par' }, quadro(a, `Antes · ${dataBR(antes.value)}`), quadro(b, `Depois · ${dataBR(depois.value)}`)));
      }).filter(Boolean);
      limpar(grade, linhas.length ? linhas : vazio('Sem fotos do mesmo ângulo nessas datas.'));
    };
    antes.addEventListener('change', desenhar);
    depois.addEventListener('change', desenhar);
    comparacao = h('div', { class: 'cartao' },
      h('h2', null, icone('compare', 18), ' Antes e depois'),
      h('div', { class: 'grade-campos' }, campo('Antes', antes), campo('Depois', depois)),
      grade);
    desenhar();
  }

  // galeria por data
  const galeria = datas.slice().reverse().map((d) => h('div', { class: 'cartao' },
    h('h3', { class: 'grupo' }, dataBR(d)),
    h('div', { class: 'fotos' }, fotos.filter((f) => f.dia === d).map((f) => h('figure', { class: 'foto' },
      urls[f.caminho] ? h('img', { src: urls[f.caminho], alt: `${NOME_ANGULO[f.angulo]} em ${dataBR(d)}`, loading: 'lazy' }) : h('div', { class: 'foto-vazia' }, 'foto'),
      h('figcaption', null, NOME_ANGULO[f.angulo] || f.angulo,
        h('button', { class: 'btn-icone perigo mini', type: 'button', 'aria-label': `Apagar foto ${NOME_ANGULO[f.angulo]} de ${dataBR(d)}`, onclick: async (e) => {
          const b = e.currentTarget;
          if (!(await confirmar('Apagar esta foto? Não dá para desfazer.', 'Apagar'))) return;
          acao(b, async () => { await dados.excluirFoto(f); aviso('Foto apagada.'); abrirAba(el, 'fotos', aluno, souT); });
        } }, icone('trash', 16))))))));

  limpar(el,
    comparacao,
    datas.length === 1 ? h('p', { class: 'muted centro' }, 'Quando houver fotos de duas datas diferentes, a comparação de antes e depois aparece aqui.') : null,
    formEnvio,
    galeria.length ? h('h2', { class: 'secao' }, 'Todas as fotos') : null,
    galeria.length ? galeria : vazio(souT ? 'Este aluno ainda não enviou fotos.' : 'Envie suas primeiras fotos para acompanhar a evolução.'));
}

// ---------------------------------------------------------------------
// ABA ANAMNESE
// ---------------------------------------------------------------------
async function abaAnamnese(el, aluno, souT) {
  const a = await dados.obterAnamnese(aluno.id);
  const resp = (a && a.respostas) || {};
  if (souT) {
    limpar(el, !a ? vazio('O aluno ainda não preencheu a anamnese.') : h('div', { class: 'cartao' },
      h('p', { class: 'muted' }, `Atualizada em ${dataBR(a.updated_at, true)}` + (a.consentimento ? ' · consentimento LGPD dado' : '')),
      h('dl', { class: 'respostas' }, PERGUNTAS.map((p) => [
        h('dt', null, p.r),
        h('dd', { class: resp[p.k] ? '' : 'muted' }, resp[p.k] || 'Não respondeu')]))));
    return;
  }
  const nome = h('input', { value: aluno.nome || '', autocomplete: 'name', required: true });
  const social = h('input', { value: aluno.nome_social || '' });
  const pron = h('input', { value: aluno.pronomes || '', list: 'lista-pronomes', placeholder: 'ex.: ela/dela' });
  const listaPron = h('datalist', { id: 'lista-pronomes' }, ['ela/dela', 'ele/dele', 'elu/delu', 'qualquer pronome'].map((p) => h('option', { value: p })));
  const entradas = {};
  const campos = PERGUNTAS.map((p) => {
    const e = p.t === 'select'
      ? h('select', { required: !!p.obrig }, h('option', { value: '' }, 'Selecione…'), p.ops.map((o) => h('option', { value: o, selected: resp[p.k] === o }, o)))
      : h('textarea', { rows: 2, required: !!p.obrig }, resp[p.k] || '');
    entradas[p.k] = e;
    return campo(p.r + (p.obrig ? ' *' : ''), e, p.dica);
  });
  const consent = h('input', { type: 'checkbox', checked: !!(a && a.consentimento), required: true });
  const salvar = h('button', { class: 'btn largo', type: 'submit' }, 'Salvar anamnese');
  limpar(el, h('form', { class: 'cartao form', onsubmit: (e) => {
    e.preventDefault();
    if (!nome.value.trim()) return aviso('Preencha o seu nome.', 'erro');
    const respostas = {};
    for (const k in entradas) respostas[k] = entradas[k].value.trim();
    acao(salvar, async () => {
      await dados.atualizarPerfil(aluno.id, { nome: nome.value.trim(), nome_social: social.value.trim(), pronomes: pron.value.trim() });
      await dados.salvarAnamnese(aluno.id, respostas, consent.checked);
      Object.assign(eu, { nome: nome.value.trim(), nome_social: social.value.trim() || null, pronomes: pron.value.trim() || null });
      aviso('Anamnese salva! Obrigada 💜');
      location.hash = '#/treinos';
    });
  } },
    h('p', { class: 'muted' }, 'Responda com calma. Só você e a sua treinadora veem estas respostas.'),
    a ? h('p', { class: 'muted pequeno-texto' }, `Última atualização: ${dataBR(a.updated_at, true)}`) : null,
    h('h2', { class: 'secao' }, 'Seus dados'),
    campo('Nome completo *', nome),
    h('div', { class: 'grade-campos' },
      campo('Nome social', social, 'Se preenchido, é como você aparece no app.'),
      campo('Pronomes', pron)), listaPron,
    h('h2', { class: 'secao' }, 'Sobre você e o treino'),
    campos,
    h('label', { class: 'consentimento' }, consent,
      h('span', null, 'Autorizo o uso destas informações, inclusive de saúde, exclusivamente para a prescrição e o acompanhamento do meu treino (LGPD).')),
    salvar));
}

// ---------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------
async function iniciar() {
  try {
    await dados.iniciar();
  } catch (e) {
    console.error(e);
    telaEntrada(h('div', { class: 'cartao entrada-cartao' }, h('h2', null, 'Sem conexão'),
      h('p', { class: 'sub' }, 'Não foi possível carregar. Verifique a internet e tente de novo.'),
      h('button', { class: 'btn largo', onclick: () => location.reload() }, 'Tentar de novo')));
    return;
  }
  dados.aoMudar((evento) => {
    if (evento === 'PASSWORD_RECOVERY') { location.hash = '#/nova-senha'; telaNovaSenha(); }
    if (evento === 'SIGNED_OUT' && eu) { eu = null; telaLogin(); }
  });
  window.addEventListener('hashchange', render);
  render();
}

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
iniciar();

function resumoSeries(it) {
  return blocosDe(it).map((b) => `${b.series || '-'}x${b.repeticoes || '-'}`).join(' + ');
}

function juntarSerieRep(b) {
  if (b.series && b.repeticoes) return `${b.series}/ ${b.repeticoes}`;
  return b.series || b.repeticoes || '';
}
function separarSerieRep(txt) {
  const m = String(txt).match(/^\s*(\d+)\s*[\/xX×]\s*(.*?)\s*$/);
  if (m) return { series: m[1], repeticoes: m[2] };
  const t = String(txt).trim();
  return /^\d+$/.test(t) ? { series: t, repeticoes: '' } : { series: '', repeticoes: t };
}
// "60", "60s", "90 seg", "1min", "1:30", "2 min" -> segundos
function segundos(txt) {
  const t = String(txt || '').toLowerCase().trim();
  if (!t) return 0;
  let m = t.match(/^(\d+):(\d{1,2})$/); if (m) return +m[1] * 60 + +m[2];
  m = t.match(/^(\d+(?:[.,]\d+)?)\s*(m|min|mins|minuto|minutos)$/); if (m) return Math.round(parseFloat(m[1].replace(',', '.')) * 60);
  m = t.match(/^(\d+)/); return m ? +m[1] : 0;
}
