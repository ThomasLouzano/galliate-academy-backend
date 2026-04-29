const prisma = require('../prisma');

const listar = async (req, res) => {
  const { avaliacaoId } = req.query;
  if (!avaliacaoId) return res.status(400).json({ erro: 'avaliacaoId é obrigatório' });
  try {
    const questoes = await prisma.questao.findMany({
      where: { avaliacaoId: Number(avaliacaoId) },
      orderBy: { id: 'asc' },
    });
    res.json(questoes);
  } catch {
    res.status(500).json({ erro: 'Erro ao listar questões' });
  }
};

const criar = async (req, res) => {
  const { enunciado, tipo, alternativas, respostaCorreta, peso, avaliacaoId } = req.body;
  if (!enunciado || !avaliacaoId || respostaCorreta === undefined) {
    return res.status(400).json({ erro: 'enunciado, respostaCorreta e avaliacaoId são obrigatórios' });
  }
  try {
    const questao = await prisma.questao.create({
      data: {
        enunciado,
        tipo: tipo || 'multipla',
        alternativas: alternativas ? JSON.stringify(alternativas) : null,
        respostaCorreta: String(respostaCorreta),
        peso: peso !== undefined ? Number(peso) : 1,
        avaliacaoId: Number(avaliacaoId),
      },
    });
    res.status(201).json({ mensagem: 'Questão criada!', questao });
  } catch (e) {
    console.error('[questaoController.criar]', e);
    res.status(500).json({ erro: 'Erro ao criar questão' });
  }
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  const { enunciado, tipo, alternativas, respostaCorreta, peso } = req.body;
  try {
    const questao = await prisma.questao.update({
      where: { id: Number(id) },
      data: {
        ...(enunciado !== undefined ? { enunciado } : {}),
        ...(tipo !== undefined ? { tipo } : {}),
        ...(alternativas !== undefined ? { alternativas: JSON.stringify(alternativas) } : {}),
        ...(respostaCorreta !== undefined ? { respostaCorreta: String(respostaCorreta) } : {}),
        ...(peso !== undefined ? { peso: Number(peso) } : {}),
      },
    });
    res.json({ mensagem: 'Questão atualizada!', questao });
  } catch {
    res.status(500).json({ erro: 'Erro ao atualizar questão' });
  }
};

const excluir = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.questao.delete({ where: { id: Number(id) } });
    res.json({ mensagem: 'Questão excluída' });
  } catch {
    res.status(500).json({ erro: 'Erro ao excluir questão' });
  }
};

module.exports = { listar, criar, atualizar, excluir };
