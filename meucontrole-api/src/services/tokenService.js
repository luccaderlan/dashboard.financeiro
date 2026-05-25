import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms

/**
 * Gera o access token JWT (curta duração — 15min).
 */
export function generateAccessToken(app, payload) {
  return app.jwt.sign(payload, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
}

/**
 * Gera e persiste um refresh token (longa duração — 7 dias).
 */
export async function generateRefreshToken(userId) {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  // Gera token com jwt puro (secret diferente do access token)
  const token = jwt.sign(
    { sub: userId, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

/**
 * Valida e rotaciona o refresh token.
 * Implementa refresh token rotation — invalida o token usado e emite um novo.
 * Se um token já usado for apresentado, todos os tokens do usuário são invalidados
 * (sinal de possível roubo de token).
 */
export async function rotateRefreshToken(token) {
  let payload;

  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch {
    throw Object.assign(new Error('Refresh token inválido ou expirado.'), { statusCode: 401 });
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });

  if (!stored) {
    // Token não existe — pode ter sido usado antes (token reuse attack)
    // Invalidar TODOS os tokens do usuário por segurança
    await prisma.refreshToken.deleteMany({ where: { userId: payload.sub } });
    throw Object.assign(new Error('Refresh token inválido. Faça login novamente.'), { statusCode: 401 });
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token } });
    throw Object.assign(new Error('Sessão expirada. Faça login novamente.'), { statusCode: 401 });
  }

  // Deletar token atual (rotation)
  await prisma.refreshToken.delete({ where: { token } });

  return stored.userId;
}

/**
 * Invalida todos os refresh tokens de um usuário (logout).
 */
export async function revokeAllRefreshTokens(userId) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

/**
 * Remove refresh tokens expirados do banco (manutenção).
 */
export async function cleanupExpiredTokens() {
  await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}
