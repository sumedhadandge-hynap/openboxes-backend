import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Put } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }


  // Login
  @Post('login')
  login(
    @Body()
    dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }
  // Refresh 
  @Post('refresh')
  refresh(
    @Body()
    dto: RefreshTokenDto,
  ) {
    return this.authService.refresh(dto);
  }
  // Logout
  @Post('logout')
  logout(
    @Body()
    dto: RefreshTokenDto,
  ) {
    return this.authService.logout(dto);
  }
  // Get current user
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @CurrentUser() user: any,
  ) {
    return this.authService.me(
      user.uid,
    );
  }
  // Change password
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.uid,
      dto,
    );
  }
  // Forgot password
  @Post('forgot-password')
  forgotPassword(
    @Body()
    dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(dto);
  }
  // Reset password
  @Post('reset-password')
  resetPassword(
    @Body()
    dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(dto);
  }


  @Put('profile')
@UseGuards(JwtAuthGuard)
updateProfile(
  @CurrentUser() user: any,
  @Body() dto: UpdateProfileDto,
) {
  return this.authService.updateProfile(
    user.uid,
    dto,
  );
}

  
}