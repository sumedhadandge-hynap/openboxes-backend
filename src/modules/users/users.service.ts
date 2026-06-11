import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly auditService: AuditService,
  ) {}

  private generateTempPassword() {
    return `Temp@${Math.floor(
      100000 + Math.random() * 900000,
    )}`;
  }

  async create(dto: CreateUserDto) {
    const existing =
      await this.usersRepository.findByEmail(
        dto.email,
      );

    if (existing) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    const role =
      await this.usersRepository.findRoleByUid(
        dto.roleUid,
      );

    if (!role) {
      throw new BadRequestException(
        'Role not found',
      );
    }

    const temporaryPassword =
      this.generateTempPassword();

    const passwordHash =
      await bcrypt.hash(
        temporaryPassword,
        10,
      );

    const user =
      await this.usersRepository.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
      });

    await this.usersRepository.assignRole(
      user.id,
      role.id,
    );

    await this.auditService.log({
      module: 'users',
      action: 'create',
      newData: user,
    });

    return {
      message: 'User created successfully',
      data: {
        uid: user.uid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        temporaryPassword,
      },
    };
  }

  async findAll() {
    const users =
      await this.usersRepository.findAll();

    return {
      message:
        'Users fetched successfully',
      data: users,
    };
  }

  async findOne(uid: string) {
    const user =
      await this.usersRepository.findByUid(uid);

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return {
      message:
        'User fetched successfully',
      data: user,
    };
  }

  async update(
    uid: string,
    dto: UpdateUserDto,
  ) {
    const existing =
      await this.usersRepository.findByUid(uid);

    if (!existing) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const updated =
      await this.usersRepository.update(
        uid,
        dto,
      );

    await this.auditService.log({
      module: 'users',
      action: 'update',
      oldData: existing,
      newData: updated,
    });

    return {
      message:
        'User updated successfully',
      data: updated,
    };
  }

  async delete(uid: string) {
    const existing =
      await this.usersRepository.findByUid(uid);

    if (!existing) {
      throw new NotFoundException(
        'User not found',
      );
    }

    await this.usersRepository.delete(uid);

    await this.auditService.log({
      module: 'users',
      action: 'delete',
      oldData: existing,
    });

    return {
      message:
        'User deleted successfully',
    };
  }

  async assignRole(
    userUid: string,
    dto: AssignRoleDto,
  ) {
    const user =
      await this.usersRepository.findByUid(
        userUid,
      );

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const role =
      await this.usersRepository.findRoleByUid(
        dto.roleUid,
      );

    if (!role) {
      throw new NotFoundException(
        'Role not found',
      );
    }

    const existing =
      await this.usersRepository.userRoleExists(
        user.id,
        role.id,
      );

    if (existing) {
      throw new BadRequestException(
        'Role already assigned',
      );
    }

    await this.usersRepository.assignRole(
      user.id,
      role.id,
    );

    return {
      message:
        'Role assigned successfully',
    };
  }

  async getRoles(uid: string) {
    const user =
      await this.usersRepository.findByUid(uid);

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const roles =
      await this.usersRepository.getUserRoles(
        user.id,
      );

    return {
      message:
        'Roles fetched successfully',
      data: roles,
    };
  }

  async removeRole(
    userUid: string,
    roleUid: string,
  ) {
    const user =
      await this.usersRepository.findByUid(
        userUid,
      );

    const role =
      await this.usersRepository.findRoleByUid(
        roleUid,
      );

    if (!user || !role) {
      throw new NotFoundException();
    }

    await this.usersRepository.removeRole(
      user.id,
      role.id,
    );

    return {
      message:
        'Role removed successfully',
    };
  }
}