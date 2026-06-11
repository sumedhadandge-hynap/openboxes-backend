import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
  ) { }
  // Create
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
  // Find All
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

  // Find One
  async findOne(uid: string) {
    const permission =
      await this.permissionsRepository.findByUid(uid);

    if (!permission) {
      throw new NotFoundException(
        'Permission not found',
      );
    }

    return {
      message: 'Permission fetched successfully',
      data: permission,
    };
  }

  // Update

  async update(
    uid: string,
    dto: UpdatePermissionDto,
  ) {
    const permission =
      await this.permissionsRepository.findByUid(uid);

    if (!permission) {
      throw new NotFoundException(
        'Permission not found',
      );
    }

    const updated =
      await this.permissionsRepository.update(
        uid,
        dto,
      );

    return {
      message: 'Permission updated successfully',
      data: updated,
    };
  }

  // Delete
  async remove(uid: string) {
    const permission =
      await this.permissionsRepository.findByUid(uid);

    if (!permission) {
      throw new NotFoundException(
        'Permission not found',
      );
    }

    await this.permissionsRepository.softDelete(uid);

    return {
      message: 'Permission deleted successfully',
    };
  }
}