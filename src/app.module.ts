import 'reflect-metadata';
import { Module, type Provider } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CoreModule } from './core/core.module.js';
import { SharedModule } from './shared/shared.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { VehiclesModule } from './modules/vehicles/vehicles.module.js';
import { SearchModule } from './modules/search/search.module.js';
import { MediaModule } from './modules/media/media.module.js';
import { LeadsModule } from './modules/leads/leads.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { RateLimitGuard } from './common/guards/rate-limit.guard.js';
import { GlobalValidationPipe } from './common/pipes/validation.pipe.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { LoggerService } from './core/logger/logger.service.js';

const globalProviders: Provider[] = [
  LoggerService,
  { provide: APP_PIPE, useClass: GlobalValidationPipe },
  { provide: APP_GUARD, useClass: RateLimitGuard },
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
  { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
] as unknown as Provider[];

@Module({
  imports: [
    CoreModule,
    SharedModule,
    EventEmitterModule.forRoot({ wildcard: false, delimiter: '.' }),
    AuthModule,
    UsersModule,
    VehiclesModule,
    SearchModule,
    MediaModule,
    LeadsModule,
    PaymentsModule,
    AuditModule,
    HealthModule,
  ],
  providers: globalProviders,
})
export class AppModule {}