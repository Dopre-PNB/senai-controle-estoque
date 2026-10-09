const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const { falhar, texto } = require('./validacao');

async function cadastrar(dados) {
  const nome = texto(dados.nome, 'Nome');
  const email = texto(dados.email, 'Email');
  if (typeof dados.senha !== 'string' || !dados.senha.trim()) {
    falhar(400, 'Senha deve ser preenchida');
  }
  if (!['administrador', 'operador'].includes(dados.tipo)) {
    falhar(400, 'Perfil deve ser administrador ou operador');
  }

  const usuario = await Usuario.create({
    nome,
    email,
    senha: await bcrypt.hash(dados.senha, 10),
    tipo: dados.tipo,
  });

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
  };
}

module.exports = { cadastrar };
