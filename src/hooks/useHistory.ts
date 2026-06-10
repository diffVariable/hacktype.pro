import { useCallback, useState } from 'react';
import { HISTORY_CAP, STORAGE_KEYS } from '../constants';
import { storage } from '../utils/storage';

// storage can be corrupted or hand-edited, keep only finite numbers
function loadHistory(): number[] {
  const raw = storage.getJson<unknown>(STORAGE_KEYS.history, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter((n): n is number => typeof n === 'number' && Number.isFinite(n)).slice(-HISTORY_CAP);
}

export function useHistory() {
  const [history, setHistory] = useState<number[]>(loadHistory);

  const pushWpm = useCallback((wpm: number) => {
    setHistory((current) => {
      const next = [...current, wpm].slice(-HISTORY_CAP);
      storage.setJson(STORAGE_KEYS.history, next);
      return next;
    });
  }, []);

  return { history, pushWpm };
}
