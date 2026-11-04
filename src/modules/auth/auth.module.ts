import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { AuthService } from './domain/auth.service.js';
import { AuthController } from './infrastructure/auth.controller.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
