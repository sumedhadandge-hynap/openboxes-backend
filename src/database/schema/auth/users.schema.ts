import {
  integer,
  pgTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';
import { roles } from './roles.schema';

export const users = pgTable(
  'users',
  {
    ...baseColumns,

    firstName: text('first_name').notNull(),

    lastName: text('last_name').notNull(),

    email: text('email').notNull(),

    passwordHash: text('password_hash').notNull(),

    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id, {
        onDelete: 'restrict',
      }),
  },
  (table) => ({
    usersUidUnique: uniqueIndex(
      'users_uid_unique',
    ).on(table.uid),

    usersEmailUnique: uniqueIndex(
      'users_email_unique',
    ).on(table.email),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;