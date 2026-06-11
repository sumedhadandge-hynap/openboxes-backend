import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import {
    JwtService,
    type JwtSignOptions,
} from '@nestjs/jwt';

import { AuthRepository } from './auth.repository';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    private getJwtExpiresIn(
        key: string,
    ): JwtSignOptions['expiresIn'] {
        return this.configService.getOrThrow<string>(
            key,
        ) as JwtSignOptions['expiresIn'];
    }

    async login(
        dto: LoginDto,
    ) {
        const user =
            await this.authRepository.findUserByEmail(
                dto.email,
            );

        if (!user) {
            throw new UnauthorizedException(
                'Invalid credentials',
            );
        }

        const validPassword =
            await bcrypt.compare(
                dto.password,
                user.passwordHash,
            );

        if (!validPassword) {
            throw new UnauthorizedException(
                'Invalid credentials',
            );
        }

        const payload = {
            sub: user.uid,
            email: user.email,
        };

        const accessToken =
            await this.jwtService.signAsync(
                payload,
                {
                    secret:
                        this.configService.getOrThrow<string>(
                            'jwt.accessSecret',
                        ),
                    expiresIn:
                        this.getJwtExpiresIn(
                            'jwt.accessExpiresIn',
                        ),
                },
            );

        const refreshToken =
            await this.jwtService.signAsync(
                payload,
                {
                    secret:
                        this.configService.getOrThrow<string>(
                            'jwt.refreshSecret',
                        ),
                    expiresIn:
                        this.getJwtExpiresIn(
                            'jwt.refreshExpiresIn',
                        ),
                },
            );

        return {
            message: 'Login successful',
            data: {
                accessToken,
                refreshToken,
                user: {
                    uid: user.uid,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                },
            },
        };
    }


    //
    async refresh(
        dto: RefreshTokenDto,
    ) {
        const payload =
            await this.jwtService.verifyAsync(
                dto.refreshToken,
                {
                    secret:
                        this.configService.getOrThrow<string>(
                            'jwt.refreshSecret',
                        ),
                },
            );

        const accessToken =
            await this.jwtService.signAsync(
                {
                    sub: payload.sub,
                    uid: payload.uid,
                    email: payload.email,
                },
                {
                    secret:
                        this.configService.getOrThrow<string>(
                            'jwt.accessSecret',
                        ),
                    expiresIn:
                        this.getJwtExpiresIn(
                            'jwt.accessExpiresIn',
                        ),
                },
            );

        return {
            message:
                'Token refreshed successfully',
            data: {
                accessToken,
            },
        };
    }


    async logout(
        dto: RefreshTokenDto,
    ) {
        await this.authRepository
            .deleteRefreshToken(
                dto.refreshToken,
            );

        return {
            message:
                'Logged out successfully',
        };
    }
}
