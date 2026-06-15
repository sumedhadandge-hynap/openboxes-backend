import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';


import {
    users,
    roles,
    permissions,
    userRoles,
    rolePermissions,
    refreshTokens,
} from '../../database/schema';

@Injectable()
export class AuthRepository {
    constructor(
        private readonly databaseService: DatabaseService,
    ) { }

    private get db() {
        return this.databaseService.db;
    }

    async findUserByEmail(email: string) {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email));

        return result[0] ?? null;
    }

    async findUserByUid(uid: string) {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.uid, uid));

        return result[0] ?? null;
    }

    async findUserRoles(userId: number) {
        return this.db
            .select({
                uid: roles.uid,
                name: roles.name,
                roleType: roles.roleType,
            })
            .from(userRoles)
            .innerJoin(
                roles,
                eq(userRoles.roleId, roles.id),
            )
            .where(eq(userRoles.userId, userId));
    }

    async findUserPermissions(userId: number) {
        const result = await this.db
            .select({
                name: permissions.name,
            })
            .from(userRoles)
            .innerJoin(
                rolePermissions,
                eq(
                    userRoles.roleId,
                    rolePermissions.roleId,
                ),
            )
            .innerJoin(
                permissions,
                eq(
                    rolePermissions.permissionId,
                    permissions.id,
                ),
            )
            .where(eq(userRoles.userId, userId));

        return [...new Set(result.map((x) => x.name))];
    }

    async createRefreshToken(
        userId: number,
        tokenHash: string,
        expiresAt: Date,
    ) {
        const [token] = await this.db
            .insert(refreshTokens)
            .values({
                userId,
                tokenHash,
                expiresAt,
            })
            .returning();

        return token;
    }

    async findRefreshTokensByUser(
        userId: number,
    ) {
        return this.db
            .select()
            .from(refreshTokens)
            .where(
                eq(refreshTokens.userId, userId),
            );
    }

    async findRefreshToken(
        tokenHash: string,
    ) {
        const result = await this.db
            .select()
            .from(refreshTokens)
            .where(
                eq(refreshTokens.tokenHash, tokenHash),
            );

        return result[0] ?? null;
    }

    async deleteRefreshToken(
        tokenHash: string,
    ) {
        return this.db
            .delete(refreshTokens)
            .where(
                eq(refreshTokens.tokenHash, tokenHash),
            );
    }


    async deleteRefreshTokensByUser(
        userId: number,
    ) {
        return this.db
            .delete(refreshTokens)
            .where(eq(refreshTokens.userId, userId));
    }


    async getCurrentUser(userId: number) {
        const user = await this.db
            .select({
                uid: users.uid,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
                isActive: users.isActive,
            })
            .from(users)
            .where(eq(users.id, userId));

        return user[0] ?? null;
    }

    async getCurrentUserRoles(userId: number) {
        return this.db
            .select({
                uid: roles.uid,
                name: roles.name,
                roleType: roles.roleType,
            })
            .from(userRoles)
            .innerJoin(
                roles,
                eq(userRoles.roleId, roles.id),
            )
            .where(eq(userRoles.userId, userId));
    }


    async getCurrentUserPermissions(
        userId: number,
    ) {
        const result = await this.db
            .select({
                name: permissions.name,
            })
            .from(userRoles)
            .innerJoin(
                rolePermissions,
                eq(
                    userRoles.roleId,
                    rolePermissions.roleId,
                ),
            )
            .innerJoin(
                permissions,
                eq(
                    rolePermissions.permissionId,
                    permissions.id,
                ),
            )
            .where(eq(userRoles.userId, userId));

        return [...new Set(result.map((x) => x.name))];
    }














}