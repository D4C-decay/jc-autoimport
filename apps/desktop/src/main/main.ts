import { app, BrowserWindow, shell } from 'electron';
import { spawn, type ChildProcess } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** In dev we talk to `next dev`; in production we boot the bundled Next server. */
const IS_DEV = !app.isPackaged;
const DEV_URL = process.env.JCA_DEV_URL ?? 'http://localhost:4200';
const SERVER_PORT = Number(process.env.JCA_SERVER_PORT ?? 47821);
const STARTUP_TIMEOUT_MS = 30_000;

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

/** Resources are copied verbatim by electron-builder's extraResources. */
function resourcePath(...segments: string[]): string {
  // dev: apps/desktop/dist/main -> apps/desktop ; prod: process.resourcesPath
  const base = IS_DEV ? path.resolve(__dirname, '..', '..') : process.resourcesPath;
  return path.join(base, ...segments);
}

async function isPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    const done = (ok: boolean) => {
      socket.destroy();
      resolve(ok);
    };
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    socket.setTimeout(1000, () => done(false));
  });
}

async function waitForPort(port: number, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isPortOpen(port)) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`El servidor web no respondió en el puerto ${port} tras ${timeoutMs} ms`);
}

/**
 * Boots the Next.js standalone server that ships inside the app bundle.
 * Electron ships a Node runtime, so we reuse it (ELECTRON_RUN_AS_NODE) instead of
 * requiring the end user to install Node.
 */
async function startBundledServer(): Promise<string> {
  const serverEntry = resourcePath('web', 'server.js');
  if (!fs.existsSync(serverEntry)) {
    throw new Error(
      `No se encontró el servidor web empaquetado en ${serverEntry}. ` +
        'Ejecuta `npm run build:web` antes de empaquetar.',
    );
  }

  serverProcess = spawn(process.execPath, [serverEntry], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: String(SERVER_PORT),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  serverProcess.stdout?.on('data', (b: Buffer) => process.stdout.write(`[web] ${b}`));
  serverProcess.stderr?.on('data', (b: Buffer) => process.stderr.write(`[web] ${b}`));
  serverProcess.on('exit', (code) => console.log(`[web] servidor terminado (code=${code})`));

  await waitForPort(SERVER_PORT, STARTUP_TIMEOUT_MS);
  return `http://127.0.0.1:${SERVER_PORT}`;
}

function stopBundledServer(): void {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
  serverProcess = null;
}

async function resolveAppUrl(): Promise<string> {
  if (IS_DEV) {
    const dev = new URL(DEV_URL);
    if (!(await isPortOpen(Number(dev.port || 4200), dev.hostname))) {
      throw new Error(
        `El frontend de desarrollo no está corriendo en ${DEV_URL}.\n` +
          'Ejecuta `npm run dev` en apps/web primero.',
      );
    }
    return DEV_URL;
  }
  return startBundledServer();
}

function createWindow(url: string): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    backgroundColor: '#0a0a0b',
    title: 'JC Autoimport',
    autoHideMenuBar: true,
    icon: resourcePath('build', 'icon.png'),
    webPreferences: {
      // __dirname is dist/main, while the compiled preload lands in dist/preload.
      preload: path.join(__dirname, '..', 'preload', 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());

  // External links open in the real browser, never inside the app shell.
  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    void shell.openExternal(target);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, target) => {
    if (!target.startsWith(url)) {
      event.preventDefault();
      void shell.openExternal(target);
    }
  });

  void mainWindow.loadURL(url);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function showFatalError(message: string): void {
  const win = new BrowserWindow({
    width: 640,
    height: 360,
    resizable: false,
    backgroundColor: '#0a0a0b',
    title: 'JC Autoimport — error',
  });
  const html = `<!doctype html><html><head><meta charset="utf-8">
    <style>body{background:#0a0a0b;color:#e8e6e3;font:15px/1.6 system-ui,sans-serif;display:grid;place-items:center;height:100vh;margin:0;padding:40px;text-align:center}
    h1{font-size:19px;letter-spacing:.14em;text-transform:uppercase;color:#c8a44d;margin:0 0 14px}
    p{color:#8b8880;max-width:52ch;margin:0 auto}</style></head>
    <body><div><h1>No pudimos iniciar</h1><p>${message.replace(/[<>&]/g, '')}</p></div></body></html>`;
  void win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}

app.whenReady().then(async () => {
  try {
    createWindow(await resolveAppUrl());
  } catch (err) {
    showFatalError(err instanceof Error ? err.message : String(err));
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void resolveAppUrl().then(createWindow).catch((e) => showFatalError(String(e)));
    }
  });
});

app.on('window-all-closed', () => {
  stopBundledServer();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', stopBundledServer);
process.on('exit', stopBundledServer);
