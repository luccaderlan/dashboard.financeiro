import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from './utils.js';

const ToastContext = createContext(null);

const toastStyles = {
  success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200'
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback(id => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback(({ title, description, tone = 'info' }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setToasts(current => [...current, { id, title, description, tone }].slice(-3));
    window.setTimeout(() => removeToast(id), 3800);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto w-full max-w-sm rounded-[14px] border px-4 py-3 text-sm shadow-lg shadow-slate-900/10 transition-all duration-200 dark:shadow-black/30',
              toastStyles[toast.tone] || toastStyles.info
            )}
            role="status"
          >
            <div className="font-semibold">{toast.title}</div>
            {toast.description ? (
              <div className="mt-1 leading-relaxed opacity-85">{toast.description}</div>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.');
  }

  return context.showToast;
}
