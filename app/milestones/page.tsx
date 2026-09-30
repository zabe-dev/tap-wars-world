import Link from "next/link";
import { listMilestones } from "@/server/milestones";
import { countryCode, countryName, flag, formatCount } from "../_components/countries";
import styles from "./milestones.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Milestones · tapwars.world" };

export default async function MilestonesPage() {
	const milestones = await listMilestones();
	return <main className={styles.page}><article className={styles.content}>
		<Link className={styles.back} href="/">← Back to tapwars.world</Link>
		<h1>Milestones</h1>
		<p className={styles.intro}>The top 10 captured when the world reached each milestone.</p>
		{milestones.length === 0 ? <p className={styles.empty}>The first milestone will appear as taps are added.</p> : <div className={styles.list}>
			{milestones.map((milestone) => <section className={styles.milestone} key={milestone.tapTotal}>
				<h2>{milestone.tapTotal.toLocaleString("en-US")} taps</h2>
				<ol>{milestone.topTen.map((entry, index) => <li key={entry.country}><span className={styles.rank}>{index + 1}</span><span className={styles.flag}>{flag(countryCode(entry.country))}</span><span className={styles.name}>{countryName(countryCode(entry.country))}</span><strong>{formatCount(entry.count)}</strong></li>)}</ol>
			</section>)}
		</div>}
	</article></main>;
}
