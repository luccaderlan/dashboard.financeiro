import { readJsonStorage, readStorage, STORAGE_KEYS, writeJsonStorage } from './storage.js';

function listOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function objectOrEmpty(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function normalizeLegacyAppState(value) {
  const appState = objectOrEmpty(value);

  // Keep the legacy object shape while guaranteeing the arrays React consumes.
  return {
    ...appState,
    dividas: listOrEmpty(appState.dividas),
    fluxo: listOrEmpty(appState.fluxo),
    emprestimos: listOrEmpty(appState.emprestimos)
  };
}

export function readLegacyDashboardDataSnapshot() {
  const appState = normalizeLegacyAppState(readJsonStorage(STORAGE_KEYS.appState, {}));

  return {
    rawState: appState,
    dividas: appState.dividas,
    fluxo: appState.fluxo,
    emprestimos: appState.emprestimos,
    nome: readStorage(STORAGE_KEYS.userName) || '',
    welcomed: readStorage(STORAGE_KEYS.welcomed) || ''
  };
}

export function writeLegacyAppState(appState) {
  writeJsonStorage(STORAGE_KEYS.appState, normalizeLegacyAppState(appState));
}
