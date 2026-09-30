"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import styles from "./counter.module.css";

type SoundContextValue = { muted: boolean; toggleMuted: () => void; anonymous: boolean; toggleAnonymous: () => void };
const SoundContext = createContext<SoundContextValue | null>(null);

export function useSound() {
	const value = useContext(SoundContext);
	if (!value) throw new Error("useSound must be used inside SiteControlsProvider");
	return value;
}

export function SiteControlsProvider({ children }: { children: React.ReactNode }) {
	const [muted, setMuted] = useState(false);
	const [anonymous, setAnonymous] = useState(true);
	useEffect(() => {
		try {
			const saved = localStorage.getItem("wc-anonymous-taps");
			setAnonymous(saved === null || saved === "true");
		} catch { /* Optional preference. */ }
	}, []);
	function toggleAnonymous() {
		setAnonymous((value) => {
			const next = !value;
			try { localStorage.setItem("wc-anonymous-taps", String(next)); } catch { /* Preference still applies this session. */ }
			return next;
		});
	}
	return <SoundContext.Provider value={{ muted, toggleMuted: () => setMuted((value) => !value), anonymous, toggleAnonymous }}>{children}</SoundContext.Provider>;
}

export function SiteControls() {
	const pathname = usePathname();
	const { muted, toggleMuted, anonymous, toggleAnonymous } = useSound();
	const [dark, setDark] = useState(false);

	useEffect(() => {
		let saved: string | null = null;
		try { saved = localStorage.getItem("wc-theme"); } catch { /* System theme works without storage. */ }
		const isDark = saved === "dark";
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
			<button type="button" className={styles.sound} onClick={toggleAnonymous} title={anonymous ? "Anonymous taps: city names are blurred in activity toasts" : "Show city names in activity toasts"} aria-label={anonymous ? "Show cities in tap toasts" : "Hide cities in tap toasts"} aria-pressed={anonymous}>
				<Icon icon={anonymous ? "lucide:eye-off" : "lucide:eye"} aria-hidden="true" />
			</button>
			<button type="button" className={styles.sound} onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
				<Icon icon={dark ? "lucide:sun" : "lucide:moon"} aria-hidden="true" />
			</button>
		</div>
	</header>;
}
