import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { UsersService } from './domain/users.service.js';
import { UsersController } from './infrastructure/users.controller.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
