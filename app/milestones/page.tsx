import { getMilestoneTargets, listMilestones } from "@/server/milestones";
import { MilestoneList } from "./milestone-list";
import styles from "./milestones.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Milestones", description: "See the countries that led the world at each Tap Wars World milestone.", alternates: { canonical: "/milestones" } };

export default async function MilestonesPage() {
	const milestones = await listMilestones();
	const targets = getMilestoneTargets();
	const recorded = milestones;
	const displayMilestones = targets.map((tapTotal) => {
		return recorded.find((milestone) => milestone.tapTotal === tapTotal) ?? { tapTotal, topTen: [], reachedAt: "", achieved: false };
	});
	return <main className={styles.page}><div className={styles.shell}><article className={styles.content}>
		<h1>Milestones</h1>
		<p className={styles.intro}>See which countries led the world at each milestone.</p>
		<MilestoneList milestones={displayMilestones} />
	</article></div></main>;
}
