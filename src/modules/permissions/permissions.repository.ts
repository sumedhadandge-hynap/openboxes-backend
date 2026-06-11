import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import type { DbType } from '../../database/database.module';
import { permissions } from '../../database/schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class PermissionsRepository {
  // constructor(@Inject('DB') private readonly db: DbType) { }

  constructor(
    private readonly databaseService: DatabaseService,
  ) { }

  private get db() {
    return this.databaseService.db;
  }

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


  async findByUid(uid: string) {
    const [permission] = await this.db
      .select()
      .from(permissions)
      .where(eq(permissions.uid, uid))
      .limit(1);

    return permission ?? null;
  }


  async update(uid: string, data: Partial<CreatePermissionDto>) {
    const [permission] = await this.db
      .update(permissions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(permissions.uid, uid))
      .returning();

    return permission;
  }

  async softDelete(uid: string) {
    const [permission] = await this.db
      .update(permissions)
      .set({
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(permissions.uid, uid))
      .returning();

    return permission;
  }
}