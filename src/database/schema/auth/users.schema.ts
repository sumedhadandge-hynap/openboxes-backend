import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';
import { roles } from './roles.schema';

export const users = pgTable('users', {
  ...baseColumns,
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  roleId: uuid('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'restrict' }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
