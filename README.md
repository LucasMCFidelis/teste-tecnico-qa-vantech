# Teste Técnico — QA Vantech

API REST desenvolvida como teste técnico para a vaga de Analista de Teste (QA) na Vantech.

> ⚠️ **Status:** projeto em desenvolvimento. Este README cobre o setup inicial da aplicação (servidor, banco de dados, documentação e tooling). As seções de autenticação, cadastro de usuários e cobertura de testes serão atualizadas conforme as features forem implementadas.

## Sobre o projeto

API REST em Node.js com os seguintes requisitos funcionais:

- **Cadastro de usuários**, com senha criptografada antes de ser persistida.
- **Login**, retornando um token de acesso para rotas protegidas.
- **Persistência local** dos dados em SQLite3.

## Tecnologias

| Categoria           | Ferramenta                                      |
| ------------------- | ----------------------------------------------- |
| Runtime             | Node.js                                         |
| Linguagem           | TypeScript                                      |
| Framework HTTP      | Fastify                                         |
| ORM                 | Prisma (com driver adapter para better-sqlite3) |
| Banco de dados      | SQLite3                                         |
| Documentação de API | Swagger (`@fastify/swagger` + `swagger-ui`)     |
| Testes              | Jest + ts-jest                                  |
| Lint                | ESLint (flat config) + typescript-eslint        |
| Formatação          | Prettier                                        |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 22 ou superior
- npm 10 ou superior

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/LucasMCFidelis/teste-tecnico-qa-vantech.git
cd teste-tecnico-qa-vantech
npm install
```

## Variáveis de ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

| Variável       | Descrição                                  | Padrão          |
| -------------- | ------------------------------------------ | --------------- |
| `DATABASE_URL` | Caminho do banco SQLite usado pelo Prisma  | `file:./dev.db` |
| `HOST`         | Host em que o servidor Fastify vai escutar | `localhost`     |
| `PORT`         | Porta do servidor                          | `3333`          |
| `CORS_ORIGIN`  | Origem permitida pelo CORS                 | `*`             |

## Banco de dados e migrações

O projeto usa **Prisma** como ORM sobre **SQLite3**. O client é gerado em `generated/prisma` (fora da pasta `src`, e ignorado no lint e no controle de versão).

Gerar o client do Prisma a partir do schema:

```bash
npm run db:generate
```

Criar e aplicar as migrações em ambiente de desenvolvimento:

```bash
npm run db:migrate
```

Aplicar migrações já existentes (ex.: ambiente de CI ou após um `git pull`):

```bash
npm run db:migrate:deploy
```

Inspecionar o banco visualmente (opcional):

```bash
npm run db:studio
```

## Rodando a aplicação

**Ambiente de desenvolvimento** (com reload automático):

```bash
npm run dev
```

**Build de produção:**

```bash
npm run build
npm start
```

Por padrão, a API sobe em `http://localhost:3333`.

## Documentação da API

Com o servidor rodando, a documentação Swagger fica disponível em:

```
http://localhost:3333/api/v1/docs
```

> Uma collection do Postman/Insomnia será adicionada futuramente como diferencial, conforme os endpoints forem finalizados.

## Testes

Executar a suíte de testes:

```bash
npm test
```

> O script atual roda o Jest em modo `--watch`. Ao configurar a suíte completa de testes, será adicionado um script dedicado para execução única (ex.: `test:ci`), voltado para uso em pipelines de CI e para gerar relatório de cobertura.

## Lint e formatação

Verificar problemas de lint:

```bash
npm run lint
```

Corrigir automaticamente o que for possível:

```bash
npm run lint:fix
```

Verificar formatação (Prettier):

```bash
npm run format:check
```

Aplicar formatação:

```bash
npm run format
```

## Estrutura de pastas

```
├── prisma/
│   └── schema.prisma        # Definição do banco de dados
├── src/
│   ├── plugins/              # Plugins do Fastify (ex.: swagger)
│   ├── routes/                # Rotas da API
│   ├── utils/                  # Utilitários (ex.: tags do swagger)
│   └── index.ts                # Ponto de entrada da aplicação
├── generated/prisma/         # Client gerado pelo Prisma (não versionado)
├── .env.example
├── eslint.config.mjs
├── jest.config.js
├── prisma.config.ts
└── tsconfig.json
```

## Roadmap

- [✅] Setup inicial da aplicação (Fastify, Prisma, SQLite, Swagger, ESLint, Prettier, Jest)
- [✅] Endpoint de health check
- [ ] Cadastro de usuários com criptografia de senha
- [ ] Fluxo de autenticação (login e emissão de token)
- [ ] Testes automatizados (unitários e de integração)
- [ ] Pipeline de CI (build + testes)
- [ ] Collection Postman/Insomnia

## Autor

Lucas Fidelis
