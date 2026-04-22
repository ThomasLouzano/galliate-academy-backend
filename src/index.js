require('dotenv').config();

const express = require('express');
const cors = require('cors');
const usuarioRoutes = require('./routes/usuarioRoutes');
const moduloRoutes = require('./routes/moduloRoutes');
const progressoRoutes = require('./routes/progressoRoutes');

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Rotas
app.use('/usuarios', usuarioRoutes);
app.use('/modulos', moduloRoutes);
app.use('/progresso', progressoRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Galliate Academy API funcionando! 🍔' });
});

// Porta do servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});