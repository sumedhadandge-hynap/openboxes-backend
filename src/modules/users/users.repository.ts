import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';

import {
  users,
  roles,
  userRoles,
} from '../../database/schema';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  private get db() {
    return this.databaseService.db;
  }

  async create(data: any) {
    const [user] = await this.db
      .insert(users)
      .values(data)
      .returning();

    return user;
  }

  async findAll() {
    return this.db
      .select()
      .from(users)
      .where(eq(users.isDeleted, false));
  }

  async findByUid(uid: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.uid, uid));

    return result[0] ?? null;
  }

  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return result[0] ?? null;
  }

  async update(uid: string, data: any) {
    const result = await this.db
      .update(users)
      .set(data)
      .where(eq(users.uid, uid))
      .returning();

    return result[0];
  }

  async delete(uid: string) {
    const result = await this.db
      .update(users)
      .set({
        isDeleted: true,
        isActive: false,
      })
      .where(eq(users.uid, uid))
      .returning();

    return result[0];
  }

  async findRoleByUid(uid: string) {
    const result = await this.db
      .select()
      .from(roles)
      .where(eq(roles.uid, uid));

    return result[0] ?? null;
  }

  async userRoleExists(
    userId: number,
    roleId: number,
  ) {
    const result = await this.db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId),
        ),
      );

    return result[0] ?? null;
  }

  async assignRole(
    userId: number,
    roleId: number,
  ) {
    const [record] = await this.db
      .insert(userRoles)
      .values({
        userId,
        roleId,
      })
      .returning();

    return record;
  }

  async getUserRoles(userId: number) {
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

  async removeRole(
    userId: number,
    roleId: number,
  ) {
    return this.db
      .delete(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId),
        ),
      );
  }
}