import { SiteFooter } from "../_components/site-footer";
import { SiteControls, SiteControlsProvider } from "../_components/site-controls";
import { SiteBrand } from "../_components/site-brand";
import headerStyles from "../_components/site-brand.module.css";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteControlsProvider><div className={headerStyles.topbar}><SiteBrand /><SiteControls /></div>{children}<SiteFooter /></SiteControlsProvider>;
}
