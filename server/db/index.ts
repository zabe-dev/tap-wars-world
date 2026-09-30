import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { activeBattles, countryCounts, milestones } from "./schema";

const connectionString = process.env.DATABASE_URL;
export const client = connectionString ? postgres(connectionString, { max: 10 }) : null;

export const db = client ? drizzle({ client, schema: { activeBattles, countryCounts, milestones } }) : null;
