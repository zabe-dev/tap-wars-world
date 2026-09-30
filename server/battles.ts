import { and, eq, sql } from "drizzle-orm";
import { activeBattles } from "./db/schema";
import { db } from "./db";
import type { RankingEntry } from "./counter-store";

export const BATTLE_THRESHOLD = 10;
export const BATTLE_GOAL = 250;
export type BattleState = { left: string; right: string; scores: Record<string, number>; frozen: Record<string, number>; completed?: boolean };

function toState(row: typeof activeBattles.$inferSelect): BattleState {
	return {
		left: row.leftCountry,
		right: row.rightCountry,
		scores: { [row.leftCountry]: row.leftScore, [row.rightCountry]: row.rightScore },
		frozen: { [row.leftCountry]: row.leftFrozen, [row.rightCountry]: row.rightFrozen },
	};
}

function candidate(ranking: RankingEntry[]) {
	return ranking.filter((entry) => entry.country !== "Worldwide").slice(0, 11)
		.map((entry, index, entries) => ({ left: entry, right: entries[index + 1] }))
		.filter((pair) => pair.right && pair.left.count - pair.right.count <= BATTLE_THRESHOLD)
		.sort((a, b) => (a.left.count - a.right.count) - (b.left.count - b.right.count))[0];
}

export async function getActiveBattle(ranking: RankingEntry[]): Promise<BattleState | null> {
	if (!db) return null;
	try {
		const existing = await db.select().from(activeBattles).where(eq(activeBattles.id, 1)).limit(1);
		if (existing[0]) return toState(existing[0]);
		const pair = candidate(ranking);
		if (!pair) return null;
		const inserted = await db.insert(activeBattles).values({ id: 1, leftCountry: pair.left.country, rightCountry: pair.right.country, leftFrozen: pair.left.count, rightFrozen: pair.right.count }).onConflictDoNothing().returning();
		return inserted[0] ? toState(inserted[0]) : getActiveBattle(ranking);
	} catch {
		return null;
	}
}

export async function recordBattleTap(country: string, ranking: RankingEntry[]) {
	if (!db) return null;
	try {
		const battle = await getActiveBattle(ranking);
		if (!battle || ![battle.left, battle.right].includes(country)) return battle;
		const column = country === battle.left ? activeBattles.leftScore : activeBattles.rightScore;
		await db.update(activeBattles).set({ [country === battle.left ? "leftScore" : "rightScore"]: sql`${column} + 1`, updatedAt: new Date() }).where(and(eq(activeBattles.id, 1), sql`${column} < ${BATTLE_GOAL}`));
		const current = await db.select().from(activeBattles).where(eq(activeBattles.id, 1)).limit(1);
		if (!current[0]) return null;
		const next = toState(current[0]);
		if (next.scores[battle.left] >= BATTLE_GOAL || next.scores[battle.right] >= BATTLE_GOAL) {
			next.completed = true;
			await db.delete(activeBattles).where(eq(activeBattles.id, 1));
		}
		return next;
	} catch {
		return null;
	}
}
