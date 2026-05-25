import { formatCurrency } from '../../utils/formatters.js';

function SummaryItem({ label, value, tone = 'default' }) {
  const toneClasses = {
    blue: 'text-finance-blue',
    green: 'text-finance-green',
    yellow: 'text-finance-yellow',
    default: 'text-finance-text'
  };

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-[12px] border border-finance-border bg-white p-4 dark:bg-slate-900">
      <div className="text-xs font-semibold uppercase text-finance-muted">{label}</div>
      <div className={['mt-2 break-all font-number text-lg font-bold tabular-nums sm:text-xl', toneClasses[tone]].join(' ')}>
        {value}
      </div>
    </div>
  );
}

export function GoalSummary({ summary }) {
  return (
    <div className="grid min-w-0 max-w-full gap-3 md:grid-cols-4">
      <SummaryItem label="Acumulado" value={formatCurrency(summary.currentValue)} tone="green" />
      <SummaryItem label="Valor alvo" value={formatCurrency(summary.targetValue)} tone="blue" />
      <SummaryItem label="Concluídas" value={`${summary.completedCount}/${summary.count}`} tone="yellow" />
      <SummaryItem label="Progresso médio" value={`${summary.averageProgress}%`} />
    </div>
  );
}
