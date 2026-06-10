import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import type { DbType } from '../../database/database.module';
import { permissions } from '../../database/schema';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsRepository {
  constructor(@Inject('DB') private readonly db: DbType) {}

  async create(dto: CreatePermissionDto) {
    const [permission] = await this.db
      .insert(permissions)
      .values(dto)
      .returning();

    return permission;
  }

  async findAll() {
    return this.db.select().from(permissions);
  }

  async findByName(name: string) {
    const [permission] = await this.db
      .select()
      .from(permissions)
      .where(eq(permissions.name, name))
      .limit(1);

    return permission ?? null;
  }
}