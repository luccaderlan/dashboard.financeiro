import { readJsonStorage, STORAGE_KEYS, writeJsonStorage } from './storage.js';

function parseAmount(value) {
  return Math.max(0, parseFloat(value) || 0);
}

function normalizeString(value, fallback = '') {
  return (value || fallback).toString().trim();
}

export function getCurrentBudgetMonth() {
  return new Date().toISOString().slice(0, 7);
}

function createBudgetId() {
  return `budget-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeBudget(budget) {
  return {
    id: budget.id || createBudgetId(),
    category: normalizeString(budget.category, 'Outro'),
    month: normalizeString(budget.month, getCurrentBudgetMonth()),
    limit: parseAmount(budget.limit || budget.valorLimite),
    createdAt: budget.createdAt || new Date().toISOString(),
    updatedAt: budget.updatedAt || new Date().toISOString()
  };
}

function normalizeBudgets(value) {
  return Array.isArray(value) ? value.map(normalizeBudget) : [];
}

function validateBudgetInput(input) {
  const category = normalizeString(input.category);
  const month = normalizeString(input.month);
  const limit = parseAmount(input.limit);

  if (!category) {
    throw new Error('Informe a categoria do orçamento.');
  }

  if (!month) {
    throw new Error('Informe o mês do orçamento.');
  }

  if (limit <= 0) {
    throw new Error('Informe um limite maior que zero.');
  }

  return { category, month, limit };
}

export function readFinancialBudgets() {
  return normalizeBudgets(readJsonStorage(STORAGE_KEYS.budgets, []));
}

export function writeFinancialBudgets(budgets) {
  writeJsonStorage(STORAGE_KEYS.budgets, normalizeBudgets(budgets));
}

export function addFinancialBudget(input) {
  const budgets = readFinancialBudgets();
  const budgetInput = validateBudgetInput(input);
  const duplicated = budgets.some(budget =>
    budget.month === budgetInput.month
    && budget.category.toLowerCase() === budgetInput.category.toLowerCase()
  );

  if (duplicated) {
    throw new Error('Já existe um orçamento para esta categoria neste mês.');
  }

  const budget = normalizeBudget({
    ...budgetInput,
    id: createBudgetId()
  });

  writeFinancialBudgets([budget, ...budgets]);
  return budget;
}

export function updateFinancialBudget(id, input) {
  const budgets = readFinancialBudgets();
  const index = budgets.findIndex(budget => budget.id === id);

  if (index < 0) {
    throw new Error('Orçamento não encontrado.');
  }

  const budgetInput = validateBudgetInput(input);
  const duplicated = budgets.some(budget =>
    budget.id !== id
    && budget.month === budgetInput.month
    && budget.category.toLowerCase() === budgetInput.category.toLowerCase()
  );

  if (duplicated) {
    throw new Error('Já existe um orçamento para esta categoria neste mês.');
  }

  budgets[index] = normalizeBudget({
    ...budgets[index],
    ...budgetInput,
    updatedAt: new Date().toISOString()
  });
  writeFinancialBudgets(budgets);
  return budgets[index];
}

export function deleteFinancialBudget(id) {
  const budgets = readFinancialBudgets();
  const nextBudgets = budgets.filter(budget => budget.id !== id);

  if (nextBudgets.length === budgets.length) {
    throw new Error('Orçamento não encontrado.');
  }

  writeFinancialBudgets(nextBudgets);
}

function getBudgetStatus(percent) {
  if (percent > 100) return 'over';
  if (percent >= 80) return 'near';
  return 'normal';
}

function expenseTotalsByCategory(cashFlow = [], monthKey = getCurrentBudgetMonth()) {
  return cashFlow
    .filter(item => item.type !== 'entrada' && (item.date || '').slice(0, 7) === monthKey)
    .reduce((totals, item) => {
      const category = item.category || 'Sem categoria';
      totals.set(category, (totals.get(category) || 0) + (Number(item.value) || 0));
      return totals;
    }, new Map());
}

export function calculateBudgetUsage(budgets = [], cashFlow = [], monthKey = getCurrentBudgetMonth()) {
  const expenses = expenseTotalsByCategory(cashFlow, monthKey);
  const items = budgets
    .filter(budget => budget.month === monthKey)
    .map(budget => {
      const spent = expenses.get(budget.category) || 0;
      const remaining = budget.limit - spent;
      const percent = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;

      return {
        ...budget,
        spent,
        remaining,
        percent,
        status: getBudgetStatus(percent)
      };
    })
    .sort((a, b) => b.percent - a.percent);

  const summary = items.reduce(
    (totals, item) => {
      totals.limit += item.limit;
      totals.spent += item.spent;
      if (item.status === 'over') totals.overCount++;
      if (item.status === 'near') totals.nearCount++;
      return totals;
    },
    { limit: 0, spent: 0, overCount: 0, nearCount: 0, count: items.length }
  );

  return {
    items,
    summary: {
      ...summary,
      remaining: summary.limit - summary.spent,
      percent: summary.limit > 0 ? Math.round((summary.spent / summary.limit) * 100) : 0
    }
  };
}
