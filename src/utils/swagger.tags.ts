export const swaggerTags = {
  health: { name: 'Health', description: 'Monitoramento da API' },
  user: { name: 'User', description: 'Operações relacionadas a usuários' },
} as const

export type SwaggerTag = (typeof swaggerTags)[keyof typeof swaggerTags]['name']
