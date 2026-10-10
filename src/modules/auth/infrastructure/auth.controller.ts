import 'reflect-metadata';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../domain/auth.service.js';
import { TwoFactorService } from '../domain/two-factor.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import {
  ForgotPasswordDto,
  LogoutDto,
  RefreshTokenDto,
  ResetPasswordDto,
} from './dto/auth-extra.dto.js';
import { TwoFactorCodeDto, TwoFactorVerifyDto } from './dto/two-factor.dto.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import { Throttle } from '../../../common/decorators/throttle.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { TokenPair } from './providers/token.service.js';
import type { JwtPayload } from '../../../common/types/index.js';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactor: TwoFactorService,
  ) {}

  @Public()
  @Post('register')
  @Throttle({ ttl: 60, limit: 5 })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @Throttle({ ttl: 60, limit: 5 })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get tokens' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto): Promise<TokenPair> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ ttl: 300, limit: 3 })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @Public()
  @Post('2fa/verify')
  @Throttle({ ttl: 60, limit: 10 })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete login with a two-factor code' })
  verify2fa(@Body() dto: TwoFactorVerifyDto) {
    return this.authService.login2fa(dto.tempToken, dto.code);
  }

  @Get('2fa/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Whether two-factor authentication is enabled' })
  twoFactorStatus(@CurrentUser() user: JwtPayload) {
    return this.twoFactor.status(user.sub);
  }

  @Post('2fa/setup')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Begin two-factor setup, returns secret and QR' })
  twoFactorSetup(@CurrentUser() user: JwtPayload) {
    return this.twoFactor.setup(user.sub);
  }

  @Post('2fa/enable')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm and enable two-factor' })
  twoFactorEnable(@CurrentUser() user: JwtPayload, @Body() dto: TwoFactorCodeDto) {
    return this.twoFactor.enable(user.sub, dto.code);
  }

  @Post('2fa/disable')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable two-factor with a valid code' })
  twoFactorDisable(@CurrentUser() user: JwtPayload, @Body() dto: TwoFactorCodeDto) {
    return this.twoFactor.disable(user.sub, dto.code);
  }
}
