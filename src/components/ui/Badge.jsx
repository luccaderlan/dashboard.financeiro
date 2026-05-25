import { cn } from './utils.js';

const tones = {
  blue: 'bg-blue-100 text-finance-blue dark:bg-blue-950/60',
  green: 'bg-green-100 text-finance-green dark:bg-green-950/60',
  red: 'bg-red-100 text-finance-red dark:bg-red-950/60',
  yellow: 'bg-yellow-100 text-finance-yellow dark:bg-yellow-950/60',
  neutral: 'bg-slate-100 text-finance-muted dark:bg-slate-800'
};

export function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200',
        tones[tone] || tones.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
