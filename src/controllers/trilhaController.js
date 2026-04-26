const prisma = require('../prisma');

const listar = async (req, res) => {
  try {
    const trilhas = await prisma.trilha.findMany({
      orderBy: { ordem: 'asc' },
      include: { _count: { select: { modulos: true } } },
    });
    res.json(trilhas);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao listar trilhas' });
  }
};

const buscarPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const trilha = await prisma.trilha.findUnique({
      where: { id: Number(id) },
      include: { modulos: { where: { ativo: true }, orderBy: { criadoEm: 'asc' } } },
    });
    if (!trilha) return res.status(404).json({ erro: 'Trilha não encontrada' });
    res.json(trilha);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar trilha' });
  }
};

const criar = async (req, res) => {
  const { nome, descricao, icone } = req.body;
  if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
  try {
    const trilha = await prisma.trilha.create({
      data: { nome, descricao: descricao || null, icone: icone || '📋' },
    });
    res.status(201).json({ mensagem: 'Trilha criada com sucesso!', trilha });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar trilha' });
  }
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, icone, ordem } = req.body;
  try {
    const trilha = await prisma.trilha.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
        icone,
        ...(ordem !== undefined && { ordem: Number(ordem) }),
      },
    });
    res.json({ mensagem: 'Trilha atualizada com sucesso!', trilha });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar trilha' });
  }
};

const excluir = async (req, res) => {
  const { id } = req.params;
  try {
    const existe = await prisma.trilha.findUnique({ where: { id: Number(id) } });
    if (!existe) return res.status(404).json({ erro: 'Trilha não encontrada' });
    await prisma.trilha.delete({ where: { id: Number(id) } });
    res.json({ mensagem: 'Trilha excluída com sucesso' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao excluir trilha' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
