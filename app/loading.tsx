import styles from "./loading.module.css";

export default function Loading() {
  return <main className={styles.page} aria-label="Loading World Counter"><span className={styles.dots} role="status"><i /><i /><i /></span></main>;
}
