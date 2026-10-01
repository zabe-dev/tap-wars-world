import { bigint, jsonb, pgTable, primaryKey, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const countryCounts = pgTable("country_counts", {
	country: text("country").primaryKey(),
	tapCount: bigint("tap_count", { mode: "number" }).notNull().default(0),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const regionalCounts = pgTable("regional_counts", {
	countryCode: text("country_code").notNull(),
	region: text("region").notNull(),
	tapCount: bigint("tap_count", { mode: "number" }).notNull().default(0),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({ primaryKey: primaryKey({ columns: [table.countryCode, table.region] }) }));

export const milestones = pgTable("milestones", {
	id: serial("id").primaryKey(),
	tapTotal: bigint("tap_total", { mode: "number" }).notNull().unique(),
	topTen: jsonb("top_ten").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activeBattles = pgTable("active_battles", {
	id: serial("id").primaryKey(),
	scope: text("scope").notNull().default("WW"),
	leftCountry: text("left_country").notNull(),
	rightCountry: text("right_country").notNull(),
	leftFrozen: bigint("left_frozen", { mode: "number" }).notNull(),
	rightFrozen: bigint("right_frozen", { mode: "number" }).notNull(),
	leftScore: bigint("left_score", { mode: "number" }).notNull().default(0),
	rightScore: bigint("right_score", { mode: "number" }).notNull().default(0),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({ scopeIndex: uniqueIndex("active_battles_scope_idx").on(table.scope) }));
