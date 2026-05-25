import { useTheme } from '../context/ThemeContext.jsx';

const options = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Auto' }
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="flex w-fit items-center gap-1 rounded-[10px] border border-finance-border bg-white/70 p-0.5 opacity-80 shadow-none dark:bg-slate-900/70 sm:gap-2 sm:p-1 sm:opacity-100">
      {options.map(option => {
        const active = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={[
              'min-h-9 rounded-[9px] px-3 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:focus-visible:ring-blue-900/50',
              active
                ? 'bg-slate-100 text-finance-text shadow-none dark:bg-slate-800'
                : 'text-finance-muted hover:bg-slate-100 hover:text-finance-text dark:hover:bg-slate-800'
            ].join(' ')}
            aria-pressed={active}
            aria-label={`Usar tema ${option.label.toLowerCase()}`}
            onClick={() => setTheme(option.value)}
          >
            {option.label}
          </button>
        );
      })}
      <span className="sr-only">Tema atual: {resolvedTheme}</span>
    </div>
  );
}
