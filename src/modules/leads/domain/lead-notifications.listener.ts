import 'reflect-metadata';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../../../shared/services/email.service.js';
import { WhatsAppService } from '../../../shared/services/whatsapp.service.js';
import { PrismaService } from '../../../core/database/prisma.service.js';

export interface LeadCreatedEvent {
  leadId: string;
  sellerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  leadType: string;
  vehicle: { brand: string; model: string; year: number } | null;
}

export interface LeadAssignedEvent {
  leadId: string;
  sellerId: string | null;
  customerName: string;
}

@Injectable()
export class LeadNotificationsListener {
  private readonly logger = new Logger(LeadNotificationsListener.name);

  constructor(
    private readonly email: EmailService,
    private readonly whatsapp: WhatsAppService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('lead.created')
  async handleLeadCreated(event: LeadCreatedEvent): Promise<void> {
    const seller = event.sellerId
      ? await this.prisma.user.findUnique({
          where: { id: event.sellerId },
          select: { email: true, phone: true, firstName: true },
        })
      : null;

    const subject = `Nuevo lead: ${event.leadType.replace('_', ' ').toLowerCase()} - ${event.vehicle ? `${event.vehicle.brand} ${event.vehicle.model}` : 'Consulta general'}`;

    const vehicleLine = event.vehicle
      ? `Vehiculo: ${event.vehicle.brand} ${event.vehicle.model} ${event.vehicle.year}`
      : 'Vehiculo: No especificado';

    const body = [
      `Nuevo lead recibido.`,
      ``,
      `Cliente: ${event.customerName}`,
      `Email: ${event.customerEmail}`,
      event.customerPhone ? `Telefono: ${event.customerPhone}` : '',
      vehicleLine,
      `Tipo: ${event.leadType}`,
      ``,
      `Ingrese a su panel de administracion para ver los detalles completos.`,
    ]
      .filter(Boolean)
      .join('\n');

    if (seller?.email) {
      await this.email.send({
        to: seller.email,
        subject,
        text: body,
      });
    }

    if (seller?.phone) {
      await this.whatsapp.sendMessage({
        to: seller.phone,
        body,
      });
    }
  }

  @OnEvent('lead.assigned')
  async handleLeadAssigned(event: LeadAssignedEvent): Promise<void> {
    if (!event.sellerId) return;

    const seller = await this.prisma.user.findUnique({
      where: { id: event.sellerId },
      select: { email: true, phone: true },
    });

    const body = `Se le ha asignado un nuevo lead de ${event.customerName}. Revise su panel para mas informacion.`;

    if (seller?.email) {
      await this.email.send({
        to: seller.email,
        subject: 'Nuevo lead asignado',
        html: `<p>${body}</p>`,
      });
    }

    if (seller?.phone) {
      await this.whatsapp.sendMessage({ to: seller.phone, body });
    }
  }
}