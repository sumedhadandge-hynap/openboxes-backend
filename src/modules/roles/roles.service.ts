import { Injectable } from '@nestjs/common';

import { Role } from '../../database/schema';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async findAll() {
    const roles = await this.rolesRepository.findAll();
    return { message: 'Roles retrieved successfully', data: roles };
  }

  async findByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findByName(name);
  }

  async createIfMissing(name: string, description: string): Promise<Role> {
    const existingRole = await this.findByName(name);
    if (existingRole) {
      return existingRole;
    }

    return this.rolesRepository.create({ name, description });
  }
}
