CREATE TABLE "regional_counts" (
	"country_code" text NOT NULL,
	"region" text NOT NULL,
	"tap_count" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "regional_counts_country_code_region_pk" PRIMARY KEY("country_code","region")
);
