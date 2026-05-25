/**
 * API Storage Adapter
 *
 * Implementa a mesma interface do localStorageAdapter, mas persiste os dados
 * no backend em background — de forma assíncrona e sem bloquear a UI.
 *
 * Estratégia: localStorage continua sendo a fonte de verdade LOCAL (síncrono).
 * Após cada escrita, um sync assíncrono é disparado para a API.
 * Na inicialização (login), os dados da API sobrescrevem o localStorage.
 *
 * Isso garante:
 * - Zero alteração em hooks, componentes ou DashboardContext
 * - Fallback automático se a API estiver indisponível
 * - UX sem latência (writes são instantâneos localmente)
 */

import { apiClient } from '../api/apiClient.js';
import { STORAGE_KEYS } from '../storage.js';

function getLocalStorage() {
  return typeof window !== 'undefined' ? window.localStorage : globalThis.localStorage;
}

// Mapa de localStorage keys → campos do backend
const KEY_TO_FIELD = {
  [STORAGE_KEYS.appState]:    'appState',
  [STORAGE_KEYS.goals]:       'goals',
  [STORAGE_KEYS.categories]:  'categories',
  [STORAGE_KEYS.recurrences]: 'recurrences',
  [STORAGE_KEYS.budgets]:     'budgets',
  [STORAGE_KEYS.userName]:    null, // nome do usuário — gerenciado separadamente
  [STORAGE_KEYS.welcomed]:    'welcomed',
};

// Debounce de sync para não fazer uma requisição por keystroke
const syncTimers = new Map();
const SYNC_DEBOUNCE_MS = 800;

async function syncToApi(key, value) {
  const field = KEY_TO_FIELD[key];
  if (!field) return; // chave não sincronizada (ex: nome gerenciado pelo backend)

  try {
    let parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      parsedValue = value;
    }

    await apiClient.put('/user/data', { [field]: parsedValue });
  } catch (err) {
    // Falha silenciosa — o dado já está salvo no localStorage
    // O sync será tentado novamente na próxima escrita
    if (err?.statusCode !== 401) {
      console.warn('[apiStorageAdapter] Sync falhou para', key, err?.message);
    }
  }
}

function debouncedSync(key, value) {
  if (syncTimers.has(key)) {
    clearTimeout(syncTimers.get(key));
  }

  const timer = setTimeout(() => {
    syncTimers.delete(key);
    syncToApi(key, value);
  }, SYNC_DEBOUNCE_MS);

  syncTimers.set(key, timer);
}

export const apiStorageAdapter = {
  /**
   * Leitura: sempre do localStorage (síncrono, sem latência).
   */
  read(key) {
    return getLocalStorage().getItem(key);
  },

  /**
   * Escrita: localStorage primeiro (instantâneo), depois sync para API.
   */
  write(key, value) {
    getLocalStorage().setItem(key, value);
    debouncedSync(key, value);
  },

  /**
   * Remoção: localStorage + notifica API.
   */
  remove(key) {
    getLocalStorage().removeItem(key);

    const field = KEY_TO_FIELD[key];
    if (field) {
      apiClient.put('/user/data', { [field]: null }).catch(() => {});
    }
  },
};

/**
 * Hidrata o localStorage com os dados vindos da API.
 * Chamado uma vez após o login bem-sucedido.
 * Os dados da API têm prioridade — são a fonte de verdade remota.
 */
export async function hydrateFromApi() {
  try {
    const response = await apiClient.get('/user/data');
    const data = response?.data;

    if (!data) return;

    const ls = getLocalStorage();

    if (data.appState != null) {
      ls.setItem(STORAGE_KEYS.appState, JSON.stringify(data.appState));
    }
    if (data.goals != null) {
      ls.setItem(STORAGE_KEYS.goals, JSON.stringify(data.goals));
    }
    if (data.categories != null) {
      ls.setItem(STORAGE_KEYS.categories, JSON.stringify(data.categories));
    }
    if (data.recurrences != null) {
      ls.setItem(STORAGE_KEYS.recurrences, JSON.stringify(data.recurrences));
    }
    if (data.budgets != null) {
      ls.setItem(STORAGE_KEYS.budgets, JSON.stringify(data.budgets));
    }
    if (data.welcomed != null) {
      ls.setItem(STORAGE_KEYS.welcomed, data.welcomed);
    }

    return data;
  } catch (err) {
    console.warn('[apiStorageAdapter] Hydration falhou:', err?.message);
    return null;
  }
}

/**
 * Envia dados do localStorage para o backend (migração inicial).
 * Só é chamado uma vez quando o usuário faz login pela primeira vez
 * e tem dados locais existentes.
 */
export async function migrateLocalToApi() {
  const ls = getLocalStorage();

  const payload = {};

  try {
    const appState = ls.getItem(STORAGE_KEYS.appState);
    if (appState) payload.appState = JSON.parse(appState);
  } catch {}

  try {
    const goals = ls.getItem(STORAGE_KEYS.goals);
    if (goals) payload.goals = JSON.parse(goals);
  } catch {}

  try {
    const categories = ls.getItem(STORAGE_KEYS.categories);
    if (categories) payload.categories = JSON.parse(categories);
  } catch {}

  try {
    const recurrences = ls.getItem(STORAGE_KEYS.recurrences);
    if (recurrences) payload.recurrences = JSON.parse(recurrences);
  } catch {}

  try {
    const budgets = ls.getItem(STORAGE_KEYS.budgets);
    if (budgets) payload.budgets = JSON.parse(budgets);
  } catch {}

  const welcomed = ls.getItem(STORAGE_KEYS.welcomed);
  if (welcomed) payload.welcomed = welcomed;

  const hasData = Object.keys(payload).length > 0;
  if (!hasData) return { migrated: [] };

  return apiClient.post('/user/migrate', payload);
}
