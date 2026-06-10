import type { IThemeConfig, TThemeId } from '../types';

export const THEMES: IThemeConfig[] = [
  {
    id: 'cozy',
    name: 'cozy hacker',
    description: 'charcoal plum, dusty pink. quiet, no glow',
  },
  {
    id: 'textbook',
    name: 'textbook hacker',
    description: 'green phosphor on black, straight from the movies',
  },
];

export const DEFAULT_THEME_ID: TThemeId = 'cozy';
