import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import type { AppDatabase } from '../../database/database.module';
import { DRIZZLE } from '../../database/database.tokens';
import { Permission, permissions } from '../../database/schema';

@Injectable()
export class PermissionsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async findAll(): Promise<Permission[]> {
    return this.db.select().from(permissions);
  }

  async findByName(name: string): Promise<Permission | null> {
    const [permission] = await this.db
      .select()
      .from(permissions)
      .where(eq(permissions.name, name))
      .limit(1);
    return permission ?? null;
  }
}
