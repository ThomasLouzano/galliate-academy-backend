const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

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
    await transporter.sendMail({
      from: `"Galliate Academy" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Redefinição de senha — Galliate Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0D0D0D; color: #F0F0F0; padding: 32px; border-radius: 12px;">
          <div style="font-size: 24px; font-weight: 900; color: #F9A800; margin-bottom: 8px;">GALLIATE ACADEMY</div>
          <p style="color: #888; margin-bottom: 24px;">Recebemos uma solicitação para redefinir sua senha.</p>
          <a href="${link}" style="display: inline-block; background: #F9A800; color: #000; font-weight: 900; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 15px;">
            REDEFINIR SENHA
          </a>
          <p style="color: #555; font-size: 12px; margin-top: 24px;">
            Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este email.
          </p>
          <p style="color: #333; font-size: 11px;">Ou acesse: <a href="${link}" style="color: #F9A800;">${link}</a></p>
        </div>
      `,
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
