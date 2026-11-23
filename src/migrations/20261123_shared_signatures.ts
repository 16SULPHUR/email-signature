import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "shared_signatures" (
  	"id" varchar(12) PRIMARY KEY NOT NULL,
  	"template" varchar(64) NOT NULL,
  	"data" jsonb NOT NULL,
  	"ip_hash" varchar(32) NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  CREATE INDEX IF NOT EXISTS "shared_signatures_ip_created_idx" ON "shared_signatures" USING btree ("ip_hash","created_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "shared_signatures" CASCADE;`)
}
