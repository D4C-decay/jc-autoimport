import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { LeadsService } from './domain/leads.service.js';
import { LeadAssignmentService } from './domain/lead-assignment.service.js';
import { LeadNotificationsListener } from './domain/lead-notifications.listener.js';
import { LeadsController } from './infrastructure/leads.controller.js';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, LeadAssignmentService, LeadNotificationsListener],
  exports: [LeadsService],
})
export class LeadsModule {}