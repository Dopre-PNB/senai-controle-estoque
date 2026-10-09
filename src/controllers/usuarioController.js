const usuarioService = require('../services/usuarioService');

async function cadastrar(req, res) {
  const usuario = await usuarioService.cadastrar(req.body || {});
  res.status(201).json(usuario);
}

module.exports = { cadastrar };
