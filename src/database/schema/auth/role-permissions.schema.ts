import {
  integer,
  pgTable,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';
import { permissions } from './permissions.schema';
import { roles } from './roles.schema';

export const rolePermissions = pgTable(
  'role_permissions',
  {
    ...baseColumns,

    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id, {
        onDelete: 'cascade',
      }),

    permissionId: integer('permission_id')
      .notNull()
      .references(() => permissions.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => ({
    rolePermissionsUidUnique: uniqueIndex(
      'role_permissions_uid_unique',
    ).on(table.uid),

    rolePermissionUnique: uniqueIndex(
      'role_permissions_role_permission_unique',
    ).on(table.roleId, table.permissionId),
  }),
);

export type RolePermission =
  typeof rolePermissions.$inferSelect;

export type NewRolePermission =
  typeof rolePermissions.$inferInsert;