import 'reflect-metadata';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditService } from '../domain/audit.service.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';

@ApiTags('audit')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('api/v1/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit trail (admin only)' })
  findAll(@Query() query: { entity?: string; userId?: string; action?: string; page?: number; limit?: number }) {
    return this.auditService.findAll({
      entity: query.entity,
      userId: query.userId,
      action: query.action,
      page: query.page,
      limit: query.limit,
    });
  }
}