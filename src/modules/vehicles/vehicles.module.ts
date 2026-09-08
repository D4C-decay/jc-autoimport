import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { VehiclesService } from './domain/vehicles.service.js';
import { VehiclesRepository } from './domain/vehicles.repository.js';
import { VehiclesController } from './infrastructure/vehicles.controller.js';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService, VehiclesRepository],
  exports: [VehiclesService, VehiclesRepository],
})
export class VehiclesModule {}
