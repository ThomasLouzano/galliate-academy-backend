const prisma = require('../prisma');

// Registrar progresso
const registrar = async (req, res) => {
  const { usuarioId, moduloId } = req.body;
  try {
    // Verifica se já existe
    const existe = await prisma.progresso.findFirst({
      where: { usuarioId: Number(usuarioId), moduloId: Number(moduloId) }
    });

    if (existe) {
      // Atualiza para concluído
      const progresso = await prisma.progresso.update({
        where: { id: existe.id },
        data: { concluido: true }
      });
      return res.json({ mensagem: 'Módulo marcado como concluído!', progresso });
    }

    // Cria novo progresso
    const progresso = await prisma.progresso.create({
      data: {
        usuarioId: Number(usuarioId),
        moduloId: Number(moduloId),
        concluido: true
      }
    });
    res.status(201).json({ mensagem: 'Progresso registrado!', progresso });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao registrar progresso' });
  }
};

// Buscar progresso de um usuário
const buscarPorUsuario = async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const progressos = await prisma.progresso.findMany({
      where: { usuarioId: Number(usuarioId) }
    });

    // Busca total de módulos ativos
    const totalModulos = await prisma.modulo.count({ where: { ativo: true } });
    const concluidos = progressos.filter(p => p.concluido).length;
    const percentual = totalModulos > 0 ? Math.round((concluidos / totalModulos) * 100) : 0;

    res.json({
      progressos,
      resumo: {
        totalModulos,
        concluidos,
        percentual: `${percentual}%`
      }
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar progresso' });
  }
};

module.exports = { registrar, buscarPorUsuario };