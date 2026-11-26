// Pequenas ferramentas de interface (sem bibliotecas externas).
import { traduzirErro } from './dados.js';

// h('div', {class:'x', onclick: fn}, 'texto', outroElemento)
// Textos sempre viram textContent — protege contra código malicioso.
export function h(tag, attrs, ...filhos) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v === null || v === undefined) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'value') el.value = v;
      else if (k === 'checked') el.checked = !!v;
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  adicionar(el, filhos);
  return el;
}

function adicionar(el, filhos) {
  for (const f of filhos.flat(Infinity)) {
    if (f === null || f === undefined || f === false) continue;
    el.append(f instanceof Node ? f : document.createTextNode(String(f)));
  }
}

export function limpar(el, ...filhos) {
  el.replaceChildren();
  adicionar(el, filhos);
  return el;
}

// Ícones simples em SVG (traço)
const ICONES = {
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  users: 'M16 19v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1M9 10a4 4 0 100-8 4 4 0 000 8M22 19v-1a4 4 0 00-3-3.9M16 2.1a4 4 0 010 7.8',
  dumbbell: 'M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  chart: 'M3 3v18h18M7 15l4-4 3 3 5-6',
  clipboard: 'M9 4h6v3H9zM9 5H6a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1h-3M8 12h8M8 16h5',
  user: 'M20 21v-1a5 5 0 00-5-5H9a5 5 0 00-5 5v1M12 11a4 4 0 100-8 4 4 0 000 8',
  plus: 'M12 5v14M5 12h14',
  back: 'M15 18l-6-6 6-6',
  play: 'M8 5l11 7-11 7z',
  check: 'M5 12l5 5L20 7',
  timer: 'M12 8v5l3 2M9 2h6M12 22a8 8 0 100-16 8 8 0 000 16',
  up: 'M18 15l-6-6-6 6',
  down: 'M6 9l6 6 6-6',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  edit: 'M4 20h4L20 8l-4-4L4 16zM14 6l4 4',
  logout: 'M15 17l5-5-5-5M20 12H9M12 21H5a1 1 0 01-1-1V4a1 1 0 011-1h7',
  chat: 'M21 12a8 8 0 01-11.6 7.1L4 21l1.9-5.4A8 8 0 1121 12z',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  camera: 'M3 8a2 2 0 012-2h2l2-3h6l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM12 17a4 4 0 100-8 4 4 0 000 8',
  fire: 'M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-6 6-6 10-1-1-2-2-2-4-2 2-1 5-1 6 0 4 3 7 7 7z',
  compare: 'M12 3v18M4 6h5v12H4zM15 6h5v12h-5z',
  menu: 'M4 7h16M4 12h16M4 17h16'
};
export function icone(nome, tam = 22) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', tam);
  svg.setAttribute('height', tam);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(ns, 'path');
  p.setAttribute('d', ICONES[nome] || '');
  svg.append(p);
  return svg;
}

let toastTimer;
export function aviso(msg, tipo = 'ok') {
  let t = document.getElementById('toast');
  if (!t) {
    t = h('div', { id: 'toast', role: 'status', 'aria-live': 'polite' });
    document.body.append(t);
  }
  t.textContent = msg;
  t.className = 'toast mostrar ' + tipo;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast ' + tipo; }, 3200);
}

// Janela de confirmação no estilo do app (substitui o confirm() do navegador)
export function confirmar(msg, textoSim = 'Confirmar') {
  return new Promise((ok) => {
    const anterior = document.activeElement;
    const fechar = (v) => { fundo.remove(); document.removeEventListener('keydown', tecla); if (anterior && anterior.focus) anterior.focus(); ok(v); };
    const tecla = (e) => { if (e.key === 'Escape') fechar(false); };
    const sim = h('button', { class: 'btn', onclick: () => fechar(true) }, textoSim);
    const fundo = h('div', { class: 'cron-fundo', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Confirmação',
      onclick: (e) => { if (e.target === fundo) fechar(false); } },
      h('div', { class: 'cartao dialogo' },
        h('p', null, msg),
        h('div', { class: 'linha-botoes fim' },
          h('button', { class: 'btn secundario', onclick: () => fechar(false) }, 'Cancelar'),
          sim)));
    document.addEventListener('keydown', tecla);
    document.body.append(fundo);
    sim.focus();
  });
}

// Executa uma ação com botão em estado "carregando" e mostra erro amigável
export async function acao(botao, fn) {
  const texto = botao ? botao.textContent : '';
  if (botao) { botao.disabled = true; botao.textContent = 'Aguarde…'; }
  try {
    return await fn();
  } catch (e) {
    console.error(e);
    aviso(traduzirErro(e), 'erro');
    return undefined;
  } finally {
    if (botao && botao.isConnected) { botao.disabled = false; botao.textContent = texto; }
  }
}

export function campo(rotulo, input, dica) {
  const id = input.id || 'c-' + Math.random().toString(36).slice(2, 9);
  input.id = id;
  return h('div', { class: 'campo' },
    h('label', { for: id }, rotulo),
    input,
    dica ? h('small', { class: 'dica' }, dica) : null
  );
}

export function dataBR(iso, comHora = false) {
  if (!iso) return '';
  const d = iso.length === 10 ? new Date(iso + 'T12:00:00') : new Date(iso);
  const op = { day: '2-digit', month: '2-digit', year: 'numeric' };
  if (comHora) Object.assign(op, { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleString('pt-BR', op);
}

export function hojeISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// Aceita links youtube.com/watch?v=, youtu.be/, /shorts/, /embed/
export function idYoutube(url) {
  if (!url) return null;
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function videoYoutube(url) {
  const id = idYoutube(url);
  if (!id) return null;
  return h('div', { class: 'video' },
    h('iframe', {
      src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`,
      title: 'Vídeo do exercício',
      allow: 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen',
      allowfullscreen: true,
      loading: 'lazy'
    })
  );
}

export function nomeExibicao(p) {
  if (!p) return '';
  return p.nome_social || p.nome || p.email || '';
}

export function vazio(texto, ...extra) {
  return h('div', { class: 'vazio' }, h('p', null, texto), ...extra);
}

// Gráfico de linha simples (SVG) para evolução de peso/medidas
export function graficoLinha(pontos, unidade = '') {
  if (pontos.length < 2) return null;
  const ns = 'http://www.w3.org/2000/svg';
  const L = 320, A = 120, m = { e: 36, d: 12, t: 14, b: 24 };
  const xs = pontos.map((p) => new Date(p.data + 'T12:00:00').getTime());
  const ys = pontos.map((p) => p.valor);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (y0 === y1) { y0 -= 1; y1 += 1; }
  const pad = (y1 - y0) * 0.15; y0 -= pad; y1 += pad;
  const px = (x) => m.e + ((x - x0) / (x1 - x0 || 1)) * (L - m.e - m.d);
  const py = (y) => m.t + (1 - (y - y0) / (y1 - y0)) * (A - m.t - m.b);
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${L} ${A}`);
  svg.setAttribute('class', 'grafico');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Evolução: de ${ys[0]}${unidade} para ${ys[ys.length - 1]}${unidade}`);
  const add = (tag, at, txt) => {
    const e = document.createElementNS(ns, tag);
    for (const k in at) e.setAttribute(k, at[k]);
    if (txt !== undefined) e.textContent = txt;
    svg.append(e);
    return e;
  };
  [y0 + pad, y1 - pad].forEach((v) => {
    add('line', { x1: m.e, x2: L - m.d, y1: py(v), y2: py(v), class: 'grade' });
    add('text', { x: m.e - 6, y: py(v) + 4, 'text-anchor': 'end', class: 'eixo' }, (Math.round(v * 10) / 10).toString().replace('.', ','));
  });
  add('polyline', { points: pontos.map((p, i) => `${px(xs[i])},${py(ys[i])}`).join(' '), class: 'linha' });
  pontos.forEach((p, i) => add('circle', { cx: px(xs[i]), cy: py(ys[i]), r: 3.5, class: 'ponto' }));
  add('text', { x: m.e, y: A - 6, class: 'eixo' }, dataBR(pontos[0].data));
  add('text', { x: L - m.d, y: A - 6, 'text-anchor': 'end', class: 'eixo' }, dataBR(pontos[pontos.length - 1].data));
  return svg;
}
