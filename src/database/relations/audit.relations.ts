import { relations } from 'drizzle-orm';

import {
  auditLogs,
  users,
} from '../schema';

export const auditLogsRelations = relations(
  auditLogs,
  ({ one }) => ({
    user: one(users, {
      fields: [auditLogs.userId],
      references: [users.id],
    }),
  }),
);