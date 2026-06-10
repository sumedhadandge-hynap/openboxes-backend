import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import type { AppDatabase } from '../../database/database.module';
import { DRIZZLE } from '../../database/database.tokens';
import { NewUser, roles, users } from '../../database/schema';

export type UserWithRole = typeof users.$inferSelect & { role: string };

@Injectable()
export class UsersRepository {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async create(input: NewUser): Promise<typeof users.$inferSelect> {
    const [user] = await this.db.insert(users).values(input).returning();
    return user;
  }

  async findByEmail(email: string): Promise<UserWithRole | null> {
    const [row] = await this.db
      .select({ user: users, roleName: roles.name })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return row ? { ...row.user, role: row.roleName } : null;
  }

  async findById(id: string): Promise<UserWithRole | null> {
    const [row] = await this.db
      .select({ user: users, roleName: roles.name })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, id))
      .limit(1);

    return row ? { ...row.user, role: row.roleName } : null;
  }
}
