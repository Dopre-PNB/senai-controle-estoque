const { Op } = require('sequelize');
const Produto = require('../models/Produto');
const { falhar, texto, inteiroPositivo } = require('./validacao');

async function cadastrar(dados) {
  const nome = texto(dados.nome, 'Nome');
  const descricao = texto(dados.descricao, 'Descrição');
  const quantidade = dados.quantidade_estoque === undefined
    ? 0
    : dados.quantidade_estoque;
  if (!Number.isInteger(quantidade) || quantidade < 0) {
    falhar(400, 'Estoque inicial deve ser um número inteiro não negativo');
  }
  return Produto.create({ nome, descricao, quantidade_estoque: quantidade });
}

async function listar(query) {
  const pagina = inteiroPositivo(Number(query.pagina ?? 1), 'Página');
  const limite = inteiroPositivo(Number(query.limite ?? 10), 'Limite');
  const where = {};
  if (query.nome !== undefined) {
    if (typeof query.nome !== 'string') {
      falhar(400, 'Filtro de nome inválido');
    }
    if (query.nome) where.nome = { [Op.like]: `%${query.nome}%` };
  }
  if (query.data !== undefined) {
    const data = typeof query.data === 'string' ? new Date(query.data) : null;
    if (!data || Number.isNaN(data.getTime())) {
      falhar(400, 'Filtro de data inválido');
    }
    where.createdAt = { [Op.gte]: data };
  }
  return Produto.findAll({
    where,
    limit: limite,
    offset: (pagina - 1) * limite,
    order: [['id', 'ASC']],
  });
}

async function deletar(idRecebido) {
  const id = inteiroPositivo(Number(idRecebido), 'ID do produto');
  const produto = await Produto.findByPk(id);
  if (!produto) falhar(404, 'Produto não encontrado');
  await produto.destroy();
  return { mensagem: 'Produto removido com sucesso' };
}

module.exports = { cadastrar, listar, deletar };
