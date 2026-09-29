import Link from "next/link";
import styles from "./fallback.module.css";

export default function NotFound() {
  return <main className={styles.page}><div className={styles.content}>
    <p className={styles.code}>ERROR 404</p>
    <p className={styles.message}>This page could not be found.</p>
    <Link className={styles.back} href="/">Go back</Link>
  </div></main>;
}
