import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL is required.");
}

const client = postgres(connectionString);

try {
	await client.unsafe(`
		TRUNCATE TABLE
			country_counts,
			regional_counts,
			milestones,
			active_battles
		RESTART IDENTITY
	`);
	console.log("Cleared all tap counts, regional counts, milestones, and active battles.");
} finally {
	await client.end();
}
