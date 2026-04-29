const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log('[forgotPassword] email recebido:', email);
  if (!email) return res.status(400).json({ erro: 'Email é obrigatório' });

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    // Resposta genérica para não expor se o email existe
    if (!usuario) {
      console.log('[forgotPassword] email não encontrado no banco, retornando resposta genérica');
      return res.json({ mensagem: 'Se o email estiver cadastrado, você receberá um link em breve.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiracao = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.usuario.update({
      where: { email },
      data: { resetToken: token, resetTokenExp: expiracao },
    });

    const link = `https://galliate-academy.netlify.app/reset-password?token=${token}`;

    console.log('[forgotPassword] tentando enviar email para:', email);
    await resend.emails.send({
      from: 'Galliate Academy <onboarding@resend.dev>',
      to: email,
      subject: 'Redefinição de senha - Galliate Academy',
      html: `<p>Clique no link para redefinir sua senha: <a href="${link}">${link}</a></p>`,
    });

    console.log('[forgotPassword] email enviado com sucesso para:', email);
    res.json({ mensagem: 'Se o email estiver cadastrado, você receberá um link em breve.' });
  } catch (erro) {
    console.error('[forgotPassword] erro ao enviar email:', erro);
    res.status(500).json({ erro: 'Erro ao processar solicitação' });
  }
};

const resetPassword = async (req, res) => {
  const { token, senha } = req.body;
  if (!token || !senha) return res.status(400).json({ erro: 'Token e nova senha são obrigatórios' });
  if (senha.length < 6) return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres' });

  try {
    const usuario = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gt: new Date() },
      },
    });

    if (!usuario) return res.status(400).json({ erro: 'Token inválido ou expirado' });

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senha: senhaCriptografada,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    res.json({ mensagem: 'Senha redefinida com sucesso!' });
  } catch (erro) {
    console.error('[resetPassword] erro:', erro);
    res.status(500).json({ erro: 'Erro ao redefinir senha' });
  }
};

module.exports = { forgotPassword, resetPassword };
