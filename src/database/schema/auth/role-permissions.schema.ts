import { pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { baseColumns } from '../common/base-columns';
import { permissions } from './permissions.schema';
import { roles } from './roles.schema';

export const rolePermissions = pgTable(
  'role_permissions',
  {
    ...baseColumns,
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    rolePermissionUnique: uniqueIndex(
      'role_permissions_role_id_permission_id_idx',
    ).on(table.roleId, table.permissionId),
  }),
);

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
