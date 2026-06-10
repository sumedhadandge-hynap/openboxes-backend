import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { TokenType } from '../../common/enums/token-type.enum';
import { AppLoggerService } from '../../common/logger/app-logger.service';
import { addDays } from '../../common/utils/date.util';
import { hashPassword, verifyPassword } from '../../common/utils/password.util';
import { hashToken } from '../../common/utils/token.util';
import { UsersService } from '../users/users.service';
import { UserWithRole } from '../users/users.repository';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface RefreshJwtPayload {
  sub: string;
  email: string;
  role: string;
  type: TokenType;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await hashPassword(dto.password);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      isActive: true,
    });

    this.logger.auth(
      { event: 'auth_register', userId: user.id, email: user.email },
      'User registered',
    );
    const tokens = await this.issueTokens(user);

    return {
      message: 'Registration successful',
      data: { ...tokens, user: this.usersService.toResponse(user) },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive) {
      this.logger.auth(
        {
          event: 'auth_login_failed',
          email: dto.email,
          reason: 'not_found_or_inactive',
        },
        'User login failed',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await verifyPassword(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      this.logger.auth(
        {
          event: 'auth_login_failed',
          userId: user.id,
          email: user.email,
          reason: 'invalid_password',
        },
        'User login failed',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.auth(
      { event: 'auth_login_success', userId: user.id, email: user.email },
      'User authenticated',
    );
    const tokens = await this.issueTokens(user);

    return {
      message: 'Login successful',
      data: { ...tokens, user: this.usersService.toResponse(user) },
    };
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const storedToken = await this.authRepository.findValidRefreshToken({
      userId: payload.sub,
      tokenHash,
    });

    if (!storedToken) {
      this.logger.auth(
        {
          event: 'auth_refresh_failed',
          userId: payload.sub,
          reason: 'token_not_found',
        },
        'Refresh token rejected',
      );
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      this.logger.auth(
        {
          event: 'auth_refresh_failed',
          userId: payload.sub,
          reason: 'user_not_found_or_inactive',
        },
        'Refresh token rejected',
      );
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.authRepository.deleteRefreshTokenById(storedToken.id);
    const tokens = await this.issueTokens(user);

    this.logger.auth(
      { event: 'auth_refresh_success', userId: user.id },
      'Refresh token rotated',
    );
    return { message: 'Token refresh successful', data: tokens };
  }

  async logout(refreshToken: string) {
    await this.authRepository.deleteRefreshTokenByHash(hashToken(refreshToken));

    this.logger.auth({ event: 'auth_logout' }, 'User logged out');
    return { message: 'Logout successful', data: null };
  }

  async profile(userId: string) {
    const profile = await this.usersService.getProfile(userId);
    return { message: 'Profile retrieved successfully', data: profile };
  }

  private async issueTokens(user: UserWithRole) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(
      { ...payload, type: TokenType.ACCESS },
      {
        secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
        expiresIn: this.configService.getOrThrow<string>(
          'jwt.accessExpiresIn',
        ) as never,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: TokenType.REFRESH },
      {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: this.configService.getOrThrow<string>(
          'jwt.refreshExpiresIn',
        ) as never,
      },
    );

    await this.authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: addDays(new Date(), 30),
    });

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string): Promise<RefreshJwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshJwtPayload>(
        token,
        {
          secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        },
      );

      if (payload.type !== TokenType.REFRESH) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch {
      this.logger.auth(
        { event: 'auth_refresh_failed', reason: 'jwt_verification_failed' },
        'Refresh token verification failed',
      );
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
