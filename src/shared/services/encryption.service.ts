import 'reflect-metadata';
import { Injectable, Logger } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';
import { AppConfigService } from '../../core/config/app-config.service.js';

const PREFIX = 'enc:v1:';
const ALGO = 'aes-256-gcm';

/**
 * Field-level encryption for PII at rest (phone numbers, secrets, free text).
 *
 * AES-256-GCM gives confidentiality and integrity (the auth tag detects
 * tampering). Values carry a versioned prefix so `decrypt` can pass through
 * legacy plaintext untouched: existing rows keep working while new writes are
 * encrypted, and a future algorithm change is a new prefix, not a migration.
 */
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly key: Buffer;

  constructor(config: AppConfigService) {
    const provided = config.encryption.key;
    const fallback = config.jwt.accessSecret;
    const raw = provided || fallback;

    if (!provided && config.app.nodeEnv === 'production') {
      throw new Error('DATA_ENCRYPTION_KEY is required in production');
    }
    if (!provided) {
      this.logger.warn(
        'DATA_ENCRYPTION_KEY not set; deriving a development key from JWT_ACCESS_SECRET. Do not use this in production.',
      );
    }

    this.key =
      /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : createHash('sha256').update(raw).digest();
  }

  /** Encrypt a value; empty/null values pass through unchanged. */
  encrypt<T extends string | null | undefined>(value: T): T {
    if (value === null || value === undefined || value === '') return value;
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGO, this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${PREFIX}${iv.toString('base64url')}:${tag.toString('base64url')}:${ciphertext.toString('base64url')}` as T;
  }

  /** Decrypt a value; plaintext (no prefix) is returned as-is. */
  decrypt<T extends string | null | undefined>(value: T): T {
    if (value === null || value === undefined || value === '') return value;
    if (!value.startsWith(PREFIX)) return value;

    try {
      const [ivPart, tagPart, dataPart] = value.slice(PREFIX.length).split(':');
      if (!ivPart || !tagPart || !dataPart) return value;
      const decipher = createDecipheriv(ALGO, this.key, Buffer.from(ivPart, 'base64url'));
      decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
      const plain = Buffer.concat([
        decipher.update(Buffer.from(dataPart, 'base64url')),
        decipher.final(),
      ]);
      return plain.toString('utf8') as T;
    } catch {
      this.logger.error('Failed to decrypt a stored value; returning empty string');
      return '' as T;
    }
  }
}
