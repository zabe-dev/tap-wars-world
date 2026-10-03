import styles from "../../legal.module.css";

export const metadata = { title: "Privacy Policy", description: "Read the Tap Wars World privacy policy.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <main className={styles.page}><div className={styles.shell}><article className={styles.content}>
    <h1>Privacy Policy</h1><p className={styles.updated}>Last updated October 3, 2026</p>
    <p>tapwars.world is a public country tap counter. This policy explains what the service uses to attribute taps and operate the ranking.</p>
    <p>In this policy, “the service” means the tapwars.world website, its rankings, battles, APIs, and related features.</p>
    <h2>Information We Receive</h2>
    <p>When you submit a tap, the server may receive your IP address through the hosting proxy. We use it to estimate a country and city with a local location database and to apply abuse limits. We do not create accounts or collect names or email addresses.</p>
    <h2>Optional Device Location</h2>
    <p>We offer optional device location access. Your browser stores the location choice and selected city and country in local storage so your tap location stays consistent between visits. This browser storage does not contain device coordinates.</p>
    <p>If you grant permission, your browser sends device coordinates directly to <a href="https://www.bigdatacloud.com/" target="_blank" rel="nofollow noreferrer">BigDataCloud</a>. We receive only the city and country it returns with your next tap, not the coordinates. The provider handles that request under its <a href="https://www.bigdatacloud.com/privacy-and-cookie-policy" target="_blank" rel="nofollow noreferrer">privacy policy</a>. You can decline and continue using the approximate public-IP location.</p>
    <h2>Browser Location Fallback</h2>
    <p>If the server cannot see a trusted proxy address, your browser may request its public IP from a third-party location service and send that address to this service for an approximate lookup. That provider processes the request under its own privacy policy. VPNs, proxies, and mobile networks can produce an inaccurate location.</p>
    <h2>Storage and Retention</h2>
    <p>Accepted taps are stored as aggregated country and city totals in a database. We do not store individual tap records or IP addresses in the ranking database. Active country and city battles and milestone snapshots are stored server-side so they can stay consistent for participating visitors. The derived city and country used for a tap become part of those aggregate totals and may not be removable individually. The site also uses a strictly necessary first-party tap-session cookie or equivalent session token to validate tap requests; it does not contain your name or contact details. Temporary rate-limit data is held in application memory and normally disappears when the service restarts.</p>
    <h2>Anonymous Tap Display</h2>
    <p>The anonymous-taps toggle is enabled by default and asks the service to blur your city in tap activity toasts shown to other visitors. It is a display preference only: it does not change the location information used to attribute your tap or remove city and country totals from rankings or battles. If only a few people are tapping, other visitors may still be able to infer where a tap came from based on its timing, activity, or changes in a small ranking.</p>
    <h2>Advertising</h2>
    <p>The service displays advertisements. Advertising providers may use cookies or similar technologies and may receive device or usage information according to their own privacy policies.</p>
    <h2>Service Providers</h2>
    <p>Our hosting, database, location, and advertising providers may process technical information needed to deliver the service. Location lookups are performed using a local database when possible.</p>
    <h2>Security</h2>
    <p>We use reasonable safeguards for the information we handle, but no website, network, or storage system can be guaranteed secure. Do not send sensitive or confidential information through the service.</p>
    <h2>Your Choices</h2>
    <p>You can decline browser location permission, clear the site’s local storage or cookie, and stop using the service at any time. Depending on where you live, you may have additional privacy rights. Contact us to ask a question or make a request; because the ranking contains only aggregate country totals, individual taps cannot be removed from it.</p>
    <h2>Changes to This Policy</h2>
    <p>We may update this policy when the service or applicable requirements change. The date above shows when it was last revised. Continued use after an update means the revised policy applies to future use.</p>
    <h2>Contact</h2>
    <p>For privacy questions or requests, email <a href="mailto:contact@tapwars.world">contact@tapwars.world</a>.</p>
  </article></div></main>;
}
