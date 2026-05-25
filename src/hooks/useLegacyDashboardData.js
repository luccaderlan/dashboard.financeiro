import { useSyncExternalStore } from 'react';
import { readLegacyDashboardDataSnapshot } from '../services/legacyDashboardData.js';

let cachedLegacyDashboardData;
const listeners = new Set();

function getLegacyDashboardDataSnapshot() {
  if (!cachedLegacyDashboardData) {
    cachedLegacyDashboardData = readLegacyDashboardDataSnapshot();
  }

  return cachedLegacyDashboardData;
}

function subscribeLegacyDashboardData(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function refreshLegacyDashboardData() {
  cachedLegacyDashboardData = readLegacyDashboardDataSnapshot();
  listeners.forEach(listener => listener());

  return cachedLegacyDashboardData;
}

export function useLegacyDashboardData() {
  return useSyncExternalStore(
    subscribeLegacyDashboardData,
    getLegacyDashboardDataSnapshot,
    getLegacyDashboardDataSnapshot
  );
}
