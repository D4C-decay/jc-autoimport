import { contextBridge } from 'electron';

/**
 * Sandboxed preload: no Node APIs are exposed to the renderer. The web app is a
 * plain Next.js site, so the bridge is intentionally minimal — it only reports the
 * runtime environment so the frontend can adjust links/behaviour under Electron.
 */
const api = {
  isDesktop: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
};

contextBridge.exposeInMainWorld('jcaDesktop', api);

export type JcaDesktopBridge = typeof api;
