import { formatCurrency } from '../utils/formatters.js';

function DebtSummaryItem({ label, value, tone = 'default' }) {
  const toneClasses = {
    red: 'text-finance-red',
    green: 'text-finance-green',
    yellow: 'text-finance-yellow',
    default: 'text-finance-text'
  };

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-[12px] border border-finance-border bg-white p-4 dark:bg-slate-900">
      <div className="text-xs font-semibold uppercase text-finance-muted">{label}</div>
      <div className={['mt-2 break-words font-number text-lg font-bold tabular-nums sm:text-xl', toneClasses[tone]].join(' ')}>
        {value}
      </div>
    </div>
  );
}

export function DebtSummary({ summary }) {
  return (
    <div className="grid min-w-0 max-w-full gap-3 md:grid-cols-4">
      <DebtSummaryItem label="Total em aberto" value={formatCurrency(summary.totalOpen)} tone="red" />
      <DebtSummaryItem label="Dívidas ativas" value={`${summary.activeCount} item(s)`} />
      <DebtSummaryItem label="Em atraso" value={formatCurrency(summary.totalOverdue)} tone="yellow" />
      <DebtSummaryItem label="Dívidas pagas" value={`${summary.paidCount} item(s)`} tone="green" />
    </div>
  );
}
