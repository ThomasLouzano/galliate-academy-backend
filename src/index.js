require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const usuarioRoutes = require('./routes/usuarioRoutes');
const moduloRoutes = require('./routes/moduloRoutes');
const progressoRoutes = require('./routes/progressoRoutes');
const secaoRoutes = require('./routes/secaoRoutes');
const aulaRoutes = require('./routes/aulaRoutes');
const trilhaRoutes = require('./routes/trilhaRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const questaoRoutes = require('./routes/questaoRoutes');
const certificadoRoutes = require('./routes/certificadoRoutes');

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rotas
app.use('/usuarios', usuarioRoutes);
app.use('/modulos', moduloRoutes);
app.use('/progresso', progressoRoutes);
app.use('/secoes', secaoRoutes);
app.use('/aulas', aulaRoutes);
app.use('/trilhas', trilhaRoutes);
app.use('/avaliacoes', avaliacaoRoutes);
app.use('/questoes', questaoRoutes);
app.use('/certificados', certificadoRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Galliate Academy API funcionando! 🍔' });
});

// Porta do servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});