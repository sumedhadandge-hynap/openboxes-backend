import {
  pgTable,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';
import { identityColumns } from '../common/identity-columns';

export const permissions = pgTable(
  'permissions',
  {
    ...baseColumns,
    ...identityColumns,
  },
  (table) => ({
    permissionsUidUnique: uniqueIndex(
      'permissions_uid_unique',
    ).on(table.uid),

    permissionsNameUnique: uniqueIndex(
      'permissions_name_unique',
    ).on(table.name),
  }),
);

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;