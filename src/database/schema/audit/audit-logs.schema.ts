import {
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';

export const auditLogs = pgTable(
  'audit_logs',
  {
    ...baseColumns,

    userId: integer('user_id'),

    module: text('module').notNull(),

    action: text('action').notNull(),

    oldData: jsonb('old_data'),

    newData: jsonb('new_data'),
  },
  (table) => ({
    auditLogsUidUnique: uniqueIndex(
      'audit_logs_uid_unique',
    ).on(table.uid),
  }),
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;