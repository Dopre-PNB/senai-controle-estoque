function permitir(...tiposPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !tiposPermitidos.includes(req.usuario.tipo)) {
      return res.status(403).json({ mensagem: 'Sem permissão para essa ação' });
    }
    return next();
  };
}

module.exports = permitir;
