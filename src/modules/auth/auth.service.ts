import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { AuthRepository } from './auth.repository';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

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

    // =====================================================
    // LOGIN
    // =====================================================

    async login(dto: LoginDto) {
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

        const roles =
            await this.authRepository.findUserRoles(
                user.id,
            );

        const permissions =
            await this.authRepository.findUserPermissions(
                user.id,
            );

        const payload = {
            sub: user.uid,
            email: user.email,
            roles: roles.map((role) => role.name),
        };

        const accessToken =
            await this.jwtService.signAsync(
                payload,
                {
                    secret:
                        this.configService.getOrThrow<string>(
                            'jwt.accessSecret',
                        ),
                    expiresIn: this.getJwtExpiresIn(
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
                    expiresIn: this.getJwtExpiresIn(
                        'jwt.refreshExpiresIn',
                    ),
                },
            );

        // Store hashed refresh token

        const refreshHash =
            await bcrypt.hash(
                refreshToken,
                10,
            );

        const expiresAt = new Date();

        expiresAt.setDate(
            expiresAt.getDate() + 30,
        );

        await this.authRepository.deleteRefreshTokensByUser(
            user.id,
        );

        await this.authRepository.createRefreshToken(
            user.id,
            refreshHash,
            expiresAt,
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

                roles,

                permissions,
            },
        };
    }



    // =====================================================
    // REFRESH TOKEN
    // =====================================================

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

        const user =
            await this.authRepository.findUserByUid(
                payload.sub,
            );

        if (!user) {
            throw new UnauthorizedException();
        }

        const roles =
            await this.authRepository.findUserRoles(
                user.id,
            );

        const permissions =
            await this.authRepository.findUserPermissions(
                user.id,
            );

        const storedTokens =
            await this.authRepository.findRefreshTokensByUser(
                user.id,
            );

        let matchedToken:
            Awaited<
                ReturnType<
                    AuthRepository['findRefreshTokensByUser']
                >
            >[number]
            | null = null;

        for (const token of storedTokens) {
            const valid = await bcrypt.compare(
                dto.refreshToken,
                token.tokenHash,
            );

            if (valid) {
                matchedToken = token;
                break;
            }
        }

        if (!matchedToken) {
            throw new UnauthorizedException(
                'Invalid Refresh Token',
            );
        }

        if (!matchedToken) {
            throw new UnauthorizedException(
                'Invalid Refresh Token',
            );
        }

        await this.authRepository.deleteRefreshTokensByUser(
            user.id,
        );

        const newPayload = {
            sub: user.uid,
            email: user.email,
            roles: roles.map((r) => r.name),
        };

        const accessToken =
            await this.jwtService.signAsync(
                newPayload,
                {
                    secret:
                        this.configService.getOrThrow<string>(
                            'jwt.accessSecret',
                        ),
                    expiresIn: this.getJwtExpiresIn(
                        'jwt.accessExpiresIn',
                    ),
                },
            );

        const refreshToken =
            await this.jwtService.signAsync(
                newPayload,
                {
                    secret:
                        this.configService.getOrThrow<string>(
                            'jwt.refreshSecret',
                        ),
                    expiresIn: this.getJwtExpiresIn(
                        'jwt.refreshExpiresIn',
                    ),
                },
            );

        const refreshHash =
            await bcrypt.hash(
                refreshToken,
                10,
            );

        const expiresAt = new Date();

        expiresAt.setDate(
            expiresAt.getDate() + 30,
        );

        await this.authRepository.createRefreshToken(
            user.id,
            refreshHash,
            expiresAt,
        );

        return {
            message: 'Token refreshed successfully',
            data: {
                accessToken,
                refreshToken,
                user: {
                    uid: user.uid,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                },
                roles,
                permissions,
            },
        };
    }

    // =====================================================
    // LOGOUT
    // =====================================================

    async logout(
        dto: RefreshTokenDto,
    ) {
        let payload: any;

        try {
            payload = await this.jwtService.verifyAsync(
                dto.refreshToken,
                {
                    secret:
                        this.configService.getOrThrow<string>(
                            'jwt.refreshSecret',
                        ),
                },
            );
        } catch {
            throw new UnauthorizedException(
                'Invalid refresh token',
            );
        }

        const user =
            await this.authRepository.findUserByUid(
                payload.sub,
            );

        if (!user) {
            throw new UnauthorizedException();
        }

        await this.authRepository.deleteRefreshTokensByUser(
            user.id,
        );

        return {
            message: 'Logged out successfully',
        };
    }




    async me(userUid: string) {
        const user =
            await this.authRepository.findUserByUid(
                userUid,
            );

        if (!user) {
            throw new UnauthorizedException(
                'User not found',
            );
        }

        const currentUser =
            await this.authRepository.getCurrentUser(
                user.id,
            );

        const roles =
            await this.authRepository.getCurrentUserRoles(
                user.id,
            );

        const permissions =
            await this.authRepository.getCurrentUserPermissions(
                user.id,
            );

        return {
            message: 'Current user fetched successfully',
            data: {
                ...currentUser,
                roles,
                permissions,
            },
        };
    }




















}