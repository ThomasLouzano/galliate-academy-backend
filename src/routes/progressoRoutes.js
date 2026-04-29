const express = require('express');
const router = express.Router();
const { listar, resumo, registrar } = require('../controllers/progressoController');
const auth = require('../middlewares/auth');

router.get('/resumo', auth, resumo); // deve vir antes de qualquer /:param
router.get('/', auth, listar);
router.post('/', auth, registrar);

module.exports = router;
