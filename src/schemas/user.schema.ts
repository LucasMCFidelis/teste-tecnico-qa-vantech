import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
  email: z.email('E-mail inválido').max(150, 'E-mail muito longo'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(72, 'Senha muito longa'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
