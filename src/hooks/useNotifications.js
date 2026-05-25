import { useMemo, useState, useCallback } from 'react';
import { useDashboardContext } from '../context/DashboardContext.jsx';
import { generateNotifications } from '../services/notificationsService.js';

const READ_KEY = 'mc_notifications_read';

function getReadIds() {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveReadIds(ids) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
  } catch {
    // localStorage indisponível — ignora silenciosamente
  }
}

/**
 * useNotifications — hook que calcula notificações a partir dos dados do dashboard.
 *
 * Retorna:
 * - notifications: todas as notificações geradas
 * - unreadCount:   quantidade de não lidas
 * - markAllRead:   função para marcar todas como lidas
 * - markRead:      função para marcar uma notificação específica como lida
 * - isRead:        função para verificar se uma notificação foi lida
 */
export function useNotifications() {
  const { debts, loans, goals, cashFlow, budgets, recurrences } = useDashboardContext();
  const [readIds, setReadIds] = useState(getReadIds);

  // goals = { items: [], summary: {} } no DashboardContext — extrair o array
  const goalItems = Array.isArray(goals?.items) ? goals.items : [];

  // debts = { activeDebts, paidDebts, summary } — extrair array de ativas
  // loans = { items, summary }                   — extrair array de items
  const debtItems = Array.isArray(debts?.activeDebts) ? debts.activeDebts : [];
  const loanItems = Array.isArray(loans?.items) ? loans.items : [];

  const notifications = useMemo(
    () => generateNotifications({ debts: debtItems, loans: loanItems, goals: goalItems, cashFlow, budgets, recurrences }),
    [debtItems, loanItems, goalItems, cashFlow, budgets, recurrences]
  );

  const isRead = useCallback((id) => readIds.includes(id), [readIds]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !readIds.includes(n.id)).length,
    [notifications, readIds]
  );

  const markRead = useCallback((id) => {
    setReadIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    saveReadIds(allIds);
  }, [notifications]);

  return { notifications, unreadCount, isRead, markRead, markAllRead };
}
