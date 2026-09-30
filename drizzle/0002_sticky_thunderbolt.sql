CREATE TABLE "active_battles" (
	"id" serial PRIMARY KEY NOT NULL,
	"left_country" text NOT NULL,
	"right_country" text NOT NULL,
	"left_frozen" bigint NOT NULL,
	"right_frozen" bigint NOT NULL,
	"left_score" bigint DEFAULT 0 NOT NULL,
	"right_score" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
