import 'reflect-metadata';
import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../core/config/app-config.service.js';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: AppConfigService) {}

  async send(options: EmailOptions): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      this.logger.warn('Email service not configured (RESEND_API_KEY missing). Skipping send.');
      this.logger.debug(`Would send email to ${options.to} with subject "${options.subject}"`);
      return false;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: options.from ?? process.env.EMAIL_FROM ?? 'no-reply@jcautoimport.com',
          to: options.to,
          subject: options.subject,
          ...(options.text ? { text: options.text } : {}),
          ...(options.html ? { html: options.html } : {}),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(`Email send failed (${response.status}): ${body}`);
        return false;
      }

      this.logger.debug(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Email send error: ${(error as Error).message}`);
      return false;
    }
  }

  sendLeadNotification(to: string, leadSummary: { customerName: string; vehicleModel?: string; leadType: string }): Promise<boolean> {
    return this.send({
      to,
      subject: `Nuevo lead: ${leadSummary.leadType}`,
      text: `Hola,\n\nSe ha registrado un nuevo lead.\n\nCliente: ${leadSummary.customerName}\nVehiculo: ${leadSummary.vehicleModel ?? 'No especificado'}\nTipo: ${leadSummary.leadType}\n\nPor favor contacte al cliente lo antes posible.`,
    });
  }
}
