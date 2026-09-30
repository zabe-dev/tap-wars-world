import { bigint, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const countryCounts = pgTable("country_counts", {
	country: text("country").primaryKey(),
	tapCount: bigint("tap_count", { mode: "number" }).notNull().default(0),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const milestones = pgTable("milestones", {
	id: serial("id").primaryKey(),
	tapTotal: bigint("tap_total", { mode: "number" }).notNull().unique(),
	topTen: jsonb("top_ten").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
