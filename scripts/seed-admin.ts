import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { BCRYPT_SALT_ROUNDS } from '../src/common/constants/app.constant';
import { users } from '../src/database/schema';

async function seedAdmin() {
  const databaseUrl = process.env.DATABASE_URL;
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  if (!adminPassword) {
    throw new Error(
      'DEFAULT_ADMIN_PASSWORD is required',
    );
  }

  const client = postgres(databaseUrl, {
    prepare: false,
  });

  const db = drizzle(client);

  const email = 'admin@openboxes.com';

  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(
      adminPassword,
      BCRYPT_SALT_ROUNDS,
    );

    await db.insert(users).values({
      firstName: 'System',
      lastName: 'Admin',
      email,
      passwordHash,
    });

    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  // Seed test user javatam988@ocuser.com
  const testEmail = 'javatam988@ocuser.com';
  const [existingTestUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, testEmail))
    .limit(1);

  if (!existingTestUser) {
    const passwordHash = await bcrypt.hash(
      adminPassword, // Use the same default password ChangeMe123!
      BCRYPT_SALT_ROUNDS,
    );

    await db.insert(users).values({
      firstName: 'Java',
      lastName: 'Tam',
      email: testEmail,
      passwordHash,
    });

    console.log('Test user javatam988@ocuser.com created');
  } else {
    console.log('Test user javatam988@ocuser.com already exists');
  }

  await client.end();
}

void seedAdmin();