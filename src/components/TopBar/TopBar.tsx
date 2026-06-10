import { GITHUB_URL, KOFI_URL, LOGO_TEXT } from '../../constants';
import type { TThemeId } from '../../types';
import styles from './TopBar.module.css';

interface ITopBarProps {
  themeId: TThemeId;
  onToggleTheme: () => void;
}

export function TopBar({ themeId, onToggleTheme }: ITopBarProps) {
  const [head, tail] = LOGO_TEXT.split('.');

  return (
    <header className={styles.bar}>
      <span className={styles.logo}>
        {head}
        <span className={styles.logoDot}>.</span>
        {tail}
      </span>
      <nav className={styles.links} aria-label="site links">
        <a className={styles.link} href={GITHUB_URL} target="_blank" rel="noreferrer">
          about
        </a>
        <button
          type="button"
          className={styles.themeButton}
          onClick={onToggleTheme}
          aria-label={`switch theme, current theme is ${themeId}`}
        >
          theme: {themeId}
        </button>
        <a className={styles.kofi} href={KOFI_URL} target="_blank" rel="noreferrer">
          support on ko-fi
        </a>
      </nav>
    </header>
  );
}
