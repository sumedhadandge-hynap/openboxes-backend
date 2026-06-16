import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import * as Crypto from 'crypto';

import { AuthRepository } from './auth.repository';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) { }

    private getJwtExpiresIn(
        key: string,
    ): JwtSignOptions['expiresIn'] {
        return this.configService.getOrThrow<string>(
            key,
        ) as JwtSignOptions['expiresIn'];
    }


    // LOGIN
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

    // REFRESH TOKEN
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

    // LOGOUT
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


    // Current User
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





    async changePassword(
        uid: string,
        dto: ChangePasswordDto,
    ) {
        const user =
            await this.authRepository.findUserByUid(
                uid,
            );

        if (!user) {
            throw new UnauthorizedException(
                'User not found',
            );
        }

        const validPassword =
            await bcrypt.compare(
                dto.currentPassword,
                user.passwordHash,
            );

        if (!validPassword) {
            throw new UnauthorizedException(
                'Current password is incorrect',
            );
        }

        if (
            dto.currentPassword ===
            dto.newPassword
        ) {
            throw new UnauthorizedException(
                'New password must be different from current password',
            );
        }

        const passwordHash =
            await bcrypt.hash(
                dto.newPassword,
                10,
            );

        await this.authRepository.updatePassword(
            uid,
            passwordHash,
        );

        // Logout from all devices by removing all refresh tokens
        const tokens =
            await this.authRepository.findRefreshTokensByUser(
                user.id,
            );

        for (const token of tokens) {
            await this.authRepository.deleteRefreshToken(
                token.tokenHash,
            );
        }

        return {
            message:
                'Password changed successfully. Please login again.',
        };
    }




    async forgotPassword(
        dto: ForgotPasswordDto,
    ) {
        const user =
            await this.authRepository.findUserByEmail(
                dto.email,
            );

        // Never reveal whether the email exists
        if (!user) {
            return {
                message:
                    'If the email exists, a password reset link has been sent.',
            };
        }

        // Generate secure random token
        const resetToken =
            `${user.email}:${Crypto.randomBytes(32).toString('hex')}`;


        // Hash token before storing
        const tokenHash =
            await bcrypt.hash(
                resetToken,
                10,
            );

        // Remove any existing reset tokens
        const existingTokens =
            await this.authRepository.findPasswordResetTokensByUser(
                user.id,
            );

        for (const token of existingTokens) {
            await this.authRepository.deletePasswordResetToken(
                token.tokenHash,
            );
        }

        // Token expires in 30 minutes
        const expiresAt = new Date();

        expiresAt.setMinutes(
            expiresAt.getMinutes() + 30,
        );

        await this.authRepository.createPasswordResetToken(
            user.id,
            tokenHash,
            expiresAt,
        );

        const frontendUrl =
            this.configService.getOrThrow<string>(
                'FRONTEND_URL',
            );

        const resetLink =
            `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

        await this.mailService.sendPasswordResetEmail(
            user.email,
            user.firstName,
            resetLink,
        );

        return {
            message:
                'If the email exists, a password reset link has been sent.',
        };
    }



    async resetPassword(
        dto: ResetPasswordDto,
    ) {
        // Decode the token to identify the user
        const user = await this.authRepository.findUserByEmail(
            dto.token.split(':')[0],
        );

        if (!user) {
            throw new UnauthorizedException(
                'Invalid reset token',
            );
        }

        const storedTokens =
            await this.authRepository.findPasswordResetTokensByUser(
                user.id,
            );

        let matchedToken:
            Awaited<
                ReturnType<
                    AuthRepository['findPasswordResetTokensByUser']
                >
            >[number] | null = null;

        for (const token of storedTokens) {
            const valid = await bcrypt.compare(
                dto.token,
                token.tokenHash,
            );

            if (valid) {
                matchedToken = token;
                break;
            }
        }

        if (!matchedToken) {
            throw new UnauthorizedException(
                'Invalid reset token',
            );
        }

        if (matchedToken.expiresAt < new Date()) {
            throw new UnauthorizedException(
                'Reset token expired',
            );
        }

        const passwordHash =
            await bcrypt.hash(
                dto.newPassword,
                10,
            );

        await this.authRepository.updatePassword(
            user.uid,
            passwordHash,
        );

        await this.authRepository.deletePasswordResetToken(
            matchedToken.tokenHash,
        );

        return {
            message:
                'Password reset successfully',
        };
    }



    async updateProfile(
        userUid: string,
        dto: UpdateProfileDto,
    ) {
        const user =
            await this.authRepository.findUserByUid(
                userUid,
            );

        if (!user) {
            throw new UnauthorizedException(
                'User not found',
            );
        }

        const updatedUser =
            await this.authRepository.updateProfile(
                userUid,
                dto,
            );

        return {
            message: 'Profile updated successfully',
            data: updatedUser,
        };
    }

}