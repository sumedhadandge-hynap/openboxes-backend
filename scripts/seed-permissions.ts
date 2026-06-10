import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { PermissionName } from '../src/common/enums/permission.enum';
import { permissions } from '../src/database/schema';

async function seedPermissions() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const client = postgres(databaseUrl, { prepare: false });
  const db = drizzle(client);

  await db
    .insert(permissions)
    .values(
      Object.values(PermissionName).map((name) => ({
        name,
        description: `Allows ${name}`,
      })),
    )
    .onConflictDoNothing();

  await client.end();
}

void seedPermissions();
