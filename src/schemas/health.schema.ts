import { z } from 'zod'

export const healthResponseSchema = z
  .object({
    status: z.enum(['ok', 'degraded']),
    timestamp: z.iso.datetime(),
    services: z.object({
      database: z.enum(['ok', 'unreachable']),
    }),
  })
  .meta({
    example: {
      status: 'ok',
      timestamp: '2026-07-21T12:30:00.000Z',
      services: {
        database: 'ok',
      },
    },
  })

export const degradedHealthResponseSchema = healthResponseSchema.meta({
  example: {
    status: 'degraded',
    timestamp: '2026-07-21T12:30:00.000Z',
    services: {
      database: 'unreachable',
    },
  },
})

export type HealthResponse = z.infer<typeof healthResponseSchema>
