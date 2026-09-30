import Link from "next/link";
import styles from "../legal.module.css";

export const metadata = { title: "Privacy Policy · tapwars.world" };

export default function PrivacyPage() {
  return <main className={styles.page}><article className={styles.content}>
    <Link className={styles.back} href="/">← Back to tapwars.world</Link>
    <h1>Privacy Policy</h1><p className={styles.updated}>Last updated September 30, 2026</p>
    <p>tapwars.world is a public country tap counter. This policy explains what the service uses to attribute taps and operate the ranking.</p>
    <h2>Information we receive</h2>
    <p>When you submit a tap, the server may receive your IP address through the hosting proxy. We use it to estimate a country and city with a local GeoIP database and to apply abuse limits. We do not request GPS permission, create accounts, or collect names, email addresses, or precise location.</p>
    <h2>Browser location fallback</h2>
    <p>If the server cannot see a trusted proxy address, your browser may request its public IP from ipify and send that address to this service for an approximate lookup. ipify processes that request under its own privacy policy. VPNs, proxies, and mobile networks can produce an inaccurate location.</p>
    <h2>Storage and retention</h2>
    <p>Accepted taps are stored as aggregated country totals in PostgreSQL. We do not store individual tap records or IP addresses in the ranking database. Temporary rate-limit data is held in application memory and normally disappears when the service restarts. An active battle may be stored in your browser’s local storage so it survives a refresh.</p>
    <h2>Service providers</h2>
    <p>The hosting provider, PostgreSQL provider, and ipify may process technical information needed to deliver the service. The GeoIP database is bundled with the application and queried locally.</p>
    <h2>Your choices</h2>
    <p>You can stop using the service at any time and clear its local storage through your browser settings. Because the ranking contains only aggregate country totals, individual taps cannot be removed from it.</p>
    <h2>Contact</h2>
    <p>For privacy questions or requests, contact the site operator using the published contact address for this deployment.</p>
  </article></main>;
}
