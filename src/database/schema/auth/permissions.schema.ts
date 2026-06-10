import { pgTable } from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';
import { identityColumns } from '../common/identity-columns';

export const permissions = pgTable('permissions', {
  ...baseColumns,
  ...identityColumns,
});

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
