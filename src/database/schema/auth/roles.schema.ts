import {
  pgTable,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';
import { identityColumns } from '../common/identity-columns';

export const roles = pgTable(
  'roles',
  {
    ...baseColumns,
    ...identityColumns,
  },
  (table) => ({
    rolesUidUnique: uniqueIndex(
      'roles_uid_unique',
    ).on(table.uid),

    rolesNameUnique: uniqueIndex(
      'roles_name_unique',
    ).on(table.name),
  }),
);

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;