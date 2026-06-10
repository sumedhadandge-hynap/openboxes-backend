import { pgTable } from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';
import { identityColumns } from '../common/identity-columns';

export const roles = pgTable('roles', {
  ...baseColumns,
  ...identityColumns,
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
