import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { UsersService } from './domain/users.service.js';
import { UsersController } from './infrastructure/users.controller.js';
import { PasswordService } from '../auth/infrastructure/providers/password.service.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PasswordService],
  exports: [UsersService],
})
export class UsersModule {}
