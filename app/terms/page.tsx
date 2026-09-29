import Link from "next/link";
import styles from "../legal.module.css";

export const metadata = { title: "Terms of Use · World Counter" };

export default function TermsPage() {
  return <main className={styles.page}><article className={styles.content}>
    <Link className={styles.back} href="/">← Back to World Counter</Link>
    <h1>Terms of Use</h1><p className={styles.updated}>Last updated September 30, 2026</p>
    <p>World Counter is provided as an experimental public service. You may use it for personal, non-commercial interaction.</p>
    <h2>Fair use</h2><p>Do not automate taps, overload the service, manipulate rankings, or attempt to bypass rate limits. Rankings are informational and may change or reset.</p>
    <h2>Availability</h2><p>The service is provided as available, without guarantees of uptime, accuracy, or permanence. Location attribution is approximate and must not be used for legal, financial, or safety decisions.</p>
    <h2>Content</h2><p>Trivia links to third-party sources. Their content, availability, and terms are controlled by those providers.</p>
  </article></main>;
}
