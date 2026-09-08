import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditService } from './domain/audit.service.js';
import { AuditInterceptor } from './domain/audit.interceptor.js';
import { AuditController } from './infrastructure/audit.controller.js';

const AuditInterceptorProvider = {
  provide: APP_INTERCEPTOR,
  useClass: AuditInterceptor,
  multi: true,
};

@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditInterceptorProvider],
  exports: [AuditService],
})
export class AuditModule {}