import z from 'zod'

export const healthSchema = z
  .object({
    status: z.string(),
    timestamp: z.iso.datetime(),
    services: z.object({}),
  })
  .meta({
    example: {
      status: 'ok',
      timestamp: '2026-07-21T12:30:00.000Z',
      services: { database: 'ok' },
    },
  })
