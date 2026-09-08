import 'reflect-metadata';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SearchService } from '../domain/search.service.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import { CacheTTL } from '../../../common/decorators/cache.decorator.js';
import { UseInterceptors } from '@nestjs/common';
import { RedisCacheInterceptor } from '../../../common/interceptors/redis-cache.interceptor.js';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

class SearchQueryDto {
  @IsString()
  q!: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

class SuggestionQueryDto {
  @IsString()
  q!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 8;
}

class FacetsQueryDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsOptional()
  @IsString()
  bodyType?: string;
}

@ApiTags('search')
@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @UseInterceptors(RedisCacheInterceptor)
  @CacheTTL({ ttl: 30, keyPrefix: 'search' })
  @ApiOperation({ summary: 'Full-text search vehicles with relevance ranking' })
  @ApiQuery({ name: 'q', required: true, description: 'Search text' })
  @ApiQuery({ name: 'cursor', required: false })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search({
      query: query.q,
      cursor: query.cursor,
      limit: query.limit,
    });
  }

  @Public()
  @Get('suggestions')
  @UseInterceptors(RedisCacheInterceptor)
  @CacheTTL({ ttl: 300, keyPrefix: 'suggest' })
  @ApiOperation({ summary: 'Autocomplete suggestions for search box' })
  suggestions(@Query() query: SuggestionQueryDto) {
    return this.searchService.suggestions(query.q, query.limit);
  }

  @Public()
  @Get('facets')
  @UseInterceptors(RedisCacheInterceptor)
  @CacheTTL({ ttl: 300, keyPrefix: 'facets' })
  @ApiOperation({ summary: 'Faceted search metadata (brands, ranges, counts)' })
  facets(@Query() query: FacetsQueryDto) {
    return this.searchService.facets(query);
  }
}