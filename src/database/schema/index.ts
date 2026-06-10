import { relations } from 'drizzle-orm';

import { auditLogs } from './audit/audit-logs.schema';
import { permissions } from './auth/permissions.schema';
import { refreshTokens } from './auth/refresh-tokens.schema';
import { rolePermissions } from './auth/role-permissions.schema';
import { roles } from './auth/roles.schema';
import { users } from './auth/users.schema';

export * from './common/base-columns';
export * from './common/identity-columns';
export * from './auth/users.schema';
export * from './auth/roles.schema';
export * from './auth/permissions.schema';
export * from './auth/role-permissions.schema';
export * from './auth/refresh-tokens.schema';
export * from './audit/audit-logs.schema';

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  refreshTokens: many(refreshTokens),
  auditLogs: many(auditLogs),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
