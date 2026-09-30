import Link from "next/link";
import { listMilestones } from "@/server/milestones";
import { MilestoneList } from "./milestone-list";
import styles from "./milestones.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Milestones · tapwars.world" };

const developmentSample = {
	tapTotal: 1_060,
	topTen: [
		{ country: "JP", count: 110 }, { country: "US", count: 109 }, { country: "BR", count: 108 },
		{ country: "AU", count: 107 }, { country: "DE", count: 106 }, { country: "CA", count: 105 },
		{ country: "SG", count: 104 }, { country: "PH", count: 103 }, { country: "KR", count: 102 }, { country: "IN", count: 101 },
	],
};

export default async function MilestonesPage() {
	const milestones = await listMilestones();
	const displayMilestones = milestones.length > 0 ? milestones : process.env.NODE_ENV === "development" ? [developmentSample] : [];
	return <main className={styles.page}><article className={styles.content}>
		<Link className={styles.back} href="/">← Back to tapwars.world</Link>
		<h1>Milestones</h1>
		<p className={styles.intro}>The top 10 captured when the world reached each milestone.</p>
		{displayMilestones.length === 0 ? <p className={styles.empty}>The first milestone will appear as taps are added.</p> : <MilestoneList milestones={displayMilestones} />}
	</article></main>;
}
