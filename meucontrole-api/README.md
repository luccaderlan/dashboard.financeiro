# MeuControle API

Backend do MeuControle — Dashboard Financeiro Pessoal.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Fastify 5
- **Banco:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Auth:** JWT (access token 15min) + Refresh Token HttpOnly cookie (7 dias)
- **Validação:** Zod
- **Segurança:** Helmet, CORS, Rate Limiting

## Como rodar localmente

### 1. Pré-requisitos

- Node.js 20+
- Uma instância PostgreSQL (recomendado: [Supabase](https://supabase.com) gratuito)

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Preencha os valores no arquivo .env
```

### 4. Gerar o Prisma Client e rodar migrations

```bash
npm run db:generate
npm run db:migrate:dev
```

### 5. Rodar o servidor

```bash
npm run dev
```

O servidor sobe em `http://localhost:3333`.
Acesse `http://localhost:3333/health` para verificar.

## Rotas

### Autenticação (`/auth`)

| Método | Rota             | Descrição                          | Auth |
|--------|------------------|------------------------------------|------|
| POST   | /auth/register   | Criar conta                        | Não  |
| POST   | /auth/login      | Fazer login                        | Não  |
| POST   | /auth/refresh    | Renovar access token (via cookie)  | Não  |
| POST   | /auth/logout     | Fazer logout                       | Não  |

### Usuário (`/user`) — todas exigem `Authorization: Bearer <token>`

| Método | Rota             | Descrição                          |
|--------|------------------|------------------------------------|
| GET    | /user/me         | Dados do usuário autenticado       |
| GET    | /user/data       | Dados financeiros                  |
| PUT    | /user/data       | Atualizar dados financeiros        |
| POST   | /user/migrate    | Migrar dados do localStorage       |
| DELETE | /user/account    | Excluir conta permanentemente      |

## Deploy no Railway

1. Criar projeto no [Railway](https://railway.app)
2. Conectar ao repositório GitHub
3. Adicionar as variáveis de ambiente do `.env.example`
4. O Railway detecta automaticamente Node.js e usa `npm run start`
5. Configurar `DATABASE_URL` apontando para o Supabase

## Variáveis de ambiente obrigatórias

| Variável             | Descrição                          |
|----------------------|------------------------------------|
| `DATABASE_URL`       | Connection string PostgreSQL       |
| `JWT_SECRET`         | Secret do access token             |
| `JWT_REFRESH_SECRET` | Secret do refresh token            |
| `COOKIE_SECRET`      | Secret para assinar cookies        |
| `FRONTEND_URL`       | URL do frontend (CORS)             |
