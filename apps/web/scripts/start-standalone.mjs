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
