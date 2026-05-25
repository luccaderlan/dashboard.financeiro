/**
 * Middleware de autenticação JWT.
 * Adiciona `request.user` com { id, email, plan } se o token for válido.
 */
export async function authenticate(request, reply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token inválido ou ausente. Faça login novamente.',
    });
  }
}
