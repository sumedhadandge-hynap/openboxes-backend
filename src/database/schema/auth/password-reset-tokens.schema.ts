import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';
import { users } from './users.schema';

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
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
    passwordResetTokensUidUnique: uniqueIndex(
      'password_reset_tokens_uid_unique',
    ).on(table.uid),

    passwordResetTokensTokenHashUnique: uniqueIndex(
      'password_reset_tokens_token_hash_unique',
    ).on(table.tokenHash),
  }),
);

export type PasswordResetToken =
  typeof passwordResetTokens.$inferSelect;

export type NewPasswordResetToken =
  typeof passwordResetTokens.$inferInsert;