# Memoria del proyecto JC Autoimport (Backend)

> Este archivo se carga automáticamente al inicio de cada sesión de opencode (via `opencode.json` → `instructions`). Es la fuente de continuidad entre sesiones.

## Objetivo
Plataforma de venta/importación de vehículos "JC Autoimport". Backend API completo orientado a: catálogo + búsqueda (<100ms), gestión de leads/CRM, reservas y pagos (Stripe), media, auditoría y RBAC. Meta de rendimiento: respuestas de catálogo <100ms vía caché Redis.

## Stack
NestJS 12 · TypeScript (ESM) · Prisma 7.10 · PostgreSQL 16 · Redis 7 · Stripe · Sharp · Argon2 · oxlint · pino.

## Repositorio
- GitHub **privado**: `https://github.com/D4C-decay/jc-autoimport` — rama `main`.
- `gh` autenticada como `D4C-decay` (HTTPS). Push directo aprobado (reglas en `AGENTS.md`, verifícalas antes de cualquier commit).
- NO versionar jamás: `.env`, `generated/`, `dist/`, `node_modules/`, `*.tsbuildinfo`.

## Estado actual
- Backend **completo y compilando** (build + lint en verde), 9 módulos:
  - `auth` (JWT access/refresh, blacklist Redis, Argon2, RBAC)
  - `users` (CRUD, roles, /me)
  - `vehicles` (CRUD, filtros, cursor pagination cifrado, caché Redis, slug)
  - `search` (full-text `to_tsvector` en español, suggestions, facets)
  - `media` (upload S3/local, compresión Sharp, galería)
  - `leads` (CRM, asignación least-loaded a SELLER, notificaciones email/WhatsApp)
  - `payments` (reservas con lock Redis + vigencia 72h, Stripe checkout, webhook con firma)
  - `audit` (interceptor global + consulta ADMIN)
  - `health` (`GET /api/v1/health`: Prisma + Redis)
- Infra: `Dockerfile`, `docker-compose.yml` (postgres 16 + redis 7 + app), `.env.example` con placeholders.
- Seed: `prisma/seed.ts` (admin/manager/2 sellers + specifications + 3 vehículos demo).

## Próximo paso
Levantar infra y validar runtime:
1. PostgreSQL 16 + Redis 7 (instalar local o `docker compose up -d postgres redis`).
2. `npm run prisma:migrate` (crea `prisma/migrations/`, aún no existe) luego seed.
3. `npm run start` y probar `GET http://localhost:3000/api/v1/health` + flujo público (register→login→catálogo).
4. Opcional: `npm run test:e2e`.

## Blockers
- PostgreSQL y Redis **no instalados** en la máquina; Docker tampoco → no se ha podido probar runtime ni crear migraciones.
- `PrismaService.onModuleInit` hace `$connect()` sin catch → si la DB no responde al boot, la app crashea (aceptado; compose usa healthchecks).

## Decisiones clave
- **ESM**: imports relativos con sufijo `.js` (obligatorio).
- **Prisma 7**: el datasource NO lleva `url`; la URL vive en `prisma.config.ts`; cliente generado en `generated/prisma`.
- **Stripe**: `apiVersion: '2026-08-26.dahlia'` (verificada del SDK instalado).
- **Build**: `tsconfig.build.json` `rootDir: "."` → salida `dist/src/`; `start:prod: node dist/src/main.js`.
- **ioredis v6**: `import { Redis } from 'ioredis'` (named import).
- **Guards globales** en orden: `RateLimitGuard` → `JwtAuthGuard` → `RolesGuard`; `JwtModule` es `global: true` (requisito para el guard global).
- **Interceptores globales**: Logging + Transform (envuelve respuestas `{success,data,timestamp}`; DELETE/PATCH/PUT sin retorno → 404). Caché Redis por controller (no global).
- **Stripe webhook**: `rawBody: true` en `NestFactory.create` para verificar firma.
- **Flujo de reservas**: vehículo `AVAILABLE→RESERVED` al reservar; `→SOLD` en `checkout.session.completed`; `→AVAILABLE` al cancelar.
- **Auditoría**: `AuditInterceptor` global con DI de PrismaService (fire-and-forget), redacta secrets.
- **Seed argon2**: memoryCost 19456 / timeCost 2 / parallelism 1.
- **Cursors de paginación**: cifrados con `JWT_ACCESS_SECRET` (cursor-encoder).

## Reglas de continuidad
- **Al inicio de sesión**: leer este `MEMORY.md` y dar continuidad al `Próximo paso`.
- **Al cierre**: actualizar este archivo (usar el subagente `memory-keeper`) con estado, próximo paso, blockers y una entrada en el log.
- Revisar los subagentes en `.opencode/agent/` (builders = implementan; consejo de planeación = diseñan; `memory-keeper` = archiva).

## Log de sesiones
- 2026-09-08 — Creación del repo GitHub privado `dc4decay/jc-autoimport`, push inicial del backend completo (102 archivos). Setup de continuidad: 14 subagentes (6 builders + 7 del consejo de planeación + memory-keeper), `opencode.json` con `instructions` (AGENTS.md + MEMORY.md) y reglas de continuidad.