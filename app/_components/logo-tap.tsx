"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "./site-brand.module.css";

export const LOGO_TAP_EVENT = "tapwars:logo-tap";

export function LogoTap() {
  const pathname = usePathname();
  const [rings, setRings] = useState<number[]>([]);
  const image = <img src="/brand-logo.png" alt="" width="40" height="40" />;
  const tapPage = pathname === "/" || /^\/[a-z]{2}$/.test(pathname);
  if (!tapPage) return <Link href="/" aria-label="Tap Wars World home">{image}</Link>;
  return <button type="button" className={styles.logoButton} aria-label="Tap logo"
    onClick={() => { const id = Date.now() + Math.random(); setRings((value) => [...value, id]); window.setTimeout(() => setRings((value) => value.filter((ring) => ring !== id)), 800); window.dispatchEvent(new Event(LOGO_TAP_EVENT)); }}>{image}{rings.map((id) => <span key={id} className={styles.logoRing} aria-hidden="true" />)}</button>;
}
