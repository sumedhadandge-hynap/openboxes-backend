import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { DEFAULT_ROLES } from '../src/common/constants/app.constant';
import { roles } from '../src/database/schema';

const descriptions: Record<string, string> = {
  ADMIN: 'Full system administration access',
  MANAGER: 'Operational management access',
  USER: 'Standard application access',
};

async function seedRoles() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const client = postgres(databaseUrl, { prepare: false });
  const db = drizzle(client);

  await db
    .insert(roles)
    .values(
      DEFAULT_ROLES.map((name) => ({
        name,
        description: descriptions[name],
      })),
    )
    .onConflictDoNothing();

  await client.end();
}

void seedRoles();
