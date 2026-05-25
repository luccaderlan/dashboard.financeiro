import { authenticate } from '../middlewares/authenticate.js';
import { getUserById, deleteUser } from '../services/authService.js';
import { getUserData, updateUserData, migrateLocalData } from '../services/userDataService.js';
import { revokeAllRefreshTokens } from '../services/tokenService.js';
import { z } from 'zod';

const userDataPatchSchema = z.object({
  appState:    z.record(z.unknown()).optional().nullable(),
  goals:       z.array(z.unknown()).optional().nullable(),
  categories:  z.array(z.unknown()).optional().nullable(),
  recurrences: z.array(z.unknown()).optional().nullable(),
  budgets:     z.array(z.unknown()).optional().nullable(),
  welcomed:    z.string().optional().nullable(),
}).strict();

const migrateSchema = z.object({
  appState:    z.record(z.unknown()).optional().nullable(),
  goals:       z.array(z.unknown()).optional().nullable(),
  categories:  z.array(z.unknown()).optional().nullable(),
  recurrences: z.array(z.unknown()).optional().nullable(),
  budgets:     z.array(z.unknown()).optional().nullable(),
  welcomed:    z.string().optional().nullable(),
});

export async function userRoutes(app) {
  // Todas as rotas aqui exigem autenticação
  app.addHook('onRequest', authenticate);

  // ─── GET /user/me ───────────────────────────────────────────
  app.get('/me', async (request, reply) => {
    const user = await getUserById(request.user.sub);
    return reply.send({ user });
  });

  // ─── GET /user/data ─────────────────────────────────────────
  app.get('/data', async (request, reply) => {
    const data = await getUserData(request.user.sub);
    return reply.send({ data });
  });

  // ─── PUT /user/data ─────────────────────────────────────────
  // Atualiza parcialmente os dados financeiros
  app.put('/data', async (request, reply) => {
    const result = userDataPatchSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: result.error.issues[0].message,
      });
    }

    const data = await updateUserData(request.user.sub, result.data);
    return reply.send({ data });
  });

  // ─── POST /user/migrate ─────────────────────────────────────
  // Importa dados do localStorage (chamado uma única vez na primeira entrada)
  app.post('/migrate', async (request, reply) => {
    const result = migrateSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: result.error.issues[0].message,
      });
    }

    const result2 = await migrateLocalData(request.user.sub, result.data);
    return reply.status(200).send(result2);
  });

  // ─── DELETE /user/account ────────────────────────────────────
  // Exclusão total — LGPD compliance
  app.delete('/account', async (request, reply) => {
    const userId = request.user.sub;

    // Revoga todos os tokens antes de excluir
    await revokeAllRefreshTokens(userId);

    // Exclui o usuário (cascade deleta userData e refreshTokens)
    await deleteUser(userId);

    reply.clearCookie('meucontrole_refresh', { path: '/' });
    return reply.send({ message: 'Conta excluída permanentemente.' });
  });
}
