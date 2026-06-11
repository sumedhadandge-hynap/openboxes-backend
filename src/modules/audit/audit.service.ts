import { Injectable } from '@nestjs/common';

import { AuditRepository } from './audit.repository';

@Injectable()
export class AuditService {
  constructor(
    private readonly auditRepository: AuditRepository,
  ) {}

  async log(data: {
    userId?: number;
    module: string;
    action: string;
    oldData?: any;
    newData?: any;
    createdBy?: number;
  }) {
    return this.auditRepository.create({
      userId: data.userId,
      module: data.module,
      action: data.action,
      oldData: data.oldData,
      newData: data.newData,
      createdBy: data.createdBy,
    });
  }

  async findAll() {
    const logs =
      await this.auditRepository.findAll();

    return {
      message: 'Audit logs fetched successfully',
      data: logs,
    };
  }

  async findOne(uid: string) {
    const log =
      await this.auditRepository.findByUid(uid);

    return {
      message: 'Audit log fetched successfully',
      data: log,
    };
  }
}