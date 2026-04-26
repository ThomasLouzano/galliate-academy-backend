const prisma = require('../prisma');

// Listar seções de um módulo (GET /secoes?moduloId=X)
const listar = async (req, res) => {
  const { moduloId } = req.query;
  if (!moduloId) return res.status(400).json({ erro: 'moduloId é obrigatório' });
  try {
    const secoes = await prisma.secao.findMany({
      where: { moduloId: Number(moduloId) },
      orderBy: { ordem: 'asc' },
      include: { aulas: { orderBy: { ordem: 'asc' } } },
    });
    res.json(secoes);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao listar seções' });
  }
};

// Buscar seção por ID com aulas (GET /secoes/:id)
const buscarPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const secao = await prisma.secao.findUnique({
      where: { id: Number(id) },
      include: { aulas: { orderBy: { ordem: 'asc' } } },
    });
    if (!secao) return res.status(404).json({ erro: 'Seção não encontrada' });
    res.json(secao);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar seção' });
  }
};

// Criar seção (POST /secoes)
const criar = async (req, res) => {
  const { titulo, moduloId, ordem } = req.body;
  if (!titulo || !moduloId) return res.status(400).json({ erro: 'titulo e moduloId são obrigatórios' });
  try {
    const secao = await prisma.secao.create({
      data: { titulo, moduloId: Number(moduloId), ordem: ordem ?? 0 },
    });
    res.status(201).json({ mensagem: 'Seção criada com sucesso!', secao });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar seção' });
  }
};

// Atualizar seção (PUT /secoes/:id)
const atualizar = async (req, res) => {
  const { id } = req.params;
  const { titulo, ordem } = req.body;
  try {
    const secao = await prisma.secao.update({
      where: { id: Number(id) },
      data: { titulo, ordem },
    });
    res.json({ mensagem: 'Seção atualizada com sucesso!', secao });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar seção' });
  }
};

// Excluir seção (DELETE /secoes/:id) — cascade remove as aulas
const excluir = async (req, res) => {
  const { id } = req.params;
  try {
    const existe = await prisma.secao.findUnique({ where: { id: Number(id) } });
    if (!existe) return res.status(404).json({ erro: 'Seção não encontrada' });
    await prisma.secao.delete({ where: { id: Number(id) } });
    res.json({ mensagem: 'Seção excluída com sucesso' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao excluir seção' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
