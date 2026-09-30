import styles from "./site-brand.module.css";

export function SiteBrand() {
	return <header className={styles.brand}><img src="/logo-256x256.png" alt="" width="40" height="40" /><h1>Tap Wars World</h1></header>;
}
