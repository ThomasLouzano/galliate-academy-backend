const express = require('express');
const router = express.Router();
const { listar, buscarPorId, criar, atualizar, excluir, submeter } = require('../controllers/avaliacaoController');
const auth = require('../middlewares/auth');

router.get('/', auth, listar);
router.get('/:id', auth, buscarPorId);
router.post('/', auth, criar);
router.put('/:id', auth, atualizar);
router.delete('/:id', auth, excluir);
router.post('/:id/submeter', auth, submeter);

module.exports = router;
