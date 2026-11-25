// Camada de dados: Supabase (de verdade) ou demonstração (dados no próprio aparelho).
// As telas usam apenas o objeto `dados` exportado aqui.

const CFG = window.APP_CONFIG || {};
export const MODO_DEMO = !(CFG.supabaseUrl && CFG.supabaseAnonKey);

const novoId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36));
const agora = () => new Date().toISOString();

export function hojeISO(d = new Date()) {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
}

// Reduz a foto antes de enviar (economiza o espaço grátis)
export async function reduzirFoto(arquivo, maxLado = 1400, qualidade = 0.82) {
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise((ok, erro) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => erro(new Error('Não foi possível ler esta imagem. Tente uma foto em JPG ou PNG.'));
      i.src = url;
    });
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * escala);
    c.height = Math.round(img.height * escala);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((ok) => c.toBlob(ok, 'image/jpeg', qualidade));
  } finally {
    URL.revokeObjectURL(url);
  }
}

const blobParaDataUrl = (blob) => new Promise((ok) => {
  const r = new FileReader();
  r.onload = () => ok(r.result);
  r.readAsDataURL(blob);
});

const ordenarItens = (t) => ({ ...t, itens: (t.itens || []).slice().sort((a, b) => a.ordem - b.ordem) });

export function traduzirErro(e) {
  const msg = (e && e.message) || String(e || '');
  if (/Invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if (/Email not confirmed/i.test(msg)) return 'Esta conta ainda não foi confirmada. Fale com a sua treinadora.';
  if (/rate limit|too many/i.test(msg)) return 'Muitas tentativas. Espere alguns minutos e tente de novo.';
  if (/Password should be at least/i.test(msg)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/same password|should be different/i.test(msg)) return 'A nova senha precisa ser diferente da anterior.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) return 'Sem conexão com a internet. Verifique e tente de novo.';
  if (/row-level security|permission denied/i.test(msg)) return 'Você não tem permissão para fazer isso.';
  if (/duplicate key.*checkins/i.test(msg)) return 'Você já fez check-in neste dia.';
  if (/payload too large|exceeded the maximum/i.test(msg)) return 'A foto é grande demais. Tente outra.';
  return msg && msg.length < 140 ? msg : 'Não foi possível concluir. Tente de novo em instantes.';
}

// =====================================================================
// MODO DEMONSTRAÇÃO
// =====================================================================
function criarDemo() {
  const CHAVE = 'kaisen-demo-v2';
  let memoria = null;
  const ouvintes = new Set();

  function semente() {
    const tId = 'demo-treinadora', aId = 'demo-aluno', a2 = 'demo-aluno-2';
    const tA = { id: novoId(), aluno_id: aId, nome: 'Treino A – Inferiores', observacoes: 'Aquecer 5 min na bike antes.', ordem: 0, arquivado: false, created_at: agora(), updated_at: agora() };
    const tB = { id: novoId(), aluno_id: aId, nome: 'Treino B – Superiores', observacoes: '', ordem: 1, arquivado: false, created_at: agora(), updated_at: agora() };
    const item = (treino, ordem, exercicio, series, repeticoes, carga, descanso, observacao = '', video_url = '') =>
      ({ id: novoId(), treino_id: treino.id, exercicio, video_url, series, repeticoes, carga, descanso, observacao, ordem });
    const hoje = new Date();
    const dia = (n) => { const d = new Date(hoje); d.setDate(d.getDate() - n); return hojeISO(d); };
    return {
      sessao: null,
      contas: { 'treinadora@demo.com': tId, 'aluno@demo.com': aId },
      profiles: [
        { id: tId, email: 'treinadora@demo.com', nome: 'Flávia Mayumi', nome_social: null, pronomes: 'ela/dela', papel: 'treinadora', created_at: agora() },
        { id: aId, email: 'aluno@demo.com', nome: 'Alex Souza', nome_social: 'Alex', pronomes: 'elu/delu', papel: 'aluno', created_at: agora() },
        { id: a2, email: 'rafa@demo.com', nome: '', nome_social: null, pronomes: null, papel: 'aluno', created_at: agora() }
      ],
      anamneses: [],
      treinos: [tA, tB],
      treino_itens: [
        item(tA, 0, 'Agachamento livre', '4', '10-12', '20 kg', '90', 'Desça até a coxa ficar paralela ao chão'),
        item(tA, 1, 'Elevação pélvica', '3', '12', '30 kg', '60', 'Pausa de 1 s no topo'),
        item(tA, 2, 'Prancha', '3', '30 s', '', '45'),
        item(tB, 0, 'Supino reto com halteres', '4', '8-10', '12 kg', '90'),
        item(tB, 1, 'Remada curvada', '4', '10', '25 kg', '90'),
        item(tB, 2, 'Desenvolvimento com halteres', '3', '12', '8 kg', '60')
      ],
      checkins: [
        { id: novoId(), aluno_id: aId, dia: dia(1), treino_id: tB.id, treino_nome: tB.nome, nota: 'Ombro um pouco cansado', created_at: agora() },
        { id: novoId(), aluno_id: aId, dia: dia(2), treino_id: tA.id, treino_nome: tA.nome, nota: '', created_at: agora() },
        { id: novoId(), aluno_id: aId, dia: dia(4), treino_id: tB.id, treino_nome: tB.nome, nota: '', created_at: agora() }
      ],
      fotos: [],
      arquivos: {}
    };
  }

  function ler() {
    if (memoria) return JSON.parse(memoria);
    try {
      const s = localStorage.getItem(CHAVE);
      if (s) return JSON.parse(s);
    } catch { /* sem armazenamento */ }
    const d = semente();
    gravar(d);
    return d;
  }
  function gravar(d) {
    const txt = JSON.stringify(d);
    try { localStorage.setItem(CHAVE, txt); memoria = null; }
    catch (e) {
      if (e && e.name === 'QuotaExceededError') throw new Error('O espaço do modo demonstração acabou. Apague algumas fotos.');
      memoria = txt;
    }
  }
  const eu = (d) => d.profiles.find((p) => p.id === d.sessao);
  const exigirTreinadora = (d) => { if (!eu(d) || eu(d).papel !== 'treinadora') throw new Error('Apenas a treinadora pode fazer isso.'); };
  const podeVer = (d, alunoId) => eu(d) && (eu(d).papel === 'treinadora' || eu(d).id === alunoId);
  const montar = (d, t) => ordenarItens({ ...t, itens: d.treino_itens.filter((i) => i.treino_id === t.id) });

  return {
    modo: 'demo',
    async iniciar() {},
    aoMudar(cb) { ouvintes.add(cb); },
    async usuario() { const d = ler(); return d.sessao ? { id: d.sessao } : null; },
    async entrar(email, senha) {
      const d = ler();
      const id = d.contas[email.trim().toLowerCase()];
      if (!id || senha !== 'demo123') throw new Error('Invalid login credentials');
      d.sessao = id; gravar(d);
    },
    async sair() { const d = ler(); d.sessao = null; gravar(d); ouvintes.forEach((cb) => cb('SIGNED_OUT')); },
    async recuperar() {},
    async novaSenha() {},

    async meuPerfil() { const d = ler(); return d.sessao ? { ...eu(d) } : null; },
    async perfil(id) { const d = ler(); return podeVer(d, id) ? d.profiles.find((p) => p.id === id) || null : null; },
    async atualizarPerfil(id, campos) {
      const d = ler();
      if (!podeVer(d, id)) throw new Error('Você não tem permissão para fazer isso.');
      const p = d.profiles.find((x) => x.id === id);
      ['nome', 'nome_social', 'pronomes'].forEach((k) => { if (k in campos) p[k] = campos[k] || (k === 'nome' ? '' : null); });
      gravar(d);
    },
    async listarAlunos() {
      const d = ler(); exigirTreinadora(d);
      return d.profiles.filter((p) => p.papel === 'aluno');
    },
    async resumoAlunos() {
      const d = ler(); exigirTreinadora(d);
      const r = {};
      d.profiles.filter((p) => p.papel === 'aluno').forEach((p) => {
        const cks = d.checkins.filter((c) => c.aluno_id === p.id).map((c) => c.dia).sort();
        r[p.id] = { ultimoCheckin: cks[cks.length - 1] || null, temAnamnese: d.anamneses.some((a) => a.aluno_id === p.id) };
      });
      return r;
    },

    async obterAnamnese(alunoId) { const d = ler(); return podeVer(d, alunoId) ? d.anamneses.find((a) => a.aluno_id === alunoId) || null : null; },
    async salvarAnamnese(alunoId, respostas, consentimento) {
      const d = ler();
      if (!podeVer(d, alunoId)) throw new Error('Você não tem permissão para fazer isso.');
      const reg = { aluno_id: alunoId, respostas, consentimento, updated_at: agora() };
      const i = d.anamneses.findIndex((a) => a.aluno_id === alunoId);
      if (i >= 0) d.anamneses[i] = reg; else d.anamneses.push(reg);
      gravar(d);
    },

    async listarTreinos(alunoId) {
      const d = ler();
      return d.treinos.filter((t) => t.aluno_id === alunoId && podeVer(d, alunoId))
        .sort((a, b) => a.ordem - b.ordem || a.created_at.localeCompare(b.created_at))
        .map((t) => montar(d, t));
    },
    async obterTreino(id) {
      const d = ler();
      const t = d.treinos.find((x) => x.id === id);
      return t && podeVer(d, t.aluno_id) ? montar(d, t) : null;
    },
    async salvarTreino(treino, itens) {
      const d = ler(); exigirTreinadora(d);
      let t = treino.id && d.treinos.find((x) => x.id === treino.id);
      if (t) Object.assign(t, { nome: treino.nome, observacoes: treino.observacoes, updated_at: agora() });
      else {
        t = { id: novoId(), aluno_id: treino.aluno_id, nome: treino.nome, observacoes: treino.observacoes,
          ordem: d.treinos.filter((x) => x.aluno_id === treino.aluno_id).length, arquivado: false, created_at: agora(), updated_at: agora() };
        d.treinos.push(t);
      }
      d.treino_itens = d.treino_itens.filter((i) => i.treino_id !== t.id);
      itens.forEach((i, n) => d.treino_itens.push({
        id: novoId(), treino_id: t.id, exercicio: i.exercicio, video_url: i.video_url || '', series: i.series || '',
        repeticoes: i.repeticoes || '', carga: i.carga || '', descanso: i.descanso || '', observacao: i.observacao || '', ordem: n,
        blocos: Array.isArray(i.blocos) && i.blocos.length ? i.blocos.map((b) => ({ ...b })) : null
      }));
      gravar(d);
      return t;
    },
    async arquivarTreino(id, arquivado) {
      const d = ler(); exigirTreinadora(d);
      const t = d.treinos.find((x) => x.id === id); if (t) t.arquivado = arquivado; gravar(d);
    },
    async excluirTreino(id) {
      const d = ler(); exigirTreinadora(d);
      d.treinos = d.treinos.filter((t) => t.id !== id);
      d.treino_itens = d.treino_itens.filter((i) => i.treino_id !== id);
      d.checkins.forEach((c) => { if (c.treino_id === id) c.treino_id = null; });
      gravar(d);
    },
    async exerciciosConhecidos() {
      const d = ler(); exigirTreinadora(d);
      const m = new Map();
      d.treino_itens.forEach((i) => { const k = i.exercicio.trim().toLowerCase(); if (!m.has(k) || (i.video_url && !m.get(k).video_url)) m.set(k, { exercicio: i.exercicio, video_url: i.video_url }); });
      return [...m.values()].sort((a, b) => a.exercicio.localeCompare(b.exercicio));
    },

    async listarCheckins(alunoId) {
      const d = ler();
      return podeVer(d, alunoId) ? d.checkins.filter((c) => c.aluno_id === alunoId).sort((a, b) => b.dia.localeCompare(a.dia)) : [];
    },
    async fazerCheckin({ dia, treino, nota }) {
      const d = ler();
      const me = eu(d);
      if (d.checkins.some((c) => c.aluno_id === me.id && c.dia === dia)) throw new Error('duplicate key value violates unique constraint "checkins_aluno_id_dia_key"');
      d.checkins.push({ id: novoId(), aluno_id: me.id, dia, treino_id: treino ? treino.id : null, treino_nome: treino ? treino.nome : null, nota: nota || null, created_at: agora() });
      gravar(d);
    },
    async excluirCheckin(id) {
      const d = ler();
      const c = d.checkins.find((x) => x.id === id);
      if (!c || !podeVer(d, c.aluno_id)) throw new Error('Você não tem permissão para fazer isso.');
      d.checkins = d.checkins.filter((x) => x.id !== id);
      gravar(d);
    },

    async listarFotos(alunoId) {
      const d = ler();
      return podeVer(d, alunoId) ? d.fotos.filter((f) => f.aluno_id === alunoId).sort((a, b) => a.dia.localeCompare(b.dia)) : [];
    },
    async enviarFotos(alunoId, dia, lista) {
      const d = ler();
      if (!podeVer(d, alunoId)) throw new Error('Você não tem permissão para fazer isso.');
      for (const { arquivo, angulo } of lista) {
        const blob = await reduzirFoto(arquivo, 700, 0.7);
        const caminho = `${alunoId}/${novoId()}.jpg`;
        d.arquivos[caminho] = await blobParaDataUrl(blob);
        d.fotos.push({ id: novoId(), aluno_id: alunoId, dia, angulo, caminho, created_at: agora() });
      }
      gravar(d);
    },
    async excluirFoto(foto) {
      const d = ler();
      if (!podeVer(d, foto.aluno_id)) throw new Error('Você não tem permissão para fazer isso.');
      delete d.arquivos[foto.caminho];
      d.fotos = d.fotos.filter((f) => f.id !== foto.id);
      gravar(d);
    },
    async urlsFotos(caminhos) {
      const d = ler(); const m = {};
      caminhos.forEach((c) => { m[c] = d.arquivos[c] || ''; });
      return m;
    },
    resetarDemo() { memoria = null; try { localStorage.removeItem(CHAVE); } catch { /* ignora */ } }
  };
}

// =====================================================================
// SUPABASE
// =====================================================================
function criarSupabase() {
  let sb = null;
  const ouvintes = new Set();
  const r = async (consulta) => {
    const { data, error } = await consulta;
    if (error) throw error;
    return data;
  };
  const SELECT_TREINO = '*, itens:treino_itens(*)';

  return {
    modo: 'supabase',
    async iniciar() {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      sb = createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      sb.auth.onAuthStateChange((evento) => ouvintes.forEach((cb) => cb(evento)));
    },
    aoMudar(cb) { ouvintes.add(cb); },
    async usuario() { const { data } = await sb.auth.getSession(); return data.session ? data.session.user : null; },
    async entrar(email, senha) { await r(sb.auth.signInWithPassword({ email: email.trim(), password: senha })); },
    async sair() { await sb.auth.signOut(); },
    async recuperar(email) { await r(sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: location.origin + location.pathname })); },
    async novaSenha(senha) { await r(sb.auth.updateUser({ password: senha })); },

    async meuPerfil() {
      const u = await this.usuario();
      return u ? r(sb.from('profiles').select('*').eq('id', u.id).maybeSingle()) : null;
    },
    async perfil(id) { return r(sb.from('profiles').select('*').eq('id', id).maybeSingle()); },
    async atualizarPerfil(id, campos) {
      const ok = {};
      ['nome', 'nome_social', 'pronomes'].forEach((k) => { if (k in campos) ok[k] = campos[k] || (k === 'nome' ? '' : null); });
      await r(sb.from('profiles').update(ok).eq('id', id));
    },
    async listarAlunos() { return r(sb.from('profiles').select('*').eq('papel', 'aluno')); },
    async resumoAlunos() {
      const [cks, ans] = await Promise.all([
        r(sb.from('checkins').select('aluno_id, dia').order('dia', { ascending: false }).limit(2000)),
        r(sb.from('anamneses').select('aluno_id'))
      ]);
      const res = {};
      (cks || []).forEach((c) => { if (!res[c.aluno_id]) res[c.aluno_id] = { ultimoCheckin: c.dia, temAnamnese: false }; });
      (ans || []).forEach((a) => { res[a.aluno_id] = res[a.aluno_id] || { ultimoCheckin: null }; res[a.aluno_id].temAnamnese = true; });
      return res;
    },

    async obterAnamnese(alunoId) { return r(sb.from('anamneses').select('*').eq('aluno_id', alunoId).maybeSingle()); },
    async salvarAnamnese(alunoId, respostas, consentimento) {
      await r(sb.from('anamneses').upsert({ aluno_id: alunoId, respostas, consentimento, updated_at: agora() }));
    },

    async listarTreinos(alunoId) {
      const l = await r(sb.from('treinos').select(SELECT_TREINO).eq('aluno_id', alunoId).order('ordem').order('created_at'));
      return (l || []).map(ordenarItens);
    },
    async obterTreino(id) {
      const t = await r(sb.from('treinos').select(SELECT_TREINO).eq('id', id).maybeSingle());
      return t ? ordenarItens(t) : null;
    },
    async salvarTreino(treino, itens) {
      let t;
      if (treino.id) {
        t = await r(sb.from('treinos').update({ nome: treino.nome, observacoes: treino.observacoes, updated_at: agora() })
          .eq('id', treino.id).select().single());
      } else {
        const { count } = await sb.from('treinos').select('id', { count: 'exact', head: true }).eq('aluno_id', treino.aluno_id);
        t = await r(sb.from('treinos').insert({ aluno_id: treino.aluno_id, nome: treino.nome, observacoes: treino.observacoes, ordem: count || 0 })
          .select().single());
      }
      await r(sb.from('treino_itens').delete().eq('treino_id', t.id));
      if (itens.length) {
        await r(sb.from('treino_itens').insert(itens.map((i, n) => ({
          treino_id: t.id, exercicio: i.exercicio, video_url: i.video_url || null, series: i.series || null,
          repeticoes: i.repeticoes || null, carga: i.carga || null, descanso: i.descanso || null,
          observacao: i.observacao || null, ordem: n,
          blocos: Array.isArray(i.blocos) && i.blocos.length ? i.blocos : null
        }))));
      }
      return t;
    },
    async arquivarTreino(id, arquivado) { await r(sb.from('treinos').update({ arquivado }).eq('id', id)); },
    async excluirTreino(id) { await r(sb.from('treinos').delete().eq('id', id)); },
    async exerciciosConhecidos() {
      const l = await r(sb.from('treino_itens').select('exercicio, video_url').limit(3000));
      const m = new Map();
      (l || []).forEach((i) => { const k = i.exercicio.trim().toLowerCase(); if (!m.has(k) || (i.video_url && !m.get(k).video_url)) m.set(k, i); });
      return [...m.values()].sort((a, b) => a.exercicio.localeCompare(b.exercicio));
    },

    async listarCheckins(alunoId) {
      return r(sb.from('checkins').select('*').eq('aluno_id', alunoId).order('dia', { ascending: false }).limit(800));
    },
    async fazerCheckin({ dia, treino, nota }) {
      const u = await this.usuario();
      await r(sb.from('checkins').insert({
        aluno_id: u.id, dia, treino_id: treino ? treino.id : null, treino_nome: treino ? treino.nome : null, nota: nota || null
      }));
    },
    async excluirCheckin(id) { await r(sb.from('checkins').delete().eq('id', id)); },

    async listarFotos(alunoId) {
      return r(sb.from('fotos').select('*').eq('aluno_id', alunoId).order('dia').order('created_at'));
    },
    async enviarFotos(alunoId, dia, lista) {
      for (const { arquivo, angulo } of lista) {
        const blob = await reduzirFoto(arquivo);
        const caminho = `${alunoId}/${novoId()}.jpg`;
        await r(sb.storage.from('fotos').upload(caminho, blob, { contentType: 'image/jpeg' }));
        await r(sb.from('fotos').insert({ aluno_id: alunoId, dia, angulo, caminho }));
      }
    },
    async excluirFoto(foto) {
      await sb.storage.from('fotos').remove([foto.caminho]);
      await r(sb.from('fotos').delete().eq('id', foto.id));
    },
    async urlsFotos(caminhos) {
      if (!caminhos.length) return {};
      const l = await r(sb.storage.from('fotos').createSignedUrls(caminhos, 3600));
      const m = {};
      (l || []).forEach((x) => { if (x.path && x.signedUrl) m[x.path] = x.signedUrl; });
      return m;
    }
  };
}

export const dados = MODO_DEMO ? criarDemo() : criarSupabase();

// Linhas de séries de um exercício (ex.: 1x20 aquecimento + 3x8-10 força).
// Exercícios antigos, sem linhas, viram uma linha só com os campos de sempre.
export function blocosDe(it) {
  if (Array.isArray(it.blocos) && it.blocos.length) return it.blocos;
  return [{ tipo: '', series: it.series || '', repeticoes: it.repeticoes || '', carga: it.carga || '', descanso: it.descanso || '' }];
}
