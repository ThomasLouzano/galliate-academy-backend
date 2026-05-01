const express = require('express');
const router = express.Router();
const { atualizarItem } = require('../controllers/checklistController');
const auth = require('../middlewares/auth');

router.put('/:aulaId', auth, atualizarItem);

module.exports = router;
