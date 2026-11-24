import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "mail_connections" (
  	"user_id" integer PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  	"provider" varchar(16) NOT NULL,
  	"email" varchar(200) NOT NULL,
  	"refresh_token" text NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "tracked_emails" ADD COLUMN IF NOT EXISTS "sent_at" timestamp(3) with time zone;
  CREATE INDEX IF NOT EXISTS "tracked_emails_user_sent_idx" ON "tracked_emails" USING btree ("user_id","sent_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "tracked_emails_user_sent_idx";
  ALTER TABLE "tracked_emails" DROP COLUMN IF EXISTS "sent_at";
  DROP TABLE IF EXISTS "mail_connections" CASCADE;`)
}
