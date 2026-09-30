import Link from "next/link";
import styles from "../legal.module.css";

export const metadata = { title: "Privacy Policy · tapwars.world" };

export default function PrivacyPage() {
  return <main className={styles.page}><Link className={styles.back} href="/">← Back</Link><article className={styles.content}>
    <h1>Privacy Policy</h1><p className={styles.updated}>Last updated September 30, 2026</p>
    <p>tapwars.world is a public country tap counter. This policy explains what the service uses to attribute taps and operate the ranking.</p>
    <p>In this policy, “the service” means the tapwars.world website, its rankings, battles, APIs, and related features.</p>
    <h2>Information we receive</h2>
    <p>When you submit a tap, the server may receive your IP address through the hosting proxy. We use it to estimate a country and city with a local location database and to apply abuse limits. We do not request GPS permission, create accounts, or collect names, email addresses, or precise location.</p>
    <h2>Browser location fallback</h2>
    <p>If the server cannot see a trusted proxy address, your browser may request its public IP from a third-party location service and send that address to this service for an approximate lookup. That provider processes the request under its own privacy policy. VPNs, proxies, and mobile networks can produce an inaccurate location.</p>
    <h2>Storage and retention</h2>
    <p>Accepted taps are stored as aggregated country totals in a database. We do not store individual tap records or IP addresses in the ranking database. Active battles and milestone snapshots are stored server-side so they can stay consistent for participating visitors. The site also uses a strictly necessary first-party cookie to validate tap sessions; it does not contain your name or contact details. Temporary rate-limit data is held in application memory and normally disappears when the service restarts.</p>
    <h2>Advertising</h2>
    <p>The service displays advertisements. Advertising providers may use cookies or similar technologies and may receive device or usage information according to their own privacy policies.</p>
    <h2>Service providers</h2>
    <p>Our hosting, database, location, and advertising providers may process technical information needed to deliver the service. Location lookups are performed using a local database when possible.</p>
    <h2>Your choices</h2>
    <p>You can stop using the service at any time. Because the ranking contains only aggregate country totals, individual taps cannot be removed from it.</p>
    <h2>Contact</h2>
    <p>For privacy questions or requests, email <a href="mailto:contact@tapwars.world">contact@tapwars.world</a>.</p>
  </article></main>;
}
