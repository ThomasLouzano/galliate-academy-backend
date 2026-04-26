const express = require('express');
const router = express.Router();
const { listar, buscarPorId, criar, atualizar, excluir } = require('../controllers/trilhaController');
const auth = require('../middlewares/auth');

router.get('/', auth, listar);
router.get('/:id', auth, buscarPorId);
router.post('/', auth, criar);
router.put('/:id', auth, atualizar);
router.delete('/:id', auth, excluir);

module.exports = router;
