const express = require('express');
const router = express.Router();
const { cadastrar, login, listar, excluir, adicionarXP } = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');

router.post('/cadastrar', auth, cadastrar);
router.post('/login', login);
router.get('/', auth, listar);
router.delete('/:id', auth, excluir);
router.post('/:id/xp', auth, adicionarXP);

module.exports = router;