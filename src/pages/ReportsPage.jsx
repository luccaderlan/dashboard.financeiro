import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ChartCard } from '../components/charts/ChartCard.jsx';
import { Card, CardContent, CardHeader, CardTitle, EmptyState, Field, Input } from '../components/ui/index.js';
import { useDashboardContext } from '../context/DashboardContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { getCurrentMonthKey, getMonthLabel, getMonthlyReport } from '../services/monthlyReport.js';
import { formatCompactCurrency, formatCurrency } from '../utils/formatters.js';

const chartTheme = {
  light: {
    grid: '#e2e8f0',
    text: '#64748b',
    tooltipBg: '#ffffff',
    tooltipText: '#1e293b',
    tooltipBorder: '#e2e8f0',
    colors: {
      income: '#16a34a',
      expense: '#dc2626',
      balance: '#2563eb',
      paidDebt: '#0891b2',
      dueDebt: '#f59e0b'
    },
    categories: ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2']
  },
  dark: {
    grid: '#334155',
    text: '#94a3b8',
    tooltipBg: '#0f172a',
    tooltipText: '#e2e8f0',
    tooltipBorder: '#334155',
    colors: {
      income: '#4ade80',
      expense: '#f87171',
      balance: '#60a5fa',
      paidDebt: '#22d3ee',
      dueDebt: '#fbbf24'
    },
    categories: ['#60a5fa', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee']
  }
};

function currencyTick(value) {
  return formatCompactCurrency(value);
}

function ReportTooltip({ active, payload, label, theme }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-[10px] border px-3 py-2 text-xs shadow-sm"
      style={{
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        color: theme.tooltipText
      }}
    >
      {label ? <div className="mb-1 font-semibold">{label}</div> : null}
      {payload.map(item => (
        <div key={`${item.name}-${item.value}`} className="font-medium" style={{ color: theme.text }}>
          {item.name}: <span className="font-number font-bold" style={{ color: theme.tooltipText }}>{formatCurrency(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

function ReportMetric({ label, value, subtitle, tone = 'default' }) {
  const toneClasses = {
    income: 'text-finance-green',
    expense: 'text-finance-red',
    balance: 'text-finance-blue',
    warning: 'text-finance-yellow',
    default: 'text-finance-text'
  };

  return (
    <Card className="p-4">
      <div className="text-xs font-semibold uppercase text-finance-muted">{label}</div>
      <div className={['mt-2 break-all font-number text-lg font-bold tabular-nums sm:text-xl', toneClasses[tone]].join(' ')}>
        {value}
      </div>
      {subtitle ? <div className="mt-1 text-xs font-medium text-finance-muted">{subtitle}</div> : null}
    </Card>
  );
}

function hasPositiveData(data = []) {
  return data.some(item => (Number(item.value) || 0) > 0);
}

export function ReportsPage() {
  const { budgets, cashFlow, debts, dividas, loans } = useDashboardContext();
  const { resolvedTheme } = useTheme();
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey);
  const colors = chartTheme[resolvedTheme] || chartTheme.light;

  const report = useMemo(
    () => getMonthlyReport({ budgets, cashFlow, debts, rawDebts: dividas, loans }, monthKey),
    [budgets, cashFlow, debts, dividas, loans, monthKey]
  );

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Período do relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[220px_1fr] md:items-end">
            <Field label="Mês e ano">
              <Input
                type="month"
                value={monthKey}
                onChange={event => setMonthKey(event.target.value || getCurrentMonthKey())}
              />
            </Field>
            <div className="rounded-[10px] border border-finance-border bg-slate-50 px-4 py-3 text-sm font-medium text-finance-muted dark:bg-slate-950">
              Resumo de {getMonthLabel(monthKey)} com base nos dados reais salvos no dashboard.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-5">
        <ReportMetric label="Entradas" value={formatCurrency(report.income)} subtitle={`${report.cashFlowCount} lançamento(s)`} tone="income" />
        <ReportMetric label="Saídas" value={formatCurrency(report.expenses)} subtitle="Despesas do período" tone="expense" />
        <ReportMetric label="Saldo do mês" value={formatCurrency(report.balance)} subtitle="Entradas menos saídas" tone={report.balance >= 0 ? 'balance' : 'expense'} />
        <ReportMetric label="Dívidas pagas" value={formatCurrency(report.paidDebtsTotal)} subtitle={`${report.paidDebtsCount} dívida(s)`} tone="income" />
        <ReportMetric label="Vencendo no mês" value={formatCurrency(report.dueDebtsTotal)} subtitle={`${report.dueDebtsCount} compromisso(s)`} tone="warning" />
      </div>

      {report.budgetUsage.items.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos do mês</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Resumo geral */}
            <div className="grid gap-3 md:grid-cols-3 mb-6">
              <ReportMetric label="Limite planejado" value={formatCurrency(report.budgetUsage.summary.limit)} />
              <ReportMetric label="Consumo total" value={formatCurrency(report.budgetUsage.summary.spent)} tone={report.budgetUsage.summary.spent > report.budgetUsage.summary.limit ? 'expense' : 'warning'} />
              <ReportMetric label="Ultrapassados" value={`${report.budgetUsage.summary.overCount} item(s)`} tone={report.budgetUsage.summary.overCount ? 'expense' : 'income'} />
            </div>

            {/* Detalhamento por orçamento */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.05em] text-finance-muted">Detalhamento por categoria</p>
              {report.budgetUsage.items.map(item => {
                const isOver = item.status === 'over';
                const isNear = item.status === 'near';
                const barColor = isOver
                  ? 'bg-finance-red'
                  : isNear
                    ? 'bg-finance-yellow'
                    : 'bg-finance-green';
                const badgeLabel = isOver ? 'Ultrapassado' : isNear ? 'Próximo do limite' : 'Dentro do limite';
                const badgeTone = isOver ? 'red' : isNear ? 'yellow' : 'green';

                return (
                  <div key={item.id} className="rounded-[10px] border border-finance-border bg-slate-50 p-4 dark:bg-slate-950/40">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-finance-text">{item.category}</p>
                        <p className="mt-0.5 text-xs text-finance-muted">
                          {formatCurrency(item.spent)} de {formatCurrency(item.limit)}
                          {item.remaining >= 0
                            ? ` — restam ${formatCurrency(item.remaining)}`
                            : ` — excedido em ${formatCurrency(Math.abs(item.remaining))}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={[
                          'rounded-full px-2 py-0.5 text-[0.68rem] font-semibold',
                          badgeTone === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' :
                          badgeTone === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300' :
                          'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300'
                        ].join(' ')}>
                          {badgeLabel}
                        </span>
                        <span className="font-number text-sm font-bold text-finance-text">{item.percent}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className={['h-2 rounded-full transition-all duration-300', barColor].join(' ')}
                        style={{ width: `${Math.min(item.percent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Resumo mensal"
          subtitle="Entradas, saídas, saldo e dívidas do período selecionado."
          empty={!hasPositiveData(report.chartData)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.chartData} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: colors.text, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: colors.text, fontSize: 11 }} tickFormatter={currencyTick} tickLine={false} axisLine={false} width={68} />
              <Tooltip content={<ReportTooltip theme={colors} />} />
              <Bar dataKey="value" name="Valor" minPointSize={4} radius={[8, 8, 0, 0]}>
                {report.chartData.map(item => (
                  <Cell key={item.name} fill={colors.colors[item.tone] || colors.colors.balance} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Saídas por categoria"
          subtitle="Distribuição das despesas dentro do mês selecionado."
          empty={!hasPositiveData(report.expenseCategoryData)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ReportTooltip theme={colors} />} />
              <Legend wrapperStyle={{ color: colors.text }} />
              <Pie
                data={report.expenseCategoryData}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={3}
              >
                {report.expenseCategoryData.map((item, index) => (
                  <Cell key={item.name} fill={colors.categories[index % colors.categories.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {report.cashFlowCount || report.paidDebtsCount || report.dueDebtsCount ? null : (
        <EmptyState>Nenhum movimento encontrado para o mês selecionado.</EmptyState>
      )}
    </section>
  );
}
