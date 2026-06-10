import { useEffect, useRef, useState } from 'react';
import type { ISessionResult, TModeId } from '../../types';
import { shareResult } from '../../utils/share';
import type { TShareOutcome } from '../../utils/share';
import { calcTraceProbability, getClearanceRank } from '../../utils/wpm';
import styles from './Results.module.css';

interface IResultsProps {
  result: ISessionResult;
  mode: TModeId;
  onRestart: () => void;
}

const SHARE_LABELS: Record<TShareOutcome, string> = {
  shared: 'shared',
  copied: 'image copied',
  'copied-text': 'copied as text',
  downloaded: 'image saved',
  cancelled: 'share result',
  failed: 'share failed',
};

export function Results({ result, mode, onRestart }: IResultsProps) {
  const trace = calcTraceProbability(result.wpm);
  const rank = getClearanceRank(result.breachScore);
  const [shareLabel, setShareLabel] = useState('share result');
  const labelTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(labelTimer.current), []);

  const handleShare = async () => {
    const outcome = await shareResult(result, mode);
    if (outcome === 'cancelled') return;
    setShareLabel(SHARE_LABELS[outcome]);
    window.clearTimeout(labelTimer.current);
    labelTimer.current = window.setTimeout(() => setShareLabel('share result'), 2000);
  };

  return (
    <section className={styles.panel} aria-label="session results">
      <span className={styles.label}>breach score</span>
      <span className={styles.score}>{result.breachScore}</span>
      <span className={styles.rank}>
        clearance: <span className={styles.rankName}>{rank.name}</span>
      </span>
      <span className={styles.blurb}>{rank.blurb}</span>
      <div className={styles.grid}>
        <div className={styles.cell}>
          <span className={styles.value}>{result.wpm}</span>
          <span className={styles.cellLabel}>wpm</span>
        </div>
        <div className={styles.cell}>
          <span className={styles.value}>{result.accuracy}%</span>
          <span className={styles.cellLabel}>accuracy</span>
        </div>
        <div className={styles.cell}>
          <span className={styles.value}>{result.linesCleared}</span>
          <span className={styles.cellLabel}>lines cleared</span>
        </div>
        <div className={styles.cell}>
          <span className={styles.value}>{result.errors}</span>
          <span className={styles.cellLabel}>errors</span>
        </div>
      </div>
      <p className={styles.flavor}>trace probability: {trace}% - connection terminated cleanly</p>
      <div className={styles.actions}>
        <button type="button" className={styles.restart} onClick={onRestart}>
          new session
        </button>
        <button type="button" className={styles.share} onClick={handleShare} aria-live="polite">
          {shareLabel}
        </button>
      </div>
    </section>
  );
}
