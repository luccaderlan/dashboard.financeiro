import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { NotificationBell } from './NotificationBell.jsx';

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}
function IconArrows() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}
function IconCreditCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}
function IconBank() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}
function IconRepeat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
function IconPieChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const icons = {
  dashboard:    <IconHome />,
  fluxo:        <IconArrows />,
  dividas:      <IconCreditCard />,
  emprestimos:  <IconBank />,
  metas:        <IconTarget />,
  recorrencias: <IconRepeat />,
  orcamentos:   <IconPieChart />,
  relatorios:   <IconBarChart />,
  configuracoes:<IconSettings />,
};

function UserAvatar({ name, size = 'md' }) {
  const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-[0.65rem]' : 'h-9 w-9 text-xs';
  return (
    <div className={[sizeClass, 'flex shrink-0 items-center justify-center rounded-full bg-finance-accent font-semibold text-white'].join(' ')}>
      {initials}
    </div>
  );
}

const defaultItems = [
  { id: 'dashboard',    label: 'Início',             to: '/' },
  { id: 'fluxo',        label: 'Entradas e Saídas',  to: '/fluxo' },
  { id: 'dividas',      label: 'Dívidas',            to: '/dividas' },
  { id: 'emprestimos',  label: 'Empréstimos',        to: '/emprestimos' },
  { id: 'metas',        label: 'Metas',              to: '/metas' },
  { id: 'recorrencias', label: 'Recorrências',       to: '/recorrencias' },
  { id: 'orcamentos',   label: 'Orçamentos',         to: '/orcamentos' },
  { id: 'relatorios',   label: 'Relatórios',         to: '/relatorios' },
  { id: 'configuracoes',label: 'Configurações',      to: '/configuracoes' }
];

const activeClass = 'bg-finance-accent-bg text-finance-accent font-semibold';
// Hover via mix-blend-friendly: usamos um overlay com finance-text/8 para
// funcionar igualmente bem em light e dark sem precisar de classes dark:*.
const inactiveClass = 'text-finance-muted hover:bg-finance-text/[0.06] hover:text-finance-text font-medium';

export function Sidebar({ items = defaultItems, tutorialLabel = 'Ver tutorial', onTutorialClick, className = '' }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <aside className={['hidden md:flex md:h-screen md:w-[256px] md:flex-col md:overflow-y-auto md:border-r md:border-finance-border md:bg-finance-surface md:sticky md:top-0', className].join(' ')}>
        <div className="flex items-center gap-2.5 border-b border-finance-border px-5 py-[1.15rem]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-finance-accent text-white shadow-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-[0.95rem] font-bold tracking-tight text-finance-text">MeuControle</span>
        </div>
        <nav aria-label="Navegacao principal" className="flex flex-1 flex-col gap-0.5 px-3 py-4">
          {items.map(item => (
            <NavLink key={item.id} to={item.to} end={item.to === '/'}
              className={({ isActive }) => ['flex min-w-0 items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm transition-colors', isActive ? activeClass : inactiveClass].join(' ')}>
              <span className="shrink-0">{icons[item.id]}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        {onTutorialClick && (
          <div className="px-3">
            <button type="button" onClick={onTutorialClick} className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[0.82rem] font-medium text-finance-muted transition-colors hover:bg-finance-text/[0.06]">
              {tutorialLabel}
            </button>
          </div>
        )}
        <div className="border-t border-finance-border px-3 py-3">
          {user?.name && (
            <div className="mb-2 flex items-center gap-2.5 rounded-[10px] px-3 py-2">
              <UserAvatar name={user.name} />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-finance-text">{user.name}</p>
                <p className="text-[0.7rem] text-finance-muted">Conta pessoal</p>
              </div>
            </div>
          )}
          <button type="button" onClick={() => logout()} className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[0.82rem] font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
            <span className="shrink-0"><IconLogout /></span>
            Sair da conta
          </button>
        </div>
      </aside>

      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-finance-border bg-finance-surface px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-finance-accent text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-finance-text">MeuControle</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Sino de notificações — no topo ao lado do avatar no mobile */}
          <NotificationBell />
          {user?.name && <UserAvatar name={user.name} size="sm" />}
          <button type="button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenuOpen(v => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-finance-muted transition-colors hover:bg-finance-text/[0.06]">
            {menuOpen
              ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" /></svg>
              : <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="17" y2="6" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14" x2="17" y2="14" /></svg>
            }
          </button>
        </div>
      </div>

      {menuOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMenuOpen(false)} />}

      <div className={['fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col bg-finance-surface shadow-2xl transition-transform duration-300 md:hidden', menuOpen ? 'translate-x-0' : 'translate-x-full'].join(' ')}>
        <div className="flex h-14 items-center justify-between border-b border-finance-border px-5">
          <span className="text-sm font-semibold text-finance-text">Menu</span>
          <button type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-finance-muted hover:bg-finance-text/[0.06]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" /></svg>
          </button>
        </div>
        <nav aria-label="Navegacao mobile" className="flex-1 overflow-y-auto px-3 py-3">
          {items.map(item => (
            <NavLink key={item.id} to={item.to} end={item.to === '/'}
              className={({ isActive }) => ['flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors', isActive ? activeClass : inactiveClass].join(' ')}>
              <span className="shrink-0">{icons[item.id]}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-finance-border px-3 py-3">
          {user?.name && (
            <div className="mb-2 flex items-center gap-2.5 rounded-[10px] px-3 py-2">
              <UserAvatar name={user.name} />
              <p className="truncate text-xs font-semibold text-finance-text">{user.name}</p>
            </div>
          )}
          {onTutorialClick && (
            <button type="button" onClick={onTutorialClick} className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium text-finance-muted transition-colors hover:bg-finance-text/[0.06]">
              {tutorialLabel}
            </button>
          )}
          <button type="button" onClick={() => logout()} className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
            <span className="shrink-0"><IconLogout /></span>
            Sair da conta
          </button>
        </div>
      </div>
    </>
  );
}
