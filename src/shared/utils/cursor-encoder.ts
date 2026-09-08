import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const CURSOR_SECRET = process.env.JWT_ACCESS_SECRET ?? 'cursor-encoding-secret';
const KEY = createHash('sha256').update(CURSOR_SECRET).digest();

export interface CursorData {
  [key: string]: string | number;
}

export function encodeCursor(data: CursorData): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const plaintext = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString('base64url');
}

export function decodeCursor<T extends CursorData = CursorData>(cursor: string): T {
  try {
    const buffer = Buffer.from(cursor, 'base64url');
    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);

    const decipher = createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString('utf8')) as T;
  } catch {
    throw new Error('Invalid cursor');
  }
}
