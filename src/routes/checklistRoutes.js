const express = require('express');
const router = express.Router();
const { atualizarItem, removerItem } = require('../controllers/checklistController');
const auth = require('../middlewares/auth');

router.put('/:aulaId', auth, atualizarItem);
router.delete('/:aulaId', auth, removerItem);

module.exports = router;
