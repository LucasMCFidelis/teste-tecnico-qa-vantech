export const swaggerTags = {
  health: { name: 'Health', description: 'Monitoramento da API' },
} as const

export type SwaggerTag = (typeof swaggerTags)[keyof typeof swaggerTags]['name']
