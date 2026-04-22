const express = require('express');
const router = express.Router();
const { listar, buscarPorId, criar, atualizar } = require('../controllers/moduloController');
const auth = require('../middlewares/auth');

router.get('/', auth, listar);
router.get('/:id', auth, buscarPorId);
router.post('/', auth, criar);
router.put('/:id', auth, atualizar);

module.exports = router;