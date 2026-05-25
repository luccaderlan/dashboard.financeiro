/**
 * Validação e exportação de variáveis de ambiente.
 * O servidor não sobe se alguma variável obrigatória estiver ausente.
 */

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[ENV] Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

function optionalEnv(name, fallback) {
  return process.env[name] ?? fallback;
}

export const env = {
  // Servidor
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  PORT: parseInt(optionalEnv('PORT', '3333'), 10),
  HOST: optionalEnv('HOST', '0.0.0.0'),

  // Banco de dados
  DATABASE_URL: requireEnv('DATABASE_URL'),

  // JWT
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: optionalEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: optionalEnv('JWT_REFRESH_EXPIRES_IN', '7d'),

  // CORS — domínio do frontend em produção
  FRONTEND_URL: optionalEnv('FRONTEND_URL', 'http://localhost:5173'),

  // E-mail (Resend) — opcional em desenvolvimento
  RESEND_API_KEY: optionalEnv('RESEND_API_KEY', ''),
  EMAIL_FROM: optionalEnv('EMAIL_FROM', 'MeuControle <noreply@meucontrole.com.br>'),

  // Monitoramento — opcional em desenvolvimento
  SENTRY_DSN: optionalEnv('SENTRY_DSN', ''),

  // Cookie
  COOKIE_SECRET: requireEnv('COOKIE_SECRET'),

  get isDevelopment() {
    return this.NODE_ENV === 'development';
  },

  get isProduction() {
    return this.NODE_ENV === 'production';
  },
};
