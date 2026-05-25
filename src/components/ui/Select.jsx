import { cn } from './utils.js';

export function Select({ children, className = '', ...props }) {
  return (
    <select
      className={cn(
        'w-full min-w-0 max-w-full rounded-[10px] border border-finance-border bg-white px-3 py-2 text-sm font-medium text-finance-text outline-none transition-colors duration-200 focus:border-finance-blue focus:ring-4 focus:ring-blue-100 dark:bg-slate-950 dark:focus:ring-blue-900/50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
