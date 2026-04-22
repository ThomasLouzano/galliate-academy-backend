const express = require('express');
const router = express.Router();
const { registrar, buscarPorUsuario } = require('../controllers/progressoController');
const auth = require('../middlewares/auth');

router.post('/', auth, registrar);
router.get('/usuario/:usuarioId', auth, buscarPorUsuario);

module.exports = router;