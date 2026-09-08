import 'reflect-metadata';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeadsService } from '../domain/leads.service.js';
import {
  AssignLeadDto,
  CreateLeadDto,
  LeadQueryDto,
  UpdateLeadDto,
} from './dto/lead.dto.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Throttle } from '../../../common/decorators/throttle.decorator.js';
import type { JwtPayload } from '../../../common/types/index.js';

@ApiTags('leads')
@Controller('api/v1/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Public()
  @Post()
  @Throttle({ ttl: 60, limit: 6 })
  @ApiOperation({ summary: 'Create a lead from a public form' })
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List leads (CRM). Sellers see only assigned leads' })
  findAll(
    @Query() query: LeadQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.leadsService.findAll(query, user.sub, user.role);
  }

  @Get('stats')
  @Roles('ADMIN', 'MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'CRM statistics' })
  getStats() {
    return this.leadsService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a lead by id' })
  findById(@Param('id') id: string) {
    return this.leadsService.findById(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lead status/notes' })
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }

  @Post(':id/assign')
  @Roles('ADMIN', 'MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign lead to a seller' })
  assign(@Param('id') id: string, @Body() dto: AssignLeadDto) {
    return this.leadsService.assign(id, dto);
  }
}