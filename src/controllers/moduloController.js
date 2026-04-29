const prisma = require('../prisma');

// Listar módulos (suporta ?trilhaId=X para filtrar)
const listar = async (req, res) => {
  const { trilhaId } = req.query;
  console.log('[moduloController.listar] trilhaId recebido:', trilhaId, '| tipo:', typeof trilhaId);
  try {
    const where = { ativo: true };
    if (trilhaId) where.trilhaId = Number(trilhaId);
    console.log('[moduloController.listar] where:', JSON.stringify(where));
    const modulos = await prisma.modulo.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
    });
    console.log('[moduloController.listar] módulos retornados:', modulos.length, modulos.map(m => ({ id: m.id, titulo: m.titulo, trilhaId: m.trilhaId })));
    res.json(modulos);
  } catch (erro) {
    console.error('[moduloController.listar] erro:', erro);
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
  const { titulo, descricao, trilhaId, xpBonus } = req.body;
  try {
    const modulo = await prisma.modulo.create({
      data: { titulo, descricao, trilhaId: trilhaId ? Number(trilhaId) : null, xpBonus: xpBonus ?? 50 },
    });
    res.status(201).json({ mensagem: 'Módulo criado com sucesso!', modulo });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar módulo' });
  }
};

// Atualizar módulo
const atualizar = async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, ativo, trilhaId, xpBonus } = req.body;
  try {
    const modulo = await prisma.modulo.update({
      where: { id: Number(id) },
      data: {
        titulo,
        descricao,
        ativo,
        ...(trilhaId !== undefined ? { trilhaId: trilhaId ? Number(trilhaId) : null } : {}),
        ...(xpBonus !== undefined ? { xpBonus: Number(xpBonus) } : {}),
      },
    });
    res.json({ mensagem: 'Módulo atualizado com sucesso!', modulo });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar módulo' });
  }
};

// Excluir módulo
const excluir = async (req, res) => {
  const { id } = req.params;
  try {
    const existe = await prisma.modulo.findUnique({ where: { id: Number(id) } });
    if (!existe) return res.status(404).json({ erro: 'Módulo não encontrado' });
    await prisma.modulo.delete({ where: { id: Number(id) } });
    res.json({ mensagem: 'Módulo excluído com sucesso' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao excluir módulo' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir };