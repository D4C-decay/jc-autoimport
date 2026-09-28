#!/usr/bin/env node
/**
 * Generates the desktop app icon without any image dependency.
 *
 * Draws a 512x512 RGBA mark (carved carbon background + brass chevron, matching the
 * site's diagonal identity) and encodes it as PNG with Node's built-in zlib.
 * electron-builder derives the Windows .ico and other densities from this file.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SIZE = 512;
const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'build');

const INK = [10, 10, 11];
const INK_SOFT = [22, 22, 24];
const BRASS = [200, 164, 77];
const BRASS_LIGHT = [226, 197, 122];

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const px = new Uint8Array(SIZE * SIZE * 4);
const set = (x, y, [r, g, b], a = 255) => {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  const i = (y * SIZE + x) * 4;
  const src = a / 255;
  px[i] = Math.round(r * src + px[i] * (1 - src));
  px[i + 1] = Math.round(g * src + px[i + 1] * (1 - src));
  px[i + 2] = Math.round(b * src + px[i + 2] * (1 - src));
  px[i + 3] = Math.max(px[i + 3], a);
};

const R = 96; // corner radius
const inRounded = (x, y) => {
  const cx = Math.min(Math.max(x, R), SIZE - R);
  const cy = Math.min(Math.max(y, R), SIZE - R);
  return Math.hypot(x - cx, y - cy) <= R;
};

// Background: rounded square with a soft top-left sheen.
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    if (!inRounded(x, y)) continue;
    const t = 1 - Math.hypot(x - SIZE * 0.28, y - SIZE * 0.22) / (SIZE * 1.15);
    const mix = Math.max(0, Math.min(1, t));
    set(x, y, [
      Math.round(INK[0] + (INK_SOFT[0] - INK[0]) * mix),
      Math.round(INK[1] + (INK_SOFT[1] - INK[1]) * mix),
      Math.round(INK[2] + (INK_SOFT[2] - INK[2]) * mix),
    ]);
  }
}

// Brass chevron: two thick diagonal strokes, echoing the diagonal CTA clip-path.
const stroke = (x0, y0, x1, y1, half, color) => {
  const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const cxp = x0 + (x1 - x0) * t;
    const cyp = y0 + (y1 - y0) * t;
    for (let dy = -half; dy <= half; dy += 0.5) {
      for (let dx = -half; dx <= half; dx += 0.5) {
        if (dx * dx + dy * dy > half * half) continue;
        // Vertical gradient across the stroke for a brushed-metal feel.
        const f = (cyp + dy) / SIZE;
        const col = [
          Math.round(color[0] + (BRASS_LIGHT[0] - color[0]) * (1 - f)),
          Math.round(color[1] + (BRASS_LIGHT[1] - color[1]) * (1 - f)),
          Math.round(color[2] + (BRASS_LIGHT[2] - color[2]) * (1 - f)),
        ];
        set(Math.round(cxp + dx), Math.round(cyp + dy), col);
      }
    }
  }
};

stroke(214, 150, 316, 256, 30, BRASS);
stroke(316, 256, 214, 362, 30, BRASS);

// Thin brass frame, inset.
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    if (!inRounded(x, y)) continue;
    const onEdge =
      inRounded(x + 10, y + 10) && inRounded(x - 10, y + 10) && inRounded(x + 10, y - 10) && inRounded(x - 10, y - 10);
    if (!onEdge) set(x, y, BRASS, 190);
  }
}

mkdirSync(OUT_DIR, { recursive: true });
const out = path.join(OUT_DIR, 'icon.png');
writeFileSync(out, encodePng(SIZE, SIZE, Buffer.from(px)));
console.log(`icono generado: ${out} (${SIZE}x${SIZE})`);
