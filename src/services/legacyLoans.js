function parseAmount(value) {
  return parseFloat(value) || 0;
}

function parseInteger(value, fallback = 0) {
  return parseInt(value, 10) || fallback;
}

function getPaymentValue(loan) {
  const storedPayment = parseAmount(loan.pmt);
  if (storedPayment) return storedPayment;

  const value = parseAmount(loan.valor);
  const installments = parseInteger(loan.parcelas, 1);
  const interest = parseAmount(loan.juros);

  if (!interest) return value / installments;

  const rate = interest / 100;
  return value * (rate * Math.pow(1 + rate, installments)) / (Math.pow(1 + rate, installments) - 1);
}

function adaptLegacyLoan(loan) {
  const installments = parseInteger(loan.parcelas, 1);
  const paidInstallments = parseInteger(loan.pagas);
  const remainingInstallments = Math.max(0, installments - paidInstallments);
  const progress = installments > 0 ? Math.round((paidInstallments / installments) * 100) : 0;

  return {
    id: loan.id,
    description: loan.desc || '',
    value: parseAmount(loan.valor),
    interest: parseAmount(loan.juros),
    installmentValue: getPaymentValue(loan),
    installments,
    paidInstallments,
    remainingInstallments,
    progress,
    startDate: loan.inicio || ''
  };
}

export function getLegacyLoans(loans = []) {
  const items = loans.map(adaptLegacyLoan);

  const summary = items.reduce(
    (totals, loan) => {
      totals.totalValue += loan.value;
      totals.openBalance += loan.installmentValue * loan.remainingInstallments;
      totals.monthlyCommitment += loan.remainingInstallments > 0 ? loan.installmentValue : 0;
      return totals;
    },
    { totalValue: 0, openBalance: 0, monthlyCommitment: 0, count: items.length }
  );

  return { items, summary };
}
