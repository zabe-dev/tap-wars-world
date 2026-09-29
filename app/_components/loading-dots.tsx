import styles from "./loading-dots.module.css";

export function LoadingDots({ label = "Loading" }: { label?: string }) {
  return <span className={styles.dots} role="status" aria-label={label}><i /><i /><i /></span>;
}
