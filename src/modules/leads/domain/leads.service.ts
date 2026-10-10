import 'reflect-metadata';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { EncryptionService } from '../../../shared/services/encryption.service.js';
import { LeadAssignmentService } from './lead-assignment.service.js';
import {
  AssignLeadDto,
  CreateLeadDto,
  LeadQueryDto,
  UpdateLeadDto,
} from '../infrastructure/dto/lead.dto.js';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assignment: LeadAssignmentService,
    private readonly eventEmitter: EventEmitter2,
    private readonly encryption: EncryptionService,
  ) {}

  /** Decrypts PII stored at rest before returning a lead to a caller. */
  private presentLead<T>(lead: T): T {
    const record = lead as {
      customerPhone?: string | null;
      message?: string | null;
      assignedTo?: { phone?: string | null } | null;
    };
    return {
      ...lead,
      ...(record.customerPhone !== undefined
        ? { customerPhone: this.encryption.decrypt(record.customerPhone) }
        : {}),
      ...(record.message !== undefined ? { message: this.encryption.decrypt(record.message) } : {}),
      ...(record.assignedTo?.phone !== undefined
        ? { assignedTo: { ...record.assignedTo, phone: this.encryption.decrypt(record.assignedTo.phone) } }
        : {}),
    } as T;
  }

  async create(dto: CreateLeadDto) {
    const leadType = dto.leadType;
    const assignedSeller = await this.assignment.getLeastLoadedSeller();

    const lead = await this.prisma.lead.create({
      data: {
        vehicleId: dto.vehicleId,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: this.encryption.encrypt(dto.customerPhone),
        message: this.encryption.encrypt(dto.message),
        leadType,
        status: 'NEW',
        assignedToId: assignedSeller ?? undefined,
        scheduledAt: dto.scheduledAt,
        source: dto.source ?? 'web_form',
      },
      include: {
        vehicle: { select: { brand: true, model: true, year: true, slug: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
    });

    this.eventEmitter.emit('lead.created', {
      leadId: lead.id,
      sellerId: lead.assignedToId,
      customerName: lead.customerName,
      customerEmail: lead.customerEmail,
      customerPhone: this.encryption.decrypt(lead.customerPhone),
      leadType: lead.leadType,
      vehicle: lead.vehicle
        ? { brand: lead.vehicle.brand, model: lead.vehicle.model, year: lead.vehicle.year }
        : null,
    });

    return this.presentLead(lead);
  }

  async findAll(query: LeadQueryDto, userId?: string, userRole?: string) {
    const where: Record<string, unknown> = {};

    if (query.status) where.status = query.status;
    if (query.leadType) where.leadType = query.leadType;

    // Sellers only see their own leads
    if (query.assignedToMe && userId) {
      where.assignedToId = userId;
    }

    if (userRole === 'SELLER' && !query.assignedToMe) {
      where.assignedToId = userId;
    }

    const safeLimit = Math.min(Math.max(query.limit, 1), 100);
    const safePage = Math.max(query.page, 1);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        include: {
          vehicle: { select: { id: true, brand: true, model: true, year: true, slug: true, price: true } },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data: data.map((lead) => this.presentLead(lead)),
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findById(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        vehicle: { select: { id: true, brand: true, model: true, year: true, slug: true, price: true } },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    return this.presentLead(lead);
  }

  async update(id: string, dto: UpdateLeadDto) {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.scheduledAt !== undefined ? { scheduledAt: dto.scheduledAt } : {}),
      },
      include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } },
    });

    if (dto.status && dto.status === 'CONVERTED') {
      this.eventEmitter.emit('lead.converted', {
        leadId: lead.id,
        sellerId: lead.assignedToId,
      });
    }

    return this.presentLead(lead);
  }

  async assign(id: string, dto: AssignLeadDto) {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    const seller = await this.prisma.user.findUnique({ where: { id: dto.sellerId } });
    if (!seller || seller.role !== 'SELLER') {
      throw new NotFoundException('Seller not found or not a seller role');
    }

    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        assignedToId: dto.sellerId,
        ...(existing.status === 'NEW' ? { status: 'CONTACTED' } : {}),
      },
      include: { assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    this.eventEmitter.emit('lead.assigned', {
      leadId: lead.id,
      sellerId: lead.assignedToId,
      customerName: lead.customerName,
    });

    return this.presentLead(lead);
  }

  async getStats() {
    const [total, newLeads, contacted, converted, byType, last7days] =
      await this.prisma.$transaction([
        this.prisma.lead.count(),
        this.prisma.lead.count({ where: { status: 'NEW' } }),
        this.prisma.lead.count({ where: { status: { in: ['CONTACTED', 'QUALIFIED', 'SCHEDULED'] } } }),
        this.prisma.lead.count({ where: { status: 'CONVERTED' } }),
        this.prisma.lead.groupBy({ by: ['leadType'], _count: { _all: true } }),
        this.prisma.lead.count({
          where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        }),
      ]);

    return {
      total,
      newLeads,
      contacted,
      converted,
      last7days,
      conversionRate: total > 0 ? (converted / total) * 100 : 0,
      byType,
    };
  }
}