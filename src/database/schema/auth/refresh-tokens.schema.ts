import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';
import { users } from './users.schema';

export const refreshTokens = pgTable('refresh_tokens', {
  ...baseColumns,
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
