import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import type { DbType } from '../../database/database.module';
import { permissions, rolePermissions, roles } from '../../database/schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class RolesRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) { }

  private get db() {
    return this.databaseService.db;
  }

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

  async findPermissionByUid(
    uid: string,
  ) {
    const result = await this.db
      .select()
      .from(permissions)
      .where(eq(permissions.uid, uid));

    return result[0] ?? null;
  }

  async assignPermission(
    roleId: number,
    permissionId: number,
  ) {
    const [record] = await this.db
      .insert(rolePermissions)
      .values({
        roleId,
        permissionId,
      })
      .returning();

    return record;
  }



  async getRolePermissions(
    roleId: number,
  ) {
    return this.db
      .select({
        uid: permissions.uid,
        name: permissions.name,
        description:
          permissions.description,
      })
      .from(rolePermissions)
      .innerJoin(
        permissions,
        eq(
          rolePermissions.permissionId,
          permissions.id,
        ),
      )
      .where(
        eq(
          rolePermissions.roleId,
          roleId,
        ),
      );
  }

  async removePermission(
    roleId: number,
    permissionId: number,
  ) {
    return this.db
      .delete(rolePermissions)
      .where(
        and(
          eq(
            rolePermissions.roleId,
            roleId,
          ),
          eq(
            rolePermissions.permissionId,
            permissionId,
          ),
        ),
      );
  }
}