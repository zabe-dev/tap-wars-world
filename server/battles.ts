import { eq, sql } from "drizzle-orm";
import { activeBattles } from "./db/schema";
import { db } from "./db";

export const BATTLE_THRESHOLD = 10;
export const BATTLE_SWING = 250;
export type BattleState = { scope: string; left: string; right: string; scores: Record<string, number>; frozen: Record<string, number>; completed?: boolean };
type BattleEntry = { country: string; count: number };

function toState(row: typeof activeBattles.$inferSelect): BattleState {
	return {
		scope: row.scope,
		left: row.leftCountry,
		right: row.rightCountry,
		scores: { [row.leftCountry]: row.leftScore, [row.rightCountry]: row.rightScore },
		frozen: { [row.leftCountry]: row.leftFrozen, [row.rightCountry]: row.rightFrozen },
	};
}

function candidate(ranking: BattleEntry[]) {
	return ranking.filter((entry) => entry.country !== "Worldwide").slice(0, 11)
		.map((entry, index, entries) => ({ left: entry, right: entries[index + 1] }))
		.filter((pair) => pair.right && pair.left.count - pair.right.count <= BATTLE_THRESHOLD)
		.sort((a, b) => (a.left.count - a.right.count) - (b.left.count - b.right.count))[0];
}

export async function getActiveBattle(ranking: BattleEntry[], scope = "WW"): Promise<BattleState | null> {
	if (!db) return null;
	try {
		const existing = await db.select().from(activeBattles).where(eq(activeBattles.scope, scope)).limit(1);
		if (existing[0]) return toState(existing[0]);
		const pair = candidate(ranking);
		if (!pair) return null;
		const inserted = await db.insert(activeBattles).values({ scope, leftCountry: pair.left.country, rightCountry: pair.right.country, leftFrozen: pair.left.count, rightFrozen: pair.right.count }).onConflictDoNothing({ target: activeBattles.scope }).returning();
		return inserted[0] ? toState(inserted[0]) : getActiveBattle(ranking, scope);
	} catch {
		return null;
	}
}

export async function recordBattleTap(scope: string, participant: string, ranking: BattleEntry[], points = 1) {
	if (!db) return null;
	try {
		const battle = await getActiveBattle(ranking, scope);
		if (!battle || ![battle.left, battle.right].includes(participant)) return battle;
		const column = participant === battle.left ? activeBattles.leftScore : activeBattles.rightScore;
		await db.update(activeBattles).set({ [participant === battle.left ? "leftScore" : "rightScore"]: sql`${column} + ${points}`, updatedAt: new Date() }).where(eq(activeBattles.scope, scope));
		const current = await db.select().from(activeBattles).where(eq(activeBattles.scope, scope)).limit(1);
		if (!current[0]) return null;
		const next = toState(current[0]);
		if (Math.abs(next.scores[battle.left] - next.scores[battle.right]) >= BATTLE_SWING) {
			next.completed = true;
			await db.delete(activeBattles).where(eq(activeBattles.scope, scope));
		}
		return next;
	} catch {
		return null;
	}
}
