import { describe, expect, it } from 'vitest';
import { encodeCursor, decodeCursor } from './cursor-encoder.js';

describe('cursor-encoder', () => {
  it('round-trips a numeric cursor', () => {
    const cursor = encodeCursor({ id: 'abc-123', v1: 42 });
    const decoded = decodeCursor(cursor);
    expect(decoded).toEqual({ id: 'abc-123', v1: 42 });
  });

  it('round-trips a string cursor (ISO createdAt)', () => {
    const cursor = encodeCursor({ id: 'x', v1: '2026-09-08T00:00:00.000Z' });
    const decoded = decodeCursor(cursor);
    expect(decoded).toEqual({ id: 'x', v1: '2026-09-08T00:00:00.000Z' });
  });

  it('produces URL-safe opaque tokens that differ each call', () => {
    const payload = { id: 'same', v1: 5 };
    const a = encodeCursor(payload);
    const b = encodeCursor(payload);
    expect(a).not.toBe(b);
    expect(a).not.toMatch(/[+/=]/);
  });

  it('throws on tampered cursors', () => {
    const cursor = encodeCursor({ id: 'abc', v1: 1 });
    const tampered = cursor.slice(0, -2) + (cursor.endsWith('AA') ? 'BB' : 'AA');
    expect(() => decodeCursor(tampered)).toThrow('Invalid cursor');
  });

  it('throws on garbage input', () => {
    expect(() => decodeCursor('not-a-cursor')).toThrow('Invalid cursor');
  });
});