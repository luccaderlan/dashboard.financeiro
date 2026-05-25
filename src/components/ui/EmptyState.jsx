import { cn } from './utils.js';

export function EmptyState({ children, icon, className = '' }) {
  return (
    <div className={cn('px-6 py-10 text-center text-sm text-finance-muted', className)}>
      {icon ? (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-finance-border bg-slate-50 font-semibold text-finance-blue dark:bg-slate-950">
          {icon}
        </div>
      ) : null}
      <p className="mx-auto max-w-sm leading-relaxed">{children}</p>
    </div>
  );
}
