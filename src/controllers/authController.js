const authService = require('../services/authService');

async function login(req, res) {
  res.json(await authService.login(req.body || {}));
}

module.exports = { login };
