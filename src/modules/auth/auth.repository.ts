import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';

import {
    users,
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

    async findUserByEmail(
        email: string,
    ) {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email));

        return result[0] ?? null;
    }

    async findUserByUid(
        uid: string,
    ) {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.uid, uid));

        return result[0] ?? null;
    }

    async saveRefreshToken(
        data: any,
    ) {
        const [token] = await this.db
            .insert(refreshTokens)
            .values(data)
            .returning();

        return token;
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


    async findRefreshToken(
        tokenHash: string,
    ) {
        const result = await this.db
            .select()
            .from(refreshTokens)
            .where(
                eq(
                    refreshTokens.tokenHash,
                    tokenHash,
                ),
            );

        return result[0] ?? null;
    }
    
    async deleteRefreshToken(
        tokenHash: string,
    ) {
        return this.db
            .delete(refreshTokens)
            .where(
                eq(
                    refreshTokens.tokenHash,
                    tokenHash,
                ),
            );
    }












}