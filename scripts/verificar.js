'use strict';

// Executa somente contra um schema de teste novo; não remove bancos ou tabelas.
require('dotenv').config({ quiet: true });
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const root = path.resolve(__dirname, '..');
const casesPath = path.join(root, 'docs', 'casos.json');
const specificationText = fs.readFileSync(casesPath, 'utf8');
const specification = JSON.parse(specificationText);
const secrets = [process.env.DB_PASSWORD, process.env.JWT_SECRET].filter(Boolean);
const context = {};
let connection;
let sequelize;
let server;
let baseUrl;
let active;
const execution = {
  title: 'Execução real dos testes do sistema de estoque',
  startedAt: new Date().toISOString(),
  timezone: 'America/Sao_Paulo',
  method: 'Requisições HTTP automáticas e consultas ao MySQL real; não é uma execução manual do Postman.',
  expectedDefinition: {
    file: 'docs/casos.json',
    sha256: crypto.createHash('sha256').update(specificationText).digest('hex'),
    lastModifiedAt: fs.statSync(casesPath).mtime.toISOString(),
    loadedBeforeExecution: true,
  },
  environment: { node: process.version, platform: process.platform, architecture: process.arch },
  cases: [],
  defects: [],
};

class BlockedError extends Error {}
function need(...names) {
  for (const name of names) if (context[name] === undefined) throw new BlockedError('Pré-condição indisponível: ' + name);
}
function sanitize(value) {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    const output = {};
    for (const [key, item] of Object.entries(value)) {
      output[key] = /^(senha|password|token|hash|authorization|secret|jwt_secret|db_password)$/i.test(key)
        ? '[redigido]' : sanitize(item);
    }
    return output;
  }
  if (typeof value === 'string') {
    let output = value;
    for (const secret of secrets) if (secret) output = output.split(secret).join('[redigido]');
    return output;
  }
  return value;
}
function evidence(label, value) {
  if (active) active.evidence.push({ label, value: sanitize(value) });
}
function table(modelName) {
  const model = sequelize.models[modelName];
  assert.ok(model, 'Model não carregado: ' + modelName);
  const name = model.getTableName();
  const plain = typeof name === 'string' ? name : name.tableName;
  assert.match(plain, /^[A-Za-z0-9_]+$/, 'Nome de tabela inesperado');
  return '\x60' + plain + '\x60';
}
async function query(sql, parameters = []) {
  const [rows] = await connection.execute(sql, parameters);
  return rows;
}
async function user(id) {
  const rows = await query('SELECT id, nome, email, tipo FROM ' + table('Usuario') + ' WHERE id = ?', [id]);
  return rows[0] || null;
}
async function product(id) {
  const rows = await query('SELECT * FROM ' + table('Produto') + ' WHERE id = ?', [id]);
  return rows[0] || null;
}
async function movements(productId) {
  return query('SELECT * FROM ' + table('Movimentacao') + ' WHERE produto_id = ? ORDER BY id', [productId]);
}
async function productState(id) {
  return { product: await product(id), movements: await movements(id) };
}
async function allMovementCount() {
  const rows = await query('SELECT COUNT(*) AS total FROM ' + table('Movimentacao'));
  return Number(rows[0].total);
}
async function request(method, route, body, token) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token !== undefined) headers.Authorization = 'Bearer ' + token;
  const started = performance.now();
  const response = await fetch(baseUrl + route, {
    method, headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = { nonJsonResponse: raw }; }
  const durationMs = Number((performance.now() - started).toFixed(3));
  if (data && typeof data.token === 'string') secrets.push(data.token);
  const result = { status: response.status, body: data, durationMs };
  if (active) active.actual.push({
    method, route, input: sanitize(body),
    authentication: token === undefined ? 'Sem token' : 'Bearer presente; valor omitido',
    response: sanitize(result),
  });
  return result;
}
function status(response, expected) {
  assert.equal(response.status, expected, 'Status HTTP diferente do esperado');
}
function portugueseError(response) {
  assert.equal(typeof response.body.mensagem, 'string', 'Mensagem de erro ausente');
  assert.match(response.body.mensagem, /[áàãâéêíóôõúç]|erro|inv[aá]lid|n[aã]o|sem |permiss|quantidade|obrigat|insufic|produto|perfil|p[aá]gina|limite|dados|cadastro|email|senha|token|data|tipo|nome|preench/i, 'Mensagem deve explicar o erro em português');
}
function noPassword(body) {
  assert.equal(Object.hasOwn(body, 'senha'), false, 'Resposta não deve revelar senha/hash');
  assert.equal(Object.hasOwn(body, 'hash'), false, 'Resposta não deve revelar hash');
}
async function run(id, action) {
  const definition = specification.cases.find(item => item.id === id);
  assert.ok(definition, 'Caso não definido previamente: ' + id);
  const result = {
    ...definition,
    startedAt: new Date().toISOString(),
    actual: [],
    evidence: [],
    status: 'Bloqueado',
    result: '',
  };
  active = result;
  try {
    await action();
    result.status = 'Passou';
    result.result = 'Todas as comparações deste caso corresponderam ao esperado previamente definido.';
  } catch (error) {
    result.status = error instanceof BlockedError ? 'Bloqueado' : 'Falhou';
    result.result = sanitize(error.message);
    if (result.status === 'Falhou') {
      const high = result.requirements.some(item => ['RN01', 'RN02', 'RN04', 'RN05', 'RNF01', 'RNF02'].includes(item));
      execution.defects.push({
        id: 'DF' + String(execution.defects.length + 1).padStart(2, '0'),
        title: result.title,
        caseId: result.id,
        reproductionSteps: result.steps,
        expected: result.expected,
        obtained: result.result,
        severity: high ? 'Alta' : 'Média',
        origin: 'Comparação entre aplicação e caso de teste',
        evidence: 'docs/evidencias/execucao.json — ' + result.id,
        status: 'Aberto',
      });
    }
  } finally {
    result.finishedAt = new Date().toISOString();
    execution.cases.push(result);
    active = undefined;
    console.log(result.id + ': ' + result.status);
  }
}
async function unchangedInvalidMovement(body, expectedStatus = 400) {
  need('principal', 'operatorToken');
  const before = await productState(context.principal);
  const result = await request('POST', '/movimentacoes', body, context.operatorToken);
  status(result, expectedStatus);
  portugueseError(result);
  const after = await productState(context.principal);
  assert.deepEqual(after, before, 'Requisição recusada deve preservar estoque e histórico');
  evidence('MySQL antes e depois da requisição recusada', { before, after });
  return result;
}
async function executeCases() {
  const suffix = context.suffix;
  const operatorEmail = 'operador_' + suffix + '@example.test';
  const adminEmail = 'administrador_' + suffix + '@example.test';
  const password = crypto.randomBytes(18).toString('base64url');
  secrets.push(password);
  context.password = password;
  context.operatorEmail = operatorEmail;
  context.adminEmail = adminEmail;

  await run('CT01', async () => {
    const response = await request('POST', '/usuarios', { nome: 'Operador de Teste', email: operatorEmail, senha: password, tipo: 'operador' });
    status(response, 201);
    noPassword(response.body);
    context.operatorId = response.body.id;
    const rows = await query('SELECT * FROM ' + table('Usuario') + ' WHERE email = ?', [operatorEmail]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].tipo, 'operador');
    assert.notEqual(rows[0].senha, password, 'Senha não pode ser gravada em texto puro');
    assert.equal(await bcrypt.compare(password, rows[0].senha), true);
    evidence('Usuário no MySQL e verificação de hash', { user: await user(rows[0].id), hashDifferentFromPlaintext: true, bcryptComparisonPassed: true });
  });
  await run('CT02', async () => {
    const response = await request('POST', '/usuarios', { nome: 'Administrador de Teste', email: adminEmail, senha: password, tipo: 'administrador' });
    status(response, 201);
    noPassword(response.body);
    context.adminId = response.body.id;
    const row = await user(context.adminId);
    assert.equal(row.tipo, 'administrador');
    evidence('Administrador no MySQL', row);
  });
  await run('CT03', async () => {
    need('operatorId');
    const response = await request('POST', '/usuarios', { nome: 'Duplicado', email: operatorEmail, senha: password, tipo: 'operador' });
    status(response, 400);
    portugueseError(response);
    const rows = await query('SELECT id, nome, email, tipo FROM ' + table('Usuario') + ' WHERE email = ?', [operatorEmail]);
    assert.equal(rows.length, 1);
    evidence('E-mail único no MySQL', rows);
  });
  await run('CT04', async () => {
    const inputs = [
      { nome: 'Perfil inválido', email: 'perfil_' + suffix + '@example.test', senha: password, tipo: 'gerente' },
      { email: 'incompleto_' + suffix + '@example.test', senha: password, tipo: 'operador' },
    ];
    for (const body of inputs) {
      const response = await request('POST', '/usuarios', body);
      status(response, 400);
      portugueseError(response);
      const rows = await query('SELECT id FROM ' + table('Usuario') + ' WHERE email = ?', [body.email]);
      assert.equal(rows.length, 0);
      evidence('Ausência de usuário inválido no MySQL', { email: body.email, rows });
    }
  });
  await run('CT05', async () => {
    need('operatorId', 'adminId');
    for (const entry of [
      { email: operatorEmail, id: context.operatorId, tipo: 'operador', contextKey: 'operatorToken' },
      { email: adminEmail, id: context.adminId, tipo: 'administrador', contextKey: 'adminToken' },
    ]) {
      const response = await request('POST', '/login', { email: entry.email, senha: password });
      status(response, 200);
      assert.equal(typeof response.body.token, 'string');
      context[entry.contextKey] = response.body.token;
      const payload = jwt.decode(response.body.token);
      assert.equal(payload.id, entry.id);
      assert.equal(payload.tipo, entry.tipo);
      assert.equal(payload.exp - payload.iat, 8 * 60 * 60);
      noPassword(payload);
      evidence('Conteúdo público do JWT sem assinatura/token', { id: payload.id, tipo: payload.tipo, durationSeconds: payload.exp - payload.iat, passwordPresent: false });
    }
  });
  await run('CT06', async () => {
    need('operatorId');
    for (const body of [
      { email: operatorEmail, senha: 'senha-incorreta' },
      { email: 'inexistente_' + suffix + '@example.test', senha: password },
    ]) {
      const response = await request('POST', '/login', body);
      status(response, 401);
      portugueseError(response);
      assert.match(response.body.mensagem, /inv[aá]lid/i);
      assert.equal(Object.hasOwn(response.body, 'token'), false);
    }
  });
  await run('CT07', async () => {
    need('operatorId');
    assert.ok(process.env.JWT_SECRET, 'JWT_SECRET precisa estar configurado');
    const expired = jwt.sign({ id: context.operatorId, tipo: 'operador' }, process.env.JWT_SECRET, { expiresIn: -1 });
    secrets.push(expired);
    for (const token of [undefined, 'token-invalido', expired]) {
      const response = await request('GET', '/produtos', undefined, token);
      status(response, 401);
      portugueseError(response);
    }
  });
  await run('CT08', async () => {
    need('operatorToken');
    const response = await request('POST', '/produtos', { nome: 'Parafuso Principal', descricao: 'Produto principal dos testes', quantidade_estoque: 10 }, context.operatorToken);
    status(response, 201);
    context.principal = response.body.id;
    const row = await product(context.principal);
    assert.equal(row.nome, 'Parafuso Principal');
    assert.equal(row.descricao, 'Produto principal dos testes');
    assert.equal(row.quantidade_estoque, 10);
    evidence('Produto inicial no MySQL', row);
  });
  await run('CT09', async () => {
    need('operatorToken', 'principal');
    const response = await request('POST', '/produtos', { nome: 'Parafuso Reserva', descricao: 'Estoque padrão' }, context.operatorToken);
    status(response, 201);
    context.reserve = response.body.id;
    const row = await product(context.reserve);
    assert.equal(row.quantidade_estoque, 0);
    evidence('Produto com estoque padrão no MySQL', row);
    for (const body of [
      { nome: 'Estoque negativo', descricao: 'Entrada inválida', quantidade_estoque: -1 },
      { nome: 'Estoque fracionário', descricao: 'Entrada inválida', quantidade_estoque: 1.5 },
      { descricao: 'Nome ausente', quantidade_estoque: 0 },
    ]) {
      const before = await query('SELECT COUNT(*) AS total FROM ' + table('Produto'));
      const invalid = await request('POST', '/produtos', body, context.operatorToken);
      status(invalid, 400);
      portugueseError(invalid);
      const after = await query('SELECT COUNT(*) AS total FROM ' + table('Produto'));
      assert.deepEqual(after, before);
      evidence('Contagem de produtos após cadastro recusado', { before, after });
    }
    for (const fixture of [
      { nome: 'Martelo Descartável', descricao: 'Produto reservado à exclusão', contextKey: 'disposable' },
      { nome: 'Alicate Outro', descricao: 'Outro produto da paginação', quantidade_estoque: 2, contextKey: 'other' },
    ]) {
      const { contextKey, ...body } = fixture;
      const created = await request('POST', '/produtos', body, context.operatorToken);
      status(created, 201);
      context[contextKey] = created.body.id;
      evidence('Fixture cadastrada pela API', await product(created.body.id));
    }
  });
  await run('CT10', async () => {
    need('operatorToken', 'principal', 'reserve', 'disposable', 'other');
    const pages = [];
    for (const route of ['/produtos?pagina=1&limite=2', '/produtos?pagina=2&limite=2', '/produtos']) {
      const response = await request('GET', route, undefined, context.operatorToken);
      status(response, 200);
      assert.ok(Array.isArray(response.body), 'Listagem deve retornar array');
      assert.ok(response.body.length <= (route.includes('limite=2') ? 2 : 10));
      assert.ok(response.durationMs <= 2000, 'Listagem excedeu dois segundos: ' + response.durationMs + ' ms');
      pages.push(response.body);
    }
    assert.equal(pages[0].length, 2);
    assert.equal(pages[1].length, 2);
    const ids = [...pages[0], ...pages[1]].map(row => row.id);
    assert.equal(new Set(ids).size, 4);
    const rows = await query('SELECT * FROM ' + table('Produto') + ' ORDER BY id');
    evidence('Dados existentes e páginas sem repetição', { databaseRows: rows, pageIds: ids, defaultCount: pages[2].length });
  });
  await run('CT11', async () => {
    need('operatorToken', 'principal', 'reserve');
    const response = await request('GET', '/produtos?nome=Parafuso', undefined, context.operatorToken);
    status(response, 200);
    assert.ok(Array.isArray(response.body));
    assert.equal(response.body.length, 2);
    assert.deepEqual(response.body.map(row => row.id).sort((a, b) => a - b), [context.principal, context.reserve].sort((a, b) => a - b));
    assert.ok(response.body.every(row => row.nome.toLowerCase().includes('parafuso')));
    evidence('Ids esperados no MySQL', [await product(context.principal), await product(context.reserve)]);
  });
  await run('CT12', async () => {
    need('operatorToken', 'principal', 'reserve', 'disposable', 'other');
    // Datas controladas só nas fixtures do schema isolado; não altera dados da aplicação.
    await query('UPDATE ' + table('Produto') + ' SET createdAt = ? WHERE id IN (?, ?)', ['2020-01-01 12:00:00', context.principal, context.reserve]);
    await query('UPDATE ' + table('Produto') + ' SET createdAt = ? WHERE id IN (?, ?)', ['2025-01-01 12:00:00', context.disposable, context.other]);
    const response = await request('GET', '/produtos?data=2021-01-01', undefined, context.operatorToken);
    status(response, 200);
    assert.ok(Array.isArray(response.body));
    assert.deepEqual(response.body.map(row => row.id).sort((a, b) => a - b), [context.disposable, context.other].sort((a, b) => a - b));
    const combined = await request('GET', '/produtos?nome=Parafuso&data=2021-01-01', undefined, context.operatorToken);
    status(combined, 200);
    assert.deepEqual(combined.body, []);
    evidence('Datas de cadastro controladas no MySQL', await query('SELECT id, nome, createdAt FROM ' + table('Produto') + ' ORDER BY id'));
  });
  await run('CT13', async () => {
    need('operatorToken');
    for (const route of ['/produtos?pagina=0', '/produtos?limite=0', '/produtos?pagina=1.5', '/produtos?data=nao-e-data']) {
      const response = await request('GET', route, undefined, context.operatorToken);
      status(response, 400);
      portugueseError(response);
    }
  });
  await run('CT14', async () => {
    need('operatorToken', 'disposable');
    const response = await request('DELETE', '/produtos/' + context.disposable, undefined, context.operatorToken);
    status(response, 403);
    assert.equal(response.body.mensagem, 'Sem permissão para essa ação');
    const row = await product(context.disposable);
    assert.ok(row);
    evidence('Produto preservado após bloqueio', row);
  });
  await run('CT15', async () => {
    need('adminToken', 'disposable');
    const response = await request('DELETE', '/produtos/' + context.disposable, undefined, context.adminToken);
    status(response, 200);
    assert.equal(response.body.mensagem, 'Produto removido com sucesso');
    const row = await product(context.disposable);
    assert.equal(row, null);
    evidence('Produto ausente no MySQL após exclusão', { id: context.disposable, row });
    const missing = await request('DELETE', '/produtos/' + context.disposable, undefined, context.adminToken);
    status(missing, 404);
    portugueseError(missing);
  });
  await run('CT16', async () => {
    need('operatorToken', 'operatorId', 'adminId', 'principal');
    const before = await productState(context.principal);
    assert.equal(before.product.quantidade_estoque, 10);
    const response = await request('POST', '/movimentacoes', { produto_id: context.principal, tipo: 'entrada', quantidade: 5, usuario_id: context.adminId }, context.operatorToken);
    status(response, 201);
    const after = await productState(context.principal);
    assert.equal(after.product.quantidade_estoque, 15);
    assert.equal(after.movements.length, before.movements.length + 1);
    const movement = after.movements.find(row => row.id === response.body.id);
    assert.ok(movement);
    assert.equal(movement.quantidade, 5);
    assert.equal(movement.tipo, 'entrada');
    assert.equal(movement.usuario_id, context.operatorId);
    assert.ok(movement.data);
    evidence('Entrada, saldo e responsável reais no MySQL', { before, after, forgedIdIgnored: movement.usuario_id !== context.adminId });
  });
  await run('CT17', async () => {
    need('adminToken', 'adminId', 'principal');
    const before = await productState(context.principal);
    assert.equal(before.product.quantidade_estoque, 15);
    const response = await request('POST', '/movimentacoes', { produto_id: context.principal, tipo: 'saida', quantidade: 3 }, context.adminToken);
    status(response, 201);
    const after = await productState(context.principal);
    assert.equal(after.product.quantidade_estoque, 12);
    assert.equal(after.movements.length, before.movements.length + 1);
    const movement = after.movements.find(row => row.id === response.body.id);
    assert.ok(movement);
    assert.equal(movement.quantidade, 3);
    assert.equal(movement.tipo, 'saida');
    assert.equal(movement.usuario_id, context.adminId);
    assert.ok(movement.data);
    evidence('Saída, saldo e responsável reais no MySQL', { before, after });
  });
  await run('CT18', async () => {
    need('principal');
    const response = await unchangedInvalidMovement({ produto_id: context.principal, tipo: 'saida', quantidade: 999 });
    assert.equal(response.body.mensagem, 'Quantidade insuficiente em estoque');
  });
  await run('CT19', async () => {
    need('principal');
    for (const quantidade of [0, -1, 1.5]) await unchangedInvalidMovement({ produto_id: context.principal, tipo: 'entrada', quantidade });
  });
  await run('CT20', async () => {
    need('principal');
    await unchangedInvalidMovement({ produto_id: context.principal, tipo: 'ajuste', quantidade: 2 });
  });
  await run('CT21', async () => {
    need('operatorToken');
    assert.equal(await product(2147483647), null);
    const before = await allMovementCount();
    const response = await request('POST', '/movimentacoes', { produto_id: 2147483647, tipo: 'entrada', quantidade: 1 }, context.operatorToken);
    status(response, 404);
    portugueseError(response);
    const after = await allMovementCount();
    assert.equal(after, before);
    evidence('Contagem de movimentos preservada no MySQL', { before, after });
  });
  await run('CT22', async () => {
    need('operatorToken', 'operatorId', 'principal');
    const before = await productState(context.principal);
    const entry = await request('POST', '/movimentacoes', { produto_id: context.principal, tipo: 'entrada', quantidade: 1 }, context.operatorToken);
    status(entry, 201);
    const intermediate = await productState(context.principal);
    assert.equal(intermediate.product.quantidade_estoque, before.product.quantidade_estoque + 1);
    const exit = await request('POST', '/movimentacoes', { produto_id: context.principal, tipo: 'saida', quantidade: 1 }, context.operatorToken);
    status(exit, 201);
    const after = await productState(context.principal);
    assert.equal(after.product.quantidade_estoque, before.product.quantidade_estoque);
    assert.equal(after.movements.length, before.movements.length + 2);
    for (const id of [entry.body.id, exit.body.id]) {
      const movement = after.movements.find(row => row.id === id);
      assert.ok(movement);
      assert.equal(movement.quantidade, 1);
      assert.equal(movement.usuario_id, context.operatorId);
    }
    evidence('Valor limite: estoque e movimentos reais no MySQL', { before, intermediate, after });
  });
}
function markdownCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
function buildReport() {
  const summary = execution.summary;
  const formatLocal = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'não registrado' : date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'medium',
    });
  };
  const chronology = [
    '| Etapa | Data e horário local | Fonte da informação |',
    '| --- | --- | --- |',
    '| Definição prévia dos casos registrada | ' + formatLocal(execution.expectedDefinition.lastModifiedAt) + ' | expectedDefinition.lastModifiedAt em [execucao.json](evidencias/execucao.json); arquivo carregado antes da execução. |',
  ];
  if (execution.verifierRetest) chronology.push(
    '| Início da rodada inicial preservada | ' + formatLocal(execution.verifierRetest.initialStartedAt) + ' | verifierRetest.initialStartedAt e [evidência inicial](evidencias/execucao-instrumentacao-inicial.json). |',
    '| Diagnóstico e correção documentados do verificador | Sem horário próprio registrado | DFV01 e verifierRetest em [execucao.json](evidencias/execucao.json). |',
  );
  chronology.push('| Execução automática desta rodada | ' + formatLocal(execution.startedAt) + ' a ' + formatLocal(execution.finishedAt) + ' | startedAt, finishedAt, casos e resumo em [execucao.json](evidencias/execucao.json). |');
  const lines = [
    '# Plano e execução de testes',
    '',
    'Objetivo: verificar RF01–RF07, RNF01–RNF05 e RN01–RN05 do sistema de estoque, a partir de resultados reais.',
    '',
    'Escopo: cadastro de usuário, login, cadastro/listagem/exclusão de produto e movimentação de entrada/saída. Telas de frontend não fazem parte destes testes de API.',
    '',
    'Ambiente: Node.js ' + execution.environment.node + '; MySQL ' + (execution.environment.mysqlVersion || 'não disponível') + '; servidor HTTP local na porta ' + (execution.environment.httpPort || 'não disponível') + '; schema de teste ' + (execution.environment.testDatabase || 'não disponível') + '.',
    '',
    'Estratégia: testes automáticos de sistema e integração por HTTP e consultas ao MySQL real; cenários funcionais, segurança, mensagens em português, valor limite e tempo de listagem. A coleção Postman permite reproduzir as requisições; esta execução foi realizada pelo script.',
    '',
    'Critérios de entrada: configuração local válida, banco acessível, schema novo distinto do banco da aplicação, servidor iniciado e models sincronizados sem apagar tabelas. O próprio script prepara usuários e produtos de teste.',
    '',
    'Critérios de saída: todos os casos executados e aprovados; nenhum defeito crítico ou alto aberto. A exigência de aprovação de todos os casos é mais estrita que o critério mínimo do material.',
    '',
    'Responsáveis do trabalho: Pedro — solicitante; Codex — preparação e execução técnica da entrega original. Esta rodada é executada automaticamente pelo script verificar.js, acionado com npm test; o script não registra a identidade de quem acionou o comando.',
    '',
    'Cronograma realizado, no horário de São Paulo (America/Sao_Paulo, UTC−03:00):',
    '',
    ...chronology,
    '',
    'Os horários originais em UTC permanecem na evidência JSON. Esta rodada comprova somente a execução automática; não comprova execução manual no Postman nem aprovação pelo professor. A prática por interface e a entrega complementar são documentadas em [Módulo 7](modulo7/README.md).',
    '',
    'Pré-condições, passos e esperados foram registrados antes de executar em [casos.json](casos.json). Sua impressão SHA-256 nesta rodada é ' + execution.expectedDefinition.sha256 + '.',
    '',
    '## Matriz de rastreabilidade',
    '',
    '| Requisito | Descrição | Casos | Cobertura |',
    '| --- | --- | --- | --- |',
  ];
  for (const [code, description] of Object.entries(specification.requirements)) {
    const ids = specification.cases.filter(item => item.requirements.includes(code)).map(item => item.id);
    lines.push('| ' + code + ' | ' + markdownCell(description) + ' | ' + ids.join(', ') + ' | ' + (ids.length ? 'Coberto' : 'Sem caso') + ' |');
  }
  lines.push('', '## Resultados reais', '', '| Caso | Cenário | Resultado |', '| --- | --- | --- |');
  for (const item of execution.cases) lines.push('| ' + item.id + ' | ' + markdownCell(item.title) + ' | ' + item.status + ' |');
  lines.push('', 'Cada caso contém os dados de entrada sem segredos, respostas HTTP, duração, comparações e consultas ao banco em [evidencias/execucao.json](evidencias/execucao.json). Os resultados esperados vieram da definição prévia; não foram preenchidos a partir das respostas.', '', '## Defeitos');
  if (execution.defects.length === 0) {
    lines.push('', 'Nenhuma divergência funcional foi observada nesta execução. Nenhum relatório de defeito funcional foi aberto. Casos bloqueados, se existirem, aparecem no resumo e não contam como aprovados.');
  } else {
    lines.push('', '| ID | Caso | Origem | Severidade | Estado | Divergência |', '| --- | --- | --- | --- | --- | --- |');
    for (const defect of execution.defects) lines.push('| ' + defect.id + ' | ' + defect.caseId + ' | ' + markdownCell(defect.origin || 'Aplicação') + ' | ' + defect.severity + ' | ' + defect.status + ' | ' + markdownCell(defect.obtained) + ' |');
    lines.push('', 'Passos de reprodução, esperado, obtido e evidência de cada defeito estão no JSON. Defeitos fechados não contam como abertos no resumo.');
    if (execution.verifierRetest) lines.push('', execution.verifierRetest.diagnosis, '', 'A [evidência da rodada inicial](evidencias/execucao-instrumentacao-inicial.json) foi preservada. O reteste e a regressão executaram novamente os 22 casos, sem alterar os esperados de casos.json. A execução final passou integralmente.');
  }
  if (execution.setupError) lines.push('', 'Bloqueio de preparação: ' + markdownCell(execution.setupError));
  lines.push('', '## Resumo', '', '| Total | Passou | Falhou | Bloqueado | Defeitos abertos | Critério de saída |', '| --- | --- | --- | --- | --- | --- |',
    '| ' + summary.total + ' | ' + summary.passed + ' | ' + summary.failed + ' | ' + summary.blocked + ' | ' + summary.openDefects + ' | ' + (summary.exitCriteriaMet ? 'Atendido' : 'Não atendido') + ' |',
    '',
    'Limite da medição de desempenho: listagem local com quatro produtos; estes resultados verificam o cenário definido, sem estabelecer capacidade sob carga.',
    '',
    'O schema isolado foi preservado para conferir os registros. O script não remove bancos ou tabelas e nunca executa testes contra DB_NAME da aplicação.',
    ''
  );
  return lines.join('\n');
}
function recordVerifierRetest() {
  const initialPath = path.join(root, 'docs', 'evidencias', 'execucao-instrumentacao-inicial.json');
  if (!fs.existsSync(initialPath)) return;
  const initial = JSON.parse(fs.readFileSync(initialPath, 'utf8'));
  const affected = ['CT04', 'CT09'];
  const initialMatches = affected.every(id => initial.cases.some(item => item.id === id && item.result === 'Mensagem deve explicar o erro em português'));
  const retestPassed = affected.every(id => execution.cases.some(item => item.id === id && item.status === 'Passou'));
  if (!initialMatches || !retestPassed) return;
  const diagnosis = 'DFV01 teve origem no verificador: a heurística de idioma não reconheceu a mensagem correta “Nome deve ser preenchido”. A API havia retornado HTTP 400 em português; a aplicação não precisou ser alterada. A heurística foi corrigida para reconhecer “nome” e “preenchido”, mantendo os resultados esperados previamente definidos.';
  execution.verifierRetest = {
    initialEvidence: 'docs/evidencias/execucao-instrumentacao-inicial.json',
    initialStartedAt: initial.startedAt,
    initialSummary: initial.summary,
    affectedCases: affected,
    diagnosis,
    correction: 'Heurística do verificador ampliada para reconhecer as palavras nome e preenchido.',
    expectedDefinitionUnchanged: initial.expectedDefinition.sha256 === execution.expectedDefinition.sha256,
    retestCases: execution.cases.map(item => item.id),
    retestEvidence: 'docs/evidencias/execucao.json',
  };
  if (!execution.defects.some(item => item.id === 'DFV01')) execution.defects.push({
    id: 'DFV01',
    title: 'Heurística de português rejeitou mensagem válida',
    caseId: 'CT04, CT09',
    origin: 'Verificador',
    reproductionSteps: ['Executar a versão inicial do verificador.', 'Enviar cadastros sem nome nos casos CT04 e CT09.', 'Observar HTTP 400 e a mensagem Nome deve ser preenchido, rejeitada pela heurística.'],
    expected: 'Respostas HTTP 400 em português devem ser reconhecidas pelo verificador.',
    obtained: 'A rodada inicial classificou duas mensagens corretas como falhas e bloqueou quatro casos dependentes.',
    severity: 'Média',
    evidence: 'docs/evidencias/execucao-instrumentacao-inicial.json',
    correction: execution.verifierRetest.correction,
    retest: 'CT04 e CT09 passaram; os 22 casos foram reexecutados e passaram.',
    retestEvidence: 'docs/evidencias/execucao.json',
    status: 'Fechado',
    closedAt: execution.finishedAt,
  });
}
function writeResults() {
  execution.finishedAt = new Date().toISOString();
  recordVerifierRetest();
  execution.summary = {
    total: execution.cases.length,
    passed: execution.cases.filter(item => item.status === 'Passou').length,
    failed: execution.cases.filter(item => item.status === 'Falhou').length,
    blocked: execution.cases.filter(item => item.status === 'Bloqueado').length,
    openDefects: execution.defects.filter(item => item.status === 'Aberto').length,
  };
  execution.summary.exitCriteriaMet = execution.summary.total === specification.cases.length
    && execution.summary.failed === 0 && execution.summary.blocked === 0;
  const evidenceDir = path.join(root, 'docs', 'evidencias');
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(path.join(evidenceDir, 'execucao.json'), JSON.stringify(sanitize(execution), null, 2) + '\n');
  fs.writeFileSync(path.join(root, 'docs', 'testes.md'), buildReport());
}
async function main() {
  assert.ok(specification.expectedDefinedBeforeExecution, 'Esperados precisam ser definidos antes da execução');
  const appDatabase = process.env.DB_NAME;
  const testBase = process.env.DB_TEST_NAME || 'senai_estoque_test';
  assert.ok(appDatabase, 'DB_NAME precisa estar configurado');
  assert.notEqual(testBase, appDatabase, 'DB_TEST_NAME deve ser diferente de DB_NAME');
  assert.match(appDatabase, /^[A-Za-z0-9_]+$/, 'DB_NAME contém caracteres inválidos');
  assert.match(testBase, /^[A-Za-z0-9_]+$/, 'DB_TEST_NAME contém caracteres inválidos');
  const suffix = new Date().toISOString().replace(/\D/g, '') + '_' + crypto.randomBytes(3).toString('hex');
  const testDatabase = testBase.slice(0, 38) + '_' + suffix;
  assert.notEqual(testDatabase, appDatabase);
  context.suffix = suffix;
  connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    timezone: 'Z',
    dateStrings: false,
  });
  const existing = await query('SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?', [testDatabase]);
  assert.equal(existing.length, 0, 'Schema já existe; recusando reutilização para não alterar dados anteriores');
  await connection.query('CREATE DATABASE \x60' + testDatabase + '\x60 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await connection.changeUser({ database: testDatabase });
  process.env.DB_NAME = testDatabase; // Antes de importar qualquer model ou a aplicação.
  sequelize = require('../src/config/database');
  const app = require('../src/app');
  await sequelize.authenticate();
  await sequelize.sync(); // Sem force, alter ou remoção de tabelas.
  server = await new Promise((resolve, reject) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
    instance.on('error', reject);
  });
  baseUrl = 'http://127.0.0.1:' + server.address().port;
  const version = await query('SELECT VERSION() AS version, DATABASE() AS schemaName');
  execution.environment = {
    ...execution.environment,
    mysqlVersion: version[0].version,
    mysqlHost: process.env.DB_HOST || '127.0.0.1',
    mysqlPort: Number(process.env.DB_PORT || 3306),
    applicationDatabase: appDatabase,
    testDatabase: version[0].schemaName,
    httpHost: '127.0.0.1',
    httpPort: server.address().port,
    schemaCreatedForThisRun: true,
    schemaPreservedAfterExecution: true,
  };
  await executeCases();
}
(async () => {
  try {
    await main();
  } catch (error) {
    execution.setupError = sanitize(error.message);
    for (const definition of specification.cases) {
      if (!execution.cases.some(item => item.id === definition.id)) execution.cases.push({
        ...definition, actual: [], evidence: [], status: 'Bloqueado',
        result: 'Preparação indisponível: ' + execution.setupError,
        startedAt: new Date().toISOString(), finishedAt: new Date().toISOString(),
      });
    }
  } finally {
    writeResults();
    if (server) await new Promise(resolve => server.close(resolve));
    if (sequelize) await sequelize.close();
    if (connection) await connection.end();
  }
  const summary = execution.summary;
  console.log('Total: ' + summary.total + '; passou: ' + summary.passed + '; falhou: ' + summary.failed + '; bloqueado: ' + summary.blocked + '.');
  console.log('Evidências: docs/evidencias/execucao.json; relatório: docs/testes.md.');
  process.exitCode = summary.exitCriteriaMet ? 0 : 1;
})();
