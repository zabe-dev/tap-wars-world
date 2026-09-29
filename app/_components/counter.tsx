"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./counter.module.css";
import { countryCode, countryName, flag, getTopCountries, toCounts } from "./countries";
import { HeaderControls } from "./header-controls";
import { Ranking } from "./ranking";
import { getVisitorLocation } from "./visitor-location";
import { LoadingDots } from "./loading-dots";
import { CountryMission } from "./country-mission";
import Link from "next/link";

type Place = [city: string, country: string];
type Toast = { id: number; place: Place; mine: boolean; dx: number; dy: number };
type RankingEntry = { country: string; count: number };
type AddedTaps = { country: string; amount: number } | null;
type Settlement = { country: string; total: number; consumed: number } | null;
type TapEvent = { id: number; country: string } | null;
const initialCounts: Record<string, number> = {};

function totalFor(ranking: RankingEntry[]) {
	return ranking.reduce((sum, entry) => sum + entry.count, 0);
}

export function Counter() {
	const [total, setTotal] = useState(0);
	const [counts, setCounts] = useState(initialCounts);
	const [toasts, setToasts] = useState<Toast[]>([]);
	const [muted, setMuted] = useState(false);
	const [tapError, setTapError] = useState<string | null>(null);
	const [highlightCountry, setHighlightCountry] = useState<string | null>(null);
	const [visitorCountry, setVisitorCountry] = useState<string | null>(null);
	const [tapEvent, setTapEvent] = useState<TapEvent>(null);
	const [battleActive, setBattleActive] = useState(false);
	const [battleParticipants, setBattleParticipants] = useState<[string, string] | null>(null);
	const [pendingRanking, setPendingRanking] = useState<RankingEntry[] | null>(null);
	const [pendingTotal, setPendingTotal] = useState(0);
	const [addedTaps, setAddedTaps] = useState<AddedTaps>(null);
	const [settlement, setSettlement] = useState<Settlement>(null);
	const [settlementOrder, setSettlementOrder] = useState<string[] | null>(null);
	const pendingRankingRef = useRef<RankingEntry[] | null>(null);
	const pendingTotalRef = useRef(0);
	const [rankingLoading, setRankingLoading] = useState(true);
	const [rings, setRings] = useState<number[]>([]);
	const audio = useRef<AudioContext | null>(null);
	const sorted = useMemo(() => Object.entries(counts).sort((a, b) => b[1] - a[1]), [counts]);

	useEffect(() => {
		void getVisitorLocation().then((location) => setVisitorCountry(countryCode(location.country)));
		const previewDelay = new URLSearchParams(window.location.search).get("loading") === "1" ? 2000 : 0;
		const timer = window.setTimeout(() => fetch("/api/ranking")
			.then((response) => response.json())
			.then((data: { ranking: RankingEntry[] }) => {
				setCounts(toCounts(data.ranking));
				setTotal(totalFor(data.ranking));
			})
			.catch(() => undefined)
			.finally(() => setRankingLoading(false)), previewDelay);
		return () => window.clearTimeout(timer);
	}, []);

	function showToast(place: Place, mine: boolean) {
		const id = Date.now() + Math.random();
		setToasts((value) => [
			...value.slice(-3),
			{ id, place, mine, dx: (Math.random() - 0.5) * 110, dy: -(65 + Math.random() * 45) },
		]);
		setTimeout(() => setToasts((value) => value.filter((toast) => toast.id !== id)), 2300);
	}

	async function tap() {
		setTapError(null);
		if (!muted) beep();
		const ringId = Date.now() + Math.random();
		setRings((value) => [...value, ringId]);
		setTimeout(() => setRings((value) => value.filter((id) => id !== ringId)), 800);
		try {
			const location = await getVisitorLocation();
			setVisitorCountry(countryCode(location.country));
			const response = await fetch("/api/tap", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(location.ip ? { ip: location.ip } : {}),
			});
			if (!response.ok) throw new Error("Tap failed");
			const data: { city: string; country: string; ranking: RankingEntry[]; accepted: boolean; retryAfter: number } =
				await response.json();
			if (!data.accepted) {
				setTapError(`Too many taps in a short period. Try again in ${data.retryAfter}s.`);
				return;
			}
			const nextCounts = toCounts(data.ranking);
			const country = countryCode(data.country);
			if (battleActive) {
				setPendingRanking(data.ranking);
				pendingRankingRef.current = data.ranking;
				setPendingTotal(totalFor(data.ranking));
				pendingTotalRef.current = totalFor(data.ranking);
				const visibleRanking = data.ranking.map((entry) => {
					const code = countryCode(entry.country);
					if (!battleParticipants?.includes(code)) return entry;
					return { ...entry, count: counts[code] ?? entry.count };
				});
				setCounts(toCounts(visibleRanking));
				setTotal(totalFor(visibleRanking));
			} else {
				setCounts(nextCounts);
				setTotal(totalFor(data.ranking));
			}
			setHighlightCountry(country);
			setTapEvent({ id: Date.now() + Math.random(), country });
			window.setTimeout(() => setHighlightCountry(null), 700);
			showToast([data.city, country], true);
		} catch {
			setTapError("Tap could not be saved. Please try again.");
		}
	}
	function beep() {
		try {
			audio.current ??= new AudioContext();
			const context = audio.current;
			const oscillator = context.createOscillator();
			const gain = context.createGain();
			oscillator.frequency.value = 620;
			gain.gain.setValueAtTime(0.08, context.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
			oscillator.connect(gain).connect(context.destination);
			oscillator.start();
			oscillator.stop(context.currentTime + 0.17);
		} catch {
			/* Audio is optional. */
		}
	}

	return (
		<main className={styles.page}>
			<HeaderControls muted={muted} onToggleSound={() => setMuted((value) => !value)} />
			<div className={styles.content}>
				<section className={styles.hero}>
					<div className={styles.count} aria-live="polite" aria-busy={rankingLoading}>
						{rankingLoading ? <LoadingDots label="Loading total taps" /> : <span title={total.toLocaleString("en-US")}>{total.toLocaleString("en-US")}</span>}
					</div>
					<p>taps from around the world</p>
				</section>
				<div className={styles.stage}>
					{rings.map((id) => (
						<span key={id} className={styles.ring} />
					))}
					{toasts.map((toast) => (
						<Toast key={toast.id} toast={toast} />
					))}
					<button
						className={styles.button}
						onClick={tap}
						aria-label="Add your tap to the world counter"
					>
						TAP
					</button>
				</div>
				<p className={`${styles.error} ${tapError ? styles.errorVisible : ""}`} role="alert" aria-live="polite">
					{tapError ?? " "}
				</p>
				{!rankingLoading && <CountryMission ranking={sorted} visitorCountry={visitorCountry} tapEvent={tapEvent} onBattleStart={(participants, frozen) => {
					setBattleActive(true); setBattleParticipants(participants);
					const visibleRanking = sorted.map((entry) => { const code = countryCode(entry[0]); return participants.includes(code) ? [entry[0], frozen[code] ?? entry[1]] as [string, number] : entry; });
					const visibleEntries = visibleRanking.map(([country, count]) => ({ country, count }));
					setCounts(toCounts(visibleEntries)); setTotal(totalFor(visibleEntries));
				}} onBattleComplete={async () => {
					if (!pendingRanking || !battleParticipants) {
						setBattleActive(false); setBattleParticipants(null);
						return;
					}
					const settlementRanking = pendingRankingRef.current ?? pendingRanking;
					if (!settlementRanking) return;
					const finalCounts = toCounts(settlementRanking);
					const added = battleParticipants
						.map((country) => ({ country, amount: Math.max(0, (finalCounts[country] ?? 0) - (counts[country] ?? 0)) }))
						.filter((entry) => entry.amount > 0)
						.sort((a, b) => b.amount - a.amount)[0] ?? null;
					const finalOrder = getTopCountries(Object.entries(finalCounts).sort((a, b) => b[1] - a[1])).map(([country]) => country);
					setSettlementOrder(finalOrder);
					await new Promise((resolve) => window.setTimeout(resolve, 600));
					if (added) {
						setAddedTaps(added);
						setSettlement({ country: added.country, total: added.amount, consumed: 0 });
						const stepDelay = process.env.NODE_ENV === "development" ? 100 : 45;
						for (let consumed = 1; consumed <= added.amount; consumed += 1) {
							await new Promise((resolve) => window.setTimeout(resolve, stepDelay));
							setSettlement({ country: added.country, total: added.amount, consumed });
						}
					}
					const latestRanking = pendingRankingRef.current ?? settlementRanking;
					setCounts(toCounts(latestRanking));
					setTotal(pendingTotalRef.current || pendingTotal);
					setAddedTaps(null);
					setSettlement(null);
					setSettlementOrder(null);
					setPendingRanking(null);
					pendingRankingRef.current = null;
					pendingTotalRef.current = 0;
					setBattleActive(false);
					setBattleParticipants(null);
				}} />}
				<Ranking ranking={sorted} loading={rankingLoading} highlightedCountry={battleActive ? null : highlightCountry} addedTaps={addedTaps} settlement={settlement} order={settlementOrder} />
				<footer className={styles.footer}><span>© 2026 Tap King World</span><nav><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav></footer>
			</div>
		</main>
	);
}

function Toast({ toast }: { toast: Toast }) {
	return (
		<div
			className={`${styles.toast} ${toast.mine ? styles.mine : ""}`}
			style={{ "--dx": `${toast.dx}px`, "--dy": `${toast.dy}px` } as React.CSSProperties}
		>
			<b>+1</b>
			<span className={styles.toastFlag}>{flag(toast.place[1])}</span>
			<span>
				{toast.mine ? "You · " : ""}
				{toast.place[0]}{" "}
				<em>{toast.place[1] === "WW" ? "" : countryName(toast.place[1])}</em>
			</span>
		</div>
	);
}
