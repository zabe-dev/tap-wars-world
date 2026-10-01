import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { activeBattles, countryCounts, milestones, regionalCounts } from "./schema";

const connectionString = process.env.DATABASE_URL;
export const client = connectionString ? postgres(connectionString, {
	max: 10,
	connect_timeout: process.env.NODE_ENV === "test" ? 1 : 10,
	idle_timeout: 20,
	max_lifetime: 60 * 30,
	keep_alive: 60,
}) : null;

export const db = client ? drizzle({ client, schema: { activeBattles, countryCounts, milestones, regionalCounts } }) : null;
