import {
  pgTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';
import { identityColumns } from '../common/identity-columns';

export const roles = pgTable(
  'roles',
  {
    ...baseColumns,
    ...identityColumns,

    roleType: text('role_type').notNull(),
  },
  (table) => ({
    rolesUidUnique: uniqueIndex('roles_uid_unique').on(table.uid),
    rolesNameUnique: uniqueIndex('roles_name_unique').on(table.name),
    rolesRoleTypeUnique: uniqueIndex('roles_role_type_unique').on(table.roleType),
  }),
);

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;