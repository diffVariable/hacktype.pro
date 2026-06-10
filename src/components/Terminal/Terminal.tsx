import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { ISessionLine, TModeId } from '../../types';
import { SessionLine } from '../SessionLine/SessionLine';
import styles from './Terminal.module.css';

interface ITerminalProps {
  mode: TModeId;
  lines: ISessionLine[];
  lineIndex: number;
  typed: string;
  lineComplete: boolean;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export function Terminal({ mode, lines, lineIndex, typed, lineComplete, onKeyDown }: ITerminalProps) {
  const [focused, setFocused] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // keep the current line in view as the scrollback grows
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lineIndex, lines.length]);

  return (
    <section className={styles.terminal} aria-label="typing terminal">
      <header className={styles.titleBar}>
        <span className={styles.dots} aria-hidden="true">
          <span className={styles.dot1} />
          <span className={styles.dot2} />
          <span className={styles.dot3} />
        </span>
        <span className={styles.title}>
          operator@ghost - ~/<span className={styles.titleMode}>{mode}</span>
        </span>
      </header>
      <div className={styles.bodyWrap}>
        <div
          ref={bodyRef}
          className={styles.body}
          tabIndex={0}
          role="textbox"
          aria-multiline="true"
          aria-label="terminal session. click to focus, then type the highlighted line"
          onKeyDown={onKeyDown}
          onClick={() => bodyRef.current?.focus()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {lines.slice(0, lineIndex + 1).map((line, index) => (
            <SessionLine
              key={index}
              line={line}
              state={index < lineIndex ? 'done' : 'current'}
              typed={index === lineIndex ? typed : ''}
              lineComplete={index === lineIndex && lineComplete}
            />
          ))}
        </div>
        {!focused && (
          <div className={styles.overlay} onClick={() => bodyRef.current?.focus()}>
            <span className={styles.overlayText}>
              click to jack in<span className={styles.blink}>_</span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
