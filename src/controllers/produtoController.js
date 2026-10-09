const produtoService = require('../services/produtoService');

async function cadastrar(req, res) {
  res.status(201).json(await produtoService.cadastrar(req.body || {}));
}

async function listar(req, res) {
  res.json(await produtoService.listar(req.query));
}

async function deletar(req, res) {
  res.json(await produtoService.deletar(req.params.id));
}

module.exports = { cadastrar, listar, deletar };
