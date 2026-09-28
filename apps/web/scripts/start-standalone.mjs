#!/usr/bin/env node
/**
 * Starts the Next.js standalone server.
 *
 * `output: 'standalone'` emits a self-contained server in .next/standalone, but it
 * expects .next/static and public/ to be copied next to it. This script does that
 * copy and then boots the server, so the same artifact works with `next start`-style
 * commands and inside Electron.
 */
import { cp, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const standaloneDir = path.join(root, '.next', 'standalone');
const server = path.join(standaloneDir, 'server.js');

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(server))) {
  console.error('[start] .next/standalone/server.js not found. Run `npm run build` first.');
  process.exit(1);
}

if (await exists(path.join(root, '.next', 'static'))) {
  await cp(path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static'), {
    recursive: true,
  });
}

if (await exists(path.join(root, 'public'))) {
  await cp(path.join(root, 'public'), path.join(standaloneDir, 'public'), { recursive: true });
}

const port = process.env.PORT ?? '4200';
const child = spawn(process.execPath, [server], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port, HOSTNAME: process.env.HOSTNAME ?? '0.0.0.0' },
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => child.kill(sig));
}
child.on('exit', (code) => process.exit(code ?? 0));

/**
 * A running standalone server keeps its assets in .next/standalone, and `next
 * build` deletes that directory in place. The result is a server that still
 * answers HTML 200 while every /_next/static request fails, i.e. a completely
 * unstyled site with no visible error. Verify the first stylesheet after boot
 * and fail loudly instead of letting that happen silently.
 */
async function verifyAssets() {
  const base = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const html = await fetch(base, { signal: AbortSignal.timeout(4000) });
      const body = await html.text();
      const asset = body.match(/\/_next\/static\/(?:css|chunks)\/[A-Za-z0-9._-]+\.(?:css|js)/);
      if (!asset) return;
      const res = await fetch(base + asset[0], { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        console.log(`[start] assets OK (${asset[0]} -> ${res.status})`);
        return;
      }
      console.error(
        [
          '',
          '  ERROR: el servidor sirve HTML pero sus assets estaticos fallan.',
          `  ${asset[0]} -> HTTP ${res.status}`,
          '',
          '  Causa: se ejecuto `next build` mientras el servidor estaba arriba y',
          '  borro .next/standalone. Reinicia el servidor (npm run web:start).',
          '',
        ].join('\n'),
      );
      process.exit(1);
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

if (process.env.SKIP_ASSET_CHECK !== '1') await verifyAssets();
