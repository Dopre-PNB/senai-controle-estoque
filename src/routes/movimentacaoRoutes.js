const express = require('express');
const movimentacaoController = require('../controllers/movimentacaoController');
const autenticar = require('../middlewares/auth');

const router = express.Router();
router.post('/movimentacoes', autenticar, movimentacaoController.cadastrar);
router.get('/movimentacoes', autenticar, movimentacaoController.listar);

module.exports = router;
