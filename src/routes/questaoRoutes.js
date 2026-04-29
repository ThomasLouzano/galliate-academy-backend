const express = require('express');
const router = express.Router();
const { listar, criar, atualizar, excluir } = require('../controllers/questaoController');
const auth = require('../middlewares/auth');

router.get('/', auth, listar);
router.post('/', auth, criar);
router.put('/:id', auth, atualizar);
router.delete('/:id', auth, excluir);

module.exports = router;
