import { z } from 'zod'

export const createUserSchema = z
  .object({
    name: z
      .string('Nome é obrigatório e deve ser uma string')
      .min(2, 'Nome muito curto')
      .max(100, 'Nome muito longo'),
    email: z
      .email('E-mail é obrigatório e deve ser um e-mail valido')
      .max(150, 'E-mail muito longo'),
    password: z
      .string('Senha é obrigatória e deve ser uma string')
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

export const getUserSchema = z.object({
  id: z.coerce
    .number({
      error: 'O parâmetro id deve ser um número.',
    })
    .int('O parâmetro id deve ser um número inteiro.')
    .positive('O parâmetro id deve ser maior que zero.'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type CreatedUserResponse = z.infer<typeof createdUserResponseSchema>
export type GetUserParams = z.infer<typeof getUserSchema>
