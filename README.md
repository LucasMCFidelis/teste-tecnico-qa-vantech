# Teste Técnico — QA Vantech

API REST desenvolvida como teste técnico para a vaga de Analista de Teste (QA) na Vantech.

## Sobre o projeto

API REST em Node.js/TypeScript, com os seguintes requisitos funcionais implementados:

- **Cadastro de usuários** (`POST /api/v1/users`), com senha criptografada (bcrypt) antes de ser persistida. O e-mail é normalizado (lowercase) para evitar duplicidade por diferença de caixa.
- **Login** (`POST /api/v1/auth/login`), validando e-mail (case-insensitive) e senha e retornando um token de acesso vinculado a uma sessão.
- **Busca de usuário por id** (`GET /api/v1/users/:id`), rota protegida que exige token válido e só permite ao usuário autenticado consultar os próprios dados.
- **Middlewares de proteção**, em cadeia (`preHandler`):
  - `validationMiddleware`: intercepta erros de validação de schema (Zod/Fastify) e padroniza a resposta de erro.
  - `authMiddleware`: valida o token (`Authorization: Bearer <token>`) e a expiração da sessão.
  - `ownerAuthorizationMiddleware`: garante que o usuário autenticado só acesse seus próprios recursos (retorna `403` caso contrário).
- **Persistência local** dos dados de usuários e sessões em **SQLite3**, via Prisma ORM.

Além da API funcional, o projeto tem foco em qualidade: tratamento de erros centralizado (incluindo erros de validação do Zod), validação de payloads, documentação Swagger, suíte de testes unitários com Jest e testes de integração/end-to-end com Postman/Newman rodando em pipeline de CI.

## Tecnologias

| Categoria             | Ferramenta                                               |
| --------------------- | -------------------------------------------------------- |
| Runtime               | Node.js                                                  |
| Linguagem             | TypeScript                                               |
| Framework HTTP        | Fastify                                                  |
| Validação             | Zod (`fastify-type-provider-zod`)                        |
| ORM                   | Prisma (com driver adapter para `better-sqlite3`)        |
| Banco de dados        | SQLite3                                                  |
| Autenticação          | Token opaco (UUID) + hash SHA-256 armazenado como sessão |
| Criptografia de senha | bcrypt                                                   |
| Documentação de API   | Swagger (`@fastify/swagger` + `swagger-ui`)              |
| Testes unitários      | Jest + ts-jest                                           |
| Testes de integração  | Postman + Newman                                         |
| CI                    | GitHub Actions                                           |
| Lint                  | ESLint (flat config) + typescript-eslint                 |
| Formatação            | Prettier                                                 |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 22 LTS (versão 22.13.0 ou superior)
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

O projeto usa **Prisma** como ORM sobre **SQLite3**. O client é gerado em `src/generated/prisma` (ignorado no lint e no controle de versão).

Gerar o client do Prisma a partir do schema:

```bash
npm run db:generate
```

Criar e aplicar as migrações em ambiente de desenvolvimento (cria o arquivo `.db` local caso não exista):

```bash
npm run db:migrate
```

Aplicar migrações já existentes, sem gerar novas (ex.: ambiente de CI ou após um `git pull`). Esse mesmo comando roda automaticamente no pipeline de CI, antes de lint, build e testes:

```bash
npm run db:migrate:deploy
```

Inspecionar o banco visualmente (opcional):

```bash
npm run db:studio
```

O schema atual (`prisma/schema.prisma`) define duas tabelas:

- **User**: `id`, `name`, `email` (único), `password` (hash), `createdAt`.
- **Session**: `id`, `userId` (FK para `User`), `token` (hash, único), `createdAt`, `expiresAt`, `revokedAt`.

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

Com o servidor rodando, a documentação Swagger (interativa, com exemplos de request/response) fica disponível em:

```
http://localhost:3333/api/v1/docs
```

A raiz da aplicação (`/`) redireciona automaticamente para essa documentação.

### Endpoints principais

| Método | Rota                  | Descrição                                                       |    Autenticação     |
| ------ | --------------------- | --------------------------------------------------------------- | :-----------------: |
| GET    | `/api/v1/health`      | Verifica o status da API e a conectividade com o banco de dados |         Não         |
| POST   | `/api/v1/users`       | Cadastra um novo usuário (senha criptografada com bcrypt)       |         Não         |
| GET    | `/api/v1/users/:id`   | Busca um usuário pelo id                                        | Sim (apenas o dono) |
| POST   | `/api/v1/auth/login`  | Autentica com e-mail/senha e retorna um token de acesso         |         Não         |
| POST   | `/api/v1/auth/logout` | Realiza o processo de logout usando o token de acesso           |         Sim         |

Rotas protegidas devem enviar o token retornado no login como header:

```
Authorization: Bearer <token>
```

Em `GET /api/v1/users/:id`, além do token ser válido, o `id` autenticado precisa ser o mesmo do parâmetro da rota — caso contrário a API responde `403 Forbidden`.

### Coleção Postman

O repositório inclui uma coleção pronta em `postman/vantech-test-qa-lucas-fidelis.postman_collection.json`, além de um environment (`postman/ventech-qa-ci.postman_environment.json`) usado tanto localmente quanto no pipeline de CI. Basta importar os dois arquivos no Postman (ou Insomnia) para testar os fluxos de cadastro, login e rotas protegidas.

## Testes

### Testes unitários e de integração (Jest)

Executar a suíte de testes com relatório de cobertura:

```bash
npm test
```

Executar em modo watch durante o desenvolvimento:

```bash
npm run test:watch
```

A suíte cobre, entre outros pontos:

- Criação de usuário, e-mail duplicado e validação de payload com Zod (`src/tests/services/user/create-user.test.ts`).
- Busca de usuário por e-mail (`src/tests/services/user/get-user-by-email.test.ts`).
- Login, criação de sessão e validação de token, incluindo cenários de credenciais inválidas, login case-insensitive e sessão expirada (`src/tests/services/auth`).
- Middleware de autenticação (`src/tests/middlewares/auth.middleware.test.ts`).
- Funções utilitárias de segurança: hash/comparação de senha e geração/hash de token (`src/tests/utils/security`).

O relatório de cobertura é gerado na pasta `coverage/` (ignorada pelo Git).

### Testes de API com Postman/Newman

A collection do Postman pode ser executada localmente utilizando o Newman.

Como o Newman não faz parte das dependências do projeto, instale-o globalmente:

```bash
npm install -g newman
```

Com o servidor rodando (`npm run dev` ou `npm start`), execute a coleção do Postman via linha de comando:

```bash
npm run test:postman
```

Ao final da execução, será gerado um relatório no formato JUnit em:
`postman/reports/newman-results.xml`.
Esse relatório também é utilizado pela pipeline de CI para disponibilizar os resultados da execução dos testes como artefato.

## Integração contínua (CI)

O workflow do GitHub Actions (`.github/workflows/ci.yml`) roda em push/PR para `main`, `develop`, `feature/**`, `release/**` e `hotfix/**`, executando em sequência:

1. Instalação de dependências e geração do client do Prisma.
2. Aplicação das migrações no banco de CI (`npm run db:migrate:deploy`).
3. Lint (`npm run lint`).
4. Build (`npm run build`).
5. Testes unitários com Jest (`npm test`).
6. Subida da aplicação e testes de integração com Postman/Newman (`npm run test:postman`), aguardando o endpoint de health check ficar disponível.
7. Upload dos relatórios de cobertura (Jest) e dos resultados do Newman como artefatos do workflow.

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
│   ├── migrations/            # Histórico de migrações do banco
│   └── schema.prisma          # Definição do banco de dados (User, Session)
├── postman/
│   ├── vantech-test-qa-lucas-fidelis.postman_collection.json
│   └── ventech-qa-ci.postman_environment.json
├── src/
│   ├── controller/             # Controllers (user, auth, health) — recebem a request e delegam aos services
│   ├── lib/                    # Instância do Prisma Client
│   ├── middlewares/
│   │   ├── auth.middleware.ts             # Valida o token Bearer e a expiração da sessão
│   │   ├── authorize-user.middleware.ts   # Garante que o usuário só acesse os próprios dados
│   │   └── validation.middleware.ts       # Padroniza erros de validação de schema
│   ├── plugins/                # Plugins do Fastify (ex.: swagger)
│   ├── routes/                 # Definição das rotas e seus schemas de request/response
│   ├── schemas/                 # Schemas Zod de validação e exemplos de payload
│   ├── services/                # Regras de negócio (criação/busca de usuário, login, sessão)
│   ├── tests/                   # Testes unitários e de integração (Jest), organizados por camada
│   ├── utils/
│   │   ├── errors/               # Classes de erro HTTP e handler centralizado
│   │   └── security/             # Hash de senha (bcrypt) e geração/hash de token
│   └── index.ts                  # Ponto de entrada da aplicação
├── src/generated/prisma/      # Client gerado pelo Prisma (não versionado)
├── .github/workflows/ci.yml   # Pipeline de CI (lint, build, testes unitários e Postman)
├── .env.example
├── eslint.config.mjs
├── jest.config.js
├── prisma.config.ts
└── tsconfig.json
```

## Tratamento de erros

Os erros de negócio são representados por classes específicas em `src/utils/errors/httpErrors.ts` (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `InternalServerError`), cada uma associada a um status HTTP. O `handleError` centraliza a conversão dessas exceções em respostas JSON padronizadas (`{ "error": "mensagem" }`), além de tratar automaticamente erros de validação do Zod (`ZodError`) e da validação nativa do Fastify — evitando tratamento de erro duplicado em cada controller.

A autorização de recursos (ex.: impedir que um usuário acesse dados de outro) é tratada separadamente pelo `ownerAuthorizationMiddleware`, que lança `ForbiddenError` (`403`) quando o `id` autenticado não corresponde ao `id` solicitado.

## Bugs encontrados e corrigidos

Durante o desenvolvimento, os seguintes bugs foram identificados (via testes automatizados e revisão manual) e corrigidos. O histórico completo, com a descrição do problema e da correção aplicada em cada caso, está registrado nas issues fechadas do repositório:

| Issue                                                                     | Descrição                                                       |
| ------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [#1](https://github.com/LucasMCFidelis/teste-tecnico-qa-vantech/issues/1) | Erros de validação retornavam `HTTP 500` em vez de `HTTP 400`   |
| [#2](https://github.com/LucasMCFidelis/teste-tecnico-qa-vantech/issues/2) | Login diferenciava letras maiúsculas e minúsculas no e-mail     |
| [#3](https://github.com/LucasMCFidelis/teste-tecnico-qa-vantech/issues/3) | Usuário autenticado conseguia acessar dados de outros usuários  |
| [#4](https://github.com/LucasMCFidelis/teste-tecnico-qa-vantech/issues/4) | Validação dos parâmetros da rota ocorria depois da autenticação |
| [#5](https://github.com/LucasMCFidelis/teste-tecnico-qa-vantech/issues/5) | Mensagens de validação para campos obrigatórios eram genéricas  |

Todas as issues acima estão com status **fechado** (`closed`, label `bug`) e podem ser consultadas em conjunto na [lista de bugs corrigidos](https://github.com/LucasMCFidelis/teste-tecnico-qa-vantech/issues?q=is%3Aissue+state%3Aclosed+label%3Abug).

## Roadmap

- [x] Setup inicial da aplicação (Fastify, Prisma, SQLite, Swagger, ESLint, Prettier, Jest)
- [x] Endpoint de health check
- [x] Cadastro de usuários com criptografia de senha
- [x] Fluxo de autenticação (login e emissão de token)
- [x] Middleware de autenticação para rotas protegidas
- [x] Busca de usuário por id com autorização de dono do recurso
- [x] Testes automatizados (unitários e de integração)
- [x] Pipeline de CI (lint + build + testes unitários + testes Postman)
- [x] Collection Postman

## Autor

**Lucas Fidelis**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/lucas-fidelis-778705149/)
[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=flat&logo=vercel&logoColor=white)](https://portfolio-lucasfidelis.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/LucasMCFidelis)