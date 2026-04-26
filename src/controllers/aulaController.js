const prisma = require('../prisma');

// Listar aulas de uma seção (GET /aulas?secaoId=X)
const listar = async (req, res) => {
  const { secaoId } = req.query;
  if (!secaoId) return res.status(400).json({ erro: 'secaoId é obrigatório' });
  try {
    const aulas = await prisma.aula.findMany({
      where: { secaoId: Number(secaoId) },
      orderBy: { ordem: 'asc' },
    });
    res.json(aulas);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao listar aulas' });
  }
};

// Buscar aula por ID (GET /aulas/:id)
const buscarPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const aula = await prisma.aula.findUnique({ where: { id: Number(id) } });
    if (!aula) return res.status(404).json({ erro: 'Aula não encontrada' });
    res.json(aula);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar aula' });
  }
};

// Criar aula (POST /aulas)
const criar = async (req, res) => {
  const { titulo, descricao, videoUrl, ordem, duracao, checklist, secaoId } = req.body;
  if (!titulo || !secaoId) return res.status(400).json({ erro: 'titulo e secaoId são obrigatórios' });
  try {
    const aula = await prisma.aula.create({
      data: {
        titulo,
        descricao: descricao || null,
        videoUrl: videoUrl || null,
        duracao: duracao || null,
        checklist: checklist || null,
        ordem: ordem ?? 0,
        secaoId: Number(secaoId),
      },
    });
    res.status(201).json({ mensagem: 'Aula criada com sucesso!', aula });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar aula' });
  }
};

// Atualizar aula (PUT /aulas/:id)
const atualizar = async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, videoUrl, ordem, duracao, checklist } = req.body;
  try {
    const aula = await prisma.aula.update({
      where: { id: Number(id) },
      data: { titulo, descricao, videoUrl, ordem, duracao, checklist },
    });
    res.json({ mensagem: 'Aula atualizada com sucesso!', aula });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar aula' });
  }
};

// Excluir aula (DELETE /aulas/:id)
const excluir = async (req, res) => {
  const { id } = req.params;
  try {
    const existe = await prisma.aula.findUnique({ where: { id: Number(id) } });
    if (!existe) return res.status(404).json({ erro: 'Aula não encontrada' });
    await prisma.aula.delete({ where: { id: Number(id) } });
    res.json({ mensagem: 'Aula excluída com sucesso' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao excluir aula' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
