import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';

@Injectable()
export class LeadAssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeastLoadedSeller(): Promise<string | null> {
    const sellers = await this.prisma.user.findMany({
      where: { role: 'SELLER', isActive: true },
      include: {
        _count: {
          select: {
            assignedLeads: {
              where: { status: { in: ['NEW', 'CONTACTED', 'QUALIFIED', 'SCHEDULED'] } },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (sellers.length === 0) {
      return null;
    }

    return sellers.sort(
      (a, b) => a._count.assignedLeads - b._count.assignedLeads,
    )[0].id;
  }
}