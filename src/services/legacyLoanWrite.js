import { readLegacyDashboardDataSnapshot, writeLegacyAppState } from './legacyDashboardData.js';

export const MAX_LEGACY_INSTALLMENTS = 1200;

function today() {
  return new Date().toISOString().split('T')[0];
}

function parseAmount(value) {
  return parseFloat(value) || 0;
}

function parseInteger(value, fallback = 0) {
  return parseInt(value, 10) || fallback;
}

function createLoanId(existingLoans = []) {
  const existingIds = new Set(existingLoans.map(loan => String(loan.id)));
  let id = Date.now();

  while (existingIds.has(String(id))) {
    id += 1;
  }

  return id;
}

export function calculateLegacyLoanPayment({ valor, juros, parcelas }) {
  const value = parseAmount(valor);
  const interest = parseAmount(juros);
  const installments = parseInteger(parcelas, 1);

  if (!value) return 0;
  if (installments < 1 || installments > MAX_LEGACY_INSTALLMENTS) return 0;
  if (interest === 0) return value / installments;

  const rate = interest / 100;
  const factor = Math.pow(1 + rate, installments);
  const payment = value * (rate * factor) / (factor - 1);

  return Number.isFinite(payment) ? payment : 0;
}

function normalizeLoanInput(input, id) {
  const desc = (input.desc || '').trim();
  const valor = parseAmount(input.valor);

  if (!desc || !valor) {
    throw new Error('Preencha pelo menos a descrição e o valor.');
  }

  const juros = parseAmount(input.juros);
  const parcelas = parseInteger(input.parcelas, 1);
  const pagas = parseInteger(input.pagas);

  if (parcelas < 1 || parcelas > MAX_LEGACY_INSTALLMENTS) {
    throw new Error(`Informe parcelas entre 1 e ${MAX_LEGACY_INSTALLMENTS}.`);
  }

  if (pagas < 0 || pagas > parcelas) {
    throw new Error('Parcelas pagas não pode ser maior que o total de parcelas.');
  }

  const pmt = calculateLegacyLoanPayment({ valor, juros, parcelas });

  return {
    id,
    desc,
    valor,
    juros,
    parcelas,
    pagas,
    pmt: parseFloat(pmt.toFixed(2)),
    inicio: input.inicio || today()
  };
}

export function addLegacyLoan(input) {
  const dashboardData = readLegacyDashboardDataSnapshot();
  const loan = normalizeLoanInput(input, createLoanId(dashboardData.emprestimos));

  // Writes the exact loan shape produced by the legacy addEmprestimo() flow.
  writeLegacyAppState({
    ...dashboardData.rawState,
    dividas: dashboardData.dividas,
    fluxo: dashboardData.fluxo,
    emprestimos: [...dashboardData.emprestimos, loan]
  });

  return loan;
}

export function updateLegacyLoan(id, input) {
  const dashboardData = readLegacyDashboardDataSnapshot();
  const loanIndex = dashboardData.emprestimos.findIndex(loan => String(loan.id) === String(id));

  if (loanIndex < 0) {
    throw new Error('Empréstimo não encontrado.');
  }

  const currentLoan = dashboardData.emprestimos[loanIndex];
  const updatedLoan = normalizeLoanInput(input, currentLoan.id);
  const emprestimos = [...dashboardData.emprestimos];
  emprestimos[loanIndex] = updatedLoan;

  writeLegacyAppState({
    ...dashboardData.rawState,
    dividas: dashboardData.dividas,
    fluxo: dashboardData.fluxo,
    emprestimos
  });

  return updatedLoan;
}

export function payLegacyLoanInstallment(id) {
  const dashboardData = readLegacyDashboardDataSnapshot();
  const loanIndex = dashboardData.emprestimos.findIndex(loan => String(loan.id) === String(id));

  if (loanIndex < 0) {
    throw new Error('Empréstimo não encontrado.');
  }

  const currentLoan = dashboardData.emprestimos[loanIndex];
  const paidInstallments = parseInteger(currentLoan.pagas, 0);
  const totalInstallments = parseInteger(currentLoan.parcelas, 1);

  if (paidInstallments >= totalInstallments) {
    throw new Error('Todas as parcelas deste empréstimo já foram registradas como pagas.');
  }

  const emprestimos = [...dashboardData.emprestimos];
  emprestimos[loanIndex] = {
    ...currentLoan,
    pagas: paidInstallments + 1
  };

  writeLegacyAppState({
    ...dashboardData.rawState,
    dividas: dashboardData.dividas,
    fluxo: dashboardData.fluxo,
    emprestimos
  });

  return emprestimos[loanIndex];
}

export function deleteLegacyLoan(id) {
  const dashboardData = readLegacyDashboardDataSnapshot();
  const emprestimos = dashboardData.emprestimos.filter(loan => String(loan.id) !== String(id));

  if (emprestimos.length === dashboardData.emprestimos.length) {
    throw new Error('Empréstimo não encontrado.');
  }

  writeLegacyAppState({
    ...dashboardData.rawState,
    dividas: dashboardData.dividas,
    fluxo: dashboardData.fluxo,
    emprestimos
  });
}
