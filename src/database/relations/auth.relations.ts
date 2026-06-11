import { relations } from 'drizzle-orm';

import {
  users,
  roles,
  permissions,
  rolePermissions,
  refreshTokens,
  auditLogs,
} from '../schema';

export const rolesRelations = relations(
  roles,
  ({ many }) => ({
    rolePermissions: many(rolePermissions),
  }),
);

export const permissionsRelations = relations(
  permissions,
  ({ many }) => ({
    rolePermissions: many(rolePermissions),
  }),
);

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

export const usersRelations = relations(
  users,
  ({ many }) => ({
    refreshTokens: many(refreshTokens),
    auditLogs: many(auditLogs),
  }),
);

export const refreshTokensRelations = relations(
  refreshTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [refreshTokens.userId],
      references: [users.id],
    }),
  }),
);