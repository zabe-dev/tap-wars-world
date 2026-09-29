CREATE TABLE "country_counts" (
	"country" text PRIMARY KEY NOT NULL,
	"tap_count" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
