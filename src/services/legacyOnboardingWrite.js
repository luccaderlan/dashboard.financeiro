import { STORAGE_KEYS, writeStorage } from './storage.js';

export function isLegacyWelcomeComplete(value) {
  return value === '1' || value === 'true' || value === true;
}

export function saveLegacyOnboarding({ nome }) {
  const userName = (nome || '').trim();

  if (!userName) {
    throw new Error('Informe seu nome para continuar.');
  }

  writeStorage(STORAGE_KEYS.userName, userName);
  writeStorage(STORAGE_KEYS.welcomed, '1');

  return {
    nome: userName,
    welcomed: '1'
  };
}
