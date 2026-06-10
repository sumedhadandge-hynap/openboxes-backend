import { relations } from 'drizzle-orm';

import {
  users,
  roles,
  permissions,
  rolePermissions,
  refreshTokens,
} from '../schema';

export const rolesRelations = relations(
  roles,
  ({ many }) => ({
    users: many(users),
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
  ({ one, many }) => ({
    role: one(roles, {
      fields: [users.roleId],
      references: [roles.id],
    }),

    refreshTokens: many(refreshTokens),
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