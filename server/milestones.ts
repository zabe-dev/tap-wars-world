import { db } from "./db";
import { milestones } from "./db/schema";
import type { RankingEntry } from "./counter-store";

const MILESTONE_INTERVAL = process.env.NODE_ENV === "development" ? 10 : 100;
const recordedMilestones = new Set<number>();

export type MilestoneSnapshot = {
	tapTotal: number;
	topTen: RankingEntry[];
};

function snapshotFor(ranking: RankingEntry[]): MilestoneSnapshot | null {
	const total = ranking.reduce((sum, entry) => sum + entry.count, 0);
	const tapTotal = Math.floor(total / MILESTONE_INTERVAL) * MILESTONE_INTERVAL;
	if (tapTotal <= 0) return null;
	return { tapTotal, topTen: ranking.slice(0, 10) };
}

/** Record a newly reached interval once and return it for the client celebration. */
export async function recordMilestone(ranking: RankingEntry[]): Promise<MilestoneSnapshot | null> {
	const snapshot = snapshotFor(ranking);
	if (!snapshot) return null;
	if (!db) {
		if (recordedMilestones.has(snapshot.tapTotal)) return null;
		recordedMilestones.add(snapshot.tapTotal);
		return snapshot;
	}
	try {
		const inserted = await db.insert(milestones).values(snapshot)
			.onConflictDoNothing()
			.returning({ tapTotal: milestones.tapTotal });
		return inserted.length > 0 ? snapshot : null;
	} catch (error) {
		console.error("Milestone record failed; using in-memory milestone state.", error);
		if (recordedMilestones.has(snapshot.tapTotal)) return null;
		recordedMilestones.add(snapshot.tapTotal);
		return snapshot;
	}
}
