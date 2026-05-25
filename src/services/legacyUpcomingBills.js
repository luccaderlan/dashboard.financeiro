const categoryLabels = {
  empresa: 'Empresa',
  cartao: 'Cartão',
  pessoal: 'Pessoal',
  outro: 'Outro'
};

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

function getBillStatus(debt) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = dateFromInput(debt.venc);
  if (Number.isNaN(dueDate.getTime())) return 'open';
  if (dueDate < today) return 'overdue';
  if ((dueDate - today) / (1000 * 60 * 60 * 24) <= 7) return 'dueSoon';
  return 'open';
}

function adaptLegacyUpcomingBill(debt) {
  return {
    id: debt.id,
    description: debt.desc || '',
    type: categoryLabels[debt.cat] || debt.cat || 'Outro',
    value: getRemainingDebt(debt),
    dueDate: debt.venc || '',
    status: getBillStatus(debt)
  };
}

export function getLegacyUpcomingBills(debts = []) {
  // Mirrors renderProximas(): active debts, nearest due date first, five rows.
  return debts
    .filter(debt => !isPaidDebt(debt))
    .sort((a, b) => dateFromInput(a.venc) - dateFromInput(b.venc))
    .slice(0, 5)
    .map(adaptLegacyUpcomingBill);
}
