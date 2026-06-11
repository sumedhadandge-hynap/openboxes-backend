import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],

  controllers: [UsersController],

  providers: [
    UsersService,
    UsersRepository,
  ],

  exports: [UsersService],
})
export class UsersModule { }