import { SiteFooter } from "./site-footer";
import { SiteControls, SiteControlsProvider } from "./site-controls";
import { SiteBrand } from "./site-brand";
import styles from "./site-brand.module.css";

export function SiteFrame({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteControlsProvider><div className={styles.topbar}><SiteBrand /><SiteControls /></div>{children}<SiteFooter /></SiteControlsProvider>;
}
