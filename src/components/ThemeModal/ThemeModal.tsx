import { DEFAULT_THEME_ID, THEMES } from "../../themes/themes";
import type { TThemeId } from "../../types";
import styles from "./ThemeModal.module.css";

interface IThemeModalProps {
  onChoose: (id: TThemeId) => void;
}

export function ThemeModal({ onChoose }: IThemeModalProps) {
  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="choose your terminal"
    >
      <div className={styles.modal}>
        <h1 className={styles.title}>
          what kind of hacker do you want to be today?
        </h1>
        <p className={styles.subtitle}>
          you can switch any time from the top bar
        </p>
        <div className={styles.options}>
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={
                theme.id === DEFAULT_THEME_ID
                  ? `${styles.option} ${styles.defaultOption}`
                  : styles.option
              }
              onClick={() => onChoose(theme.id)}
            >
              <span
                className={styles.preview}
                data-theme={theme.id}
                aria-hidden="true"
              >
                <span className={styles.previewBar}>
                  <span className={styles.previewDot1} />
                  <span className={styles.previewDot2} />
                  <span className={styles.previewDot3} />
                </span>
                <span className={styles.previewBody}>
                  <span className={styles.previewPrompt}>$ </span>
                  <span className={styles.previewAccent}>whoami</span>
                  {"\n"}
                  <span className={styles.previewDim}>{"  ghost"}</span>
                  {"\n"}
                  <span className={styles.previewPrompt}>$ </span>
                  <span className={styles.previewText}>ssh target.local</span>
                  <span className={styles.previewCursor} />
                </span>
              </span>
              <span className={styles.optionName}>{theme.name}</span>
              <span className={styles.optionDesc}>{theme.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
