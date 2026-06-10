export const storage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // storage blocked (private mode etc), just no-op
    }
  },

  getJson<T>(key: string, fallback: T): T {
    const raw = storage.getItem(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  setJson(key: string, value: unknown): void {
    storage.setItem(key, JSON.stringify(value));
  },
};
