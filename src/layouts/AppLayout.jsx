import { Outlet, useLocation } from 'react-router-dom';
import { NotificationBell } from '../components/NotificationBell.jsx';
import { OnboardingModal } from '../components/OnboardingModal.jsx';
import { Sidebar } from '../components/Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDashboardContext } from '../context/DashboardContext.jsx';
import { isLegacyWelcomeComplete } from '../services/legacyOnboardingWrite.js';

const routeHeaders = {
  '/': {
    label: 'Visão geral',
    title: 'Dashboard',
    description: 'Resumo financeiro com indicadores, insights, análises e próximas contas.'
  },
  '/fluxo': {
    label: 'Fluxo financeiro',
    title: 'Entradas e Saídas',
    description: 'Registre entradas e saídas, acompanhe filtros e mantenha seu saldo atualizado.'
  },
  '/dividas': {
    label: 'Controle financeiro',
    title: 'Dívidas',
    description: 'Acompanhe dívidas ativas, pagas, vencimentos e situações em aberto.'
  },
  '/emprestimos': {
    label: 'Parcelas e juros',
    title: 'Empréstimos e Financiamentos',
    description: 'Controle empréstimos e financiamentos com parcelas, juros e progresso.'
  },
  '/metas': {
    label: 'Objetivos financeiros',
    title: 'Metas Financeiras',
    description: 'Crie objetivos, acompanhe progresso e mantenha foco no que importa.'
  },
  '/recorrencias': {
    label: 'Automação mensal',
    title: 'Recorrências',
    description: 'Gere entradas, saídas e dívidas mensais com controle simples e previsível.'
  },
  '/orcamentos': {
    label: 'Planejamento',
    title: 'Orçamentos',
    description: 'Defina limites mensais por categoria e acompanhe o consumo.'
  },
  '/relatorios': {
    label: 'Análise mensal',
    title: 'Relatórios',
    description: 'Acompanhe entradas, saídas, saldo e dívidas por mês.'
  },
  '/configuracoes': {
    label: 'Segurança dos dados',
    title: 'Configurações',
    description: 'Exporte e importe backups locais para manter seus dados sob controle.'
  }
};

// ─── Avatar de perfil no header ───────────────────────────────────────────────
function HeaderAvatar({ name }) {
  const initials = (name || '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-finance-accent text-xs font-semibold text-white shadow-sm">
      {initials}
    </div>
  );
}

export function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const { nome, welcomed, refreshLegacyDashboardData } = useDashboardContext();
  const header = routeHeaders[location.pathname] || routeHeaders['/'];

  const displayName = user?.name || nome;
  const isHome = location.pathname === '/';
  const greeting = isHome && displayName ? `Olá, ${displayName}` : header.label;

  const showOnboarding = !user && !isLegacyWelcomeComplete(welcomed);

  return (
    <main className="grid min-h-screen w-full max-w-full overflow-x-hidden bg-finance-bg text-finance-text md:grid-cols-[256px_minmax(0,1fr)]">
      <Sidebar />

      <section className="mx-auto w-full min-w-0 max-w-full space-y-5 overflow-x-hidden px-3 py-4 pt-[calc(3.5rem+1rem)] sm:max-w-7xl sm:p-6 sm:pt-[calc(3.5rem+1.5rem)] md:space-y-6 md:px-10 md:py-8 md:pt-8 xl:px-12">

        {/* ── Header da página ─────────────────────────────────────────── */}
        <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          {/* Título e saudação */}
          <div className="min-w-0 max-w-full">
            <p className="text-sm font-medium text-finance-muted">{greeting}</p>
            <h1 className="break-words font-display text-3xl font-bold leading-snug tracking-normal text-finance-text sm:text-4xl md:text-[2.6rem]">
              {header.title}
            </h1>
            <p className="mt-2 max-w-2xl break-words text-sm text-finance-muted">
              {header.description}
            </p>
          </div>

          {/* Ações: tema + notificações + perfil (desktop) */}
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <NotificationBell />
            {displayName && (
              <div className="flex items-center gap-2 rounded-full border border-finance-border bg-finance-surface px-3 py-1.5 shadow-sm">
                <HeaderAvatar name={displayName} />
                <p className="max-w-[140px] truncate text-[0.78rem] font-semibold text-finance-text">
                  {displayName}
                </p>
              </div>
            )}
          </div>

          {/* Nota: no mobile o sino de notificações fica no topbar fixo (Sidebar.jsx).
               Aqui não renderizamos nada para mobile para evitar duplicação. */}
        </header>

        <Outlet />
      </section>

      <OnboardingModal
        initialName={nome}
        onComplete={refreshLegacyDashboardData}
        open={showOnboarding}
      />
    </main>
  );
}
