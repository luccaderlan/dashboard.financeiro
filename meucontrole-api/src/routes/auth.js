import { z } from 'zod';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';
import { registerUser, authenticateUser } from '../services/authService.js';
import {
  generateAccessToken,
  generateRefreshToken,
  rotateRefreshToken,
  revokeAllRefreshTokens,
} from '../services/tokenService.js';
import { requestPasswordReset, resetPassword } from '../services/passwordResetService.js';
import { env } from '../config/env.js';

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido.').toLowerCase().trim(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token obrigatório.'),
  password: z
    .string()
    .min(8, 'Senha deve ter ao menos 8 caracteres.')
    .max(72, 'Senha muito longa.')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter ao menos uma letra maiúscula, uma minúscula e um número.'
    ),
});

const COOKIE_NAME = 'meucontrole_refresh';

const COOKIE_OPTIONS = {
  httpOnly: true,
  // Em produção, SameSite=None + Secure é obrigatório para cookies cross-origin
  // (frontend em netlify.app, backend em railway.app são origens diferentes).
  // SameSite=Strict bloquearia o cookie na requisição de refresh após reload.
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 dias em segundos
};

export async function authRoutes(app) {
  // Rate limit mais restrito para rotas de auth
  app.register(async (authApp) => {
    authApp.addHook('onRequest', async (request, reply) => {
      // Rate limit específico: 10 tentativas por minuto por IP
    });

    // ─── POST /auth/register ────────────────────────────────────
    authApp.post('/register', async (request, reply) => {
      const result = registerSchema.safeParse(request.body);
      if (!result.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: result.error.issues[0].message,
        });
      }

      const user = await registerUser(result.data);
      const accessToken = generateAccessToken(app, {
        sub: user.id,
        email: user.email,
        plan: user.plan,
      });
      const refreshToken = await generateRefreshToken(user.id);

      reply.setCookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

      return reply.status(201).send({
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
        },
      });
    });

    // ─── POST /auth/login ───────────────────────────────────────
    authApp.post('/login', async (request, reply) => {
      const result = loginSchema.safeParse(request.body);
      if (!result.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: result.error.issues[0].message,
        });
      }

      const user = await authenticateUser(result.data);
      const accessToken = generateAccessToken(app, {
        sub: user.id,
        email: user.email,
        plan: user.plan,
      });
      const refreshToken = await generateRefreshToken(user.id);

      reply.setCookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

      return reply.send({
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
        },
      });
    });

    // ─── POST /auth/refresh ─────────────────────────────────────
    authApp.post('/refresh', async (request, reply) => {
      const token = request.cookies?.[COOKIE_NAME];

      if (!token) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Sessão não encontrada. Faça login novamente.',
        });
      }

      // rotateRefreshToken valida, invalida o token atual e retorna o userId
      const userId = await rotateRefreshToken(token);

      const newRefreshToken = await generateRefreshToken(userId);
      const newAccessToken = generateAccessToken(app, { sub: userId });

      reply.setCookie(COOKIE_NAME, newRefreshToken, COOKIE_OPTIONS);

      return reply.send({ accessToken: newAccessToken });
    });

    // ─── POST /auth/logout ──────────────────────────────────────
    authApp.post('/logout', async (request, reply) => {
      const token = request.cookies?.[COOKIE_NAME];

      if (token) {
        // Tenta revogar — não lança erro se o token não existir
        try {
          // Extrair userId do token para revogar todos os seus tokens
          const { prisma } = await import('../config/prisma.js');
          const stored = await prisma.refreshToken.findUnique({ where: { token } });
          if (stored) {
            await revokeAllRefreshTokens(stored.userId);
          }
        } catch {
          // Silencioso — logout sempre deve ter sucesso para o cliente
        }
      }

      reply.clearCookie(COOKIE_NAME, { path: '/' });
      return reply.send({ message: 'Logout realizado com sucesso.' });
    });

    // ─── POST /auth/forgot-password ─────────────────────────────
    authApp.post('/forgot-password', async (request, reply) => {
      const result = forgotPasswordSchema.safeParse(request.body);
      if (!result.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: result.error.issues[0].message,
        });
      }

      // Não revela se o e-mail existe — sempre retorna 200
      await requestPasswordReset(result.data.email);

      return reply.send({
        message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.',
      });
    });

    // ─── POST /auth/reset-password ──────────────────────────────
    authApp.post('/reset-password', async (request, reply) => {
      const result = resetPasswordSchema.safeParse(request.body);
      if (!result.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: result.error.issues[0].message,
        });
      }

      await resetPassword(result.data.token, result.data.password);

      return reply.send({ message: 'Senha redefinida com sucesso. Faça login novamente.' });
    });
  });
}
