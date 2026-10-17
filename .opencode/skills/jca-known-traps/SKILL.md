---
name: jca-known-traps
description: Use when touching JC Autoimport code and a change looks simple but has bitten before — Prisma migrations/search_vector, apps/web build and standalone server, Framer Motion transforms, featured rail pitch, Next client/server constants, gh and /etc/hosts. Lists the expensive traps and their fixes.
---

# Trampas caras de JC Autoimport (no volver a tropezar)

## Prisma / base de datos
- **`vehicles.search_vector`**: una migración generada por Prisma puede emitir
  `DROP INDEX vehicles_search_vector_idx` y `ALTER COLUMN search_vector DROP DEFAULT`.
  Si el `migration.sql` toca `search_vector`, **reescríbelo** a mano (solo lo pedido) y aplica con
  `npx prisma migrate deploy`; luego verifica el índice GIN:
  `CREATE INDEX vehicles_search_vector_idx ON vehicles USING GIN (search_vector);`
- `jcauto` necesita `CREATEDB` (shadow DB de Prisma): `ALTER ROLE jcauto CREATEDB;` en cada máquina.

## apps/web (Next.js standalone)
- **Tras `npm --prefix apps/web run build`, reiniciar el server standalone.** Un build mientras el
  server corre borra y recrea `.next/standalone`; el proceso vivo queda con cwd `(deleted)` y sirve
  **HTML 200 pero sin CSS** (todos los `/_next/static/*` dan 400). Diagnóstico: comparar el hash del
  CSS del HTML contra `curl -o /dev/null -w '%{http_code}'` del asset.
- **Levantar desacoplado**: `setsid nohup node scripts/start-standalone.mjs > log 2>&1 < /dev/null &`.
  Con `nohup … &` a secas el grupo de procesos muere al vencer el timeout del tool.
- `pkill -f 'standalone/server.js'` mata el propio shell → matar por puerto:
  `kill $(ss -tlnpH | grep ':4200' | grep -oE 'pid=[0-9]+' | cut -d= -f2)`.

## Frontend / React
- **Hidratación (#418)**: no ramifiques con `useReducedMotion()`/`matchMedia` en el primer render;
  gatea con `mounted` y pinta lo mismo que el servidor al principio.
- **Carril destacado**: el `transform` lo escribe el rAF a mano (`track.style.transform`), NO Framer
  Motion (`useMotionValue`+`style={{x}}` corre en otro rAF → salto de una tarjeta). El pitch se mide
  con **`offsetLeft`**, nunca `getBoundingClientRect()` (las tarjetas escalan).
- **Constante compartida server+client**: una constante exportada de un módulo `'use client'` no se
  puede importar en un server component (Next la sustituye por un stub que lanza; en un `<script>`
  inline produce `SyntaxError`). Muévela a un módulo plano (p. ej. `src/lib/theme.ts`).

## Infra / tooling
- **`gh` “roto”**: causa raíz es `/etc/hosts` mapeando `api.github.com` a la IP de `github.com`.
  El token es válido; `git push` no está bloqueado. Arreglo: corregir `/etc/hosts` (sudo).
- **Config de opencode NO es hot-reload**: tras tocar `opencode.json`, agentes, skills, comandos o
  plugins → reiniciar opencode. Escape hatch si rompes el arranque: `OPENCODE_DISABLE_PROJECT_CONFIG=1`
  o `OPENCODE_PURE=1`.
- **GPU de Electron**: en esta máquina el proceso GPU falla; usa `--disable-gpu` para pruebas headless.
- **`pkill -f cloudflared`** mata el shell; usa `pgrep -f '[c]loudflared'`.
