const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cadastrar, login, listar, excluir, adicionarXP, atualizar, uploadFoto } = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');

const fotosDir = path.join(__dirname, '..', '..', 'uploads', 'fotos');
if (!fs.existsSync(fotosDir)) fs.mkdirSync(fotosDir, { recursive: true });

const fotoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, fotosDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `foto-${req.params.id}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) cb(null, true);
    else cb(new Error('Apenas imagens JPG, PNG e WebP são permitidas'));
  },
});

router.post('/cadastrar', auth, cadastrar);
router.post('/login', login);
router.get('/', auth, listar);
router.put('/:id', auth, atualizar);
router.post('/:id/foto', auth, fotoUpload.single('foto'), uploadFoto);
router.delete('/:id', auth, excluir);
router.post('/:id/xp', auth, adicionarXP);

module.exports = router;
