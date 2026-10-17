---
name: jca-browser
description: Use when you need to drive a real browser for JC Autoimport web work — open pages, click, screenshot, inspect console/DOM, record video. Explains the CDP setup (Brave/Chromium on localhost:9222) and the chrome-debug.sh launcher, plus the Playwright and chrome-devtools MCP tools.
---

# Navegar la web con CDP (JC Autoimport)

El navegador se controla por **Chrome DevTools Protocol** en `http://localhost:9222`.
Es Brave (Chromium ≥136), que **ignora** `--remote-debugging-port` con el perfil por defecto:
por eso siempre se arranca con un `--user-data-dir` dedicado.

## Arrancar el navegador CDP
```bash
bash scripts/chrome-debug.sh          # Brave con perfil dedicado, CDP en :9222
```
Comprueba: `curl -s http://localhost:9222/json/version`.
Variables: `CDP_PORT` (default 9222), `JCA_CHROME_PROFILE`, `JCA_CHROME_LOG`.

## Herramientas MCP disponibles
- **playwright** (`@playwright/mcp` con `--cdp-endpoint http://localhost:9222`): navegar, click,
  type, snapshot de accesibilidad y **screenshots**.
- **chrome-devtools** (`chrome-devtools-mcp` con `--browserUrl`): performance traces, network,
  consola, emulación de dispositivo.

Ambas se conectan al mismo navegador si `scripts/chrome-debug.sh` está corriendo.

## Reglas
- La web local sirve en `http://localhost:4200`; la API en `http://localhost:3000` (privada).
- Revisa siempre **dos viewports** (1440×900 y 390×844) y **ambos temas** (claro/oscuro).
- Captura y reporta **errores de consola** y de hidratación; 0 tolerados.
- No automatices dominios ajenos salvo que la tarea lo pida explícitamente (el usuario autoriza
  navegar cualquier web con su navegador, pero actúa solo en lo que pide la tarea).
