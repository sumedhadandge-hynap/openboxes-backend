import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    // Temporary user
    const user = {
      id: 1,
      email: 'admin@openboxes.com',
      password: 'admin123',
      role: 'ADMIN',
    };

    if (
      user.email !== email ||
      user.password !== password
    ) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken:
        this.jwtService.sign(payload),

      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}