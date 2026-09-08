import 'reflect-metadata';
import { Injectable, Logger } from '@nestjs/common';

export interface WhatsAppMessage {
  to: string;
  body: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  private get isConfigured(): boolean {
    return Boolean(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN);
  }

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.warn('WhatsApp service not configured. Skipping send.');
      this.logger.debug(`Would send WhatsApp to ${message.to}: ${message.body}`);
      return false;
    }

    try {
      const response = await fetch(process.env.WHATSAPP_API_URL!, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: message.to,
          text: message.body,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(`WhatsApp send failed (${response.status}): ${body}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`WhatsApp send error: ${(error as Error).message}`);
      return false;
    }
  }
}
