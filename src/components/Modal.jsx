export function Modal({ title, children, open = false, className = '' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <section
        className={[
          'max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-finance-border bg-finance-surface p-5 text-finance-text shadow-xl shadow-slate-900/10 sm:p-8',
          className
        ].join(' ')}
        role="dialog"
        aria-modal="true"
      >
        {title ? (
          <h2 className="mb-6 font-display text-2xl font-semibold leading-tight tracking-tight text-finance-text sm:text-3xl">
            {title}
          </h2>
        ) : null}
        {children}
      </section>
    </div>
  );
}
