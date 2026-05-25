/**
 * Configuração do Sentry para o backend.
 * Só ativo se SENTRY_DSN estiver configurado (produção).
 * Em desenvolvimento, erros são apenas logados no console.
 */

import { env } from './env.js';

let Sentry = null;

export async function initSentry(app) {
  if (!env.SENTRY_DSN) {
    app.log.info('Sentry não configurado (SENTRY_DSN ausente) — modo desenvolvimento.');
    return;
  }

  try {
    const SentryModule = await import('@sentry/node');
    Sentry = SentryModule;

    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: env.isProduction ? 0.2 : 1.0,
    });

    app.log.info('Sentry inicializado.');
  } catch {
    app.log.warn('Sentry não instalado — erros não serão monitorados remotamente.');
  }
}

export function captureException(error, context = {}) {
  if (!Sentry) return;
  Sentry.captureException(error, { extra: context });
}

export function setUserContext(userId, email) {
  if (!Sentry) return;
  Sentry.setUser({ id: userId, email });
}

export function clearUserContext() {
  if (!Sentry) return;
  Sentry.setUser(null);
}
