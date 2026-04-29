const express = require('express');
const router = express.Router();
const { listar, gerar, validar } = require('../controllers/certificadoController');
const auth = require('../middlewares/auth');

router.get('/', auth, listar);
router.post('/', auth, gerar);
router.get('/:codigo', validar); // rota publica - sem auth

module.exports = router;
