require('dotenv').config();

const express = require('express');
const cors = require('cors');
const usuarioRoutes = require('./routes/usuarioRoutes');
const moduloRoutes = require('./routes/moduloRoutes');
const progressoRoutes = require('./routes/progressoRoutes');
const secaoRoutes = require('./routes/secaoRoutes');
const aulaRoutes = require('./routes/aulaRoutes');
const trilhaRoutes = require('./routes/trilhaRoutes');

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Rotas
app.use('/usuarios', usuarioRoutes);
app.use('/modulos', moduloRoutes);
app.use('/progresso', progressoRoutes);
app.use('/secoes', secaoRoutes);
app.use('/aulas', aulaRoutes);
app.use('/trilhas', trilhaRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Galliate Academy API funcionando! 🍔' });
});

// Porta do servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});