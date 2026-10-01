import Link from "next/link";
import styles from "./site-footer.module.css";

export function SiteFooter() {
	return <footer className={styles.footer}><span>© 2026 tapwars.world</span><nav><Link href="/">World Ranking</Link><Link href="/milestones">Milestones</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav></footer>;
}
