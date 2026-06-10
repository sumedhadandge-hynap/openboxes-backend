import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';
import { users } from './users.schema';

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    ...baseColumns,

    userId: integer('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),

    tokenHash: text('token_hash').notNull(),

    expiresAt: timestamp('expires_at', {
      withTimezone: true,
    }).notNull(),
  },
  (table) => ({
    refreshTokensUidUnique: uniqueIndex(
      'refresh_tokens_uid_unique',
    ).on(table.uid),

    refreshTokensTokenHashUnique: uniqueIndex(
      'refresh_tokens_token_hash_unique',
    ).on(table.tokenHash),
  }),
);

export type RefreshToken =
  typeof refreshTokens.$inferSelect;

export type NewRefreshToken =
  typeof refreshTokens.$inferInsert;