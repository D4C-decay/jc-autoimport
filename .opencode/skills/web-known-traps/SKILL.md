---
name: web-known-traps
description: Use when touching web code and a change looks simple but has bitten before — Next standalone build vs live server, hydration mismatches, client/server shared constants, process kills that kill your own shell, opencode config not hot-reloaded. Lists the expensive traps and their fixes.
---

# Trampas caras en proyectos web (no volver a tropezar)

## Next.js standalone
- **Tras `npm run build`, reiniciar el server standalone.** Un build mientras el
  server corre borra y recrea `.next/standalone`; el proceso vivo queda con cwd
  `(deleted)` y sirve **HTML 200 pero sin CSS** (los `/_next/static/*` dan 400).
  Diagnóstico: comparar el hash del CSS del HTML contra
  `curl -o /dev/null -w '%{http_code}'` del asset.
- **Levantar desacoplado**: `setsid nohup node scripts/start-standalone.mjs > log 2>&1 < /dev/null &`.
  Con `nohup … &` a secas el grupo de procesos muere al vencer el timeout del tool.
- **Matar por puerto, nunca por patrón**: `pkill -f 'standalone/server.js'` mata el propio shell.
  Usa `kill $(ss -tlnpH | grep ':<puerto>' | grep -oE 'pid=[0-9]+' | cut -d= -f2)`.

## Frontend / React
- **Hidratación (#418)**: no ramifiques con `useReducedMotion()`/`matchMedia` en el primer render;
  gatea con `mounted` y pinta lo mismo que el servidor al principio.
- **Constante compartida server+client**: una constante exportada de un módulo `'use client'` no se
  puede importar en un server component (Next la sustituye por un stub que lanza; en un `<script>`
  inline produce `SyntaxError`). Muévela a un módulo plano (p. ej. `src/lib/theme.ts`).
- **`notFound()` puede devolver 200**: un `app/loading.tsx` raíz envuelve todo en Suspense y Next
  fija el 200 antes de propagar `notFound()`. Quita el loading raíz o lanza `notFound()` desde
  `generateMetadata`.

## Infra / tooling
- **Config de opencode NO es hot-reload**: tras tocar `opencode.json`, agentes, skills, comandos o
  plugins → reiniciar opencode. Escape hatch si rompes el arranque:
  `OPENCODE_DISABLE_PROJECT_CONFIG=1` o `OPENCODE_PURE=1`.
- **`gh` “roto”**: causa raíz habitual es `/etc/hosts` mapeando `api.github.com` a la IP de
  `github.com`. El token suele ser válido; `git push` no se ve afectado. Arreglo: corregir
  `/etc/hosts` (sudo) o pasar `GH_TOKEN`.
- **`pkill -f <patrón>`** mata el shell si el patrón aparece en su propia línea de comandos:
  usa `pgrep -f '[c]loudflared'` (corchetes) o mata por puerto.
