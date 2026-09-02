import 'expo-sqlite/localStorage/install';

import type { SupportedStorage } from '@supabase/supabase-js';

export const authStorage: SupportedStorage = {
  getItem: (key) => globalThis.localStorage.getItem(key),
  setItem: (key, value) => {
    globalThis.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    globalThis.localStorage.removeItem(key);
  },
};
