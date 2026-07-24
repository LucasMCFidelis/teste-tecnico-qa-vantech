import { z } from 'zod'

export const loginUserSchema = z
  .object({
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
      email: 'lucas@email.com',
      password: 'Senha@123',
    },
  })

export const loggedUserResponseSchema = z.object({
  token: z.string(),
})

export const sessionInputSchema = z
  .object({
    userId: z.number().int().positive(),
    token: z.string(),
    expiresAt: z.date(),
  })
  .meta({
    example: {
      userId: 1,
      token: 'Token@123',
      expiresAt: new Date(),
    },
  })

export const sessionResponseSchema = z
  .object({
    id: z.number().int().positive(),
    userId: z.number().int().positive(),
    token: z.string(),
    createdAt: z.iso.datetime(),
    expiresAt: z.iso.datetime(),
    revokedAt: z.iso.datetime().nullable().optional(),
  })
  .meta({
    example: {
      id: 1,
      userId: 1,
      token: 'Token@123',
      createdAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
    },
  })

export type LoginUserInput = z.infer<typeof loginUserSchema>
export type LoggedUserResponse = z.infer<typeof loggedUserResponseSchema>
export type SessionInput = z.infer<typeof sessionInputSchema>
export type SessionResponse = z.infer<typeof sessionResponseSchema>
