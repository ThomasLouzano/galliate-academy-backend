const prisma = require('../prisma');

// GET /progresso?usuarioId=X
const listar = async (req, res) => {
  const { usuarioId } = req.query;
  if (!usuarioId) return res.status(400).json({ erro: 'usuarioId é obrigatório' });
  try {
    const progressos = await prisma.progresso.findMany({
      where: { usuarioId: Number(usuarioId) },
    });
    res.json(progressos);
  } catch (e) {
    console.error('[progressoController.listar]', e);
    res.status(500).json({ erro: 'Erro ao listar progresso' });
  }
};

// GET /progresso/resumo?usuarioId=X
// Returns { aulasConcluidas: [], porModulo: { id: {concluidas,total} }, porTrilha: { id: {concluidas,total} } }
const resumo = async (req, res) => {
  const { usuarioId } = req.query;
  if (!usuarioId) return res.status(400).json({ erro: 'usuarioId é obrigatório' });
  try {
    const [progressos, modulos] = await Promise.all([
      prisma.progresso.findMany({
        where: { usuarioId: Number(usuarioId), concluida: true },
        select: { aulaId: true },
      }),
      prisma.modulo.findMany({
        select: {
          id: true,
          trilhaId: true,
          secoes: { select: { aulas: { select: { id: true } } } },
        },
      }),
    ]);

    const aulasConcluidas = progressos.map(p => p.aulaId);
    const aulaSet = new Set(aulasConcluidas);
    const porModulo = {};
    const porTrilha = {};

    for (const mod of modulos) {
      const todasAulas = mod.secoes.flatMap(s => s.aulas.map(a => a.id));
      const concluidas = todasAulas.filter(id => aulaSet.has(id)).length;
      porModulo[mod.id] = { concluidas, total: todasAulas.length };

      if (mod.trilhaId) {
        if (!porTrilha[mod.trilhaId]) porTrilha[mod.trilhaId] = { concluidas: 0, total: 0 };
        porTrilha[mod.trilhaId].concluidas += concluidas;
        porTrilha[mod.trilhaId].total += todasAulas.length;
      }
    }

    res.json({ aulasConcluidas, porModulo, porTrilha });
  } catch (e) {
    console.error('[progressoController.resumo]', e);
    res.status(500).json({ erro: 'Erro ao calcular resumo de progresso' });
  }
};

// POST /progresso — idempotente: não concede XP duas vezes para a mesma aula
const registrar = async (req, res) => {
  const { usuarioId, aulaId, concluida = true } = req.body;
  if (!usuarioId || !aulaId) {
    return res.status(400).json({ erro: 'usuarioId e aulaId são obrigatórios' });
  }

  try {
    const existente = await prisma.progresso.findUnique({
      where: { usuarioId_aulaId: { usuarioId: Number(usuarioId), aulaId: Number(aulaId) } },
    });

    if (existente?.concluida) {
      return res.json({ progresso: existente, xpGanho: 0, moduloConcluido: false, xpBonus: 0 });
    }

    const progresso = await prisma.progresso.upsert({
      where: { usuarioId_aulaId: { usuarioId: Number(usuarioId), aulaId: Number(aulaId) } },
      create: {
        usuarioId: Number(usuarioId),
        aulaId: Number(aulaId),
        concluida: !!concluida,
        concluidoEm: concluida ? new Date() : null,
      },
      update: {
        concluida: !!concluida,
        concluidoEm: concluida ? new Date() : null,
      },
    });

    let xpGanho = 0;
    let moduloConcluido = false;
    let xpBonus = 0;

    if (concluida) {
      const aula = await prisma.aula.findUnique({
        where: { id: Number(aulaId) },
        include: { secao: { include: { modulo: true } } },
      });

      if (aula) {
        xpGanho = aula.xp ?? 10;
        await prisma.usuario.update({
          where: { id: Number(usuarioId) },
          data: { xp: { increment: xpGanho } },
        });

        const moduloId = aula.secao.moduloId;
        const todasAulas = await prisma.aula.findMany({
          where: { secao: { moduloId } },
          select: { id: true },
        });

        const concluidasCount = await prisma.progresso.count({
          where: {
            usuarioId: Number(usuarioId),
            aulaId: { in: todasAulas.map(a => a.id) },
            concluida: true,
          },
        });

        if (todasAulas.length > 0 && concluidasCount === todasAulas.length) {
          moduloConcluido = true;
          xpBonus = aula.secao.modulo?.xpBonus ?? 50;
          await prisma.usuario.update({
            where: { id: Number(usuarioId) },
            data: { xp: { increment: xpBonus } },
          });
        }
      }
    }

    res.json({ progresso, xpGanho, moduloConcluido, xpBonus });
  } catch (e) {
    console.error('[progressoController.registrar]', e);
    res.status(500).json({ erro: 'Erro ao registrar progresso' });
  }
};

module.exports = { listar, resumo, registrar };
