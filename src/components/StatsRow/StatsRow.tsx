import styles from './StatsRow.module.css';

interface IStatsRowProps {
  wpm: number;
  accuracy: number;
  secondsLeft: number;
}

export function StatsRow({ wpm, accuracy, secondsLeft }: IStatsRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.stat}>
        <span className={styles.wpmValue}>{wpm}</span>
        <span className={styles.label}>wpm</span>
      </div>
      <span className={styles.divider} aria-hidden="true" />
      <div className={styles.stat}>
        <span className={styles.value}>{accuracy}%</span>
        <span className={styles.label}>accuracy</span>
      </div>
      <span className={styles.divider} aria-hidden="true" />
      <div className={styles.stat}>
        <span className={styles.value}>{secondsLeft}</span>
        <span className={styles.label}>seconds</span>
      </div>
    </div>
  );
}
