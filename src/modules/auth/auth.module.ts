import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './domain/auth.service.js';
import { AuthController } from './infrastructure/auth.controller.js';
import { PasswordService } from './infrastructure/providers/password.service.js';
import { TokenService } from './infrastructure/providers/token.service.js';
import { AppConfigService } from '../../core/config/app-config.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: (config: AppConfigService) => ({
        secret: config.jwt.accessSecret,
        signOptions: {
          expiresIn: config.jwt.accessExpiresIn as unknown as number,
        },
      }),
      inject: [AppConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokenService],
  exports: [AuthService, PasswordService, TokenService],
})
export class AuthModule {}
