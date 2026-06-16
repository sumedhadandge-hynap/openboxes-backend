import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';

import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow(
          'jwt.accessSecret',
        ),
        signOptions: {
          expiresIn:
            config.getOrThrow(
              'jwt.accessExpiresIn',
            ),
        },
      }),
    }),

    MailModule,
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    AuthRepository,
    JwtStrategy,
  ],

  exports: [
    PassportModule,
    JwtModule,
    JwtStrategy,
  ],
})
export class AuthModule {}