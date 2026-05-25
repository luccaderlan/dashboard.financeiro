import { cn } from './utils.js';

export function Card({ children, className = '', ...props }) {
  return (
    <section
      className={cn(
        // Superficie tokenizada (claro: branco / escuro: slate-900) +
        // sombra mais elegante alinhada a referencia PayU.
        'min-w-0 max-w-full overflow-hidden rounded-2xl border border-finance-border bg-finance-surface p-4 shadow-sm shadow-slate-900/[0.04] transition-shadow duration-200 hover:shadow-md hover:shadow-slate-900/[0.06] dark:shadow-black/20 sm:p-5',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h2
      className={cn('text-base font-semibold leading-tight text-finance-text', className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
