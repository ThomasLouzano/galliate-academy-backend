const prisma = require('../prisma');

const atualizarItem = async (req, res) => {
  const { aulaId } = req.params;
  const { index, texto } = req.body;

  if (typeof index !== 'number' || !texto?.trim()) {
    return res.status(400).json({ erro: 'index e texto são obrigatórios' });
  }

  try {
    const aula = await prisma.aula.findUnique({ where: { id: Number(aulaId) } });
    if (!aula) return res.status(404).json({ erro: 'Aula não encontrada' });

    let items = [];
    try { items = aula.checklist ? JSON.parse(aula.checklist) : []; } catch { items = []; }

    if (index < 0 || index >= items.length) {
      return res.status(400).json({ erro: 'Índice inválido' });
    }

    items[index] = texto.trim();

    await prisma.aula.update({
      where: { id: Number(aulaId) },
      data: { checklist: JSON.stringify(items) },
    });

    res.json({ checklist: items });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

module.exports = { atualizarItem };
