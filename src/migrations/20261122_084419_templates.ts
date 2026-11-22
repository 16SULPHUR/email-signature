import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"category" varchar NOT NULL,
  	"description" varchar,
  	"tags" jsonb DEFAULT '[]'::jsonb,
  	"width" numeric DEFAULT 520 NOT NULL,
  	"animated" boolean DEFAULT false,
  	"published" boolean DEFAULT true,
  	"animation" jsonb,
  	"fields" jsonb DEFAULT '[]'::jsonb,
  	"theme" jsonb NOT NULL,
  	"defaults" jsonb,
  	"preview" jsonb,
  	"html" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "templates_id" integer;
  CREATE UNIQUE INDEX "templates_slug_idx" ON "templates" USING btree ("slug");
  CREATE INDEX "templates_category_idx" ON "templates" USING btree ("category");
  CREATE INDEX "templates_published_idx" ON "templates" USING btree ("published");
  CREATE INDEX "templates_updated_at_idx" ON "templates" USING btree ("updated_at");
  CREATE INDEX "templates_created_at_idx" ON "templates" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_templates_fk" FOREIGN KEY ("templates_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("templates_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "templates" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "templates" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_templates_fk";
  
  DROP INDEX "payload_locked_documents_rels_templates_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "templates_id";`)
}
