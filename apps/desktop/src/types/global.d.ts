/// <reference types="electron" />
/** Ambient types for the desktop bridge injected by the sandboxed preload. */
import type { JcaDesktopBridge } from '../preload/preload.cjs';

declare global {
  interface Window {
    jcaDesktop?: JcaDesktopBridge;
  }
}

export {};
