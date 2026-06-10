import { MODES } from '../../constants';
import type { TModeId } from '../../types';
import styles from './ModeBar.module.css';

interface IModeBarProps {
  mode: TModeId;
  onModeChange: (mode: TModeId) => void;
}

export function ModeBar({ mode, onModeChange }: IModeBarProps) {
  return (
    <div className={styles.bar} aria-label="session mode">
      {MODES.map((id) => (
        <button
          key={id}
          type="button"
          className={mode === id ? `${styles.tab} ${styles.active}` : styles.tab}
          aria-pressed={mode === id}
          onClick={() => onModeChange(id)}
        >
          {id}
        </button>
      ))}
    </div>
  );
}
