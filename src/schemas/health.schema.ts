import z from 'zod'

export const healthSchema = z.object({
  status: z.string(),
  timestamp: z.iso.datetime(),
  services: z.record(z.string(), z.string()),
})
