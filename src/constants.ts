import type { TModeId } from "./types";

export const APP_NAME = "hacktype";
export const LOGO_TEXT = "hacktype.pro";

export const SESSION_SECONDS = 60;
export const HISTORY_CAP = 20;
export const HISTORY_BARS_SHOWN = 16;
export const CHARS_PER_WORD = 5;

export const STORAGE_PREFIX = "hacktype_";
export const STORAGE_KEYS = {
  theme: `${STORAGE_PREFIX}theme`,
  history: `${STORAGE_PREFIX}history`,
} as const;

export const MODES: TModeId[] = ["intrusion", "network", "system"];

export const AUTHOR_HANDLE = "@diffVariable";
export const AUTHOR_URL = "https://github.com/diffVariable";
export const GITHUB_URL = "https://github.com/diffVariable/hacktype.pro";
export const KOFI_URL = "https://ko-fi.com/devinprogress";
export const SITE_URL = "https://hacktype.pro";
