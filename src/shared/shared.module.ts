import 'reflect-metadata';
import { Global, Module } from '@nestjs/common';
import { StorageService } from './services/storage.service.js';
import { CompressionService } from './services/compression.service.js';
import { EmailService } from './services/email.service.js';
import { WhatsAppService } from './services/whatsapp.service.js';
import { EncryptionService } from './services/encryption.service.js';

@Global()
@Module({
  providers: [StorageService, CompressionService, EmailService, WhatsAppService, EncryptionService],
  exports: [StorageService, CompressionService, EmailService, WhatsAppService, EncryptionService],
})
export class SharedModule {}
