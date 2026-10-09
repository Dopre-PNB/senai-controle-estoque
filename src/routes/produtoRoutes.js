const express = require('express');
const produtoController = require('../controllers/produtoController');
const autenticar = require('../middlewares/auth');
const permitir = require('../middlewares/checkRole');

const router = express.Router();
router.post('/produtos', autenticar, produtoController.cadastrar);
router.get('/produtos', autenticar, produtoController.listar);
router.delete('/produtos/:id', autenticar, permitir('administrador'), produtoController.deletar);

module.exports = router;
