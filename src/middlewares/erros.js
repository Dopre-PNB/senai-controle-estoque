function tratarErros(erro, req, res, next) {
  if (res.headersSent) return next(erro);
  if (erro.status) {
    const mensagem = erro.type === 'entity.parse.failed'
      ? 'Corpo da requisição deve conter JSON válido'
      : (erro.type ? 'Requisição inválida' : erro.message);
    return res.status(erro.status).json({ mensagem });
  }
  if (erro.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ mensagem: 'Email já cadastrado' });
  }
  if (erro.name === 'SequelizeValidationError'
    || erro.name === 'SequelizeForeignKeyConstraintError'
    || erro.name === 'SequelizeDatabaseError') {
    return res.status(400).json({ mensagem: 'Dados inválidos para esta operação' });
  }
  console.error('Erro na operação:', erro.message);
  return res.status(500).json({ mensagem: 'Não foi possível concluir a operação' });
}

module.exports = tratarErros;
