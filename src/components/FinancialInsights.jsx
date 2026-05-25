import { useMemo } from 'react';
import { useDashboardContext } from '../context/DashboardContext.jsx';
import { getFinancialInsights } from '../services/financialInsights.js';
import { Badge, Card, CardContent, CardHeader, CardTitle } from './ui/index.js';

const priorityMeta = {
  info: {
    label: 'Informativo',
    tone: 'blue',
    border: 'border-blue-200 dark:border-blue-900/70'
  },
  warning: {
    label: 'Atenção',
    tone: 'yellow',
    border: 'border-yellow-200 dark:border-yellow-900/70'
  },
  critical: {
    label: 'Crítico',
    tone: 'red',
    border: 'border-red-200 dark:border-red-900/70'
  }
};

function InsightItem({ insight }) {
  const meta = priorityMeta[insight.priority] || priorityMeta.info;

  return (
    <div
      className={[
        'rounded-[12px] border bg-slate-50 p-4 transition-colors duration-200 dark:bg-slate-950',
        meta.border
      ].join(' ')}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Badge tone={meta.tone}>{meta.label}</Badge>
        {insight.metric ? (
          <span className="font-number text-sm font-bold tabular-nums text-finance-text">
            {insight.metric}
          </span>
        ) : null}
      </div>
      <div className="text-sm font-bold text-finance-text">{insight.title}</div>
      <p className="mt-1 text-sm leading-relaxed text-finance-muted">{insight.description}</p>
    </div>
  );
}

export function FinancialInsights() {
  const { budgets, cashFlow, debts, goals, recurrences } = useDashboardContext();
  const insights = useMemo(
    () => getFinancialInsights({ budgets, cashFlow, debts, goals, recurrences }),
    [budgets, cashFlow, debts, goals, recurrences]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Insights Financeiros</CardTitle>
            <p className="mt-2 text-sm text-finance-muted">
              Leituras automaticas geradas localmente com base nos seus dados atuais.
            </p>
          </div>
          <Badge>{insights.length} insight(s)</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 lg:grid-cols-2">
          {insights.map(insight => (
            <InsightItem key={insight.id} insight={insight} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
