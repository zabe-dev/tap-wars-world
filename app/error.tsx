"use client";

import styles from "./fallback.module.css";

export default function ErrorFallback({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className={styles.page}><div className={styles.content}>
    <p className={styles.code}>ERROR 500</p>
    <p className={styles.message}>Something went wrong.</p>
    <button className={styles.back} onClick={() => window.history.length > 1 ? window.history.back() : reset()}>Go back</button>
  </div></main>;
}
