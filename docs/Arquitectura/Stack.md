---
tags:
  - arquitectura
  - stack
type: info
status: aprobado
---

# Stack tecnológico

> Snapshot desde `MEMORY.md`/`AGENTS.md`. La fuente de verdad operativa es el repo de código.

## Backend

- **NestJS 12** · TypeScript (**ESM**) · **Prisma 7.10** · **PostgreSQL 16** · **Redis 7** · **Stripe** · **Sharp** · **Argon2** · **oxlint** · **pino**

## Infra local

- PostgreSQL 18.6 + Valkey 9.1.2 (systemd, no Docker).
- Dockerfiles y `docker-compose.yml` incluidos para despliegue.

## Convenciones de código (resumen)

- **ESM**: imports relativos con sufijo `.js` (p. ej. `from './app.module.js'`). Obligatorio.
- Módulos en `src/modules/*` (domain/application/infrastructure).
- Prisma 7: cliente generado en `generated/prisma`; tras cambiar schema → `npx prisma generate`.
- Verificación estándar: `npm run build` + `npm run lint` (oxlint). Ambos en verde para aprobar.

## Detalles de cada decisión

Ver [[Decisiones/001-esm-imports|Decisiones (registro)]] y el ADR indexado allí.