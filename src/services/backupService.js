import {
  readJsonStorage,
  readStorage,
  removeStorage,
  STORAGE_KEYS,
  writeJsonStorage,
  writeStorage
} from './storage.js';

const BACKUP_KEYS = [
  STORAGE_KEYS.appState,
  STORAGE_KEYS.goals,
  STORAGE_KEYS.categories,
  STORAGE_KEYS.recurrences,
  STORAGE_KEYS.budgets,
  STORAGE_KEYS.userName,
  STORAGE_KEYS.welcomed
];

function objectOrNull(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function optionalStringOrNull(value, key) {
  if (value == null || typeof value === 'string') return value ?? null;
  throw new Error(`Campo inválido no backup: ${key}.`);
}

function validateAppState(value) {
  const appState = objectOrNull(value);

  if (!appState) {
    throw new Error('Backup inválido: meucontrole precisa ser um objeto.');
  }

  ['dividas', 'fluxo', 'emprestimos'].forEach(key => {
    if (appState[key] !== undefined && !Array.isArray(appState[key])) {
      throw new Error(`Backup inválido: ${key} precisa ser uma lista.`);
    }
  });

  return appState;
}

function validateGoals(value) {
  if (value == null) return [];

  if (!Array.isArray(value)) {
    throw new Error('Backup inválido: meucontrole_metas precisa ser uma lista.');
  }

  return value;
}

function validateCategories(value) {
  if (value == null) return null;

  if (!Array.isArray(value)) {
    throw new Error('Backup inválido: meucontrole_categorias precisa ser uma lista.');
  }

  return value;
}

function validateRecurrences(value) {
  if (value == null) return [];

  if (!Array.isArray(value)) {
    throw new Error('Backup inválido: meucontrole_recorrencias precisa ser uma lista.');
  }

  return value;
}

function validateBudgets(value) {
  if (value == null) return [];

  if (!Array.isArray(value)) {
    throw new Error('Backup inválido: meucontrole_orcamentos precisa ser uma lista.');
  }

  return value;
}

export function createDashboardBackup() {
  return {
    [STORAGE_KEYS.appState]: readJsonStorage(STORAGE_KEYS.appState, {}),
    [STORAGE_KEYS.goals]: readJsonStorage(STORAGE_KEYS.goals, []),
    [STORAGE_KEYS.categories]: readJsonStorage(STORAGE_KEYS.categories, null),
    [STORAGE_KEYS.recurrences]: readJsonStorage(STORAGE_KEYS.recurrences, []),
    [STORAGE_KEYS.budgets]: readJsonStorage(STORAGE_KEYS.budgets, []),
    [STORAGE_KEYS.userName]: readStorage(STORAGE_KEYS.userName),
    [STORAGE_KEYS.welcomed]: readStorage(STORAGE_KEYS.welcomed)
  };
}

export function serializeDashboardBackup() {
  return JSON.stringify(createDashboardBackup(), null, 2);
}

export function getBackupFileName(date = new Date()) {
  return `dashboard-financeiro-backup-${date.toISOString().slice(0, 10)}.json`;
}

export function downloadDashboardBackup() {
  const blob = new Blob([serializeDashboardBackup()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = getBackupFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function parseDashboardBackup(jsonText) {
  let parsed;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Arquivo de backup não é um JSON válido.');
  }

  const backup = objectOrNull(parsed);

  if (!backup) {
    throw new Error('Backup inválido: estrutura raiz precisa ser um objeto.');
  }

  if (!Object.prototype.hasOwnProperty.call(backup, STORAGE_KEYS.appState)) {
    throw new Error('Backup inválido: chave meucontrole ausente.');
  }

  return {
    [STORAGE_KEYS.appState]: validateAppState(backup[STORAGE_KEYS.appState]),
    [STORAGE_KEYS.goals]: validateGoals(backup[STORAGE_KEYS.goals]),
    [STORAGE_KEYS.categories]: validateCategories(backup[STORAGE_KEYS.categories]),
    [STORAGE_KEYS.recurrences]: validateRecurrences(backup[STORAGE_KEYS.recurrences]),
    [STORAGE_KEYS.budgets]: validateBudgets(backup[STORAGE_KEYS.budgets]),
    [STORAGE_KEYS.userName]: optionalStringOrNull(backup[STORAGE_KEYS.userName], STORAGE_KEYS.userName),
    [STORAGE_KEYS.welcomed]: optionalStringOrNull(backup[STORAGE_KEYS.welcomed], STORAGE_KEYS.welcomed)
  };
}

export function importDashboardBackup(jsonText) {
  const backup = parseDashboardBackup(jsonText);

  writeJsonStorage(STORAGE_KEYS.appState, backup[STORAGE_KEYS.appState]);
  writeJsonStorage(STORAGE_KEYS.goals, backup[STORAGE_KEYS.goals]);
  if (backup[STORAGE_KEYS.categories] == null) {
    removeStorage(STORAGE_KEYS.categories);
  } else {
    writeJsonStorage(STORAGE_KEYS.categories, backup[STORAGE_KEYS.categories]);
  }
  writeJsonStorage(STORAGE_KEYS.recurrences, backup[STORAGE_KEYS.recurrences]);
  writeJsonStorage(STORAGE_KEYS.budgets, backup[STORAGE_KEYS.budgets]);

  BACKUP_KEYS.filter(key => ![
    STORAGE_KEYS.appState,
    STORAGE_KEYS.goals,
    STORAGE_KEYS.categories,
    STORAGE_KEYS.recurrences,
    STORAGE_KEYS.budgets
  ].includes(key)).forEach(key => {
    const value = backup[key];

    if (value == null) {
      removeStorage(key);
      return;
    }

    writeStorage(key, value);
  });

  return backup;
}
