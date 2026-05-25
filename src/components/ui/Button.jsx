import { cn } from './utils.js';

const variants = {
  primary: 'bg-finance-blue text-white hover:bg-blue-700 focus-visible:ring-blue-200 dark:hover:bg-blue-500 dark:focus-visible:ring-blue-900/50',
  secondary: 'border border-finance-border bg-white text-finance-text hover:bg-slate-50 focus-visible:ring-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-700',
  danger: 'border border-rose-200 bg-rose-50 text-finance-red hover:bg-rose-100 focus-visible:ring-rose-200 dark:border-rose-900/70 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 dark:focus-visible:ring-rose-900/50',
  ghost: 'border border-finance-border bg-white text-finance-muted hover:border-blue-200 hover:bg-blue-50 hover:text-finance-blue focus-visible:ring-blue-100 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus-visible:ring-blue-900/50',
  success: 'border border-emerald-200 bg-emerald-50 text-finance-green hover:bg-emerald-100 focus-visible:ring-emerald-200 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 dark:focus-visible:ring-emerald-900/50'
};

const sizes = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-5 py-3 text-sm'
};

export function Button({ children, variant = 'primary', size = 'md', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-60',
        sizes[size] || sizes.md,
        variants[variant] || variants.primary,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
