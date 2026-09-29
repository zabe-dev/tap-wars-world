import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { countryCounts } from "./schema";

const connectionString = process.env.DATABASE_URL;
const client = connectionString ? postgres(connectionString, { max: 10 }) : null;

export const db = client ? drizzle({ client, schema: { countryCounts } }) : null;
