import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import type { DbType } from '../../database/database.module';
import { roles } from '../../database/schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesRepository {
  constructor(@Inject('DB') private readonly db: DbType) {}

  async create(dto: CreateRoleDto) {
    const [role] = await this.db.insert(roles).values(dto).returning();
    return role;
  }

  async findAll() {
    return this.db.select().from(roles);
  }

  async findByUid(uid: string) {
    const [role] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.uid, uid))
      .limit(1);

    return role ?? null;
  }

  async findByName(name: string) {
    const [role] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1);

    return role ?? null;
  }

  async updateByUid(uid: string, dto: UpdateRoleDto) {
    const [role] = await this.db
      .update(roles)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(roles.uid, uid))
      .returning();

    return role ?? null;
  }

  async deleteByUid(uid: string) {
    const [role] = await this.db
      .update(roles)
      .set({
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      })
      .where(eq(roles.uid, uid))
      .returning();

    return role ?? null;
  }
}