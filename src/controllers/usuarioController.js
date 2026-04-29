const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Cadastrar usuário
const cadastrar = async (req, res) => {
  const { nome, email, senha, cargo, telefone } = req.body;
  console.log('[cadastrar] body recebido:', { nome, email, cargo, telefone, senha: senha ? '***' : undefined });

  try {
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaCriptografada, cargo, telefone: telefone || null }
    });

    console.log('[cadastrar] usuário criado:', { id: usuario.id, nome: usuario.nome, telefone: usuario.telefone });
    res.status(201).json({ mensagem: 'Usuário criado com sucesso!', id: usuario.id });
  } catch (erro) {
    console.error('[cadastrar] erro:', erro);
    res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
  }
};

// Login
const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(400).json({ erro: 'Email ou senha incorretos' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(400).json({ erro: 'Email ou senha incorretos' });
    }

    const token = jwt.sign(
      { id: usuario.id, cargo: usuario.cargo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, id: usuario.id, nome: usuario.nome, cargo: usuario.cargo, xp: usuario.xp, fotoUrl: usuario.fotoUrl ?? null });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao fazer login', detalhe: erro.message });
  }
};

// Listar todos os usuários (sem expor senha)
const listar = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { ativo: true },
      orderBy: { criadoEm: 'desc' },
      select: { id: true, nome: true, email: true, cargo: true, telefone: true, ativo: true, xp: true, fotoUrl: true, criadoEm: true },
    });
    console.log('[listar] retornando', usuarios.length, 'usuários, primeiro:', usuarios[0] ?? null);
    res.json(usuarios);
  } catch (erro) {
    console.error('[listar] erro:', erro);
    res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};

// Excluir usuário (soft delete)
const excluir = async (req, res) => {
  const { id } = req.params;
  try {
    const existe = await prisma.usuario.findUnique({ where: { id: Number(id) } });
    if (!existe) return res.status(404).json({ erro: 'Usuário não encontrado' });

    await prisma.usuario.update({
      where: { id: Number(id) },
      data: { ativo: false },
    });
    res.json({ mensagem: 'Usuário removido com sucesso' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao excluir usuário' });
  }
};

// Adicionar XP ao usuário (POST /usuarios/:id/xp)
const adicionarXP = async (req, res) => {
  const { id } = req.params;
  const { ganho } = req.body;
  if (!ganho || Number(ganho) <= 0) return res.status(400).json({ erro: 'Ganho de XP inválido' });
  try {
    const usuario = await prisma.usuario.update({
      where: { id: Number(id) },
      data: { xp: { increment: Number(ganho) } },
    });
    res.json({ xp: usuario.xp });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar XP' });
  }
};

// Atualizar nome, cargo e/ou senha
const atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, cargo, senha } = req.body;

  try {
    const existe = await prisma.usuario.findUnique({ where: { id: Number(id) } });
    if (!existe) return res.status(404).json({ erro: 'Usuário não encontrado' });

    const data = {};
    if (nome !== undefined) data.nome = nome;
    if (cargo !== undefined) data.cargo = cargo;
    if (senha) data.senha = await bcrypt.hash(senha, 10);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    }

    const usuario = await prisma.usuario.update({
      where: { id: Number(id) },
      data,
    });

    res.json({ mensagem: 'Usuário atualizado com sucesso', id: usuario.id });
  } catch (erro) {
    console.error('[atualizar] erro:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar usuário' });
  }
};

// Upload de foto de perfil (POST /usuarios/:id/foto)
const uploadFoto = async (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ erro: 'Nenhuma imagem enviada' });
  try {
    const fotoUrl = `/uploads/fotos/${req.file.filename}`;
    await prisma.usuario.update({
      where: { id: Number(id) },
      data: { fotoUrl },
    });
    res.json({ fotoUrl });
  } catch (erro) {
    console.error('[uploadFoto] erro:', erro);
    res.status(500).json({ erro: 'Erro ao salvar foto' });
  }
};

module.exports = { cadastrar, login, listar, excluir, adicionarXP, atualizar, uploadFoto };
