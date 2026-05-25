import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications.js';

// ─── Metadados visuais por tipo ───────────────────────────────────────────────
const typeMeta = {
  critical: {
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
    label: 'Crítico',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    )
  },
  warning: {
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400',
    label: 'Atenção',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  },
  info: {
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
    label: 'Informativo',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    )
  },
  success: {
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400',
    label: 'Conquista',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }
};

// ─── Item individual de notificação ──────────────────────────────────────────
function NotificationItem({ notification, isRead, onRead }) {
  const meta = typeMeta[notification.type] || typeMeta.info;

  return (
    <button
      type="button"
      onClick={() => onRead(notification.id)}
      className={[
        'w-full rounded-[10px] border p-3 text-left transition-colors',
        isRead
          ? 'border-finance-border bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
          : 'border-finance-border bg-slate-50 dark:bg-slate-800/60'
      ].join(' ')}
    >
      <div className="flex items-start gap-2.5">
        {/* Indicador de não lida */}
        <div className="mt-1 flex shrink-0 items-center">
          {!isRead
            ? <span className={['h-2 w-2 rounded-full', meta.dot].join(' ')} />
            : <span className="h-2 w-2 rounded-full bg-transparent" />
          }
        </div>

        <div className="min-w-0 flex-1">
          {/* Badge de tipo */}
          <span className={[
            'mb-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold',
            meta.badge
          ].join(' ')}>
            {meta.icon}
            {meta.label}
          </span>

          <p className="text-xs font-semibold text-finance-text">{notification.title}</p>
          <p className="mt-0.5 text-[0.72rem] leading-relaxed text-finance-muted">{notification.description}</p>
        </div>
      </div>
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function NotificationBell() {
  const { notifications, unreadCount, isRead, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event) {
      if (
        panelRef.current && !panelRef.current.contains(event.target) &&
        triggerRef.current && !triggerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Fecha com Esc
  useEffect(() => {
    if (!open) return;
    function handleEsc(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  return (
    <div className="relative">
      {/* ── Botão sino ────────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
        onClick={() => setOpen(v => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-finance-muted transition-colors hover:bg-slate-100 hover:text-finance-text dark:hover:bg-slate-800"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[0.6rem] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Painel dropdown ───────────────────────────────────────────── */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[14px] border border-finance-border bg-white shadow-xl dark:bg-slate-950"
        >
          {/* Header do painel */}
          <div className="flex items-center justify-between border-b border-finance-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-finance-text">Notificações</p>
              {unreadCount > 0 && (
                <p className="text-[0.72rem] text-finance-muted">{unreadCount} não lida(s)</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[0.72rem] font-medium text-finance-accent transition-opacity hover:opacity-70"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-finance-muted opacity-40">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p className="text-xs text-finance-muted">Nenhuma notificação no momento.</p>
              </div>
            ) : (
              <div className="space-y-1.5 p-3">
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isRead={isRead(notification.id)}
                    onRead={markRead}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
