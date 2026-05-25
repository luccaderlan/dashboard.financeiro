import { useSyncExternalStore } from 'react';
import { readFinancialRecurrences } from '../services/financialRecurrences.js';

let cachedRecurrences;
const listeners = new Set();

function getRecurrencesSnapshot() {
  if (!cachedRecurrences) {
    cachedRecurrences = readFinancialRecurrences();
  }

  return cachedRecurrences;
}

function subscribeRecurrences(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function refreshFinancialRecurrences() {
  cachedRecurrences = readFinancialRecurrences();
  listeners.forEach(listener => listener());

  return cachedRecurrences;
}

export function useFinancialRecurrences() {
  return useSyncExternalStore(
    subscribeRecurrences,
    getRecurrencesSnapshot,
    getRecurrencesSnapshot
  );
}
