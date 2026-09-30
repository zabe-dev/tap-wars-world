"use client";

import { useEffect, useState } from "react";
import { countryCode, countryName, flag } from "../_components/countries";
import styles from "./milestones.module.css";

type Milestone = { tapTotal: number; reachedAt: string; topTen: { country: string; count: number }[]; achieved?: boolean };

export function MilestoneList({ milestones }: { milestones: Milestone[] }) {
	const [selected, setSelected] = useState<Milestone | null>(null);
	useEffect(() => {
		if (!selected) return;
		const close = (event: KeyboardEvent) => event.key === "Escape" && setSelected(null);
		window.addEventListener("keydown", close);
		return () => window.removeEventListener("keydown", close);
	}, [selected]);
	return <>
		<div className={styles.list}>{milestones.map((milestone) => { const achieved = milestone.achieved !== false; return <button className={`${styles.milestone} ${achieved ? styles.achieved : styles.locked}`} key={milestone.tapTotal} onClick={() => achieved && setSelected(milestone)} type="button" disabled={!achieved} aria-label={achieved ? `View top 10 at ${milestone.tapTotal.toLocaleString("en-US")} taps` : `${milestone.tapTotal.toLocaleString("en-US")} tap milestone unavailable`}>
			<span className={styles.milestoneTotal}><strong>{milestone.tapTotal.toLocaleString("en-US")}</strong><span>total taps</span></span>
			<span className={styles.view}>View top 10 <span aria-hidden="true">↗</span></span>
		</button>; })}</div>
		{selected && <div className={styles.overlay} role="presentation" onClick={() => setSelected(null)}>
			<section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="milestone-title" onClick={(event) => event.stopPropagation()}>
				<button className={styles.close} type="button" onClick={() => setSelected(null)} aria-label="Close milestone">×</button>
				<h2 id="milestone-title">{selected.tapTotal.toLocaleString("en-US")} taps</h2>
				<p>Top 10 countries</p>
				<ol>{selected.topTen.map((entry, index) => { const code = countryCode(entry.country); return <li key={entry.country}><span className={styles.rank}>{index + 1}</span><span className={styles.flag}>{flag(code)}</span><span className={styles.name}>{countryName(code)}</span><strong>{entry.count.toLocaleString("en-US")}</strong></li>; })}</ol>
			</section>
		</div>}
	</>;
}
