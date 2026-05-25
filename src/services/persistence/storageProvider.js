import { localStorageAdapter } from './localStorageAdapter.js';

let activeStorageAdapter = localStorageAdapter;

export function setStorageAdapter(adapter) {
  activeStorageAdapter = adapter || localStorageAdapter;
}

export function getStorageAdapter() {
  return activeStorageAdapter;
}

export function readStorageValue(key) {
  return getStorageAdapter().read(key);
}

export function writeStorageValue(key, value) {
  getStorageAdapter().write(key, value);
}

export function removeStorageValue(key) {
  getStorageAdapter().remove(key);
}

export function readJsonValue(key, fallback) {
  try {
    const value = readStorageValue(key);
    return JSON.parse(value || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export function writeJsonValue(key, value) {
  writeStorageValue(key, JSON.stringify(value));
}
