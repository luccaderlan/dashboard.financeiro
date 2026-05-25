import { useSyncExternalStore } from 'react';
import { readFinancialCategories } from '../services/financialCategories.js';

let cachedCategories;
const listeners = new Set();

function getCategoriesSnapshot() {
  if (!cachedCategories) {
    cachedCategories = readFinancialCategories();
  }

  return cachedCategories;
}

function subscribeCategories(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function refreshFinancialCategories() {
  cachedCategories = readFinancialCategories();
  listeners.forEach(listener => listener());

  return cachedCategories;
}

export function useFinancialCategories() {
  return useSyncExternalStore(
    subscribeCategories,
    getCategoriesSnapshot,
    getCategoriesSnapshot
  );
}
