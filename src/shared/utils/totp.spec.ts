import { describe, expect, it } from 'vitest';
import { generateTotp, generateTotpSecret, totpUri, verifyTotp } from './totp.js';

describe('totp', () => {
  it('generates a 32-char base32 secret', () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]{32}$/);
  });

  it('verifies the code it generates', () => {
    const secret = generateTotpSecret();
    const code = generateTotp(secret);
    expect(verifyTotp(secret, code)).toBe(true);
  });

  it('rejects a wrong or malformed code', () => {
    const secret = generateTotpSecret();
    const code = generateTotp(secret);
    const wrong = generateTotp(secret, Date.now() - 10 * 60 * 1000);
    expect(verifyTotp(secret, wrong)).toBe(false);
    expect(verifyTotp(secret, '12ab34')).toBe(false);
    expect(verifyTotp(secret, '')).toBe(false);
    expect(verifyTotp(secret, code.slice(0, 5))).toBe(false);
    expect(verifyTotp('NOT-BASE32!!', code)).toBe(false);
  });

  it('builds a valid otpauth:// URI', () => {
    const secret = generateTotpSecret();
    const uri = totpUri(secret, 'test@example.com', 'JC Autoimport');
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain(`secret=${secret}`);
    expect(uri).toContain('digits=6');
    expect(uri).toContain('period=30');
  });
});