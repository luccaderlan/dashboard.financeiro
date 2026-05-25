function getLocalStorage() {
  return typeof window !== 'undefined' ? window.localStorage : globalThis.localStorage;
}

export const localStorageAdapter = {
  read(key) {
    return getLocalStorage().getItem(key);
  },

  write(key, value) {
    getLocalStorage().setItem(key, value);
  },

  remove(key) {
    getLocalStorage().removeItem(key);
  }
};
