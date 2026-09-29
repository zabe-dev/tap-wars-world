import { bigint, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const countryCounts = pgTable("country_counts", {
	country: text("country").primaryKey(),
	tapCount: bigint("tap_count", { mode: "number" }).notNull().default(0),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
