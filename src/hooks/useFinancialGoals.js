import { useSyncExternalStore } from 'react';
import { readFinancialGoals } from '../services/financialGoals.js';

let cachedGoals;
const listeners = new Set();

function getGoalsSnapshot() {
  if (!cachedGoals) {
    cachedGoals = readFinancialGoals();
  }

  return cachedGoals;
}

function subscribeGoals(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function refreshFinancialGoals() {
  cachedGoals = readFinancialGoals();
  listeners.forEach(listener => listener());

  return cachedGoals;
}

export function useFinancialGoals() {
  return useSyncExternalStore(
    subscribeGoals,
    getGoalsSnapshot,
    getGoalsSnapshot
  );
}
