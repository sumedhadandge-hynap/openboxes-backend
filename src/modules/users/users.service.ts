import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RoleName } from '../../common/enums/role.enum';
import { RolesService } from '../roles/roles.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersRepository, UserWithRole } from './users.repository';

import type { NewUser } from '../../database/schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesService: RolesService,
  ) {}

  async create(
    input: Omit<NewUser, 'roleId'> & { roleName?: string },
  ): Promise<UserWithRole> {
    const existingUser = await this.usersRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const role = await this.rolesService.createIfMissing(
      input.roleName ?? RoleName.USER,
      'Default application role',
    );

    const user = await this.usersRepository.create({
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      isActive: input.isActive ?? true,
      roleId: role.id,
    });

    return { ...user, role: role.name };
  }

  async findByEmail(email: string): Promise<UserWithRole | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserWithRole | null> {
    return this.usersRepository.findById(id);
  }

  async getProfile(id: string): Promise<UserResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponse(user);
  }

  toResponse(user: UserWithRole): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
