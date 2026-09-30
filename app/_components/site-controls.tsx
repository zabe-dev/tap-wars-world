"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import styles from "./counter.module.css";

type SoundContextValue = { muted: boolean; toggleMuted: () => void };
const SoundContext = createContext<SoundContextValue | null>(null);

export function useSound() {
	const value = useContext(SoundContext);
	if (!value) throw new Error("useSound must be used inside SiteControlsProvider");
	return value;
}

export function SiteControlsProvider({ children }: { children: React.ReactNode }) {
	const [muted, setMuted] = useState(false);
	return <SoundContext.Provider value={{ muted, toggleMuted: () => setMuted((value) => !value) }}>{children}</SoundContext.Provider>;
}

export function SiteControls() {
	const pathname = usePathname();
	const { muted, toggleMuted } = useSound();
	const [dark, setDark] = useState(false);

	useEffect(() => {
		let saved: string | null = null;
		try { saved = localStorage.getItem("wc-theme"); } catch { /* System theme works without storage. */ }
		const isDark = saved === "dark" || (saved !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
		setDark(isDark);
		document.documentElement.dataset.theme = isDark ? "dark" : "light";
	}, []);

	function toggleTheme() {
		const theme = dark ? "light" : "dark";
		setDark(!dark);
		document.documentElement.dataset.theme = theme;
		try { localStorage.setItem("wc-theme", theme); } catch { /* Theme still applies for this page. */ }
	}

	return <header className={styles.controls}>
		<div className={styles.headerActions}>
			{pathname !== "/" && <Link className={styles.backControl} href="/">‹ Back</Link>}
			<button type="button" className={styles.sound} onClick={toggleMuted} aria-label={muted ? "Turn sound on" : "Turn sound off"} aria-pressed={!muted}>
				<Icon icon={muted ? "lucide:volume-x" : "lucide:volume-2"} aria-hidden="true" />
			</button>
			<button type="button" className={styles.sound} onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
				<Icon icon={dark ? "lucide:sun" : "lucide:moon"} aria-hidden="true" />
			</button>
		</div>
	</header>;
}
