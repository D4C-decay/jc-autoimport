import { describe, expect, it } from 'vitest';
import { EncryptionService } from './encryption.service.js';

/**
 * EncryptionService takes AppConfigService; we build it directly with a
 * flattened config snapshot to avoid a Nest testing module.
 */
function bootService(): EncryptionService {
  const config = {
    encryption: { key: 'a'.repeat(64) },
    jwt: { accessSecret: 'x' },
    app: { nodeEnv: 'test' },
  };
  return new (EncryptionService as unknown as new (cfg: unknown) => EncryptionService)(
    config,
  );
}

describe('EncryptionService', () => {
  it('round-trips a value with a versioned prefix', () => {
    const service = bootService();
    const cipher = service.encrypt('+1 809 555 0100');
    expect(cipher).toMatch(/^enc:v1:/);
    expect(service.decrypt(cipher)).toBe('+1 809 555 0100');
  });

  it('produces different ciphertexts for the same input', () => {
    const service = bootService();
    const a = service.encrypt('secret');
    const b = service.encrypt('secret');
    expect(a).not.toBe(b);
  });

  it('passes through null, empty and plaintext values', () => {
    const service = bootService();
    expect(service.encrypt(null)).toBeNull();
    expect(service.encrypt(undefined)).toBeUndefined();
    expect(service.encrypt('')).toBe('');
    expect(service.decrypt('legacy-plain')).toBe('legacy-plain');
    expect(service.decrypt(null)).toBeNull();
  });

  it('never throws on tampered ciphertext', () => {
    const service = bootService();
    const cipher = service.encrypt('secreto');
    const tampered = cipher.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A'));
    expect(() => service.decrypt(tampered)).not.toThrow();
  });
});