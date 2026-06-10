import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { BCRYPT_SALT_ROUNDS } from '../src/common/constants/app.constant';
import { roles, users } from '../src/database/schema';

async function seedAdmin() {
  const databaseUrl = process.env.DATABASE_URL;
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  if (!adminPassword) {
    throw new Error('DEFAULT_ADMIN_PASSWORD is required for admin seeding');
  }

  const client = postgres(databaseUrl, { prepare: false });
  const db = drizzle(client);

  const [adminRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, 'ADMIN'))
    .limit(1);
  if (!adminRole) {
    throw new Error(
      'ADMIN role is missing. Run npm run db:seed after migrations.',
    );
  }

  const email = 'admin@openboxes.com';
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!existingAdmin) {
    await db.insert(users).values({
      email,
      passwordHash: await bcrypt.hash(adminPassword, BCRYPT_SALT_ROUNDS),
      firstName: 'OpenBoxes',
      lastName: 'Admin',
      isActive: true,
      roleId: adminRole.id,
    });
  }

  await client.end();
}

void seedAdmin();
