import 'reflect-metadata';
import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { AppConfigService } from '../../core/config/app-config.service.js';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

/**
 * Envío de correo con una cadena de proveedores:
 *   1. SMTP (p. ej. Gmail con contraseña de aplicación) si `SMTP_HOST` está definido.
 *   2. Resend (API HTTP) si hay `RESEND_API_KEY`.
 *   3. Nada: se registra en el log (útil en desarrollo / tests).
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly smtp?: Transporter;

  constructor(private readonly config: AppConfigService) {
    const host = process.env.SMTP_HOST?.trim();
    if (host) {
      const port = Number(process.env.SMTP_PORT ?? 587);
      const secure = String(process.env.SMTP_SECURE ?? 'false').toLowerCase() === 'true' || port === 465;
      const user = process.env.SMTP_USER?.trim();
      const pass = process.env.SMTP_PASS?.trim();
      this.smtp = nodemailer.createTransport({
        host,
        port,
        secure,
        ...(user ? { auth: { user, pass } } : {}),
      });
      this.logger.log(`SMTP transport configured (${host}:${port}${secure ? ', secure' : ''})`);
    } else {
      this.logger.warn('SMTP not configured (SMTP_HOST missing).');
    }
  }

  async send(options: EmailOptions): Promise<boolean> {
    const from = options.from ?? process.env.EMAIL_FROM ?? 'no-reply@jcautoimport.com';

    if (this.smtp) {
      try {
        await this.smtp.sendMail({
          from,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
        this.logger.debug(`Email sent via SMTP to ${options.to}`);
        return true;
      } catch (error) {
        this.logger.error(`SMTP send failed: ${(error as Error).message}`);
        return false;
      }
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
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

        this.logger.debug(`Email sent via Resend to ${options.to}`);
        return true;
      } catch (error) {
        this.logger.error(`Email send error: ${(error as Error).message}`);
        return false;
      }
    }

    this.logger.warn('Email service not configured (no SMTP_HOST, no RESEND_API_KEY). Skipping send.');
    this.logger.debug(`Would send email to ${options.to} with subject "${options.subject}"`);
    return false;
  }

  sendLeadNotification(to: string, leadSummary: { customerName: string; vehicleModel?: string; leadType: string }): Promise<boolean> {
    return this.send({
      to,
      subject: `Nuevo lead: ${leadSummary.leadType}`,
      text: `Hola,\n\nSe ha registrado un nuevo lead.\n\nCliente: ${leadSummary.customerName}\nVehiculo: ${leadSummary.vehicleModel ?? 'No especificado'}\nTipo: ${leadSummary.leadType}\n\nPor favor contacte al cliente lo antes posible.`,
    });
  }
}
