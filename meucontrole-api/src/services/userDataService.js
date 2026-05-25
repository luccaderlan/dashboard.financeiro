import { prisma } from '../config/prisma.js';

/**
 * Retorna os dados financeiros do usuário.
 * Garante que o registro existe (cria se necessário).
 */
export async function getUserData(userId) {
  let userData = await prisma.userData.findUnique({
    where: { userId },
  });

  if (!userData) {
    userData = await prisma.userData.create({
      data: { userId },
    });
  }

  return serializeUserData(userData);
}

/**
 * Atualiza parcialmente os dados financeiros do usuário.
 * Aceita qualquer subconjunto dos campos — não sobrescreve o que não foi enviado.
 */
export async function updateUserData(userId, patch) {
  const allowedFields = ['appState', 'goals', 'categories', 'recurrences', 'budgets', 'welcomed'];

  const data = {};
  for (const field of allowedFields) {
    if (patch[field] !== undefined) {
      data[field] = patch[field];
    }
  }

  if (Object.keys(data).length === 0) {
    return getUserData(userId);
  }

  const userData = await prisma.userData.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return serializeUserData(userData);
}

/**
 * Importa dados do localStorage (migração inicial).
 * Só sobrescreve se o campo estiver vazio no banco.
 * Garante que usuários existentes não percam dados ao migrar.
 */
export async function migrateLocalData(userId, localData) {
  const existing = await prisma.userData.findUnique({ where: { userId } });

  const data = {};

  // Só migra campos que ainda estão vazios no banco
  if (!existing?.appState && localData.appState) {
    data.appState = localData.appState;
  }
  if (!existing?.goals && localData.goals) {
    data.goals = localData.goals;
  }
  if (!existing?.categories && localData.categories) {
    data.categories = localData.categories;
  }
  if (!existing?.recurrences && localData.recurrences) {
    data.recurrences = localData.recurrences;
  }
  if (!existing?.budgets && localData.budgets) {
    data.budgets = localData.budgets;
  }
  if (!existing?.welcomed && localData.welcomed) {
    data.welcomed = localData.welcomed;
  }

  const userData = await prisma.userData.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return {
    migrated: Object.keys(data),
    data: serializeUserData(userData),
  };
}

/**
 * Serializa UserData para o formato que o frontend espera (STORAGE_KEYS).
 */
function serializeUserData(userData) {
  return {
    appState: userData.appState ?? null,
    goals: userData.goals ?? null,
    categories: userData.categories ?? null,
    recurrences: userData.recurrences ?? null,
    budgets: userData.budgets ?? null,
    welcomed: userData.welcomed ?? null,
  };
}
