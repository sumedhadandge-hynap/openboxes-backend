import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt } from 'drizzle-orm';

import type { AppDatabase } from '../../database/database.module';
import { DRIZZLE } from '../../database/database.tokens';
import { refreshTokens } from '../../database/schema';

@Injectable()
export class AuthRepository {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async createRefreshToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    await this.db.insert(refreshTokens).values(input);
  }

  async findValidRefreshToken(input: { userId: string; tokenHash: string }) {
    const [token] = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, input.userId),
          eq(refreshTokens.tokenHash, input.tokenHash),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return token ?? null;
  }

  async deleteRefreshTokenById(id: string) {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.id, id));
  }

  async deleteRefreshTokenByHash(tokenHash: string) {
    await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }
}
