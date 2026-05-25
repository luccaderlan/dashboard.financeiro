import { formatCurrency } from '../utils/formatters.js';

function parseAmount(value) {
  return parseFloat(value) || 0;
}

function getRemainingDebt(debt) {
  return Math.max(0, parseAmount(debt.valor) - parseAmount(debt.pago));
}

function isPaidDebt(debt) {
  return parseAmount(debt.pago) >= parseAmount(debt.valor);
}

function getActiveDebts(debts) {
  return debts.filter(debt => !isPaidDebt(debt));
}

function calculateDebtSummary(debts) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  let totalDebt = 0;
  let dueThisMonth = 0;
  let overdue = 0;
  let overdueCount = 0;
  let dueThisMonthCount = 0;

  debts.forEach(debt => {
    const remaining = getRemainingDebt(debt);
    if (remaining <= 0) return;

    totalDebt += remaining;

    // Mirrors calcularResumoDívidas(): overdue wins before current-month due.
    const dueDate = new Date((debt.venc || '') + 'T12:00:00');
    if (dueDate < today) {
      overdue += remaining;
      overdueCount++;
    } else if (dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear) {
      dueThisMonth += remaining;
      dueThisMonthCount++;
    }
  });

  return { totalDebt, dueThisMonth, overdue, overdueCount, dueThisMonthCount };
}

function calculateCashFlowTotals(cashFlow) {
  let income = 0;
  let expenses = 0;

  // Mirrors fluxoTotals(): only tipo "entrada" is income; all else is expense.
  cashFlow.forEach(item => {
    if (item.tipo === 'entrada') income += parseAmount(item.valor);
    else expenses += parseAmount(item.valor);
  });

  return { income, expenses, balance: income - expenses };
}

export function getLegacyKpis({ dividas: debts = [], fluxo: cashFlow = [] } = {}) {
  const debtSummary = calculateDebtSummary(debts);
  const cashFlowTotals = calculateCashFlowTotals(cashFlow);
  const activeDebtsCount = getActiveDebts(debts).length;

  return {
    totalDebts: {
      value: formatCurrency(debtSummary.totalDebt),
      subtitle: `${activeDebtsCount} dívida(s) ativa(s)`
    },
    dueThisMonth: {
      value: formatCurrency(debtSummary.dueThisMonth),
      subtitle: `${debtSummary.dueThisMonthCount} conta(s)`
    },
    overdue: {
      value: formatCurrency(debtSummary.overdue),
      subtitle: `${debtSummary.overdueCount} conta(s)`
    },
    balance: {
      value: formatCurrency(cashFlowTotals.balance),
      subtitle: 'Entradas menos saídas',
      valueColor: cashFlowTotals.balance >= 0 ? 'green' : 'red'
    }
  };
}
