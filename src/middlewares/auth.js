const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ mensagem: 'Token não enviado' });
  }
  const partes = /^Bearer ([^\s]+)$/i.exec(authHeader);
  if (!partes) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
  }
  try {
    req.usuario = jwt.verify(partes[1], process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
  }
}

module.exports = autenticar;
