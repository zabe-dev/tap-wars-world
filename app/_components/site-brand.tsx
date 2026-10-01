import Link from "next/link";
import styles from "./site-brand.module.css";
import { LogoTap } from "./logo-tap";

export function SiteBrand() {
	return <header className={styles.brand}><LogoTap /><Link href="/" className={styles.link} aria-label="Tap Wars World home"><h1>Tap Wars World</h1></Link></header>;
}
