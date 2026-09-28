#!/usr/bin/env node
/**
 * Smoke test for the desktop shell: boots Electron, waits for the DevTools endpoint,
 * evaluates the real DOM inside the window, then shuts everything down.
 *
 * Usage: node scripts/smoke.mjs [--dev]
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 9225;
const electron = path.join(root, 'node_modules', 'electron', 'dist', 'electron');
const entry = path.join(root, 'dist', 'main', 'main.js');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const child = spawn(
  electron,
  [entry, '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${PORT}`],
  { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] },
);
let log = '';
child.stdout.on('data', (b) => (log += b));
child.stderr.on('data', (b) => (log += b));

function fail(msg) {
  console.error(`FAIL: ${msg}\n--- electron output ---\n${log.slice(-2000)}`);
  child.kill('SIGKILL');
  process.exit(1);
}

async function targets() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  return res.json();
}

const deadline = Date.now() + 40_000;
let page;
while (Date.now() < deadline) {
  try {
    const list = await targets();
    page = list.find((t) => t.type === 'page');
    if (page?.webSocketDebuggerUrl) break;
  } catch {
    /* devtools not up yet */
  }
  await sleep(500);
}
if (!page?.webSocketDebuggerUrl) fail('la ventana no se registró en DevTools');

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const send = (method, params = {}) => {
  const i = ++id;
  ws.send(JSON.stringify({ id: i, method, params }));
  return new Promise((r) => pending.set(i, r));
};
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});

await new Promise((r, j) => {
  ws.addEventListener('open', r);
  ws.addEventListener('error', () => j(new Error('ws error')));
});

const evaluate = async (expr) => {
  const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (res.result?.exceptionDetails) throw new Error(JSON.stringify(res.result.exceptionDetails));
  return res.result?.result?.value;
};

await sleep(3000);

const report = await evaluate(`JSON.stringify({
  title: document.title,
  h1: (document.querySelector('h1')?.innerText || '').slice(0, 90),
  vehicleLinks: document.querySelectorAll('a[href^="/vehiculo/"]').length,
  prices: (document.body.innerText.match(/\\\$\\s?[0-9][0-9,]{3,}/g) || []).slice(0, 3),
  bridge: typeof window.jcaDesktop !== 'undefined' ? JSON.stringify(window.jcaDesktop) : 'NO BRIDGE',
  hasNodeLeak: typeof window.require !== 'undefined' || typeof window.process !== 'undefined',
  bodyChars: document.body.innerText.length
})`);

const data = JSON.parse(report);
console.log('desktop smoke report:', JSON.stringify(data, null, 2));

// Navigate inside the app to prove routing works, not just the first paint.
await evaluate(`history.pushState({}, '', '/catalogo'); true`);
await sleep(500);
await send('Page.navigate', { url: page.url.replace(/\/$/, '/catalogo') });
await sleep(4000);
const after = await evaluate(`JSON.stringify({
  url: location.pathname,
  h1: (document.querySelector('h1')?.innerText || '').slice(0, 60),
  vehicleLinks: document.querySelectorAll('a[href^="/vehiculo/"]').length
})`);
console.log('after navigate:', after);

const checks = [
  ['window carga el sitio', data.bodyChars > 500],
  ['h1 presente', data.h1.length > 3],
  ['vehículos en pantalla', data.vehicleLinks > 0],
  ['precios formateados', data.prices.length > 0],
  ['preload expone jcaDesktop', data.bridge !== 'NO BRIDGE'],
  ['sin fuga de Node al renderer', data.hasNodeLeak === false],
  ['navegación interna funciona', after.includes('catalogo')],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}

child.kill('SIGKILL');
process.exit(failed === 0 ? 0 : 1);
