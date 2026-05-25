import { useSyncExternalStore } from 'react';
import { readFinancialBudgets } from '../services/financialBudgets.js';

let cachedBudgets;
const listeners = new Set();

function getBudgetsSnapshot() {
  if (!cachedBudgets) {
    cachedBudgets = readFinancialBudgets();
  }

  return cachedBudgets;
}

function subscribeBudgets(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function refreshFinancialBudgets() {
  cachedBudgets = readFinancialBudgets();
  listeners.forEach(listener => listener());

  return cachedBudgets;
}

export function useFinancialBudgets() {
  return useSyncExternalStore(
    subscribeBudgets,
    getBudgetsSnapshot,
    getBudgetsSnapshot
  );
}
