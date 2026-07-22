export const swaggerTags = {
  health: { name: 'Health', description: 'Monitoramento da API' },
  user: { name: 'User', description: 'Operações relacionadas a usuários' },
  auth: { name: 'Auth', description: 'Operações relacionadas a autenticação do usuário' },
} as const

export type SwaggerTag = (typeof swaggerTags)[keyof typeof swaggerTags]['name']
