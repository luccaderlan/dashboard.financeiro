import { cn } from './utils.js';

export function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-[12px] bg-slate-200 dark:bg-slate-800', className)}
    />
  );
}
