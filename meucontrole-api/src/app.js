import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import fastifyRateLimit from '@fastify/rate-limit';

import { env } from './config/env.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/user.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.isDevelopment ? 'info' : 'warn',
      transport: env.isDevelopment
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
        : undefined,
    },
  });

  // ─── Segurança ──────────────────────────────────────────────
  await app.register(fastifyHelmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  await app.register(fastifyCors, {
    // Em desenvolvimento: aceita qualquer localhost (qualquer porta) para
    // evitar conflito quando o Vite sobe em porta diferente de 5173.
    // Em produção: apenas FRONTEND_URL exato.
    origin: (origin, cb) => {
      if (env.isDevelopment) {
        if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
          return cb(null, true);
        }
      }
      if (origin === env.FRONTEND_URL) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.register(fastifyRateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Muitas requisições. Tente novamente em instantes.',
    }),
  });

  // ─── Cookies ────────────────────────────────────────────────
  await app.register(fastifyCookie, {
    secret: env.COOKIE_SECRET,
    hook: 'onRequest',
  });

  // ─── JWT ────────────────────────────────────────────────────
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
  });

  // ─── Health check ────────────────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // ─── Rotas ───────────────────────────────────────────────────
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(userRoutes, { prefix: '/user' });

  // ─── Handler de erros global ─────────────────────────────────
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: 'Dados inválidos na requisição.',
        details: error.validation,
      });
    }

    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name,
        message: error.message,
      });
    }

    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: env.isDevelopment ? error.message : 'Erro interno do servidor.',
    });
  });

  return app;
}
