import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';

const SALT_ROUNDS = 12;

/**
 * Registra um novo usuário.
 * Lança erro se o e-mail já estiver cadastrado.
 */
export async function registerUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw Object.assign(
      new Error('Este e-mail já está cadastrado.'),
      { statusCode: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      // Cria o registro de dados do usuário vazio junto
      userData: { create: {} },
    },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Autentica um usuário por e-mail e senha.
 * Usa comparação de tempo constante para evitar timing attacks.
 */
export async function authenticateUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Comparar mesmo se o usuário não existir (evita timing attack)
  const passwordToCompare = user?.password ?? '$2a$12$invalidhashforcomparison';
  const isValid = await bcrypt.compare(password, passwordToCompare);

  if (!user || !isValid) {
    throw Object.assign(
      new Error('E-mail ou senha incorretos.'),
      { statusCode: 401 }
    );
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
  };
}

/**
 * Retorna dados públicos de um usuário pelo ID.
 */
export async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw Object.assign(new Error('Usuário não encontrado.'), { statusCode: 404 });
  }

  return user;
}

/**
 * Exclui permanentemente um usuário e todos os seus dados.
 * Cascata está configurada no Prisma (onDelete: Cascade).
 */
export async function deleteUser(userId) {
  await prisma.user.delete({ where: { id: userId } });
}
