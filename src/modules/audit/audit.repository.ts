import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import { auditLogs } from '../../database/schema';

@Injectable()
export class AuditRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async create(data: any) {
    const [log] = await this.databaseService.db
      .insert(auditLogs)
      .values(data)
      .returning();

    return log;
  }

  async findAll() {
    return this.databaseService.db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt));
  }

  async findByUid(uid: string) {
    const result = await this.databaseService.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.uid, uid));

    return result[0] ?? null;
  }
}