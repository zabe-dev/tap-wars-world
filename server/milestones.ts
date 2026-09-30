import { desc } from "drizzle-orm";
import { db } from "./db";
import { milestones } from "./db/schema";
import type { RankingEntry } from "./counter-store";

const PRODUCTION_TARGETS = [10_000, 100_000, 1_000_000, 5_000_000, 25_000_000, 100_000_000, 250_000_000, 500_000_000, 750_000_000, 999_999_999];
export const MILESTONE_TARGETS = PRODUCTION_TARGETS;
const recordedMilestones = new Set<number>();
const fallbackMilestones = new Map<number, MilestoneSnapshot>();

export type MilestoneSnapshot = {
	tapTotal: number;
	topTen: RankingEntry[];
	reachedAt: string;
};

export function getMilestoneTargets() {
	return MILESTONE_TARGETS;
}

function snapshotFor(ranking: RankingEntry[]): MilestoneSnapshot | null {
	const total = ranking.reduce((sum, entry) => sum + entry.count, 0);
	const tapTotal = MILESTONE_TARGETS.filter((target) => total >= target).at(-1) ?? 0;
	if (tapTotal <= 0) return null;
	return { tapTotal, topTen: ranking.slice(0, 10), reachedAt: new Date().toISOString() };
}

/** Record a newly reached interval once and return it for the client celebration. */
export async function recordMilestone(ranking: RankingEntry[]): Promise<MilestoneSnapshot | null> {
	const snapshot = snapshotFor(ranking);
	if (!snapshot) return null;
	if (!db) {
		if (recordedMilestones.has(snapshot.tapTotal)) return null;
		recordedMilestones.add(snapshot.tapTotal);
		fallbackMilestones.set(snapshot.tapTotal, snapshot);
		return snapshot;
	}
	try {
		const inserted = await db.insert(milestones).values({ tapTotal: snapshot.tapTotal, topTen: snapshot.topTen })
			.onConflictDoNothing()
			.returning({ tapTotal: milestones.tapTotal, createdAt: milestones.createdAt });
		return inserted.length > 0 ? { ...snapshot, reachedAt: inserted[0].createdAt.toISOString() } : null;
	} catch (error) {
		console.error("Milestone record failed; using in-memory milestone state.", error);
		if (recordedMilestones.has(snapshot.tapTotal)) return null;
		recordedMilestones.add(snapshot.tapTotal);
		fallbackMilestones.set(snapshot.tapTotal, snapshot);
		return snapshot;
	}
}

export async function listMilestones(): Promise<MilestoneSnapshot[]> {
	if (!db) return [...fallbackMilestones.values()].sort((a, b) => b.tapTotal - a.tapTotal);
	try {
		const rows = await db.select().from(milestones).orderBy(desc(milestones.tapTotal));
		return rows.map((row) => ({ tapTotal: row.tapTotal, topTen: row.topTen as RankingEntry[], reachedAt: row.createdAt.toISOString() }));
	} catch (error) {
		console.error("Milestone history read failed; using in-memory history.", error);
		return [...fallbackMilestones.values()].sort((a, b) => b.tapTotal - a.tapTotal);
	}
}
