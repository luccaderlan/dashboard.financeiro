import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório.' })
    .min(2, 'Nome deve ter ao menos 2 caracteres.')
    .max(100, 'Nome muito longo.')
    .trim(),

  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .email('E-mail inválido.')
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: 'Senha é obrigatória.' })
    .min(8, 'Senha deve ter ao menos 8 caracteres.')
    .max(72, 'Senha muito longa.')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter ao menos uma letra maiúscula, uma minúscula e um número.'
    ),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .email('E-mail inválido.')
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: 'Senha é obrigatória.' })
    .min(1, 'Senha é obrigatória.'),
});
