function parseAmount(value) {
  return parseFloat(value) || 0;
}

function getRemainingDebt(debt) {
  return Math.max(0, parseAmount(debt.valor) - parseAmount(debt.pago));
}

function isPaidDebt(debt) {
  return parseAmount(debt.pago) >= parseAmount(debt.valor);
}

function dateFromInput(date) {
  return new Date((date || '') + 'T12:00:00');
}

function getDebtStatus(debt) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = dateFromInput(debt.venc);
  if (isPaidDebt(debt)) return 'paid';
  if (dueDate < today) return 'overdue';
  if ((dueDate - today) / (1000 * 60 * 60 * 24) <= 7) return 'dueSoon';
  return 'open';
}

function adaptLegacyDebt(debt) {
  const remaining = getRemainingDebt(debt);

  return {
    id: debt.id,
    description: debt.desc || '',
    category: debt.cat || 'outro',
    totalValue: parseAmount(debt.valor),
    paidValue: parseAmount(debt.pago),
    remainingValue: remaining,
    dueDate: debt.venc || '',
    paidAt: debt.pagaEm || '',
    notes: debt.obs || '',
    status: getDebtStatus(debt),
    isPaid: isPaidDebt(debt)
  };
}

function calculateDebtSummary(activeDebts, paidDebts) {
  return activeDebts.reduce(
    (summary, debt) => {
      summary.totalOpen += debt.remainingValue;
      if (debt.status === 'overdue') {
        summary.totalOverdue += debt.remainingValue;
        summary.overdueCount++;
      }

      return summary;
    },
    {
      totalOpen: 0,
      totalOverdue: 0,
      overdueCount: 0,
      activeCount: activeDebts.length,
      paidCount: paidDebts.length
    }
  );
}

export function getLegacyDebts(debts = []) {
  const adaptedDebts = debts.map(adaptLegacyDebt);
  const activeDebts = adaptedDebts.filter(debt => !debt.isPaid);
  const paidDebts = adaptedDebts
    .filter(debt => debt.isPaid)
    .sort((a, b) => dateFromInput(b.paidAt || b.dueDate) - dateFromInput(a.paidAt || a.dueDate));

  return {
    activeDebts,
    paidDebts,
    summary: calculateDebtSummary(activeDebts, paidDebts)
  };
}
