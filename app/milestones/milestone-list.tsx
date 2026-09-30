"use client";

import { useEffect, useState } from "react";
import { countryCode, countryName, flag, formatCount } from "../_components/countries";
import styles from "./milestones.module.css";

type Milestone = { tapTotal: number; topTen: { country: string; count: number }[] };

export function MilestoneList({ milestones }: { milestones: Milestone[] }) {
	const [selected, setSelected] = useState<Milestone | null>(null);
	useEffect(() => {
		if (!selected) return;
		const close = (event: KeyboardEvent) => event.key === "Escape" && setSelected(null);
		window.addEventListener("keydown", close);
		return () => window.removeEventListener("keydown", close);
	}, [selected]);
	return <>
		<div className={styles.list}>{milestones.map((milestone) => <button className={styles.milestone} key={milestone.tapTotal} onClick={() => setSelected(milestone)} type="button">
			<strong>{milestone.tapTotal.toLocaleString("en-US")}</strong><span>taps</span><span className={styles.view}>View top 10 →</span>
		</button>)}</div>
		{selected && <div className={styles.overlay} role="presentation" onClick={() => setSelected(null)}>
			<section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="milestone-title" onClick={(event) => event.stopPropagation()}>
				<button className={styles.close} type="button" onClick={() => setSelected(null)} aria-label="Close milestone">×</button>
				<h2 id="milestone-title">{selected.tapTotal.toLocaleString("en-US")} taps</h2>
				<p>Top 10 at this milestone</p>
				<ol>{selected.topTen.map((entry, index) => { const code = countryCode(entry.country); return <li key={entry.country}><span className={styles.rank}>{index + 1}</span><span className={styles.flag}>{flag(code)}</span><span className={styles.name}>{countryName(code)}</span><strong>{formatCount(entry.count)}</strong></li>; })}</ol>
			</section>
		</div>}
	</>;
}
