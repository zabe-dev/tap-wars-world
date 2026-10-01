ALTER TABLE "active_battles" ADD COLUMN "scope" text DEFAULT 'WW' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "active_battles_scope_idx" ON "active_battles" USING btree ("scope");