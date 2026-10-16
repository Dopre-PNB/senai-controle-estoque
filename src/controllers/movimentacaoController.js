const movimentacaoService = require('../services/movimentacaoService');

async function cadastrar(req, res) {
  const movimentacao = await movimentacaoService.cadastrar(req.body || {}, req.usuario);
  res.status(201).json(movimentacao);
}

async function listar(req, res) {
  res.json(await movimentacaoService.listar());
}

module.exports = { cadastrar, listar };
