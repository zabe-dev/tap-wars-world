import Link from "next/link";
import styles from "../legal.module.css";

export const metadata = { title: "Privacy Policy · World Counter" };

export default function PrivacyPage() {
  return <main className={styles.page}><article className={styles.content}>
    <Link className={styles.back} href="/">← Back to World Counter</Link>
    <h1>Privacy Policy</h1><p className={styles.updated}>Last updated September 30, 2026</p>
    <p>World Counter is a public tap counter. We collect only the information needed to attribute a tap approximately to a country and maintain the shared ranking.</p>
    <h2>Location</h2><p>When proxy location is unavailable, your browser may request its public IP from ipify. That IP is sent to our server and looked up locally. We do not request GPS permission. VPNs and mobile networks may report an approximate or different location.</p>
    <h2>Data storage</h2><p>The current prototype stores ranking totals in application memory. Totals may reset when the service restarts. We do not require an account.</p>
    <h2>Contact</h2><p>For privacy questions, contact the site operator through the deployment’s published contact address.</p>
  </article></main>;
}
