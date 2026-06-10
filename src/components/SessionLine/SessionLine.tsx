import type { ISessionLine } from '../../types';
import styles from './SessionLine.module.css';

type TLineState = 'done' | 'current';

interface ISessionLineProps {
  line: ISessionLine;
  state: TLineState;
  typed: string;
  lineComplete: boolean;
}

export function SessionLine({ line, state, typed, lineComplete }: ISessionLineProps) {
  const isOutput = line.prompt === '';
  const lineClass = [styles.line, styles[state], isOutput ? styles.output : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={lineClass}>
      <span className={isOutput ? styles.indent : styles.prompt} aria-hidden="true">
        {isOutput ? '  ' : line.prompt}
      </span>
      {state === 'current' ? (
        <span>
          {line.text.split('').map((char, index) => {
            const classNames = [
              index < typed.length
                ? typed[index] === char
                  ? styles.correct
                  : styles.wrong
                : styles.untyped,
            ];
            if (index === typed.length) classNames.push(styles.cursor);
            return (
              <span key={index} className={classNames.join(' ')}>
                {char}
              </span>
            );
          })}
          {lineComplete && (
            <span className={styles.enterHint} aria-hidden="true">
              {'↵'}
            </span>
          )}
        </span>
      ) : (
        <span className={styles.doneText}>{line.text}</span>
      )}
    </div>
  );
}
