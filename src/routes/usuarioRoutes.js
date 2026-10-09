const express = require('express');
const usuarioController = require('../controllers/usuarioController');

const router = express.Router();
router.post('/usuarios', usuarioController.cadastrar);

module.exports = router;
