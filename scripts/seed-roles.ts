import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { DEFAULT_ROLE_DEFINITIONS } from '../src/common/constants/app.constant';
import { roles } from '../src/database/schema';

async function seedRoles() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const client = postgres(databaseUrl, { prepare: false });
  const db = drizzle(client);

  await db
    .insert(roles)
    .values(DEFAULT_ROLE_DEFINITIONS)
    .onConflictDoNothing();

  await client.end();
}

void seedRoles();
