const prisma = require('../prisma');

const listar = async (req, res) => {
  try {
    const { moduloId } = req.query;
    const where = moduloId ? { moduloId: Number(moduloId) } : {};
    const avaliacoes = await prisma.avaliacao.findMany({
      where,
      include: { questoes: { orderBy: { id: 'asc' } } },
      orderBy: { criadoEm: 'desc' },
    });
    res.json(avaliacoes);
  } catch {
    res.status(500).json({ erro: 'Erro ao listar avaliações' });
  }
};

const buscarPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: Number(id) },
      include: { questoes: { orderBy: { id: 'asc' } } },
    });
    if (!avaliacao) return res.status(404).json({ erro: 'Avaliação não encontrada' });
    res.json(avaliacao);
  } catch {
    res.status(500).json({ erro: 'Erro ao buscar avaliação' });
  }
};

const criar = async (req, res) => {
  const { titulo, moduloId, notaMinima, tentativas, xpBonus } = req.body;
  if (!titulo) return res.status(400).json({ erro: 'Título é obrigatório' });
  try {
    const avaliacao = await prisma.avaliacao.create({
      data: {
        titulo,
        moduloId: moduloId ? Number(moduloId) : null,
        notaMinima: notaMinima !== undefined ? Number(notaMinima) : 70,
        tentativas: tentativas !== undefined ? Number(tentativas) : 3,
        xpBonus: xpBonus !== undefined ? Number(xpBonus) : 100,
      },
    });
    res.status(201).json({ mensagem: 'Avaliação criada!', avaliacao });
  } catch {
    res.status(500).json({ erro: 'Erro ao criar avaliação' });
  }
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  const { titulo, moduloId, notaMinima, tentativas, xpBonus } = req.body;
  try {
    const avaliacao = await prisma.avaliacao.update({
      where: { id: Number(id) },
      data: {
        ...(titulo !== undefined ? { titulo } : {}),
        ...(moduloId !== undefined ? { moduloId: moduloId ? Number(moduloId) : null } : {}),
        ...(notaMinima !== undefined ? { notaMinima: Number(notaMinima) } : {}),
        ...(tentativas !== undefined ? { tentativas: Number(tentativas) } : {}),
        ...(xpBonus !== undefined ? { xpBonus: Number(xpBonus) } : {}),
      },
    });
    res.json({ mensagem: 'Avaliação atualizada!', avaliacao });
  } catch {
    res.status(500).json({ erro: 'Erro ao atualizar avaliação' });
  }
};

const excluir = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.avaliacao.delete({ where: { id: Number(id) } });
    res.json({ mensagem: 'Avaliação excluída' });
  } catch {
    res.status(500).json({ erro: 'Erro ao excluir avaliação' });
  }
};

// POST /avaliacoes/:id/submeter — body: { respostas: { [questaoId]: valor } }
const submeter = async (req, res) => {
  const { id } = req.params;
  const { respostas = {} } = req.body;
  try {
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: Number(id) },
      include: { questoes: true },
    });
    if (!avaliacao) return res.status(404).json({ erro: 'Avaliação não encontrada' });

    let totalPeso = 0;
    let acertouPeso = 0;
    const resultado = avaliacao.questoes.map(q => {
      totalPeso += q.peso;
      const resposta = respostas[q.id];
      const acertou = String(resposta) === String(q.respostaCorreta);
      if (acertou) acertouPeso += q.peso;
      return { questaoId: q.id, acertou };
    });

    const nota = totalPeso > 0 ? Math.round((acertouPeso / totalPeso) * 100) : 0;
    const aprovado = nota >= avaliacao.notaMinima;

    res.json({ nota, aprovado, notaMinima: avaliacao.notaMinima, xpBonus: avaliacao.xpBonus, resultado });
  } catch {
    res.status(500).json({ erro: 'Erro ao submeter avaliação' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir, submeter };
