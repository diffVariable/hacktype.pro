import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { SESSION_SECONDS } from '../constants';
import { getRandomSession } from '../data/sessions';
import type { ISessionLine, ISessionResult, TGameStatus, TModeId } from '../types';
import { calcAccuracy, calcBreachScore, calcWpm } from '../utils/wpm';

interface ICommittedStats {
  correct: number;
  typed: number;
  errors: number;
  lines: number;
}

// continuous scrollback: finished scripts stay, new ones get appended
interface ILineStream {
  lines: ISessionLine[];
  lastScriptId: string;
}

const EMPTY_STATS: ICommittedStats = { correct: 0, typed: 0, errors: 0, lines: 0 };

function freshStream(mode: TModeId): ILineStream {
  const script = getRandomSession(mode);
  return { lines: script.lines, lastScriptId: script.id };
}

function countCorrect(typed: string, target: string): number {
  let correct = 0;
  for (let i = 0; i < typed.length; i += 1) {
    if (typed[i] === target[i]) correct += 1;
  }
  return correct;
}

export function useTypingEngine(mode: TModeId, onFinish: (result: ISessionResult) => void) {
  const [stream, setStream] = useState<ILineStream>(() => freshStream(mode));
  const [lineIndex, setLineIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [status, setStatus] = useState<TGameStatus>('idle');
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [committed, setCommitted] = useState<ICommittedStats>(EMPTY_STATS);
  const [result, setResult] = useState<ISessionResult | null>(null);
  const startRef = useRef(0);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const currentText = stream.lines[lineIndex]?.text ?? '';
  const lineComplete = typed.length === currentText.length && currentText.length > 0;
  const currentCorrect = countCorrect(typed, currentText);
  const totalCorrect = committed.correct + currentCorrect;
  const totalTyped = committed.typed + typed.length;
  const totalErrors = committed.errors + (typed.length - currentCorrect);

  const reset = useCallback((nextMode: TModeId) => {
    setStream(freshStream(nextMode));
    setLineIndex(0);
    setTyped('');
    setStatus('idle');
    setSecondsLeft(SESSION_SECONDS);
    setCommitted(EMPTY_STATS);
    setResult(null);
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    reset(mode);
  }, [mode, reset]);

  // skip output lines so the reply and next prompt land together;
  // append a fresh session when the stream runs out
  const advanceLine = useCallback(() => {
    setTyped('');
    let next = lineIndex + 1;
    while (next < stream.lines.length && stream.lines[next].prompt === '') next += 1;
    if (next >= stream.lines.length) {
      const script = getRandomSession(mode, stream.lastScriptId);
      setStream({ lines: [...stream.lines, ...script.lines], lastScriptId: script.id });
      setLineIndex(stream.lines.length);
    } else {
      setLineIndex(next);
    }
  }, [lineIndex, stream, mode]);

  useEffect(() => {
    if (status !== 'running') return;
    const id = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== 'running' || secondsLeft > 0) return;
    const finalWpm = Math.round(calcWpm(totalCorrect, SESSION_SECONDS * 1000));
    const finalAccuracy = Math.round(calcAccuracy(totalCorrect, totalTyped));
    const final: ISessionResult = {
      wpm: finalWpm,
      accuracy: finalAccuracy,
      linesCleared: committed.lines,
      errors: totalErrors,
      breachScore: calcBreachScore(finalWpm, finalAccuracy),
    };
    setStatus('finished');
    setResult(final);
    onFinishRef.current(final);
  }, [secondsLeft, status, totalCorrect, totalTyped, totalErrors, committed.lines]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.ctrlKey || event.metaKey) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        reset(mode);
        return;
      }
      if (status === 'finished') return;

      if (event.key === 'Enter') {
        event.preventDefault();
        if (status !== 'running' || !lineComplete) return;
        const correct = countCorrect(typed, currentText);
        // enter counts as a correct char, like the space in a word test
        setCommitted((c) => ({
          correct: c.correct + correct + 1,
          typed: c.typed + typed.length + 1,
          errors: c.errors + (typed.length - correct),
          lines: c.lines + 1,
        }));
        advanceLine();
        return;
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        setTyped((t) => t.slice(0, -1));
        return;
      }

      if (event.key.length === 1) {
        event.preventDefault();
        if (status === 'idle') {
          startRef.current = Date.now();
          setStatus('running');
        }
        if (typed.length < currentText.length) {
          setTyped((t) => t + event.key);
        }
      }
    },
    [mode, status, lineComplete, currentText, typed, advanceLine, reset],
  );

  const resetRun = useCallback(() => reset(mode), [mode, reset]);

  const elapsedMs =
    status === 'running'
      ? Math.min(Math.max(Date.now() - startRef.current, 1000), SESSION_SECONDS * 1000)
      : 0;
  const wpm =
    status === 'finished' && result
      ? result.wpm
      : status === 'running'
        ? Math.round(calcWpm(totalCorrect, elapsedMs))
        : 0;
  const accuracy =
    status === 'finished' && result ? result.accuracy : Math.round(calcAccuracy(totalCorrect, totalTyped));

  return {
    lines: stream.lines,
    lineIndex,
    typed,
    status,
    secondsLeft,
    wpm,
    accuracy,
    linesCleared: committed.lines,
    result,
    lineComplete,
    handleKeyDown,
    resetRun,
  };
}
