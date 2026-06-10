import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import styles from './App.module.css';
import { Footer } from './components/Footer/Footer';
import { HistoryBars } from './components/HistoryBars/HistoryBars';
import { ModeBar } from './components/ModeBar/ModeBar';
import { Results } from './components/Results/Results';
import { StatsRow } from './components/StatsRow/StatsRow';
import { Terminal } from './components/Terminal/Terminal';
import { ThemeModal } from './components/ThemeModal/ThemeModal';
import { TopBar } from './components/TopBar/TopBar';
import { useHistory } from './hooks/useHistory';
import { useTheme } from './hooks/useTheme';
import { useTypingEngine } from './hooks/useTypingEngine';
import type { TModeId } from './types';

export function App() {
  const { themeId, needsChoice, chooseTheme, toggleTheme } = useTheme();
  const { history, pushWpm } = useHistory();
  const [mode, setMode] = useState<TModeId>('intrusion');
  const engine = useTypingEngine(mode, (result) => pushWpm(result.wpm));
  const showingResults = engine.status === 'finished' && engine.result !== null;

  return (
    <div className={showingResults ? `${styles.page} ${styles.scrollable}` : styles.page}>
      {needsChoice && <ThemeModal onChoose={chooseTheme} />}
      <div className={styles.layout}>
        <TopBar themeId={themeId} onToggleTheme={toggleTheme} />
        <ModeBar mode={mode} onModeChange={setMode} />
        <StatsRow wpm={engine.wpm} accuracy={engine.accuracy} secondsLeft={engine.secondsLeft} />
        {engine.status === 'finished' && engine.result ? (
          <Results result={engine.result} mode={mode} onRestart={engine.resetRun} />
        ) : (
          <Terminal
            mode={mode}
            lines={engine.lines}
            lineIndex={engine.lineIndex}
            typed={engine.typed}
            lineComplete={engine.lineComplete}
            onKeyDown={engine.handleKeyDown}
          />
        )}
        <p className={styles.hint}>
          the machine answers itself - you type the commands
          <span className={styles.hintKeys}>
            <kbd className={styles.kbd}>enter</kbd> commit line
            <kbd className={styles.kbd}>esc</kbd> reset
          </span>
        </p>
        <HistoryBars history={history} />
        <Footer />
      </div>
      <Analytics />
    </div>
  );
}
