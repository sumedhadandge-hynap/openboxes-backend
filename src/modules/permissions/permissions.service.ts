import { Injectable } from '@nestjs/common';

import { Permission } from '../../database/schema';
import { PermissionsRepository } from './permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async findAll() {
    const permissions = await this.permissionsRepository.findAll();
    return { message: 'Permissions retrieved successfully', data: permissions };
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.permissionsRepository.findByName(name);
  }
}
