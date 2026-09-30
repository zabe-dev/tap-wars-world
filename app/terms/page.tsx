import styles from "../legal.module.css";

export const metadata = { title: "Terms of Use", description: "Read the Tap Wars World terms of use.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return <main className={styles.page}><div className={styles.shell}><article className={styles.content}>
    <h1>Terms of Use</h1><p className={styles.updated}>Last updated September 30, 2026</p>
    <p>By accessing or using tapwars.world, you acknowledge that you have read and agree to these Terms of Use. You also agree to use the service lawfully and in a way that does not interfere with other visitors or the service itself.</p>
    <p>In these terms, “the service” means the tapwars.world website, its rankings, battles, APIs, and related features.</p>
    <h2>Fair Use</h2>
    <p>You may tap manually for personal use. Do not use scripts, bots, clickers, automated requests, multiple accounts or devices to manipulate rankings, bypass rate limits, overload the service, or interfere with another visitor’s use.</p>
    <h2>Rankings and Location</h2>
    <p>Country attribution is approximate and may be affected by VPNs, proxies, mobile networks, or unavailable location data. Optional device-location permission may use the derived device city and country for your taps; it does not provide identity verification. Rankings and battle results are informational, may be corrected or reset, and do not create a promise of rewards or recognition.</p>
    <h2>Third-Party Services</h2>
    <p>The service may rely on third-party providers, including <a href="https://www.bigdatacloud.com/" target="_blank" rel="nofollow noreferrer">BigDataCloud</a> for location lookup, as well as providers for hosting, databases, and advertising. Those providers operate under their own terms and privacy policies. We are not responsible for their independent services, content, availability, or data practices.</p>
    <h2>Availability</h2>
    <p>The service is provided on an as-available basis. We may change, suspend, limit, or discontinue features, including the ranking and battles, without notice. Do not rely on the service for legal, financial, safety, or other critical decisions.</p>
    <h2>Enforcement</h2>
    <p>We may reject taps, rate-limit requests, remove abusive activity, or block access when we reasonably believe these terms or the security of the service are being violated.</p>
    <h2>Advertising</h2>
    <p>The service displays advertisements provided by third parties. Their content, targeting, availability, and terms are controlled by those providers.</p>
    <h2>Disclaimer</h2>
    <p>To the extent permitted by law, the service is provided “as is” and “as available,” without warranties of accuracy, availability, fitness for a particular purpose, or uninterrupted operation. Location results, rankings, advertisements, and battle results may be wrong, delayed, changed, or unavailable. You use the service at your own risk and must not rely on it for legal, financial, safety, medical, or other critical decisions.</p>
    <h2>Limitation of Liability</h2>
    <p>To the extent permitted by law, tapwars.world and its operators, owners, contributors, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost data, revenue, profits, or goodwill, arising from or related to the service. Our total liability for any claim will not exceed the greater of the amount you paid us for the service in the 12 months before the event or 100 USD. Nothing in these terms limits liability that cannot legally be limited.</p>
    <h2>Indemnification</h2>
    <p>To the extent permitted by law, you agree to defend, indemnify, and hold harmless tapwars.world and its operators, owners, contributors, and service providers from claims, losses, liabilities, and expenses arising from your misuse of the service, violation of these terms, or violation of another person’s rights.</p>
    <h2>Changes to These Terms</h2>
    <p>We may change these terms when the service or applicable requirements change. The date above shows when they were last revised. Continued use after an update means you accept the revised terms for future use.</p>
    <h2>Contact</h2>
    <p>Questions about these terms should be sent to <a href="mailto:contact@tapwars.world">contact@tapwars.world</a>.</p>
  </article></div></main>;
}
