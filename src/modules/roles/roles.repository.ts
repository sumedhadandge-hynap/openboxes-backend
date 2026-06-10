import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import type { AppDatabase } from '../../database/database.module';
import { DRIZZLE } from '../../database/database.tokens';
import { NewRole, Role, roles } from '../../database/schema';

@Injectable()
export class RolesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async findAll(): Promise<Role[]> {
    return this.db.select().from(roles);
  }

  async findByName(name: string): Promise<Role | null> {
    const [role] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1);
    return role ?? null;
  }

  async create(input: NewRole): Promise<Role> {
    const [role] = await this.db.insert(roles).values(input).returning();
    return role;
  }
}
