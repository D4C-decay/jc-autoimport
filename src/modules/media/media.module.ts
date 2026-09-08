import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { MediaService } from './domain/media.service.js';
import { MediaController } from './infrastructure/media.controller.js';

@Module({
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}