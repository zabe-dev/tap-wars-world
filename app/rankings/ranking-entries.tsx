"use client";

import { useEffect, useState } from "react";
import { countryCode, countryName, flag } from "../_components/countries";
import { LoadingDots } from "../_components/loading-dots";
import styles from "./rankings.module.css";

type Entry = { country: string; count: number };

function visibleEntries(entries: Entry[]) {
	return entries.filter((entry) => entry.country !== "Worldwide" && entry.country !== "WW");
}

export function RankingEntries({ initialEntries, initialRanking, offset }: { initialEntries: Entry[]; initialRanking: Entry[]; offset: number }) {
	const [ranking, setRanking] = useState<Entry[] | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let active = true;
		const refresh = async () => {
			try {
				const response = await fetch("/api/ranking", { cache: "no-store" });
				if (!response.ok) return;
				const data = await response.json() as { ranking: Entry[] };
				if (active) setRanking(visibleEntries(data.ranking));
			} catch {
				setFailed(true);
			}
		};
		void refresh();
		const events = new EventSource("/api/activity/stream");
		events.addEventListener("tap", () => void refresh());
		return () => { active = false; events.close(); };
	}, []);

	if (!ranking && !failed) return <div className={styles.loading} aria-busy="true"><LoadingDots label="Loading rankings" /></div>;
	const entries = (ranking ?? initialRanking).slice(offset, offset + 25);
	const entriesToRender = entries.length > 0 ? entries : initialEntries;
	return <ol className={styles.list} start={offset + 1}>
		{entriesToRender.map((entry, index) => { const code = countryCode(entry.country); return <li key={entry.country}><span className={styles.rank}>{offset + index + 1}</span><span className={styles.flag}>{flag(code)}</span><span className={styles.name}>{countryName(code)}</span><strong>{entry.count.toLocaleString("en-US")}</strong></li>; })}
	</ol>;
}
