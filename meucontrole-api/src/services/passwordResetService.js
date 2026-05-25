import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { sendPasswordResetEmail } from './emailService.js';
import { env } from '../config/env.js';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora
const SALT_ROUNDS = 12;

/**
 * Gera um token de reset e envia o e-mail.
 * Não revela se o e-mail existe ou não (segurança contra enumeração).
 */
export async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Sempre retorna sucesso — não revela se o e-mail existe
  if (!user) return;

  // Invalida resets anteriores do usuário
  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

  // Gera token seguro
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordReset.create({
    data: { token, userId: user.id, expiresAt },
  });

  const resetUrl = `${env.FRONTEND_URL}/#/reset-password?token=${token}`;

  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl,
  });
}

/**
 * Valida o token e redefine a senha.
 */
export async function resetPassword(token, newPassword) {
  const record = await prisma.passwordReset.findUnique({ where: { token } });

  if (!record) {
    throw Object.assign(
      new Error('Link inválido ou expirado. Solicite um novo.'),
      { statusCode: 400 }
    );
  }

  if (record.usedAt) {
    throw Object.assign(
      new Error('Este link já foi utilizado. Solicite um novo.'),
      { statusCode: 400 }
    );
  }

  if (record.expiresAt < new Date()) {
    await prisma.passwordReset.delete({ where: { token } });
    throw Object.assign(
      new Error('Link expirado. Solicite um novo.'),
      { statusCode: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Atualiza a senha e marca o token como usado — tudo em uma transação
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordReset.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
    // Revoga todos os refresh tokens (sessões ativas) por segurança
    prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
  ]);
}
