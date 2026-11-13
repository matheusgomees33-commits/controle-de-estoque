'use strict';
/* ======================================================================
   DADOS.JS - camada de dados: armazenamento, login, regras de negócio.
   A interface (script.js) só chama as funções deste arquivo.
   ====================================================================== */
const CHAVE = 'estoque-v2', SESSAO = 'estoque-sessao';
// MODO DEMONSTRAÇÃO: com true, QUALQUER usuário e senha entram (use só para apresentar o protótipo).
// Se o usuário digitado existir (admin, operador...), entra com o nível dele; senão, entra como administrador.
// Para exigir senha de verdade, troque para false.
const MODO_DEMO = true;

/* ---------- Utilitários ---------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const moeda = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);
const dataHora = (iso) => new Date(iso).toLocaleString('pt-BR');
const dataBR = (d) => (d ? d.split('-').reverse().join('/') : '—');
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const diaLocal = (iso) => { const d = new Date(iso); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
const hoje = () => diaLocal(new Date().toISOString());
const somarDias = (n) => diaLocal(new Date(Date.now() + n * 864e5).toISOString());

/* ---------- Armazenamento (LocalStorage) ---------- */
let db = null;          // dados em memória
let armazenamentoOk = true;
let sessaoMem = null;

function carregar() {
  try {
    const d = JSON.parse(localStorage.getItem(CHAVE));
    if (d && d.seq && ['produtos', 'fornecedores', 'categorias', 'usuarios', 'historico'].every((k) => Array.isArray(d[k]))) return d;
  } catch { /* dados ausentes ou corrompidos */ }
  return null;
}
function salvar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(db)); armazenamentoOk = true; }
  catch { armazenamentoOk = false; }
}
function setSessao(id) {
  sessaoMem = id;
  try { id ? sessionStorage.setItem(SESSAO, id) : sessionStorage.removeItem(SESSAO); } catch { /* usa a memória */ }
}
function getSessao() { try { return sessionStorage.getItem(SESSAO) || sessaoMem; } catch { return sessaoMem; } }
const usuarioAtual = () => db?.usuarios.find((u) => u.id === getSessao());
const ehAdmin = () => usuarioAtual()?.papel === 'admin';

/* ---------- Senhas: PBKDF2-SHA256 com salt (nunca guarda a senha pura) ---------- */
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const novoSalt = () => (globalThis.crypto?.getRandomValues ? hex(crypto.getRandomValues(new Uint8Array(16))) : Math.random().toString(16).slice(2));
async function hashSenha(senha, salt) {
  if (!globalThis.crypto?.subtle) { // navegador sem Web Crypto: hash simples, só para a demonstração funcionar
    let h = 5381; for (const c of salt + senha) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
    return 'demo' + h.toString(16);
  }
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' }, chave, 256);
  return hex(bits);
}
async function entrar(login, senha) {
  let u = db.usuarios.find((x) => x.login.toLowerCase() === login.trim().toLowerCase());
  if (MODO_DEMO) u = u || db.usuarios.find((x) => x.papel === 'admin');
  else if (!u || (await hashSenha(senha, u.salt)) !== u.hash) return null;
  setSessao(u.id);
  return u;
}

/* ---------- CNPJ ---------- */
function dvCnpj(base) {
  const pesos = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2].slice(13 - base.length);
  const r = [...base].reduce((a, n, i) => a + n * pesos[i], 0) % 11;
  return r < 2 ? 0 : 11 - r;
}
function cnpjValido(c) {
  const n = c.replace(/\D/g, '');
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  const d1 = dvCnpj(n.slice(0, 12));
  return n.endsWith('' + d1 + dvCnpj(n.slice(0, 12) + d1));
}
const fmtCnpj = (c) => c.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

/* ---------- Dados de exemplo (protótipo) ---------- */
async function dadosExemplo() {
  const cnpj = (b) => fmtCnpj(b + dvCnpj(b) + dvCnpj(b + dvCnpj(b)));
  const dia = (n) => new Date(Date.now() + n * 864e5).toISOString();
  const usr = async (id, nome, login, senha, papel) => { const salt = novoSalt(); return { id, nome, login, papel, salt, hash: await hashSenha(senha, salt) }; };
  const p = (id, nome, barras, categoria, fornecedorId, qtd, min, compra, venda, validade = '') =>
    ({ id, nome, barras, categoria, fornecedorId, descricao: '', qtd, min, compra, venda, lote: validade ? 'L' + id : '', validade, cadastro: dia(-30) });
  const h = (n, id, nome, tipo, qtd, saldo, obs, usuario) => ({ data: dia(-n), id, nome, tipo, qtd, saldo, obs, lote: '', usuario });
  return {
    seq: { P: 7, F: 3, C: 4, U: 2 }, ultimoBackup: null,
    usuarios: [await usr('U001', 'Administrador', 'admin', 'admin123', 'admin'), await usr('U002', 'Operador Demo', 'operador', 'operador123', 'operador')],
    categorias: ['Periféricos', 'Monitores', 'Cabos', 'Manutenção'].map((nome, i) => ({ id: 'C00' + (i + 1), nome })),
    fornecedores: [
      { id: 'F001', nome: 'TechDistrib Ltda', cnpj: cnpj('112223330001'), telefone: '(11) 3000-1000', endereco: 'Rua das Flores, 100 - São Paulo/SP' },
      { id: 'F002', nome: 'Monitores & Cia', cnpj: cnpj('223334440001'), telefone: '(11) 3000-2000', endereco: 'Av. Brasil, 2000 - Campinas/SP' },
      { id: 'F003', nome: 'Química Tech', cnpj: cnpj('334445550001'), telefone: '(19) 3000-3000', endereco: 'Rua Verde, 55 - Jundiaí/SP' },
    ],
    produtos: [
      p('P001', 'Mouse USB', '7891000000011', 'Periféricos', 'F001', 15, 5, 20, 35),
      p('P002', 'Teclado ABNT2', '7891000000012', 'Periféricos', 'F001', 3, 5, 40, 65),
      p('P003', 'Monitor 24"', '7891000000013', 'Monitores', 'F002', 10, 2, 480, 650),
      p('P004', 'Cabo HDMI 2m', '7891000000014', 'Cabos', 'F002', 0, 10, 8, 19.9),
      p('P005', 'Pasta térmica', '7891000000015', 'Manutenção', 'F003', 12, 4, 6, 15, somarDias(20)),
      p('P006', 'Álcool isopropílico 1L', '7891000000016', 'Manutenção', 'F003', 8, 3, 18, 32, somarDias(200)),
      p('P007', 'Headset', '7891000000017', 'Periféricos', 'F001', 6, 3, 55, 99),
    ],
    historico: [
      h(1, 'P002', 'Teclado ABNT2', 'saida', 2, 3, 'Pedido 884', 'Operador Demo'),
      h(2, 'P004', 'Cabo HDMI 2m', 'saida', 6, 0, 'Pedido 880', 'Operador Demo'),
      h(3, 'P001', 'Mouse USB', 'saida', 5, 15, 'Pedido 871', 'Administrador'),
      h(5, 'P001', 'Mouse USB', 'entrada', 20, 20, 'NF 3321', 'Administrador'),
      h(6, 'P003', 'Monitor 24"', 'entrada', 10, 10, 'NF 3290', 'Administrador'),
    ],
  };
}
async function iniciarDados() { db = carregar() || (await dadosExemplo()); salvar(); }
async function restaurarExemplo() { db = await dadosExemplo(); salvar(); }

/* ---------- Situação dos produtos ---------- */
const situacao = (p) => (p.qtd === 0 ? 'zerado' : p.qtd <= p.min ? 'baixo' : 'ok');
function validadeStatus(p) {
  if (!p.validade) return null;
  const dias = Math.round((new Date(p.validade + 'T00:00') - new Date(hoje() + 'T00:00')) / 864e5);
  return dias < 0 ? 'vencido' : dias <= 30 ? 'vencendo' : null;
}
const buscarProduto = (id) => db.produtos.find((p) => p.id === id);

/* ---------- Entidades: campos do formulário + regras de validação ----------
   Produtos, fornecedores, categorias e usuários usam o mesmo CRUD genérico.
   soNovo: campo só pode ser definido no cadastro.                          */
const nomeEmUso = (lista, nome, idAtual) => lista.some((x) => x.id !== idAtual && norm(x.nome) === norm(nome));
const ENT = {
  produtos: {
    titulo: 'Produtos', singular: 'produto', prefixo: 'P', escritaOperador: true, lista: () => db.produtos,
    vazio: 'Nenhum produto encontrado. Use o botão "Novo produto".',
    campos: [
      { k: 'nome', r: 'Nome do produto', t: 'text', obrig: 1 },
      { k: 'id', r: 'Código', t: 'text', soNovo: 1, dica: 'Deixe vazio para gerar automaticamente' },
      { k: 'barras', r: 'Código de barras', t: 'text' },
      { k: 'categoria', r: 'Categoria', t: 'select', obrig: 1, op: () => db.categorias.map((c) => [c.nome, c.nome]) },
      { k: 'fornecedorId', r: 'Fornecedor', t: 'select', op: () => db.fornecedores.map((f) => [f.id, f.nome]), vazio: '(nenhum)' },
      { k: 'descricao', r: 'Descrição', t: 'text', largo: 1 },
      { k: 'qtd', r: 'Quantidade inicial', t: 'number', passo: 1, soNovo: 1, dica: 'Depois, só muda por entrada, saída ou inventário' },
      { k: 'min', r: 'Quantidade mínima', t: 'number', passo: 1 },
      { k: 'compra', r: 'Preço de compra (R$)', t: 'number', passo: 0.01 },
      { k: 'venda', r: 'Preço de venda (R$)', t: 'number', passo: 0.01 },
      { k: 'lote', r: 'Lote', t: 'text' },
      { k: 'validade', r: 'Validade', t: 'date' },
    ],
    validar(d, idAtual) {
      if (!d.nome) return 'Informe o nome do produto.';
      if (!d.categoria) return 'Escolha uma categoria (cadastre uma em "Categorias", se precisar).';
      if ((!idAtual && !Number.isInteger(d.qtd)) || !Number.isInteger(d.min) || d.qtd < 0 || d.min < 0) return 'As quantidades devem ser números inteiros, sem valores negativos.';
      if (!(d.compra >= 0) || !(d.venda >= 0)) return 'Os preços não podem ser negativos.';
      const outros = db.produtos.filter((p) => p.id !== idAtual);
      if (!idAtual && d.id) {
        if (!/^[A-Za-z0-9._-]{1,20}$/.test(d.id)) return 'O código aceita letras, números, ponto, hífen e sublinhado (até 20).';
        if (outros.some((p) => p.id.toLowerCase() === d.id.toLowerCase())) return 'Já existe um produto com este código.';
      }
      if (d.barras && outros.some((p) => p.barras === d.barras)) return 'Este código de barras já está em uso.';
      if (nomeEmUso(outros, d.nome)) return 'Já existe um produto com este nome.';
    },
    remover: (p) => (db.historico.some((h) => h.id === p.id) ? 'Este produto possui movimentações e não pode ser excluído (o histórico seria perdido).' : null),
  },
  fornecedores: {
    titulo: 'Fornecedores', singular: 'fornecedor', prefixo: 'F', lista: () => db.fornecedores, vazio: 'Nenhum fornecedor cadastrado.',
    campos: [
      { k: 'nome', r: 'Nome', t: 'text', obrig: 1, largo: 1 },
      { k: 'cnpj', r: 'CNPJ', t: 'text', obrig: 1, dica: '14 dígitos' },
      { k: 'telefone', r: 'Telefone', t: 'text' },
      { k: 'endereco', r: 'Endereço', t: 'text', largo: 1 },
    ],
    validar(d, idAtual) {
      if (!d.nome) return 'Informe o nome do fornecedor.';
      if (!cnpjValido(d.cnpj)) return 'CNPJ inválido. Confira os 14 dígitos.';
      if (db.fornecedores.some((f) => f.id !== idAtual && f.cnpj.replace(/\D/g, '') === d.cnpj.replace(/\D/g, ''))) return 'Já existe um fornecedor com este CNPJ.';
      if (d.telefone && d.telefone.replace(/\D/g, '').length < 10) return 'Telefone incompleto (inclua o DDD).';
    },
    preparar: async (d) => { d.cnpj = fmtCnpj(d.cnpj); },
    remover(f) { const n = db.produtos.filter((p) => p.fornecedorId === f.id).length; return n ? `Este fornecedor está associado a ${n} produto(s).` : null; },
  },
  categorias: {
    titulo: 'Categorias', singular: 'categoria', prefixo: 'C', semEditar: true, lista: () => db.categorias, vazio: 'Nenhuma categoria cadastrada.',
    campos: [{ k: 'nome', r: 'Nome da categoria', t: 'text', obrig: 1, largo: 1 }],
    validar: (d, idAtual) => (!d.nome ? 'Informe o nome da categoria.' : nomeEmUso(db.categorias, d.nome, idAtual) ? 'Esta categoria já existe.' : null),
    remover(c) { const n = db.produtos.filter((p) => p.categoria === c.nome).length; return n ? `Esta categoria é usada por ${n} produto(s).` : null; },
  },
  usuarios: {
    titulo: 'Usuários', singular: 'usuário', prefixo: 'U', lista: () => db.usuarios, vazio: 'Nenhum usuário.',
    campos: [
      { k: 'nome', r: 'Nome', t: 'text', obrig: 1 },
      { k: 'login', r: 'Login', t: 'text', obrig: 1, soNovo: 1 },
      { k: 'papel', r: 'Nível de acesso', t: 'select', obrig: 1, op: () => [['admin', 'Administrador'], ['operador', 'Operador']] },
      { k: 'senha', r: 'Senha', t: 'password', dica: 'Mínimo 6 caracteres. Ao editar, deixe vazio para manter a atual.' },
    ],
    validar(d, idAtual) {
      if (!d.nome) return 'Informe o nome.';
      if (!idAtual && !/^[A-Za-z0-9._-]{3,30}$/.test(d.login || '')) return 'O login deve ter 3 a 30 caracteres (letras, números, ponto, hífen ou sublinhado).';
      if (!idAtual && db.usuarios.some((u) => u.login.toLowerCase() === d.login.toLowerCase())) return 'Este login já existe.';
      if ((!idAtual || d.senha) && (d.senha || '').length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
      if (idAtual && d.papel !== 'admin' && !db.usuarios.some((u) => u.id !== idAtual && u.papel === 'admin')) return 'Deve existir pelo menos um administrador.';
    },
    preparar: async (d) => { if (d.senha) { d.salt = novoSalt(); d.hash = await hashSenha(d.senha, d.salt); } delete d.senha; },
    remover(u) {
      if (u.id === usuarioAtual()?.id) return 'Você não pode excluir o próprio usuário.';
      return u.papel === 'admin' && db.usuarios.filter((x) => x.papel === 'admin').length < 2 ? 'Deve existir pelo menos um administrador.' : null;
    },
  },
};

function proximoId(ent) {
  let id;
  do id = ent.prefixo + String(++db.seq[ent.prefixo]).padStart(3, '0'); while (ent.lista().some((x) => x.id === id));
  return id;
}
// Cria ou atualiza. Retorna { erro } ou { ok }.
async function salvarEntidade(chave, dados, idAtual) {
  const ent = ENT[chave];
  const erro = ent.validar(dados, idAtual);
  if (erro) return { erro };
  if (ent.preparar) await ent.preparar(dados, idAtual);
  if (idAtual) Object.assign(ent.lista().find((x) => x.id === idAtual), dados);
  else ent.lista().push({ ...dados, id: dados.id || proximoId(ent), ...(chave === 'produtos' ? { cadastro: new Date().toISOString() } : {}) });
  salvar();
  return { ok: true };
}
function excluirEntidade(chave, id) {
  if (!ehAdmin()) return { erro: 'Apenas administradores podem excluir.' };
  const ent = ENT[chave], item = ent.lista().find((x) => x.id === id);
  const erro = item ? ent.remover?.(item) : 'Item não encontrado.';
  if (erro) return { erro };
  ent.lista().splice(ent.lista().indexOf(item), 1);
  salvar();
  return { ok: true };
}

/* ---------- Movimentações (entrada, saída e ajuste de inventário) ---------- */
function registrar(p, tipo, qtd, saldo, extra = {}) {
  db.historico.unshift({ data: new Date().toISOString(), id: p.id, nome: p.nome, tipo, qtd, saldo, obs: extra.obs || '', lote: extra.lote || '', usuario: usuarioAtual()?.nome || '—' });
}
function movimentar(id, tipo, qtd, extra = {}) {
  const p = buscarProduto(id);
  if (!p) return { erro: 'Selecione um produto.' };
  if (!Number.isInteger(qtd) || qtd <= 0) return { erro: 'Informe uma quantidade inteira maior que zero.' };
  if (tipo === 'saida' && qtd > p.qtd) return { erro: `Saída maior que o disponível (${p.qtd} un.).` };
  p.qtd += tipo === 'entrada' ? qtd : -qtd;
  if (tipo === 'entrada' && (extra.lote || extra.validade)) { p.lote = extra.lote || ''; p.validade = extra.validade || ''; }
  registrar(p, tipo, qtd, p.qtd, extra);
  salvar();
  return { produto: p };
}
function ajustarEstoque(id, contado) {
  const p = buscarProduto(id), dif = contado - p.qtd;
  p.qtd = contado;
  registrar(p, 'ajuste', dif, contado, { obs: 'Inventário físico' });
  salvar();
}

/* ---------- Backup ---------- */
function exportarBackup() { db.ultimoBackup = new Date().toISOString(); salvar(); return JSON.stringify(db, null, 2); }
function importarBackup(texto) {
  let d;
  try { d = JSON.parse(texto); } catch { return { erro: 'Arquivo inválido (não é um JSON).' }; }
  const ok = d && d.seq && ['produtos', 'fornecedores', 'categorias', 'usuarios', 'historico'].every((k) => Array.isArray(d[k]));
  if (!ok || !d.usuarios.some((u) => u.papel === 'admin' && u.hash && u.salt)) return { erro: 'Arquivo de backup inválido ou sem administrador.' };
  db = d; salvar();
  return { ok: true };
}
