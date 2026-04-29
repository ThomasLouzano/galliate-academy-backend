const express = require('express');
const router = express.Router();
const { listar, buscarPorId, criar, atualizar, excluir, uploadApostila } = require('../controllers/aulaController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/', auth, listar);
router.get('/:id', auth, buscarPorId);
router.post('/', auth, criar);
router.put('/:id', auth, atualizar);
router.delete('/:id', auth, excluir);
router.post('/:id/apostila', auth, upload.single('arquivo'), uploadApostila);

module.exports = router;
