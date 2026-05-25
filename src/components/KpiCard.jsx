import { Card } from './Card.jsx';

// ─── Cores por tipo de valor ──────────────────────────────────────────────────
const valueColorClasses = {
  red:     'text-finance-red',
  green:   'text-finance-green',
  yellow:  'text-finance-yellow',
  blue:    'text-finance-blue',
  accent:  'text-finance-accent',
  default: 'text-finance-text'
};

// ─── Ícones temáticos inline ──────────────────────────────────────────────────
const kpiIcons = {
  debt: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  due: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  alert: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  balance: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  income: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  expense: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
    </svg>
  )
};

// ─── Cor do container do ícone ────────────────────────────────────────────────
const iconContainerColor = {
  red:     'bg-red-50 text-finance-red dark:bg-red-950/40',
  green:   'bg-green-50 text-finance-green dark:bg-green-950/40',
  yellow:  'bg-yellow-50 text-finance-yellow dark:bg-yellow-950/40',
  blue:    'bg-blue-50 text-finance-blue dark:bg-blue-950/40',
  accent:  'bg-finance-accent-bg text-finance-accent',
  default: 'bg-slate-100 text-finance-muted dark:bg-slate-800'
};

// ─── Componente ───────────────────────────────────────────────────────────────
export function KpiCard({
  label,
  value,
  subtitle,
  valueColor = 'default',
  icon,     // 'debt' | 'due' | 'alert' | 'balance' | 'income' | 'expense'
  trend,    // { direction: 'up' | 'down', label: string }
  className = ''
}) {
  const iconColor = iconContainerColor[valueColor] || iconContainerColor.default;

  return (
    <Card className={['p-4 shadow-sm sm:p-5', className].join(' ')}>
      {/* Label + ícone */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.05em] text-finance-muted">
          {label}
        </p>
        {icon && kpiIcons[icon] && (
          <div className={['flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', iconColor].join(' ')}>
            {kpiIcons[icon]}
          </div>
        )}
      </div>

      {/* Valor */}
      <div className={[
        'break-all font-number text-[1.35rem] font-bold leading-tight tabular-nums sm:text-[1.55rem]',
        valueColorClasses[valueColor] || valueColorClasses.default
      ].join(' ')}>
        {value}
      </div>

      {/* Subtítulo + trend opcional */}
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        {subtitle && (
          <p className="text-[0.82rem] text-finance-muted">{subtitle}</p>
        )}
        {trend && (
          <span className={[
            'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.68rem] font-semibold',
            trend.direction === 'up'
              ? 'bg-green-50 text-finance-green dark:bg-green-950/40'
              : 'bg-red-50 text-finance-red dark:bg-red-950/40'
          ].join(' ')}>
            {trend.direction === 'up'
              ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
              : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            }
            {trend.label}
          </span>
        )}
      </div>
    </Card>
  );
}
