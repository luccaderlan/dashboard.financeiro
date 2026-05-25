import { formatCurrency } from '../utils/formatters.js';

function LoanSummaryItem({ label, value, tone = 'default' }) {
  const toneClasses = {
    blue: 'text-finance-blue',
    red: 'text-finance-red',
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

export function LoanSummary({ summary }) {
  return (
    <div className="grid min-w-0 max-w-full gap-3 md:grid-cols-4">
      <LoanSummaryItem label="Empréstimos" value={`${summary.count} item(s)`} />
      <LoanSummaryItem label="Valor total" value={formatCurrency(summary.totalValue)} tone="red" />
      <LoanSummaryItem label="Saldo em aberto" value={formatCurrency(summary.openBalance)} tone="yellow" />
      <LoanSummaryItem label="Compromisso mensal" value={formatCurrency(summary.monthlyCommitment)} tone="blue" />
    </div>
  );
}
