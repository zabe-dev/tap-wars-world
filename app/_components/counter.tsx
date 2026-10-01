"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { countryCapital } from "../../country-capitals";
import styles from "./counter.module.css";
import { countryCode, flag, toCounts } from "./countries";
import { useSound } from "./site-controls";
import { Ranking } from "./ranking";
import { getVisitorLocation } from "./visitor-location";
import { LoadingDots } from "./loading-dots";
import { CountryMission } from "./country-mission";
import { MilestoneConfetti } from "./milestone-confetti";
import { MILESTONE_TARGETS } from "./milestone-targets";
import { LocationStatus } from "./location-status";
import type { DeviceLocation } from "./device-location";
import { TurnstileWidget, type TurnstileHandle } from "./turnstile-widget";

type Place = [city: string, country: string];
type Toast = { id: number; place: Place; mine: boolean; anonymous: boolean; dx: number; dy: number };
type RankingEntry = { country: string; count: number };
type RegionalEntry = { region: string; count: number };
type Milestone = { tapTotal: number; topTen: RankingEntry[] };
type SharedBattle = { left: string; right: string; scores: Record<string, number>; frozen: Record<string, number>; completed?: boolean } | null;
const initialCounts: Record<string, number> = {};
const requiresTapVerification = process.env.NODE_ENV === "production";

function totalFor(ranking: RankingEntry[]) {
	return ranking.reduce((sum, entry) => sum + entry.count, 0);
}

function nextMilestone(total: number) {
	return MILESTONE_TARGETS.find((target) => target > total) ?? MILESTONE_TARGETS[MILESTONE_TARGETS.length - 1];
}


export function Counter({ scope }: { scope?: string } = {}) {
	const [total, setTotal] = useState(0);
	const [counts, setCounts] = useState(initialCounts);
	const [toasts, setToasts] = useState<Toast[]>([]);
	const { muted, anonymous } = useSound();
	const [tapError, setTapError] = useState<string | null>(null);
	const [highlightCountry, setHighlightCountry] = useState<string | null>(null);
	const [visitorCountry, setVisitorCountry] = useState<string | null>(null);
	const [deviceLocation, setDeviceLocation] = useState<DeviceLocation | null>(null);
	const [consentDecided, setConsentDecided] = useState(false);
	const [consentRequest, setConsentRequest] = useState(0);
	const [tapToken, setTapToken] = useState<string | null>(null);
	const [tapSessionReady, setTapSessionReady] = useState(false);
	const turnstile = useRef<TurnstileHandle>(null);
	const verifiedSession = useRef(false);
	const verificationAttempt = useRef<Promise<void> | null>(null);
	const [sharedBattle, setSharedBattle] = useState<SharedBattle>(null);
	const [milestone, setMilestone] = useState<Milestone | null>(null);
	const [rankingLoading, setRankingLoading] = useState(true);
	const [rings, setRings] = useState<number[]>([]);
	const [buttonPressed, setButtonPressed] = useState(false);
	const markConsentDecided = useCallback(() => setConsentDecided(true), []);
	const audio = useRef<AudioContext | null>(null);
	const soundStep = useRef(0);
	const clientId = useRef(Math.random().toString(36).slice(2));
	const sorted = useMemo(() => Object.entries(counts).sort((a, b) => b[1] - a[1]), [counts]);

	useEffect(() => {
		void getVisitorLocation().then((location) => {
			const code = countryCode(location.country);
			setVisitorCountry(code);
		});
		void fetch(scope ? `/api/regional/${scope}` : "/api/ranking")
			.then((response) => response.json())
			.then((data: { ranking: (RankingEntry | RegionalEntry)[]; tapToken?: string }) => {
				if (data.tapToken) setTapToken(data.tapToken);
				setCounts(scope ? Object.fromEntries((data.ranking as RegionalEntry[]).map((entry) => [entry.region, entry.count])) : toCounts(data.ranking as RankingEntry[]));
				setTotal(totalFor(data.ranking as RankingEntry[]));
			})
			.catch(() => undefined)
			.finally(() => setRankingLoading(false));
		void fetch("/api/battle", { cache: "no-store" }).then((response) => response.json()).then((data: { battle: SharedBattle }) => setSharedBattle(data.battle)).catch(() => undefined);
	}, [scope]);

	useEffect(() => {
		const events = new EventSource("/api/activity/stream");
		events.addEventListener("battle", (event) => {
			try {
				setSharedBattle(JSON.parse((event as MessageEvent<string>).data) as SharedBattle);
			} catch {
				/* Ignore malformed battle events. */
			}
		});
		events.addEventListener("tap", (event) => {
			try {
				const activity = JSON.parse((event as MessageEvent<string>).data) as { city?: string; country?: string; anonymous?: boolean; clientId?: string; battle?: SharedBattle };
				if (activity.battle !== undefined) setSharedBattle(activity.battle);
				if (!activity.country || activity.clientId === clientId.current) return;
				const code = countryCode(activity.country);
				showToast([activity.city?.trim() || countryCapital(code) || "Another location", code], false, activity.anonymous === true);
				setHighlightCountry(code);
				window.setTimeout(() => setHighlightCountry((current) => current === code ? null : current), 700);
				setCounts((current) => ({ ...current, [code]: (current[code] ?? 0) + 1 }));
				setTotal((current) => current + 1);
				void fetch("/api/ranking", { cache: "no-store" }).then((response) => response.json()).then((data: { ranking: RankingEntry[] }) => {
					setCounts(toCounts(data.ranking));
					setTotal(totalFor(data.ranking));
				}).catch(() => undefined);
			} catch {
				/* Ignore malformed activity events. */
			}
		});
		return () => events.close();
	}, []);

	function showToast(place: Place, mine: boolean, isAnonymous = anonymous) {
		const id = Date.now() + Math.random();
		const mobile = window.innerWidth <= 600;
		const horizontalSpread = mobile ? 170 : 300;
		const verticalStart = mobile ? 75 : 110;
		const verticalSpread = mobile ? 75 : 110;
		setToasts((value) => [
			...value.slice(-3),
			{ id, place, mine, anonymous: isAnonymous, dx: (Math.random() - 0.5) * horizontalSpread, dy: -(verticalStart + Math.random() * verticalSpread) },
		]);
		setTimeout(() => setToasts((value) => value.filter((toast) => toast.id !== id)), 2300);
	}

	const verifyTapSession = useCallback(async () => {
		if (verifiedSession.current) return;
		if (verificationAttempt.current) return verificationAttempt.current;
		const attempt = (async () => {
		if (!tapToken) throw new Error("Tap session is still loading. Please try again.");
		const token = await turnstile.current?.getToken();
		if (!token) throw new Error("Bot verification is still loading.");
		const response = await fetch("/api/tap-verification", {
			method: "POST",
			headers: { "Content-Type": "application/json", "x-tap-token": tapToken },
			body: JSON.stringify({ turnstileToken: token }),
		});
		turnstile.current?.reset();
		if (!response.ok) throw new Error("Bot verification failed. Please try again.");
		verifiedSession.current = true;
		})();
		verificationAttempt.current = attempt;
		try {
			await attempt;
		} finally {
			verificationAttempt.current = null;
		}
	}, [tapToken]);

	useEffect(() => {
		if (!tapToken || verifiedSession.current) return;
		let cancelled = false;
		const warmSession = async () => {
			try {
				await verifyTapSession();
				if (!cancelled) setTapSessionReady(true);
			} catch {
				if (!cancelled) window.setTimeout(() => { void warmSession(); }, 500);
			}
		};
		void warmSession();
		return () => { cancelled = true; };
	}, [tapToken, verifyTapSession]);

	async function tap() {
		if (!consentDecided) {
			setConsentRequest((request) => request + 1);
			return;
		}
		if (rankingLoading || !tapToken || (requiresTapVerification && !tapSessionReady)) return;
		setTapError(null);
		if (!muted) beep();
		const ringId = Date.now() + Math.random();
		setRings((value) => [...value, ringId]);
		setTimeout(() => setRings((value) => value.filter((id) => id !== ringId)), 800);
		try {
			await verifyTapSession();
			const location = await getVisitorLocation();
			const displayLocation = deviceLocation ?? location;
			setVisitorCountry(countryCode(displayLocation.country));
			if (!tapToken) {
				setTapError("Tap session is still loading. Please try again.");
				return;
			}
			const nonceResponse = await fetch("/api/tap-nonce", { headers: { "x-tap-token": tapToken }, cache: "no-store" });
			if (!nonceResponse.ok) throw new Error("Tap session is invalid");
			const { nonce } = await nonceResponse.json() as { nonce?: string };
			if (!nonce) throw new Error("Tap request could not be prepared");
			const response = await fetch("/api/tap", {
				method: "POST",
				headers: { "Content-Type": "application/json", "x-tap-token": tapToken, "x-client-id": clientId.current },
				body: JSON.stringify({
					tapNonce: nonce,
					...(location.ip ? { ip: location.ip } : {}),
					...(deviceLocation ? { deviceLocation } : {}),
					anonymous,
					...(scope ? { scope } : {}),
				}),
			});
			if (!response.ok) throw new Error("Tap failed");
			const data: { city: string; country: string; ranking: RankingEntry[]; regionalRanking?: RegionalEntry[]; accepted: boolean; retryAfter: number; milestone: Milestone | null; battle: SharedBattle } =
				await response.json();
			const nextCounts = scope ? Object.fromEntries((data.regionalRanking ?? []).map((entry) => [entry.region, entry.count])) : toCounts(data.ranking);
			const country = countryCode(data.country);
			const ownLocation = deviceLocation ?? { city: data.city, country: data.country };
			setVisitorCountry(countryCode(ownLocation.country));
			setSharedBattle(data.battle);
			if (data.milestone) {
				setMilestone(data.milestone);
				celebrate();
			}
			setCounts(nextCounts);
			setTotal(totalFor(data.ranking));
			setHighlightCountry(country);
			window.setTimeout(() => setHighlightCountry(null), 700);
			showToast([ownLocation.city, countryCode(ownLocation.country)], true);
		} catch {
			setTapError("Tap could not be saved. Please try again.");
		}
	}
	function beep() {
		try {
			audio.current ??= new AudioContext();
			const context = audio.current;
			const start = context.currentTime;
			const step = soundStep.current++;
			const roots = [440, 466.16, 493.88, 523.25, 554.37, 587.33, 622.25, 659.25];
			const intervals = [1.2, 1.22, 1.25, 1.27, 1.2, 1.24, 1.28, 1.23];
			const variation = step % roots.length;
			const base = roots[variation];
			[base, base * 1.25].forEach((frequency, index) => {
				const oscillator = context.createOscillator();
				const gain = context.createGain();
				const noteStart = start + index * 0.045;
				oscillator.type = "sine";
				oscillator.frequency.value = index === 0 ? frequency : base * intervals[variation];
				gain.gain.setValueAtTime(0.0001, noteStart);
				gain.gain.exponentialRampToValueAtTime(0.06, noteStart + 0.012);
				gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.13);
				oscillator.connect(gain).connect(context.destination);
				oscillator.start(noteStart);
				oscillator.stop(noteStart + 0.15);
			});
		} catch {
			/* Audio is optional. */
		}
	}

	function celebrate() {
		if (muted) return;
		try {
			audio.current ??= new AudioContext();
			const context = audio.current;
			[523, 659, 784, 1046].forEach((frequency, index) => {
				const oscillator = context.createOscillator();
				const gain = context.createGain();
				const start = context.currentTime + index * 0.09;
				oscillator.type = "triangle";
				oscillator.frequency.value = frequency;
				gain.gain.setValueAtTime(0.0001, start);
				gain.gain.exponentialRampToValueAtTime(0.09, start + 0.02);
				gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
				oscillator.connect(gain).connect(context.destination);
				oscillator.start(start);
				oscillator.stop(start + 0.24);
			});
		} catch {
			/* Audio is optional. */
		}
	}

	return (
		<main className={styles.page}>
			<div className={styles.content}>
				<section className={styles.hero}>
					<p className={styles.nextGoal}>Next goal: {nextMilestone(total).toLocaleString("en-US")} taps</p>
					<div className={styles.count} aria-live="polite" aria-busy={rankingLoading}>
						{rankingLoading ? <LoadingDots label="Loading total taps" /> : <span title={total.toLocaleString("en-US")}>{total.toLocaleString("en-US")}</span>}
					</div>
					<p>{scope ? "taps around the country" : "taps from around the world"}</p>
				</section>
				<div className={styles.stage}>
					{rings.map((id) => (
						<span key={id} className={styles.ring} />
					))}
					{toasts.map((toast) => (
						<Toast key={toast.id} toast={toast} />
					))}
					<button
						className={`${styles.button} ${buttonPressed ? styles.buttonPressed : ""}`}
						onClick={tap}
						disabled={rankingLoading || !tapToken || (requiresTapVerification && !tapSessionReady)}
						onPointerDown={() => setButtonPressed(true)}
						onPointerUp={(event) => { setButtonPressed(false); event.currentTarget.blur(); }}
						onPointerCancel={() => setButtonPressed(false)}
						onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") setButtonPressed(true); }}
						onKeyUp={() => setButtonPressed(false)}
						aria-label={`Add your tap to tapwars.world. ${Math.max(0, nextMilestone(total) - total).toLocaleString("en-US")} taps remaining to the next milestone.`}
					>
						<span className={styles.tapLabel}>TAP</span>
						{!buttonPressed && <Icon className={styles.tapGuide} icon="at-icons:tap" aria-hidden="true" />}
					</button>
				</div>
				<p className={`${styles.error} ${tapError ? styles.errorVisible : ""}`} role="alert" aria-live="polite">
					{tapError ?? " "}
				</p>
				{!rankingLoading && <CountryMission visitorCountry={visitorCountry} sharedBattle={sharedBattle} />}
					<Ranking ranking={sorted} loading={rankingLoading} highlightedCountry={highlightCountry} countryFlag={scope} />
			</div>
			{milestone && <MilestoneConfetti key={milestone.tapTotal} onComplete={() => setMilestone(null)} />}
			<LocationStatus consentRequest={consentRequest} onConsentDecision={markConsentDecided} onResolved={(place) => {
				setDeviceLocation(place);
				setVisitorCountry(countryCode(place.country));
			}} />
			<TurnstileWidget ref={turnstile} />
		</main>
	);
}

function Toast({ toast }: { toast: Toast }) {
	return (
		<div
			className={`${styles.toast} ${toast.mine ? styles.mine : ""}`}
			title="Approximate location from IP address"
			style={{ "--dx": `${toast.dx}px`, "--dy": `${toast.dy}px` } as React.CSSProperties}
		>
			<b>+1</b>
			<span className={styles.toastFlag}>{flag(toast.place[1])}</span>
			<span>
				{toast.mine ? "You · " : ""}
				<span className={toast.anonymous ? styles.blurredCity : undefined} aria-label={toast.anonymous ? "City hidden" : toast.place[0]}>{toast.place[0]}</span>{" "}
				<em>{toast.place[1] === "WW" ? "" : toast.place[1]}</em>
			</span>
		</div>
	);
}
