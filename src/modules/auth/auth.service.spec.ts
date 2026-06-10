import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { AppLoggerService } from '../../common/logger/app-logger.service';
import { UsersService } from '../users/users.service';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  const user = {
    id: 'user-id',
    email: 'admin@openboxes.com',
    passwordHash: 'hash',
    firstName: 'OpenBoxes',
    lastName: 'Admin',
    isActive: true,
    roleId: 'role-id',
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const authRepository = {
    createRefreshToken: jest.fn(),
    findValidRefreshToken: jest.fn(),
    deleteRefreshTokenById: jest.fn(),
    deleteRefreshTokenByHash: jest.fn(),
  };

  const usersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    getProfile: jest.fn(),
    toResponse: jest.fn((input: typeof user) => ({
      id: input.id,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      isActive: input.isActive,
      role: input.role,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    })),
  };

  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: authRepository },
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const values: Record<string, string> = {
                'jwt.accessSecret': 'access-secret',
                'jwt.refreshSecret': 'refresh-secret',
                'jwt.accessExpiresIn': '15m',
                'jwt.refreshExpiresIn': '30d',
              };
              return values[key];
            }),
          },
        },
        {
          provide: AppLoggerService,
          useValue: {
            auth: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('logs in valid users and returns tokens without password hash', async () => {
    usersService.findByEmail.mockResolvedValue(user);

    const result = await service.login({
      email: user.email,
      password: 'ChangeMe123!',
    });

    expect(result.message).toBe('Login successful');
    expect(result.data.accessToken).toBe('access-token');
    expect(result.data.refreshToken).toBe('refresh-token');
    expect(result.data.user).not.toHaveProperty('passwordHash');
  });

  it('rejects invalid credentials', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: user.email, password: 'ChangeMe123!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
