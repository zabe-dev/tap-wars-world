import Link from "next/link";
import styles from "./site-brand.module.css";

export function SiteBrand() {
	return <header className={styles.brand}><Link href="/" className={styles.link} aria-label="Tap Wars World home"><img src="/logo-256x256.png" alt="" width="40" height="40" /><h1>Tap Wars World</h1></Link></header>;
}
