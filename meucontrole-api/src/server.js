import { buildApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { initSentry } from './config/sentry.js';

async function main() {
  const app = await buildApp();

  // Inicializa Sentry antes de qualquer outra coisa
  await initSentry(app);

  try {
    await prisma.$connect();
    app.log.info('Banco de dados conectado.');

    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    app.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
