/**
 * notificationsService.js
 *
 * Serviço puro de notificações — não altera nenhum dado financeiro.
 * Recebe os dados existentes do DashboardContext e retorna um array
 * de notificações calculadas localmente.
 *
 * Estrutura de cada notificação:
 * {
 *   id:          string   — identificador único estável (determinístico)
 *   type:        'info' | 'warning' | 'critical' | 'success'
 *   title:       string   — título curto
 *   description: string   — descrição objetiva
 *   createdAt:   string   — ISO date
 * }
 */

// ─── Utilitários ──────────────────────────────────────────────────────────────

function parseDate(value) {
  if (!value) return null;
  // Strings no formato YYYY-MM-DD são tratadas como UTC pelo JS,
  // o que causa erro de fuso horário (ex: UTC-3 recua um dia).
  // Parseamos manualmente para garantir hora local.
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysDiff(dateStr) {
  const date = parseDate(dateStr);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.round((date - today) / (1000 * 60 * 60 * 24));
}

function formatCurrency(value) {
  const n = parseFloat(value) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Regras de notificação ────────────────────────────────────────────────────

/** Dívidas vencendo em ≤ 7 dias ou já vencidas */
function debtNotifications(debts) {
  if (!Array.isArray(debts)) return [];
  const notifications = [];

  debts.forEach(debt => {
    // Ignora dívidas pagas ou sem data
    const isPaid = debt.paid || debt.status === 'paid' || debt.pago;
    if (isPaid) return;

    const label = debt.description || debt.name || debt.label || 'Dívida';
    const diff = daysDiff(debt.dueDate || debt.vencimento || debt.date);
    if (diff === null) return;

    if (diff < 0) {
      notifications.push({
        id: `debt-overdue-${debt.id}`,
        type: 'critical',
        title: 'Dívida vencida',
        description: `"${label}" venceu há ${Math.abs(diff)} dia(s). ${debt.amount ? formatCurrency(debt.amount) : ''}`.trim(),
        createdAt: new Date().toISOString()
      });
    } else if (diff <= 7) {
      notifications.push({
        id: `debt-due-${debt.id}`,
        type: 'warning',
        title: 'Dívida próxima do vencimento',
        description: `"${label}" vence ${diff === 0 ? 'hoje' : `em ${diff} dia(s)`}. ${debt.amount ? formatCurrency(debt.amount) : ''}`.trim(),
        createdAt: new Date().toISOString()
      });
    }
  });

  return notifications;
}

/** Parcelas de empréstimos vencendo em ≤ 7 dias */
function loanNotifications(loans) {
  if (!Array.isArray(loans)) return [];
  const notifications = [];

  loans.forEach(loan => {
    const isComplete = loan.completed || loan.pago || loan.finished;
    if (isComplete) return;

    const label = loan.description || loan.name || loan.label || 'Empréstimo';
    const diff = daysDiff(loan.nextDueDate || loan.dueDate || loan.proximoVencimento);
    if (diff === null) return;

    if (diff < 0) {
      notifications.push({
        id: `loan-overdue-${loan.id}`,
        type: 'critical',
        title: 'Parcela em atraso',
        description: `Parcela de "${label}" venceu há ${Math.abs(diff)} dia(s).`,
        createdAt: new Date().toISOString()
      });
    } else if (diff <= 7) {
      notifications.push({
        id: `loan-due-${loan.id}`,
        type: 'warning',
        title: 'Parcela próxima do vencimento',
        description: `Parcela de "${label}" vence ${diff === 0 ? 'hoje' : `em ${diff} dia(s)`}.`,
        createdAt: new Date().toISOString()
      });
    }
  });

  return notifications;
}

/** Metas atingidas ou em risco */
function goalNotifications(goals) {
  if (!Array.isArray(goals)) return [];
  const notifications = [];

  goals.forEach(goal => {
    // Suporta formato normalizado (title/currentValue/targetValue) e fallbacks legados
    const label = goal.title || goal.name || goal.label || goal.description || 'Meta';
    const current = parseFloat(goal.currentValue ?? goal.current ?? goal.saved ?? goal.valor ?? 0);
    const target = parseFloat(goal.targetValue ?? goal.target ?? goal.goal ?? goal.objetivo ?? 0);
    if (!target || target <= 0) return;

    const percent = current / target;

    if (percent >= 1) {
      notifications.push({
        id: `goal-done-${goal.id}`,
        type: 'success',
        title: 'Meta atingida!',
        description: `Parabéns! Você atingiu a meta "${label}" de ${formatCurrency(target)}.`,
        createdAt: new Date().toISOString()
      });
    } else if (percent >= 0.9) {
      notifications.push({
        id: `goal-near-${goal.id}`,
        type: 'info',
        title: 'Meta quase lá!',
        description: `"${label}" está em ${Math.round(percent * 100)}%. Faltam ${formatCurrency(target - current)}.`,
        createdAt: new Date().toISOString()
      });
    }
  });

  return notifications;
}

/** Saldo negativo */
function balanceNotifications(cashFlow) {
  if (!Array.isArray(cashFlow)) return [];

  const balance = cashFlow.reduce((acc, item) => {
    const val = parseFloat(item.value || item.valor || 0);
    return item.type === 'entrada' || item.type === 'income'
      ? acc + val
      : acc - val;
  }, 0);

  if (balance < 0) {
    return [{
      id: 'balance-negative',
      type: 'critical',
      title: 'Saldo negativo',
      description: `Seu saldo está em ${formatCurrency(balance)}. Revise suas entradas e saídas.`,
      createdAt: new Date().toISOString()
    }];
  }

  return [];
}

/** Gastos do mês acima da média dos últimos 3 meses */
function spendingNotifications(cashFlow) {
  if (!Array.isArray(cashFlow) || cashFlow.length === 0) return [];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  function getMonthKey(date) {
    return `${date.getFullYear()}-${date.getMonth()}`;
  }

  const currentKey = getMonthKey(now);
  const byMonth = {};

  cashFlow.forEach(item => {
    const d = parseDate(item.date || item.data);
    if (!d) return;
    const key = getMonthKey(d);
    const val = parseFloat(item.value || item.valor || 0);
    const isExpense = item.type === 'saida' || item.type === 'expense';
    if (!isExpense) return;

    byMonth[key] = (byMonth[key] || 0) + val;
  });

  const currentExpenses = byMonth[currentKey] || 0;

  // Últimos 3 meses anteriores
  const prevMonths = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const key = getMonthKey(d);
    if (byMonth[key] !== undefined) prevMonths.push(byMonth[key]);
  }

  if (prevMonths.length < 2 || currentExpenses === 0) return [];

  const avg = prevMonths.reduce((a, b) => a + b, 0) / prevMonths.length;
  if (avg <= 0) return [];

  const ratio = currentExpenses / avg;
  if (ratio > 1.3) {
    return [{
      id: 'spending-above-avg',
      type: 'warning',
      title: 'Gastos acima da média',
      description: `Seus gastos este mês (${formatCurrency(currentExpenses)}) estão ${Math.round((ratio - 1) * 100)}% acima da média dos últimos meses.`,
      createdAt: new Date().toISOString()
    }];
  }

  return [];
}

// ─── Função principal ─────────────────────────────────────────────────────────

/**
 * Gera todas as notificações com base nos dados do dashboard.
 * Função pura — não altera nenhum dado.
 *
 * @param {{ debts, loans, goals, cashFlow, budgets, recurrences }} data
 * @returns {Array} array de notificações ordenadas por severidade
 */
export function generateNotifications({ debts = [], loans = [], goals = [], cashFlow = [], budgets = [], recurrences = [] } = {}) {
  const all = [
    ...debtNotifications(debts),
    ...loanNotifications(loans),
    ...balanceNotifications(cashFlow),
    ...spendingNotifications(cashFlow),
    ...goalNotifications(goals),
  ];

  // Ordem de severidade: critical > warning > info > success
  const order = { critical: 0, warning: 1, info: 2, success: 3 };
  return all.sort((a, b) => (order[a.type] ?? 4) - (order[b.type] ?? 4));
}
