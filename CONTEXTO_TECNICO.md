# MeuControle — Contexto Técnico Completo
> Cole este documento no início de uma nova conversa para retomar o projeto com contexto completo.

---

## Objetivo atual
SaaS de controle financeiro pessoal. Arquitetura híbrida React + sistema legado, em fase de consolidação pós-backend. Funcionando localmente. Deploy configurado, ainda não publicado.

---

## Stack

### Frontend (`Dashboard Financeiro/`)
- React 19 + Vite 7 + TailwindCSS + Recharts
- Roteamento: HashRouter (react-router-dom v7)
- Estado: localStorage via adapters + DashboardContext (não alterar)
- CSS variables: `src/styles/tailwind.css` (`:root` e `.dark`)
- Build: `npm run build:react` → `dist-react/`
- Entry HTML: `react.html`
- Fonte display: Bebas Neue Pro. Fonte base: Inter.

### Backend (`meucontrole-api/`)
- Fastify 5 + Prisma 6 + PostgreSQL (Supabase, região São Paulo)
- Auth: JWT access token 15min + refresh token rotativo 7 dias (cookie HttpOnly)
- Plugins: @fastify/helmet, @fastify/cors, @fastify/rate-limit, @fastify/jwt, @fastify/cookie
- Runtime: Node 20+ com flag `--env-file=.env`
- Dev: `npm run dev` (dentro de `meucontrole-api/`)
- Prod: `npm run db:migrate && npm run start`

---

## Banco de dados — Supabase

- Projeto: `oploxvbqavywwmksvjag` (São Paulo)
- Conexão: **Session Pooler** (IPv4 compatível — nunca usar Direct Connection)
- URL padrão: `postgresql://postgres.oploxvbqavywwmksvjag:SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres`
- **ATENÇÃO: A senha foi exposta em chat anterior. Rotacionar no Supabase Dashboard > Database > Reset database password.**

### Tabelas (Prisma)
| Tabela | Descrição |
|---|---|
| `users` | Usuários (name, email, passwordHash, plan: FREE/PRO) |
| `user_data` | Dados financeiros em JSONB (appState, goals, categories, recurrences, budgets, welcomed) |
| `refresh_tokens` | Tokens rotativos com detecção de reuso |
| `password_resets` | Tokens de recuperação de senha (TTL 1h, marcados como usados) |

---

## Rotas da API

### Auth (públicas)
- `POST /auth/register` — cadastro
- `POST /auth/login` — login
- `POST /auth/refresh` — renovação silenciosa (cookie HttpOnly)
- `POST /auth/logout` — encerramento
- `POST /auth/forgot-password` — recuperação (não revela se e-mail existe)
- `POST /auth/reset-password` — redefinição com token de 1h

### User (requer autenticação)
- `GET /user/me` — dados do usuário
- `GET /user/data` / `PUT /user/data` — dados financeiros na nuvem
- `POST /user/migrate` — migração única localStorage → API
- `DELETE /user/account` — exclusão de conta (LGPD)

---

## Arquitetura de persistência

Adapter pattern em `src/services/persistence/`:
- `storageProvider.js` — troca de adapter em runtime sem alterar nenhum hook
- `localStorageAdapter.js` — modo offline/não autenticado
- `apiStorageAdapter.js` — debounce 800ms, sync silencioso com API

Nenhum componente ou hook acessa storage diretamente — apenas via adapters.

### Sincronização legado ↔ API
`syncUserToLegacy(user)` em `AuthContext.jsx` escreve `user.name` em `STORAGE_KEYS.userName` e `welcomed='1'`. Chamada após login, register e restore session.

---

## Estrutura de arquivos relevantes

```
src/
├── App.jsx                        — router principal (HashRouter)
├── main.jsx                       — entry point React
├── styles/tailwind.css            — CSS variables finance-*
├── layouts/AppLayout.jsx          — layout geral (sidebar + header + outlet)
├── context/
│   ├── AuthContext.jsx            — sessão, tokens, adapters
│   ├── DashboardContext.jsx       — hub de dados financeiros (CRÍTICO)
│   └── ThemeContext.jsx           — toggle dark/light
├── services/
│   ├── storage.js                 — STORAGE_KEYS, writeStorage (CRÍTICO)
│   ├── persistence/               — adapters (CRÍTICO)
│   ├── api/apiClient.js           — HTTP client singleton
│   ├── financialInsights.js       — insights calculados localmente
│   └── financialCategories.js     — CRUD de categorias
├── hooks/
│   ├── useLegacyKpis.js           — KPIs do dashboard
│   ├── useLegacyCashFlow.js       — fluxo de caixa
│   ├── useLegacyUpcomingBills.js  — próximos vencimentos
│   └── ... (outros hooks legados)
├── components/
│   ├── Sidebar.jsx                — sidebar desktop + drawer mobile
│   ├── KpiCard.jsx                — card de KPI
│   ├── FinancialInsights.jsx      — insights com badge
│   ├── UpcomingBillsTable.jsx     — próximos vencimentos
│   ├── charts/DashboardAnalytics.jsx — gráficos (CRÍTICO)
│   └── ui/                        — componentes base (Button, Card, etc.)
└── pages/
    ├── DashboardPage.jsx           — página principal
    ├── CashFlowPage.jsx            — entradas/saídas
    ├── DebtPage.jsx                — dívidas
    ├── LoansPage.jsx               — empréstimos
    ├── GoalsPage.jsx               — metas
    ├── RecurrencesPage.jsx         — recorrências
    ├── BudgetsPage.jsx             — orçamentos
    ├── ReportsPage.jsx             — relatórios (lazy loaded)
    ├── SettingsPage.jsx            — configurações + categorias
    ├── LoginPage.jsx               — login
    ├── RegisterPage.jsx            — cadastro
    ├── ForgotPasswordPage.jsx      — recuperação de senha
    ├── ResetPasswordPage.jsx       — redefinição de senha
    └── TermsPage.jsx               — termos LGPD
```

---

## Arquivos CRÍTICOS — Não alterar sem extremo cuidado

| Arquivo | Motivo |
|---|---|
| `DashboardContext.jsx` | Hub central de dados — quebrar rompe todos os módulos |
| `AuthContext.jsx` | Sessão e tokens — erros aqui derrubam autenticação |
| `services/persistence/*` | Adapters — alterações quebram persistência |
| `services/storage.js` | STORAGE_KEYS — renomear invalida dados do usuário |
| `hooks/useLegacy*.js` | Contratos de dados — dependências em múltiplos componentes |
| `charts/DashboardAnalytics.jsx` | Gráficos sensíveis a overflow e escala |
| `renderAll()` | Compatibilidade legada — não remover |

---

## CSS Variables (tailwind.css)

### Light mode (`:root`)
```css
--finance-bg:     248 250 252   /* slate-50 */
--finance-text:   15 23 42      /* slate-900 */
--finance-muted:  100 116 139   /* slate-500 */
--finance-border: 226 232 240   /* slate-200 */
--finance-blue:   29 78 216     /* blue-700 */
--finance-green:  22 128 76     /* green-700 */
--finance-red:    190 18 60     /* rose-700 */
--finance-yellow: 180 83 9      /* amber-700 */
```

### Dark mode (`.dark`)
```css
--finance-bg:     15 23 42      /* slate-900 */
--finance-text:   226 232 240   /* slate-200 */
--finance-muted:  148 163 184   /* slate-400 */
--finance-border: 51 65 85      /* slate-700 */
--finance-blue:   96 165 250    /* blue-400 */
--finance-green:  74 222 128    /* green-400 */
--finance-red:    248 113 113   /* red-400 */
--finance-yellow: 251 191 36    /* amber-400 */
```

---

## Comandos já rodados

```bash
# Backend
cd meucontrole-api
npm install
npx prisma migrate dev --name init     # criou tabelas no Supabase
npx prisma migrate deploy              # rodado novamente após fase 2
npm run dev                            # servidor funcionando na porta configurada

# Frontend
npm install
npm run dev:react                      # rodar SEMPRE no Windows, nunca no sandbox Linux
```

---

## Erros já resolvidos

| Erro | Causa | Solução |
|---|---|---|
| `@rollup/rollup-linux-x64-gnu not found` | node_modules instalados no Windows, sandbox é Linux | Rodar `npm run dev:react` direto no Windows |
| `Cannot find package 'jsonwebtoken'` | Pacote não estava no package.json | `npm install jsonwebtoken` dentro de `meucontrole-api` |
| `[ENV] DATABASE_URL ausente` | Node não carrega .env automaticamente | `--env-file=.env` nos scripts do package.json |
| `P1001: Can't reach database server` | URL Direct Connection (IPv6 only) | Usar Session Pooler URL do Supabase |
| Nome errado (Lucca vs Arthur Teles) | Dois sources de nome nunca sincronizados | `syncUserToLegacy()` + `displayName = user?.name \|\| nome` |
| "Olá, [nome]" em todas as páginas | Saudação sem condicional de rota | `const isHome = location.pathname === '/'` no AppLayout |

---

## Decisões de segurança

- **Refresh token rotation**: reuso detectado invalida TODOS os tokens do usuário
- **Password reset**: resposta nunca revela se e-mail existe (anti-enumeration)
- **Tokens de reset**: TTL 1h, marcados como usados (não deletados, auditável)
- **Logout**: automaticamente volta para `localStorageAdapter`
- **Cookies**: `HttpOnly`, `credentials: 'include'` em todas as requisições
- **Rate limiting**: aplicado globalmente via @fastify/rate-limit

---

## Deploy configurado (não publicado)

| Plataforma | Arquivo | Status |
|---|---|---|
| Railway (backend) | `railway.json` com auto-migrate | ⏳ Configurado |
| Vercel (frontend) | `vercel.json` com HashRouter rewrite | ⏳ Configurado |
| Resend (e-mail) | Variável `RESEND_API_KEY` no .env | ⏳ Aguarda chave |
| Sentry (erros) | Variável `SENTRY_DSN` no .env | ⏳ Aguarda DSN |

---

## Status atual

| Área | Status |
|---|---|
| Backend Fastify + Prisma | ✅ Implementado e testado localmente |
| Supabase conectado | ✅ Migrations aplicadas |
| Auth completa (login/register/refresh/logout/forgot/reset) | ✅ |
| Adapter localStorage ↔ API (zero breaking changes) | ✅ |
| Mobile hamburguer drawer | ✅ |
| Toggle "Novo lançamento" | ✅ |
| Saudação "Olá, [nome]" só na home | ✅ |
| Categorias accordion | ✅ |
| Deploy | ⏳ Configurado, não publicado |
| Redesign visual | 🔄 Em planejamento |
| Google OAuth | 🔄 Em análise técnica |

---

## Próximos passos recomendados

1. **Urgente**: Rotacionar senha do Supabase (exposta em chat)
2. **Deploy**: Publicar backend no Railway + frontend no Vercel
3. **Visual**: Redesign do dashboard (análise em andamento)
4. **Google OAuth**: Análise técnica concluída, implementar depois do redesign
