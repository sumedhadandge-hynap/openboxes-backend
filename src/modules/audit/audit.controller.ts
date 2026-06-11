import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { AuditService } from './audit.service';

@Controller('api/audit-logs')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll() {
    return this.auditService.findAll();
  }

  @Get(':uid')
  findOne(
    @Param('uid') uid: string,
  ) {
    return this.auditService.findOne(uid);
  }
}