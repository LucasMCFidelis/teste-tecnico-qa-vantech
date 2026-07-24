import { z } from 'zod'

export const errorResponseSchema = (exampleMessage?: string) =>
  z.object({
    error: z.string().meta({
      example: exampleMessage ?? 'Erro interno do servidor',
    }),
  })
