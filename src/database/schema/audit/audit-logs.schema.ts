import { jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';

export const auditLogs = pgTable('audit_logs', {
  ...baseColumns,
  userId: uuid('user_id'),
  module: text('module').notNull(),
  action: text('action').notNull(),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
