import { BadRequestException, Injectable } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
  ) {}

  async create(dto: CreatePermissionDto) {
    const existing = await this.permissionsRepository.findByName(dto.name);

    if (existing) {
      throw new BadRequestException('Permission already exists');
    }

    const permission = await this.permissionsRepository.create(dto);

    return {
      message: 'Permission created successfully',
      data: {
        uid: permission.uid,
        name: permission.name,
        description: permission.description,
      },
    };
  }

  async findAll() {
    const permissions = await this.permissionsRepository.findAll();

    return {
      message: 'Permissions fetched successfully',
      data: permissions.map((permission) => ({
        uid: permission.uid,
        name: permission.name,
        description: permission.description,
        isActive: permission.isActive,
      })),
    };
  }
}