import { z } from 'zod'

export const createUserSchema = z
  .object({
    name: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
    email: z.email('E-mail inválido').max(150, 'E-mail muito longo'),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .max(72, 'Senha muito longa'),
  })
  .meta({
    example: {
      name: 'Lucas Fidelis',
      email: 'lucas@email.com',
      password: 'Senha@123',
    },
  })

export const createdUserResponseSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    createdAt: z.iso.datetime(),
  })
  .meta({
    example: {
      id: 1,
      name: 'Lucas Fidelis',
      email: 'lucas@email.com',
      createdAt: '2026-07-21T12:30:00.000Z',
    },
  })

export type CreateUserInput = z.infer<typeof createUserSchema>
export type CreatedUserResponse = z.infer<typeof createdUserResponseSchema>
