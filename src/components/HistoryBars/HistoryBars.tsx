import { HISTORY_BARS_SHOWN } from '../../constants';
import styles from './HistoryBars.module.css';

interface IHistoryBarsProps {
  history: number[];
}

export function HistoryBars({ history }: IHistoryBarsProps) {
  const bars = history.slice(-HISTORY_BARS_SHOWN);
  const max = Math.max(...bars, 1);
  const best = bars.length ? Math.max(...bars) : 0;
  const last = bars.length ? bars[bars.length - 1] : 0;

  return (
    <section className={styles.wrap} aria-label="session history">
      <div className={styles.header}>
        <span className={styles.label}>session history</span>
        {bars.length > 0 && (
          <span className={styles.meta}>
            wpm per run
            <span className={styles.dot}>·</span>
            best <span className={styles.value}>{best}</span>
            <span className={styles.dot}>·</span>
            last <span className={styles.value}>{last}</span>
          </span>
        )}
      </div>
      {bars.length === 0 ? (
        <p className={styles.empty}>no runs yet. finish a session to log your wpm here</p>
      ) : (
        <div className={styles.bars}>
          {bars.map((wpm, index) => (
            <div
              key={index}
              className={index === bars.length - 1 ? `${styles.bar} ${styles.barLast}` : styles.bar}
              style={{ height: `${Math.max((wpm / max) * 100, 6)}%` }}
              title={`${wpm} wpm`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
