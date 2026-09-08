import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { SearchService } from './domain/search.service.js';
import { SearchController } from './infrastructure/search.controller.js';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}