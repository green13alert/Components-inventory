import type { SupportedStorage } from '@supabase/supabase-js';

const memoryStore = new Map<string, string>();

const memoryStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
  getItem: (key) => memoryStore.get(key) ?? null,
  setItem: (key, value) => {
    memoryStore.set(key, value);
  },
  removeItem: (key) => {
    memoryStore.delete(key);
  },
};

function getWebStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
    return globalThis.localStorage;
  }

  return memoryStorage;
}

export const authStorage: SupportedStorage = {
  getItem: (key) => getWebStorage().getItem(key),
  setItem: (key, value) => {
    getWebStorage().setItem(key, value);
  },
  removeItem: (key) => {
    getWebStorage().removeItem(key);
  },
};
