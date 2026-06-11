ALTER TABLE "roles" ADD COLUMN "role_type" text;--> statement-breakpoint
UPDATE "roles"
SET "role_type" = CASE "name"
  WHEN 'ADMIN' THEN 'ROLE_ADMIN'
  WHEN 'MANAGER' THEN 'ROLE_MANAGER'
  WHEN 'USER' THEN 'ROLE_AUTHENTICATED'
  ELSE upper(replace("name", ' ', '_'))
END
WHERE "role_type" IS NULL;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "role_type" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "roles_role_type_unique" ON "roles" USING btree ("role_type");
