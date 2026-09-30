import Link from "next/link";
import styles from "../legal.module.css";

export const metadata = { title: "Terms of Use · tapwars.world" };

export default function TermsPage() {
  return <main className={styles.page}><article className={styles.content}>
    <Link className={styles.back} href="/">← Back to tapwars.world</Link>
    <h1>Terms of Use</h1><p className={styles.updated}>Last updated September 30, 2026</p>
    <p>By using tapwars.world, you agree to use the service lawfully and in a way that does not interfere with other visitors or the service itself.</p>
    <p>In these terms, “the service” means the tapwars.world website, its rankings, battles, APIs, and related features.</p>
    <h2>Fair use</h2>
    <p>You may tap manually for personal use. Do not use scripts, bots, clickers, automated requests, multiple accounts or devices to manipulate rankings, bypass rate limits, overload the service, or interfere with another visitor’s use.</p>
    <h2>Rankings and location</h2>
    <p>Country attribution is approximate and may be affected by VPNs, proxies, mobile networks, or unavailable location data. Rankings and battle results are informational, may be corrected or reset, and do not create a promise of rewards or recognition.</p>
    <h2>Availability</h2>
    <p>The service is provided on an as-available basis. We may change, suspend, limit, or discontinue features, including the ranking and battles, without notice. Do not rely on the service for legal, financial, safety, or other critical decisions.</p>
    <h2>Enforcement</h2>
    <p>We may reject taps, rate-limit requests, remove abusive activity, or block access when we reasonably believe these terms or the security of the service are being violated.</p>
    <h2>Advertising</h2>
    <p>The service displays advertisements provided by third parties. Their content, targeting, availability, and terms are controlled by those providers.</p>
    <h2>Disclaimer</h2>
    <p>To the extent permitted by law, the service is provided without warranties of accuracy, availability, fitness for a particular purpose, or uninterrupted operation. You use it at your own risk.</p>
    <h2>Contact</h2>
    <p>Questions about these terms should be sent to <a href="mailto:contact@tapwars.world">contact@tapwars.world</a>.</p>
  </article></main>;
}
