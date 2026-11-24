import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "tracked_emails" (
  	"id" varchar(16) PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  	"subject" varchar(300) NOT NULL,
  	"recipient_name" varchar(200),
  	"recipient_email" varchar(200),
  	"open_count" integer DEFAULT 0 NOT NULL,
  	"first_opened_at" timestamp(3) with time zone,
  	"last_opened_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  CREATE INDEX IF NOT EXISTS "tracked_emails_user_created_idx" ON "tracked_emails" USING btree ("user_id","created_at");
  CREATE TABLE IF NOT EXISTS "email_opens" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tracked_id" varchar(16) NOT NULL REFERENCES "tracked_emails"("id") ON DELETE cascade,
  	"opened_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"ip_hash" varchar(32) NOT NULL,
  	"kind" varchar(8) NOT NULL,
  	"device" varchar(80),
  	"country" varchar(8),
  	"city" varchar(100)
  );
  CREATE INDEX IF NOT EXISTS "email_opens_tracked_opened_idx" ON "email_opens" USING btree ("tracked_id","opened_at");
  CREATE INDEX IF NOT EXISTS "email_opens_opened_idx" ON "email_opens" USING btree ("opened_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "email_opens" CASCADE; DROP TABLE IF EXISTS "tracked_emails" CASCADE;`)
}
