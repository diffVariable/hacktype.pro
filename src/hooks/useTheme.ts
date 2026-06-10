import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../constants';
import { DEFAULT_THEME_ID, THEMES } from '../themes/themes';
import type { TThemeId } from '../types';
import { storage } from '../utils/storage';

function readStoredTheme(): TThemeId | null {
  const raw = storage.getItem(STORAGE_KEYS.theme);
  return THEMES.some((theme) => theme.id === raw) ? (raw as TThemeId) : null;
}

export function useTheme() {
  const [storedId, setStoredId] = useState<TThemeId | null>(readStoredTheme);
  const themeId = storedId ?? DEFAULT_THEME_ID;

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
  }, [themeId]);

  const chooseTheme = useCallback((id: TThemeId) => {
    storage.setItem(STORAGE_KEYS.theme, id);
    setStoredId(id);
  }, []);

  const toggleTheme = useCallback(() => {
    setStoredId((current) => {
      const ids = THEMES.map((theme) => theme.id);
      const activeId = current ?? DEFAULT_THEME_ID;
      const next = ids[(ids.indexOf(activeId) + 1) % ids.length];
      storage.setItem(STORAGE_KEYS.theme, next);
      return next;
    });
  }, []);

  return {
    themeId,
    needsChoice: storedId === null,
    chooseTheme,
    toggleTheme,
  };
}
