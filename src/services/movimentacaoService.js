const sequelize = require('../config/database');
const Produto = require('../models/Produto');
const Movimentacao = require('../models/Movimentacao');
const { falhar, inteiroPositivo } = require('./validacao');

async function cadastrar(dados, usuario) {
  const produtoId = inteiroPositivo(dados.produto_id, 'ID do produto');
  const quantidade = inteiroPositivo(dados.quantidade, 'Quantidade');
  if (!['entrada', 'saida'].includes(dados.tipo)) {
    falhar(400, 'Tipo de movimentação deve ser entrada ou saida');
  }

  return sequelize.transaction(async (transaction) => {
    const produto = await Produto.findByPk(produtoId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!produto) falhar(404, 'Produto não encontrado');
    if (dados.tipo === 'saida' && produto.quantidade_estoque < quantidade) {
      falhar(400, 'Quantidade insuficiente em estoque');
    }
    const novoEstoque = dados.tipo === 'entrada'
      ? produto.quantidade_estoque + quantidade
      : produto.quantidade_estoque - quantidade;

    await produto.update({ quantidade_estoque: novoEstoque }, { transaction });
    return Movimentacao.create({
      produto_id: produtoId,
      usuario_id: usuario.id,
      tipo: dados.tipo,
      quantidade,
    }, { transaction });
  });
}

async function listar() {
  return Movimentacao.findAll({ order: [['createdAt', 'DESC']] });
}

module.exports = { cadastrar, listar };
