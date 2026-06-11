import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';

import { users } from './users.schema';

export const sessions = pgTable(
  'sessions',
  {
    ...baseColumns,

    userId: integer('user_id')
      .notNull()
      .references(() => users.id),

    refreshToken: text(
      'refresh_token',
    ).notNull(),

    ipAddress: text('ip_address'),

    userAgent: text('user_agent'),

    expiresAt: timestamp(
      'expires_at',
      {
        withTimezone: true,
      },
    ).notNull(),
  },
  (table) => ({
    sessionsUidUnique: uniqueIndex(
      'sessions_uid_unique',
    ).on(table.uid),
  }),
);

export type Session =
  typeof sessions.$inferSelect;

export type NewSession =
  typeof sessions.$inferInsert;