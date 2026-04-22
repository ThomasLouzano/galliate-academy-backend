const prisma = require('../prisma');

// Listar todos os módulos
const listar = async (req, res) => {
  try {
    const modulos = await prisma.modulo.findMany({
      where: { ativo: true },
      orderBy: { criadoEm: 'desc' }
    });
    res.json(modulos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao listar módulos' });
  }
};

// Buscar módulo por ID
const buscarPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const modulo = await prisma.modulo.findUnique({
      where: { id: Number(id) }
    });
    if (!modulo) {
      return res.status(404).json({ erro: 'Módulo não encontrado' });
    }
    res.json(modulo);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar módulo' });
  }
};

// Criar módulo
const criar = async (req, res) => {
  const { titulo, descricao } = req.body;
  try {
    const modulo = await prisma.modulo.create({
      data: { titulo, descricao }
    });
    res.status(201).json({ mensagem: 'Módulo criado com sucesso!', modulo });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar módulo' });
  }
};

// Atualizar módulo
const atualizar = async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, ativo } = req.body;
  try {
    const modulo = await prisma.modulo.update({
      where: { id: Number(id) },
      data: { titulo, descricao, ativo }
    });
    res.json({ mensagem: 'Módulo atualizado com sucesso!', modulo });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar módulo' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar };