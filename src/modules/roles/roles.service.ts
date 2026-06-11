import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesRepository } from './roles.repository';
import { AssignPermissionDto } from './dto/assign-permission.dto';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) { }

  async create(dto: CreateRoleDto) {
    const existing = await this.rolesRepository.findByName(dto.name);

    if (existing) {
      throw new BadRequestException('Role already exists');
    }

    const role = await this.rolesRepository.create(dto);

    return {
      message: 'Role created successfully',
      data: this.toResponse(role),
    };
  }

  async findAll() {
    const roles = await this.rolesRepository.findAll();

    return {
      message: 'Roles fetched successfully',
      data: roles.map((role) => this.toResponse(role)),
    };
  }

  async findOne(uid: string) {
    const role = await this.rolesRepository.findByUid(uid);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      message: 'Role fetched successfully',
      data: this.toResponse(role),
    };
  }

  async update(uid: string, dto: UpdateRoleDto) {
    const role = await this.rolesRepository.updateByUid(uid, dto);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      message: 'Role updated successfully',
      data: this.toResponse(role),
    };
  }

  async remove(uid: string) {
    const role = await this.rolesRepository.deleteByUid(uid);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      message: 'Role deleted successfully',
      data: null,
    };
  }


  async assignPermission(
    roleUid: string,
    dto: AssignPermissionDto,
  ) {
    const role =
      await this.rolesRepository.findByUid(
        roleUid,
      );

    if (!role) {
      throw new NotFoundException(
        'Role not found',
      );
    }

    const permission =
      await this.rolesRepository.findPermissionByUid(
        dto.permissionUid,
      );

    if (!permission) {
      throw new NotFoundException(
        'Permission not found',
      );
    }

    await this.rolesRepository.assignPermission(
      role.id,
      permission.id,
    );

    return {
      message:
        'Permission assigned successfully',
    };
  }

  async getPermissions(
    roleUid: string,
  ) {
    const role =
      await this.rolesRepository.findByUid(
        roleUid,
      );

    if (!role) {
      throw new NotFoundException(
        'Role not found',
      );
    }

    const permissions =
      await this.rolesRepository.getRolePermissions(
        role.id,
      );

    return {
      message:
        'Permissions fetched successfully',
      data: permissions,
    };
  }

  async removePermission(
    roleUid: string,
    permissionUid: string,
  ) {
    const role =
      await this.rolesRepository.findByUid(
        roleUid,
      );

    if (!role) {
      throw new NotFoundException(
        'Role not found',
      );
    }

    const permission =
      await this.rolesRepository.findPermissionByUid(
        permissionUid,
      );

    if (!permission) {
      throw new NotFoundException(
        'Permission not found',
      );
    }

    await this.rolesRepository.removePermission(
      role.id,
      permission.id,
    );

    return {
      message:
        'Permission removed successfully',
    };
  }

  private toResponse(role: any) {
    return {
      uid: role.uid,
      name: role.name,
      roleType: role.roleType,
      description: role.description,
      isActive: role.isActive,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}