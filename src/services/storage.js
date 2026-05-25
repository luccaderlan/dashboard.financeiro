import {
  readJsonValue,
  readStorageValue,
  removeStorageValue,
  writeJsonValue,
  writeStorageValue
} from './persistence/storageProvider.js';

export const STORAGE_KEYS = {
  appState: 'meucontrole',
  userName: 'meucontrole_nome',
  welcomed: 'meucontrole_welcomed',
  goals: 'meucontrole_metas',
  categories: 'meucontrole_categorias',
  recurrences: 'meucontrole_recorrencias',
  budgets: 'meucontrole_orcamentos'
};

export function readJsonStorage(key, fallback) {
  return readJsonValue(key, fallback);
}

export function writeJsonStorage(key, value) {
  writeJsonValue(key, value);
}

export function readStorage(key) {
  return readStorageValue(key);
}

export function writeStorage(key, value) {
  writeStorageValue(key, value);
}

export function removeStorage(key) {
  removeStorageValue(key);
}
