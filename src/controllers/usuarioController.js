const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Cadastrar usuário
const cadastrar = async (req, res) => {
  const { nome, email, senha, cargo } = req.body;

  try {
    // Verifica se email já existe
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Cria o usuário
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaCriptografada, cargo }
    });

    res.status(201).json({ mensagem: 'Usuário criado com sucesso!', id: usuario.id });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
  }
};

// Login
const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Busca o usuário
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(400).json({ erro: 'Email ou senha incorretos' });
    }

    // Verifica a senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(400).json({ erro: 'Email ou senha incorretos' });
    }

   // Gera o token
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const token = jwt.sign(
    { id: usuario.id, cargo: usuario.cargo },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

    res.json({ token, nome: usuario.nome, cargo: usuario.cargo });
} catch (erro) {
  console.error(erro);
  res.status(500).json({ erro: 'Erro ao fazer login', detalhe: erro.message });
}
};

module.exports = { cadastrar, login };