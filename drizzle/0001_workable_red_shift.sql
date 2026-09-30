CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"tap_total" bigint NOT NULL,
	"top_ten" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "milestones_tap_total_unique" UNIQUE("tap_total")
);
