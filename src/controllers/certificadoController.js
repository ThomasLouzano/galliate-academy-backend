const prisma = require('../prisma');
const { randomUUID } = require('crypto');

// Converte string de duração ("3min 45s", "1h 20min", "58s") para segundos
const parseDuracaoSegundos = (str = '') => {
  if (!str) return 0;
  let total = 0;
  const h = str.match(/(\d+)\s*h/i);
  const m = str.match(/(\d+)\s*min/i);
  const s = str.match(/(\d+)\s*s\b/i);
  if (h) total += Number(h[1]) * 3600;
  if (m) total += Number(m[1]) * 60;
  if (s) total += Number(s[1]);
  return total;
};

const buscarCompleto = async (codigoValidacao) => {
  const cert = await prisma.certificado.findUnique({ where: { codigoValidacao } });
  if (!cert) return null;

  const [usuario, modulo, secoes] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: cert.usuarioId },
      select: { id: true, nome: true, cargo: true },
    }),
    prisma.modulo.findUnique({ where: { id: cert.moduloId } }),
    prisma.secao.findMany({
      where: { moduloId: cert.moduloId },
      include: {
        aulas: {
          orderBy: { ordem: 'asc' },
          select: { id: true, titulo: true, duracao: true },
        },
      },
      orderBy: { ordem: 'asc' },
    }),
  ]);

  return { ...cert, usuario, modulo, secoes };
};

// GET /certificados?usuarioId=:id (auth)
const listar = async (req, res) => {
  const { usuarioId } = req.query;
  try {
    const where = usuarioId ? { usuarioId: Number(usuarioId) } : {};
    const certs = await prisma.certificado.findMany({ where, orderBy: { emitidoEm: 'desc' } });
    if (!certs.length) return res.json([]);

    const moduloIds = [...new Set(certs.map(c => c.moduloId))];
    const modulos = await prisma.modulo.findMany({ where: { id: { in: moduloIds } } });
    const moduloMap = Object.fromEntries(modulos.map(m => [m.id, m]));

    res.json(certs.map(cert => ({ ...cert, modulo: moduloMap[cert.moduloId] ?? null })));
  } catch (e) {
    console.error('[certificadoController.listar]', e);
    res.status(500).json({ erro: 'Erro ao listar certificados' });
  }
};

// POST /certificados (auth)
const gerar = async (req, res) => {
  const { usuarioId, moduloId, avaliacaoId, nota } = req.body;
  if (!usuarioId || !moduloId) {
    return res.status(400).json({ erro: 'usuarioId e moduloId são obrigatórios' });
  }

  try {
    // Se já existe certificado para esse usuário+módulo, retorna o existente
    const existente = await prisma.certificado.findFirst({
      where: { usuarioId: Number(usuarioId), moduloId: Number(moduloId) },
    });
    if (existente) {
      return res.json(await buscarCompleto(existente.codigoValidacao));
    }

    // Calcula carga horária somando duração de todas as aulas do módulo
    const secoes = await prisma.secao.findMany({
      where: { moduloId: Number(moduloId) },
      include: { aulas: { select: { duracao: true } } },
    });
    let totalSegundos = 0;
    for (const secao of secoes) {
      for (const aula of secao.aulas) {
        totalSegundos += parseDuracaoSegundos(aula.duracao);
      }
    }
    // Mínimo de 1 hora; arredonda para 1 casa decimal
    const cargaHoraria = totalSegundos > 0
      ? Math.round((totalSegundos / 3600) * 10) / 10
      : 1;

    const cert = await prisma.certificado.create({
      data: {
        usuarioId: Number(usuarioId),
        moduloId: Number(moduloId),
        avaliacaoId: avaliacaoId ? Number(avaliacaoId) : null,
        nota: nota !== undefined && nota !== null ? Number(nota) : null,
        cargaHoraria,
        codigoValidacao: randomUUID(),
      },
    });

    res.status(201).json(await buscarCompleto(cert.codigoValidacao));
  } catch (e) {
    console.error('[certificadoController.gerar]', e);
    res.status(500).json({ erro: 'Erro ao gerar certificado' });
  }
};

// GET /certificados/:codigo (público — sem auth)
const validar = async (req, res) => {
  const { codigo } = req.params;
  try {
    const completo = await buscarCompleto(codigo);
    if (!completo) return res.status(404).json({ erro: 'Certificado não encontrado' });
    res.json(completo);
  } catch (e) {
    console.error('[certificadoController.validar]', e);
    res.status(500).json({ erro: 'Erro ao buscar certificado' });
  }
};

module.exports = { listar, gerar, validar };
