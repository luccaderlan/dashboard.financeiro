import { lazy, Suspense, useMemo } from 'react';
import { FinancialInsights } from '../components/FinancialInsights.jsx';
import { KpiCard } from '../components/KpiCard.jsx';
import { UpcomingBillsTable } from '../components/UpcomingBillsTable.jsx';
import { Skeleton } from '../components/ui/index.js';
import { useDashboardContext } from '../context/DashboardContext.jsx';
import { useLegacyKpis } from '../hooks/useLegacyKpis.js';
import { useLegacyUpcomingBills } from '../hooks/useLegacyUpcomingBills.js';
import { formatCurrency } from '../utils/formatters.js';

const DashboardAnalytics = lazy(() => import('../components/charts/DashboardAnalytics.jsx')
  .then(module => ({ default: module.DashboardAnalytics })));

function QuickPanelCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-finance-border bg-finance-surface p-4 shadow-sm shadow-slate-900/[0.04]">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.05em] text-finance-muted">{title}</p>
      {children}
    </div>
  );
}

function GoalProgress({ goal }) {
  // Suporta o formato normalizado (currentValue/targetValue/title) e formatos legados
  const current = parseFloat(goal.currentValue ?? goal.current ?? goal.saved ?? goal.valor ?? 0);
  const target = parseFloat(goal.targetValue ?? goal.target ?? goal.goal ?? goal.objetivo ?? 1) || 1;
  const percent = Math.min(Math.round((current / target) * 100), 100);
  const label = goal.title || goal.name || goal.label || goal.description || 'Meta';

  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-finance-text">{label}</p>
        <span className="shrink-0 text-[0.7rem] font-semibold text-finance-accent">{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-finance-accent transition-all duration-500"
          style={{ width: percent + '%' }}
        />
      </div>
      <p className="mt-0.5 text-[0.68rem] text-finance-muted">
        {formatCurrency(current)} / {formatCurrency(target)}
      </p>
    </div>
  );
}

function QuickLink({ href, label, icon }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium text-finance-muted transition-colors hover:bg-slate-50 hover:text-finance-text dark:hover:bg-slate-800"
    >
      <span className="shrink-0 text-finance-accent">{icon}</span>
      {label}
    </a>
  );
}

function DashboardRightPanel({ upcomingBills, goals }) {
  const visibleBills = (upcomingBills || []).slice(0, 4);
  const visibleGoals = (goals || []).slice(0, 3);

  return (
    <aside className="flex flex-col gap-4">
      <QuickPanelCard title="Proximos vencimentos">
        {visibleBills.length === 0 ? (
          <p className="text-xs text-finance-muted">Nenhum vencimento proximo.</p>
        ) : (
          <div className="space-y-2">
            {visibleBills.map((bill, idx) => (
              <div key={bill.id || idx} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-finance-text">
                    {bill.description || bill.name || bill.label || 'Item'}
                  </p>
                  <p className="text-[0.68rem] text-finance-muted">
                    {bill.dueDate || bill.date || ''}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-finance-red">
                  {bill.amount != null ? formatCurrency(bill.amount) : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </QuickPanelCard>

      <QuickPanelCard title="Metas em andamento">
        {visibleGoals.length === 0 ? (
          <p className="text-xs text-finance-muted">Nenhuma meta cadastrada ainda.</p>
        ) : (
          visibleGoals.map((goal, idx) => (
            <GoalProgress key={goal.id || idx} goal={goal} />
          ))
        )}
      </QuickPanelCard>

      <QuickPanelCard title="Atalhos rapidos">
        <div className="-mx-1 flex flex-col">
          <QuickLink
            href="#/fluxo"
            label="Nova entrada/saida"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          />
          <QuickLink
            href="#/dividas"
            label="Ver dividas"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            }
          />
          <QuickLink
            href="#/relatorios"
            label="Ver relatorios"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
              </svg>
            }
          />
          <QuickLink
            href="#/metas"
            label="Gerenciar metas"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
              </svg>
            }
          />
        </div>
      </QuickPanelCard>
    </aside>
  );
}

function AnalyticsFallback() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-2xl border border-finance-border bg-finance-surface p-5 shadow-sm shadow-slate-900/[0.04]">
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="h-72 w-full" />
      </div>
      <div className="rounded-2xl border border-finance-border bg-finance-surface p-5 shadow-sm shadow-slate-900/[0.04]">
        <Skeleton className="mb-4 h-5 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const kpis = useLegacyKpis();
  const upcomingBills = useLegacyUpcomingBills();
  const { goals } = useDashboardContext();
  // goals = { items: [], summary: {} } — extrair o array
  const goalItems = Array.isArray(goals?.items) ? goals.items : [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_272px]">
      <div className="min-w-0 space-y-5 md:space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <KpiCard
            label="Total de Dividas"
            value={kpis.totalDebts.value}
            subtitle={kpis.totalDebts.subtitle}
            valueColor="red"
            icon="debt"
          />
          <KpiCard
            label="Vence este mes"
            value={kpis.dueThisMonth.value}
            subtitle={kpis.dueThisMonth.subtitle}
            valueColor="yellow"
            icon="due"
          />
          <KpiCard
            label="Em Atraso"
            value={kpis.overdue.value}
            subtitle={kpis.overdue.subtitle}
            valueColor="red"
            icon="alert"
          />
          <KpiCard
            label="Saldo Disponivel"
            value={kpis.balance.value}
            subtitle={kpis.balance.subtitle}
            valueColor={kpis.balance.valueColor}
            icon="balance"
          />
        </div>

        <FinancialInsights />

        <Suspense fallback={<AnalyticsFallback />}>
          <DashboardAnalytics />
        </Suspense>

        <UpcomingBillsTable bills={upcomingBills} />
      </div>

      <DashboardRightPanel upcomingBills={upcomingBills} goals={goalItems} />
    </div>
  );
}
