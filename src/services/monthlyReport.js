import { calculateBudgetUsage } from './financialBudgets.js';

function parseAmount(value) {
  return Number(value) || 0;
}

export function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function getMonthLabel(monthKey) {
  if (!monthKey) return 'Mes atual';

  const date = new Date(`${monthKey}-01T12:00:00`);
  if (Number.isNaN(date.getTime())) return monthKey;

  return date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });
}

function matchesMonth(date, monthKey) {
  return Boolean(date) && date.slice(0, 7) === monthKey;
}

function monthIndex(monthKey) {
  const [year, month] = String(monthKey || '').split('-').map(Number);
  if (!year || !month) return null;
  return year * 12 + month - 1;
}

function dateMonthIndex(date) {
  return monthIndex(String(date || '').slice(0, 7));
}

function sumValues(items, getValue) {
  return items.reduce((total, item) => total + parseAmount(getValue(item)), 0);
}

function getExpensesByCategory(cashFlowItems) {
  const categories = new Map();

  cashFlowItems
    .filter(item => item.type !== 'entrada')
    .forEach(item => {
      const category = item.category || 'Sem categoria';
      categories.set(category, (categories.get(category) || 0) + parseAmount(item.value));
    });

  return [...categories.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getProjectedDebtInstallments(rawDebts = [], monthKey) {
  const selectedIndex = monthIndex(monthKey);
  if (selectedIndex == null) return [];

  return rawDebts
    .map(debt => {
      const installments = Math.max(1, parseInt(debt.parcelas, 10) || 1);
      if (installments <= 1) return null;

      const startIndex = dateMonthIndex(debt.venc);
      if (startIndex == null) return null;

      const installmentIndex = selectedIndex - startIndex;
      const totalValue = parseAmount(debt.valor);
      const paidValue = parseAmount(debt.pago);
      const remainingValue = Math.max(0, totalValue - paidValue);

      if (installmentIndex < 0 || installmentIndex >= installments || remainingValue <= 0) {
        return null;
      }

      return {
        id: debt.id,
        value: totalValue / installments
      };
    })
    .filter(Boolean);
}

function getProjectedLoanInstallments(loans = [], monthKey) {
  const selectedIndex = monthIndex(monthKey);
  const loanItems = Array.isArray(loans) ? loans : loans.items || [];
  if (selectedIndex == null) return [];

  return loanItems
    .map(loan => {
      const startIndex = dateMonthIndex(loan.startDate);
      if (startIndex == null) return null;

      const installmentIndex = selectedIndex - startIndex;
      if (installmentIndex < 0 || installmentIndex >= loan.installments) return null;
      if (installmentIndex < loan.paidInstallments) return null;

      return {
        id: loan.id,
        value: loan.installmentValue
      };
    })
    .filter(Boolean);
}

export function getMonthlyReport({ cashFlow = [], debts = {}, rawDebts = [], loans = [], budgets = [] } = {}, monthKey = getCurrentMonthKey()) {
  const monthlyCashFlow = cashFlow.filter(item => matchesMonth(item.date, monthKey));
  const incomeItems = monthlyCashFlow.filter(item => item.type === 'entrada');
  const expenseItems = monthlyCashFlow.filter(item => item.type !== 'entrada');
  const paidDebts = (debts.paidDebts || []).filter(debt => matchesMonth(debt.paidAt || debt.dueDate, monthKey));
  const parcelledDebtIds = new Set(
    rawDebts
      .filter(debt => (parseInt(debt.parcelas, 10) || 1) > 1)
      .map(debt => String(debt.id))
  );
  const dueDebts = (debts.activeDebts || [])
    .filter(debt => matchesMonth(debt.dueDate, monthKey))
    .filter(debt => !parcelledDebtIds.has(String(debt.id)));
  const projectedDebtInstallments = getProjectedDebtInstallments(rawDebts, monthKey);
  const projectedLoanInstallments = getProjectedLoanInstallments(loans, monthKey);

  const income = sumValues(incomeItems, item => item.value);
  const expenses = sumValues(expenseItems, item => item.value);
  const paidDebtsTotal = sumValues(paidDebts, debt => debt.totalValue);
  const dueDebtsTotal = sumValues(dueDebts, debt => debt.remainingValue)
    + sumValues(projectedDebtInstallments, item => item.value)
    + sumValues(projectedLoanInstallments, item => item.value);
  const dueDebtsCount = dueDebts.length + projectedDebtInstallments.length + projectedLoanInstallments.length;
  const budgetUsage = calculateBudgetUsage(budgets, cashFlow, monthKey);

  return {
    monthKey,
    income,
    expenses,
    balance: income - expenses,
    paidDebtsTotal,
    paidDebtsCount: paidDebts.length,
    dueDebtsTotal,
    dueDebtsCount,
    projectedInstallmentsTotal: sumValues(projectedDebtInstallments, item => item.value)
      + sumValues(projectedLoanInstallments, item => item.value),
    projectedInstallmentsCount: projectedDebtInstallments.length + projectedLoanInstallments.length,
    cashFlowCount: monthlyCashFlow.length,
    chartData: [
      { name: 'Entradas', value: income, tone: 'income' },
      { name: 'Saídas', value: expenses, tone: 'expense' },
      { name: 'Saldo', value: income - expenses, tone: 'balance' },
      { name: 'Dívidas pagas', value: paidDebtsTotal, tone: 'paidDebt' },
      { name: 'Vencendo', value: dueDebtsTotal, tone: 'dueDebt' }
    ],
    expenseCategoryData: getExpensesByCategory(monthlyCashFlow),
    budgetUsage
  };
}
