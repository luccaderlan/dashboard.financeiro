import { cn } from './utils.js';

export function TableShell({ title, children, className = '' }) {
  return (
    <section className={cn('min-w-0 max-w-full overflow-hidden rounded-[14px] border border-finance-border bg-white transition-shadow duration-200 hover:shadow-sm dark:bg-slate-900 dark:hover:shadow-black/20', className)}>
      {title ? (
        <div className="border-b border-finance-border px-6 py-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
      ) : null}
      <div className="max-w-full overflow-x-auto">{children}</div>
    </section>
  );
}

export function Table({ children, className = '' }) {
  return (
    <table className={cn('w-full min-w-[680px] border-collapse text-left', className)}>
      {children}
    </table>
  );
}

export function TableHeaderCell({ children, className = '' }) {
  return (
    <th className={cn('border-b border-finance-border bg-slate-100 px-5 py-3 text-xs font-semibold uppercase text-finance-muted dark:bg-slate-950/70', className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={cn('border-b border-finance-border px-4 py-4 text-sm text-finance-text sm:px-5', className)} {...props}>
      {children}
    </td>
  );
}

export function TableRow({ children, className = '' }) {
  return (
    <tr className={cn('transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/70', className)}>
      {children}
    </tr>
  );
}
