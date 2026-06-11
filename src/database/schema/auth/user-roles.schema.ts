import {
  integer,
  pgTable,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';
import { users } from './users.schema';
import { roles } from './roles.schema';

export const userRoles = pgTable(
  'user_roles',
  {
    ...baseColumns,

    userId: integer('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),

    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => ({
    userRolesUidUnique: uniqueIndex(
      'user_roles_uid_unique',
    ).on(table.uid),

    userRoleUnique: uniqueIndex(
      'user_roles_user_role_unique',
    ).on(table.userId, table.roleId),
  }),
);