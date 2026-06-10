import { AUTHOR_HANDLE, AUTHOR_URL, GITHUB_URL } from '../../constants';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      built by{' '}
      <a className={styles.link} href={AUTHOR_URL} target="_blank" rel="noreferrer">
        {AUTHOR_HANDLE}
      </a>{' '}
      {'·'}{' '}
      <a className={styles.link} href={GITHUB_URL} target="_blank" rel="noreferrer">
        github
      </a>{' '}
      {'·'} open source, free forever
    </footer>
  );
}
